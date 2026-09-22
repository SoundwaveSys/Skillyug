import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required for payment persistence.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30_000
});

export const createPaymentRecord = async ({
  firebaseUserId,
  razorpayOrderId,
  amountPaise,
  currency
}) => {
  const result = await pool.query(
    `INSERT INTO payment_transactions
      (firebase_user_id, razorpay_order_id, amount_paise, currency, status)
     VALUES ($1, $2, $3, $4, 'created')
     RETURNING id, razorpay_order_id, status, created_at`,
    [firebaseUserId, razorpayOrderId, amountPaise, currency]
  );
  return result.rows[0];
};

export const findPaymentByOrder = async (razorpayOrderId, firebaseUserId) => {
  const result = await pool.query(
    `SELECT id, firebase_user_id, razorpay_order_id, razorpay_payment_id,
            amount_paise, currency, status, payment_method, failure_reason,
            created_at, updated_at
       FROM payment_transactions
      WHERE razorpay_order_id = $1 AND firebase_user_id = $2
      LIMIT 1`,
    [razorpayOrderId, firebaseUserId]
  );
  return result.rows[0] || null;
};

export const findPaymentByPaymentId = async (razorpayPaymentId) => {
  const result = await pool.query(
    `SELECT id, firebase_user_id, razorpay_order_id, razorpay_payment_id,
            amount_paise, currency, status, payment_method, failure_reason,
            created_at, updated_at
       FROM payment_transactions
      WHERE razorpay_payment_id = $1
      LIMIT 1`,
    [razorpayPaymentId]
  );
  return result.rows[0] || null;
};

export const updatePaymentRecord = async ({
  razorpayOrderId,
  firebaseUserId,
  razorpayPaymentId = null,
  status,
  paymentMethod = null,
  failureReason = null,
  metadata = {}
}) => {
  const result = await pool.query(
    `UPDATE payment_transactions
        SET razorpay_payment_id = COALESCE($3, razorpay_payment_id),
            status = $4,
            payment_method = COALESCE($5, payment_method),
            failure_reason = $6,
            metadata = metadata || $7::jsonb,
            updated_at = now()
      WHERE razorpay_order_id = $1 AND firebase_user_id = $2
      RETURNING id, firebase_user_id, razorpay_order_id, razorpay_payment_id,
                amount_paise, currency, status, payment_method, failure_reason,
                created_at, updated_at`,
    [
      razorpayOrderId,
      firebaseUserId,
      razorpayPaymentId,
      status,
      paymentMethod,
      failureReason,
      JSON.stringify(metadata)
    ]
  );
  return result.rows[0] || null;
};

export const closeDatabase = () => pool.end();