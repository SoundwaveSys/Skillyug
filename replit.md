# Project setup

The imported application is a React 19 frontend built with Vite. Its project root is:

`final-year-project-skillyug-sponsored-main/final-year-project-skillyug-sponsored-main`

## Run

The **Start application** workflow runs:

```sh
cd final-year-project-skillyug-sponsored-main/final-year-project-skillyug-sponsored-main && npm run dev
```

Vite listens on `0.0.0.0:5000` so the app is available in Replit Preview.

## External services

- Firebase configuration is read from the ignored `.env` file in the app directory.
- The Razorpay API runs on port 3001 and is proxied through Vite at `/api`.
- The payment API reads `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` from the server environment. The frontend receives only the public Key ID from the authenticated order response.
- Payment attempts require a valid Firebase Auth ID token. The server fixes the plan amount at ₹100 (10,000 paise), validates the Razorpay order and payment, and rejects duplicate payment IDs.
- Payment orders and verified outcomes are stored in the Replit PostgreSQL `payment_transactions` table, keyed to the validated Firebase UID. The existing Firestore question/user collections remain unchanged.
- Razorpay webhook deliveries use `/api/webhooks/razorpay`, require `RAZORPAY_WEBHOOK_SECRET`, and are deduplicated in `razorpay_webhook_events`.
- Admin payment data is available only through the protected `/admin-home` route and server-side Firebase role validation. Admin password resets use Firebase email reset; no development admin password is stored in code.