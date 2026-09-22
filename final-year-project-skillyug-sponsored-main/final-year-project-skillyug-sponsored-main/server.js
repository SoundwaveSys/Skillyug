import express from 'express';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  createPaymentRecord,
  findPaymentByOrder,
  findPaymentByPaymentId,
  updatePaymentRecord,
  processRazorpayWebhook,
  listPaymentTransactions,
  listStudentProfiles,
  findStudentProfile,
  upsertStudentProfile,
  initializeStudentProfiles
} from './db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || process.env.RAZORPAY_PORT || 3001;
const appDirectory = path.dirname(fileURLToPath(import.meta.url));
const PAYMENT_AMOUNT_PAISE = 10000;
const PAYMENT_CURRENCY = 'INR';

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
      error: 'A signed-in Firebase session is required.'
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
      email: firebaseUser.email || null,
      idToken
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

const getFirebaseProfile = async (firebaseUser) => {
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  if (!projectId) {
    const error = new Error('Firebase project configuration is missing.');
    error.code = 'FIREBASE_CONFIG_MISSING';
    throw error;
  }

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/users/${encodeURIComponent(firebaseUser.uid)}`,
    { headers: { Authorization: `Bearer ${firebaseUser.idToken}` } }
  );
  const profile = await response.json();
  return response.ok ? profile : null;
};

const safeSignatureMatch = (expected, received) => {
  const expectedBuffer = Buffer.from(expected, 'hex');
  const receivedBuffer = Buffer.from(received, 'hex');
  return expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};

const authenticateAdmin = async (req, res) => {
  const firebaseUser = await authenticateFirebaseUser(req, res);
  if (!firebaseUser) return null;

  try {
    const profile = await getFirebaseProfile(firebaseUser);
    if (profile?.fields?.role?.stringValue !== 'admin') {
      res.status(403).json({ success: false, error: 'Administrator access is required.' });
      return null;
    }
    return firebaseUser;
  } catch (error) {
    console.error('Admin authorization failed:', error.message);
    res.status(503).json({ success: false, error: 'Unable to authorize administrator.' });
    return null;
  }
};

const authenticateStudent = async (req, res) => {
  const firebaseUser = await authenticateFirebaseUser(req, res);
  if (!firebaseUser) return null;

  try {
    const profile = await getFirebaseProfile(firebaseUser);
    if (profile?.fields?.role?.stringValue !== 'student') {
      res.status(403).json({ success: false, error: 'Student access is required.' });
      return null;
    }
    return firebaseUser;
  } catch (error) {
    console.error('Student authorization failed:', error.message);
    res.status(503).json({ success: false, error: 'Unable to authorize student.' });
    return null;
  }
};

const firestoreValue = (field) => {
  if (!field) return '';
  if (Object.prototype.hasOwnProperty.call(field, 'booleanValue')) return field.booleanValue;
  return field.stringValue || field.timestampValue || '';
};

const synchronizeRegisteredStudents = async (admin) => {
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  let pageToken = '';

  do {
    const query = new URLSearchParams({ pageSize: '100' });
    if (pageToken) query.set('pageToken', pageToken);
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/users?${query}`,
      { headers: { Authorization: `Bearer ${admin.idToken}` } }
    );
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Unable to read registered users from Firebase.');
    }

    const students = (result.documents || []).filter(
      (document) => firestoreValue(document.fields?.role) === 'student'
    );
    await Promise.all(students.map((document) => {
      const fields = document.fields || {};
      const firebaseUserId = document.name.split('/').pop();
      return upsertStudentProfile({
        firebaseUserId,
        email: firestoreValue(fields.email),
        fullName: firestoreValue(fields.fullName) || firestoreValue(fields.displayName),
        dateOfBirth: firestoreValue(fields.dateOfBirth),
        guardianName: firestoreValue(fields.guardianName),
        guardianEmail: firestoreValue(fields.guardianEmail),
        guardianPhone: firestoreValue(fields.guardianPhone),
        isGuardianVerified: Boolean(firestoreValue(fields.isGuardianVerified)),
        role: 'student'
      });
    }));
    pageToken = result.nextPageToken || '';
  } while (pageToken);
};

const webhookStatusByEvent = {
  'payment.authorized': 'authorized',
  'payment.captured': 'paid',
  'order.paid': 'paid',
  'payment.failed': 'failed',
  'payment.refunded': 'refunded',
  'refund.processed': 'refunded'
};

app.post(
  '/api/webhooks/razorpay',
  express.raw({ type: 'application/json', limit: '100kb' }),
  async (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.get('x-razorpay-signature') || '';
    const eventId = req.get('x-razorpay-event-id') || '';

    if (!webhookSecret) {
      return res.status(503).json({ success: false, error: 'Webhook processing is not configured.' });
    }
    if (!signature || !eventId || !Buffer.isBuffer(req.body)) {
      return res.status(400).json({ success: false, error: 'Missing webhook verification data.' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.body)
      .digest('hex');
    if (!safeSignatureMatch(expectedSignature, signature)) {
      return res.status(400).json({ success: false, error: 'Invalid webhook signature.' });
    }

    let event;
    try {
      event = JSON.parse(req.body.toString('utf8'));
    } catch {
      return res.status(400).json({ success: false, error: 'Invalid webhook payload.' });
    }

    const status = webhookStatusByEvent[event.event];
    if (!status) {
      return res.json({ success: true, ignored: true });
    }

    const paymentEntity = event.payload?.payment?.entity || null;
    const orderEntity = event.payload?.order?.entity || null;
    const refundEntity = event.payload?.refund?.entity || null;
    const razorpayPaymentId = paymentEntity?.id || refundEntity?.payment_id || null;
    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id || null;

    if (!razorpayOrderId && !razorpayPaymentId) {
      return res.status(400).json({ success: false, error: 'Webhook has no payment identifier.' });
    }

    try {
      const result = await processRazorpayWebhook({
        eventId,
        eventType: event.event,
        payloadHash: crypto.createHash('sha256').update(req.body).digest('hex'),
        razorpayOrderId,
        razorpayPaymentId,
        status,
        paymentMethod: paymentEntity?.method || null,
        failureReason: paymentEntity?.error_description || null,
        metadata: {
          razorpayCreatedAt: paymentEntity?.created_at || refundEntity?.created_at || null,
          refundId: refundEntity?.id || null
        }
      });
      return res.json({
        success: true,
        duplicate: result.duplicate,
        status: result.payment?.status || null
      });
    } catch (error) {
      if (error.code === 'PAYMENT_NOT_FOUND') {
        return res.status(503).json({
          success: false,
          error: 'Payment record is not ready; webhook should be retried.'
        });
      }
      console.error('Razorpay webhook error:', error.message);
      return res.status(500).json({ success: false, error: 'Webhook processing failed.' });
    }
  }
);

app.use(express.json({ limit: '10kb' }));

const studentProfileFields = [
  'fullName',
  'dateOfBirth',
  'guardianName',
  'guardianEmail',
  'guardianPhone',
  'isGuardianVerified'
];

const normalizeStudentProfile = (body = {}) => {
  const profile = {};
  for (const field of studentProfileFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      profile[field] = field === 'isGuardianVerified'
        ? Boolean(body[field])
        : String(body[field] ?? '').trim();
    }
  }
  return profile;
};

app.get('/api/student-profile', async (req, res) => {
  const firebaseUser = await authenticateStudent(req, res);
  if (!firebaseUser) return;

  try {
    const profile = await findStudentProfile(firebaseUser.uid);
    return res.json({ success: true, profile });
  } catch (error) {
    console.error('Student profile lookup failed:', error.message);
    return res.status(500).json({ success: false, error: 'Unable to load the student profile.' });
  }
});

app.put('/api/student-profile', async (req, res) => {
  const firebaseUser = await authenticateStudent(req, res);
  if (!firebaseUser) return;

  try {
    const current = await findStudentProfile(firebaseUser.uid);
    const updates = normalizeStudentProfile(req.body);
    const profile = await upsertStudentProfile({
      firebaseUserId: firebaseUser.uid,
      email: firebaseUser.email,
      fullName: updates.fullName ?? current?.fullName ?? '',
      dateOfBirth: updates.dateOfBirth ?? current?.dateOfBirth ?? '',
      guardianName: updates.guardianName ?? current?.guardianName ?? '',
      guardianEmail: updates.guardianEmail ?? current?.guardianEmail ?? '',
      guardianPhone: updates.guardianPhone ?? current?.guardianPhone ?? '',
      isGuardianVerified:
          updates.isGuardianVerified ?? current?.isGuardianVerified ?? false,
        role: 'student'
    });
    return res.json({ success: true, profile });
  } catch (error) {
    console.error('Student profile save failed:', error.message);
    const invalidDate = error.code === '22007';
    return res.status(invalidDate ? 400 : 500).json({
      success: false,
      error: invalidDate ? 'Date of birth is invalid.' : 'Unable to save the student profile.'
    });
  }
});

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

    await createPaymentRecord({
      firebaseUserId: firebaseUser.uid,
      userEmail: firebaseUser.email,
      razorpayOrderId: order.id,
      amountPaise: order.amount,
      currency: order.currency
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

    const existingPayment = await findPaymentByPaymentId(razorpay_payment_id);
    if (existingPayment) {
      const isSamePayment =
        existingPayment.firebase_user_id === firebaseUser.uid &&
        existingPayment.razorpay_order_id === razorpay_order_id;
      if (!isSamePayment) {
        return res.status(409).json({
          success: false,
          error: 'This payment ID is already associated with another order.'
        });
      }
      if (existingPayment.status === 'paid') {
        return res.json({
          success: true,
          idempotent: true,
          message: 'Payment was already verified.',
          payment: existingPayment
        });
      }
    }

    const paymentRecord = await findPaymentByOrder(razorpay_order_id, firebaseUser.uid);
    if (!paymentRecord) {
      return res.status(404).json({
        success: false,
        error: 'No matching payment order was found.'
      });
    }

    const order = await razorpay.orders.fetch(razorpay_order_id);
    if (
      order.amount !== PAYMENT_AMOUNT_PAISE ||
      order.currency !== PAYMENT_CURRENCY ||
      order.notes?.firebase_uid !== firebaseUser.uid ||
      paymentRecord.amount_paise !== PAYMENT_AMOUNT_PAISE ||
      paymentRecord.currency !== PAYMENT_CURRENCY
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
      await updatePaymentRecord({
        razorpayOrderId: razorpay_order_id,
        firebaseUserId: firebaseUser.uid,
        razorpayPaymentId: razorpay_payment_id,
        status: 'failed',
        paymentMethod: payment.method || null,
        failureReason: payment.error_description || 'Razorpay reported payment failure'
      });
      return res.status(402).json({
        success: false,
        error: 'Razorpay reported that this payment failed.'
      });
    }

    if (!['authorized', 'captured'].includes(payment.status)) {
      await updatePaymentRecord({
        razorpayOrderId: razorpay_order_id,
        firebaseUserId: firebaseUser.uid,
        razorpayPaymentId: razorpay_payment_id,
        status: 'pending',
        paymentMethod: payment.method || null
      });
      return res.status(202).json({
        success: false,
        pending: true,
        error: 'Payment is still pending. Please wait before retrying.'
      });
    }

    const savedPayment = await updatePaymentRecord({
      razorpayOrderId: razorpay_order_id,
      firebaseUserId: firebaseUser.uid,
      razorpayPaymentId: razorpay_payment_id,
      status: payment.status === 'captured' ? 'paid' : 'authorized',
      paymentMethod: payment.method || null,
      metadata: {
        razorpayOrderStatus: order.status,
        verifiedAt: new Date().toISOString()
      }
    });

    res.json({
      success: true,
      message: 'Payment verified successfully',
      payment: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount: order.amount,
        currency: order.currency,
        status: savedPayment.status,
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

app.get('/api/payment-status/:orderId', async (req, res) => {
  try {
    const firebaseUser = await authenticateFirebaseUser(req, res);
    if (!firebaseUser) return;

    let payment = await findPaymentByOrder(req.params.orderId, firebaseUser.uid);
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment order was not found.'
      });
    }

    if (!['paid', 'refunded'].includes(payment.status)) {
      const razorpay = getRazorpay();
      if (razorpay) {
        const orderPayments = await razorpay.orders.fetchPayments(payment.razorpay_order_id);
        const remotePayments = orderPayments.items || [];
        const remotePayment =
          remotePayments.find((item) => item.status === 'captured') ||
          remotePayments.find((item) => item.status === 'authorized') ||
          remotePayments.find((item) => item.status === 'failed');

        if (remotePayment) {
          const reconciledStatus = remotePayment.status === 'captured'
            ? 'paid'
            : remotePayment.status;
          payment = await updatePaymentRecord({
            razorpayOrderId: payment.razorpay_order_id,
            firebaseUserId: firebaseUser.uid,
            razorpayPaymentId: remotePayment.id,
            status: reconciledStatus,
            paymentMethod: remotePayment.method || null,
            failureReason: remotePayment.error_description || null,
            metadata: {
              reconciledAt: new Date().toISOString(),
              reconciliationSource: 'status-endpoint'
            }
          });
        }
      }
    }

    res.json({
      success: true,
      payment: {
        orderId: payment.razorpay_order_id,
        paymentId: payment.razorpay_payment_id,
        amount: payment.amount_paise,
        currency: payment.currency,
        status: payment.status,
        failureReason: payment.failure_reason,
        updatedAt: payment.updated_at
      }
    });
  } catch (error) {
    console.error('Payment status error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Unable to retrieve payment status.'
    });
  }
});

app.patch('/api/payment-status/:orderId', async (req, res) => {
  try {
    const firebaseUser = await authenticateFirebaseUser(req, res);
    if (!firebaseUser) return;

    const status = req.body.status;
    if (!['failed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Only failed or cancelled client states can be reported.'
      });
    }

    const existingPayment = await findPaymentByOrder(req.params.orderId, firebaseUser.uid);
    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        error: 'Payment order was not found.'
      });
    }
    if (['paid', 'authorized'].includes(existingPayment.status)) {
      return res.status(409).json({
        success: false,
        error: 'A successful payment cannot be changed by the client.'
      });
    }

    const payment = await updatePaymentRecord({
      razorpayOrderId: req.params.orderId,
      firebaseUserId: firebaseUser.uid,
      status,
      failureReason: String(req.body.failureReason || '').slice(0, 500) || null
    });

    res.json({ success: true, status: payment.status });
  } catch (error) {
    console.error('Payment status update error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Unable to update payment status.'
    });
  }
});

app.get('/api/admin/payments', async (req, res) => {
  try {
    const admin = await authenticateAdmin(req, res);
    if (!admin) return;

    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 250)
      : 100;
    const payments = await listPaymentTransactions({ limit });
    res.json({ success: true, payments });
  } catch (error) {
    console.error('Admin payments error:', error.message);
    res.status(500).json({ success: false, error: 'Unable to load payment transactions.' });
  }
});

app.get('/api/admin/students', async (req, res) => {
  try {
    const admin = await authenticateAdmin(req, res);
    if (!admin) return;

    const requestedPage = Number.parseInt(req.query.page, 10);
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const page = Number.isFinite(requestedPage) ? Math.max(requestedPage, 1) : 1;
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 100)
      : 25;
    const search = String(req.query.search || '').trim().slice(0, 100);
    await synchronizeRegisteredStudents(admin);
    const { students, total } = await listStudentProfiles({
      limit,
      offset: (page - 1) * limit,
      search
    });

    res.json({
      success: true,
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1)
      }
    });
  } catch (error) {
    console.error('Admin students error:', error.message);
    res.status(500).json({ success: false, error: 'Unable to load registered students.' });
  }
});

app.use(express.static(path.join(appDirectory, 'dist')));
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) {
    return next();
  }
  return res.sendFile(path.join(appDirectory, 'dist', 'index.html'));
});

initializeStudentProfiles()
  .then(() => {
    app.listen(port, () => {
      console.log(`Razorpay server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
    process.exitCode = 1;
  });
