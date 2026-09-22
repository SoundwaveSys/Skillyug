# Razorpay Setup Guide

## 1) Install dependencies

npm install

## 2) Configure environment variables

Create a `.env` file in the project root with:

```env
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_PORT=3001
DATABASE_URL=provided_by_replit
```

## 3) Start the backend

npm run server

## 4) Start the frontend

npm run dev

## 5) Use Razorpay flow

- Open the Pricing page
- Sign in with Firebase
- Click "Proceed to Payment"
- The authenticated backend creates a fixed ₹100 Test Mode order
- Payment success triggers signature, order, and payment verification
- Verified payment status is persisted in the Replit development database

## Notes

- The frontend receives the public Razorpay Key ID from the create-order response; the Key Secret remains server-side.
- The old demo QR fallback was removed because it bypassed Razorpay verification.
- Test Mode remains enabled while the Key ID starts with `rzp_test_`.
