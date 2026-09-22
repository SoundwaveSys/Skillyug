# Razorpay Setup Guide

## 1) Install dependencies

npm install

## 2) Configure environment variables

Create a `.env` file in the project root with:

```env
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_separate_test_webhook_secret
RAZORPAY_PORT=3001
DATABASE_URL=provided_by_replit
```

## 3) Start the backend

npm run server

## 4) Start the frontend

npm run dev

## 5) Use Razorpay flow

- Open the Pricing page
- Click "Proceed to Payment"
- The backend creates a fixed ₹100 Test Mode order and a secure guest checkout session
- Payment success triggers signature, order, and payment verification
- After verification, create the Firebase student account
- The verified payment is linked to the new Firebase user
- Continue to student and guardian information
- Unpaid visitors cannot use the account-creation flow
- Verified payment status is persisted in the Replit database

## Notes

- The frontend receives the public Razorpay Key ID from the create-order response; the Key Secret remains server-side.
- The old demo QR fallback was removed because it bypassed Razorpay verification.
- Test Mode remains enabled while the Key ID starts with `rzp_test_`.

## Razorpay Test Mode webhook

This Repl is not currently published, so it does not yet have a stable public URL for Razorpay.
After publishing, configure this Test Mode webhook URL in the Razorpay dashboard:

```text
https://<published-domain>/api/webhooks/razorpay
```

Do not use a `.replit.dev` workspace URL. Set a separate webhook secret in Razorpay and save
the same value as `RAZORPAY_WEBHOOK_SECRET` in Replit Secrets.

Subscribe to:

- `payment.authorized`
- `payment.captured`
- `payment.failed`
- `payment.refunded`
- `order.paid`
- `refund.processed`

Webhook bodies are verified before parsing. Event IDs are stored in
`razorpay_webhook_events` so duplicate deliveries are acknowledged without being processed
twice. Payment updates are transactional and cannot downgrade a paid or refunded transaction.

## Admin access

- Admins sign in with their Firebase email and password at `/admin-login`.
- Access also requires `users/{firebaseUid}.role` to equal `admin`.
- There is no development password or authentication key stored in this repository.
- Use the **Forgot password?** action to send a Firebase password-reset email.
- `/admin-home` is protected and shows recent payment transactions only to authorized admins.
