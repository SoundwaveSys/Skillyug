# Razorpay Setup Guide

## 1) Install dependencies

npm install

## 2) Configure environment variables

Create a `.env` file in the project root with:

```env
VITE_RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
PORT=5000
```

## 3) Start the backend

npm run server

## 4) Start the frontend

npm run dev

## 5) Use Razorpay flow

- Open the Pricing page
- Click "Proceed to Payment"
- If the frontend key is configured, the app will open Razorpay checkout
- Payment success triggers verification against the backend

## Notes

- The QR payment modal remains as a fallback for demo/testing when no Razorpay key is set.
- For production, use a real Razorpay key and backend verification endpoint.
