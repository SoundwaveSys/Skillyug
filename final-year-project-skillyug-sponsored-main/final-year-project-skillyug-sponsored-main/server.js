import express from 'express';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';

dotenv.config();

const app = express();
const port = process.env.RAZORPAY_PORT || 3001;
const PAYMENT_AMOUNT_PAISE = 10000;
const PAYMENT_CURRENCY = 'INR';
const processedPayments = new Set();

app.use(express.json({ limit: '10kb' }));

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

const getFirebaseApiKey = () =>
  process.env.FIREBASE_WEB_API_KEY || process.env.VITE_FIREBASE_API_KEY;

const authenticateFirebaseUser = async (req, res) => {
  const authorization = req.get('authorization') || '';
  const idToken = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : '';
  const apiKey = getFirebaseApiKey();

  if (!idToken || !apiKey) {
    res.status(401).json({
      success: false,
      error: 'A signed-in Firebase session is required for payment.'
    });
    return null;
  }

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      }
    );
    const result = await response.json();
    const firebaseUser = result.users?.[0];

    if (!response.ok || !firebaseUser?.localId) {
      res.status(401).json({
        success: false,
        error: 'Your sign-in session is invalid or expired. Please sign in again.'
      });
      return null;
    }

    return {
      uid: firebaseUser.localId,
      email: firebaseUser.email || null
    };
  } catch (error) {
    console.error('Firebase session validation failed:', error.message);
    res.status(503).json({
      success: false,
      error: 'Unable to validate your sign-in session right now.'
    });
    return null;
  }
};

const safeSignatureMatch = (expected, received) => {
  const expectedBuffer = Buffer.from(expected, 'hex');
  const receivedBuffer = Buffer.from(received, 'hex');
  return expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Razorpay server is running' });
});

app.post('/api/create-order', async (req, res) => {
  try {
    const firebaseUser = await authenticateFirebaseUser(req, res);
    if (!firebaseUser) return;

    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        error: 'Razorpay keys are not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your environment.'
      });
    }

    const order = await razorpay.orders.create({
      amount: PAYMENT_AMOUNT_PAISE,
      currency: PAYMENT_CURRENCY,
      receipt: `prepmark-${crypto.randomUUID()}`,
      notes: {
        plan: 'PrepMark Premium',
        purpose: 'student-membership',
        firebase_uid: firebaseUser.uid
      }
    });

    res.json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      order
    });
  } catch (error) {
    console.error('Create order error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Unable to create a Razorpay order right now.'
    });
  }
});

app.post('/api/verify-payment', async (req, res) => {
  try {
    const firebaseUser = await authenticateFirebaseUser(req, res);
    if (!firebaseUser) return;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing payment verification fields'
      });
    }

    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        error: 'Razorpay is not configured on the server.'
      });
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = safeSignatureMatch(generatedSignature, razorpay_signature);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature'
      });
    }

    if (processedPayments.has(razorpay_payment_id)) {
      return res.status(409).json({
        success: false,
        error: 'This payment has already been processed.'
      });
    }

    const order = await razorpay.orders.fetch(razorpay_order_id);
    if (
      order.amount !== PAYMENT_AMOUNT_PAISE ||
      order.currency !== PAYMENT_CURRENCY ||
      order.notes?.firebase_uid !== firebaseUser.uid
    ) {
      return res.status(400).json({
        success: false,
        error: 'Payment order details could not be verified.'
      });
    }

    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (payment.order_id !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        error: 'Payment does not belong to this order.'
      });
    }

    if (payment.status === 'failed') {
      return res.status(402).json({
        success: false,
        error: 'Razorpay reported that this payment failed.'
      });
    }

    if (!['authorized', 'captured'].includes(payment.status)) {
      return res.status(202).json({
        success: false,
        pending: true,
        error: 'Payment is still pending. Please wait before retrying.'
      });
    }

    processedPayments.add(razorpay_payment_id);
    res.json({
      success: true,
      message: 'Payment verified successfully',
      payment: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount: order.amount,
        currency: order.currency,
        status: payment.status,
        userId: firebaseUser.uid
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Payment verification failed. Please try again.'
    });
  }
});

app.listen(port, () => {
  console.log(`Razorpay server running on port ${port}`);
});
