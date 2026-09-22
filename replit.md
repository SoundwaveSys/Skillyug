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
- Live Razorpay payments require test credentials in the environment: `VITE_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET`.