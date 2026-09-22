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
  userEmail,
  razorpayOrderId,
  amountPaise,
  currency
}) => {
  const result = await pool.query(
    `INSERT INTO payment_transactions
      (firebase_user_id, user_email, razorpay_order_id, amount_paise, currency, status)
     VALUES ($1, $2, $3, $4, $5, 'created')
     RETURNING id, razorpay_order_id, status, created_at`,
    [firebaseUserId, userEmail, razorpayOrderId, amountPaise, currency]
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

export const claimGuestPayment = async ({
  razorpayOrderId,
  guestOwnerId,
  firebaseUserId,
  userEmail
}) => {
  const result = await pool.query(
    `UPDATE payment_transactions
        SET firebase_user_id = $3,
            user_email = COALESCE($4, user_email),
            updated_at = now()
      WHERE razorpay_order_id = $1
        AND firebase_user_id = $2
        AND status IN ('paid', 'authorized')
      RETURNING id, firebase_user_id, user_email, razorpay_order_id,
                razorpay_payment_id, amount_paise, currency, status,
                payment_method, failure_reason, created_at, updated_at`,
    [razorpayOrderId, guestOwnerId, firebaseUserId, userEmail || null]
  );

  return result.rows[0] || null;
};

export const processRazorpayWebhook = async ({
  eventId,
  eventType,
  payloadHash,
  razorpayOrderId,
  razorpayPaymentId,
  status,
  paymentMethod = null,
  failureReason = null,
  metadata = {}
}) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const eventInsert = await client.query(
      `INSERT INTO razorpay_webhook_events
        (event_id, event_type, payload_hash, razorpay_order_id, razorpay_payment_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (event_id) DO NOTHING
       RETURNING event_id`,
      [eventId, eventType, payloadHash, razorpayOrderId, razorpayPaymentId]
    );

    if (eventInsert.rowCount === 0) {
      await client.query('COMMIT');
      return { duplicate: true, payment: null };
    }

    const paymentResult = await client.query(
      `SELECT id, firebase_user_id, user_email, razorpay_order_id,
              razorpay_payment_id, amount_paise, currency, status
         FROM payment_transactions
        WHERE ($1::text IS NOT NULL AND razorpay_order_id = $1)
           OR ($2::text IS NOT NULL AND razorpay_payment_id = $2)
        ORDER BY CASE WHEN razorpay_order_id = $1 THEN 0 ELSE 1 END
        LIMIT 1
        FOR UPDATE`,
      [razorpayOrderId, razorpayPaymentId]
    );

    if (paymentResult.rowCount === 0) {
      const error = new Error('Webhook payment record was not found.');
      error.code = 'PAYMENT_NOT_FOUND';
      throw error;
    }

    const current = paymentResult.rows[0];
    let nextStatus = status;
    if (
      current.status === 'refunded' ||
      (current.status === 'paid' && status !== 'refunded') ||
      (current.status === 'authorized' && ['failed', 'cancelled'].includes(status))
    ) {
      nextStatus = current.status;
    }

    const updated = await client.query(
      `UPDATE payment_transactions
          SET razorpay_payment_id = COALESCE($2, razorpay_payment_id),
              status = $3,
              payment_method = COALESCE($4, payment_method),
              failure_reason = $5,
              metadata = metadata || $6::jsonb,
              updated_at = now()
        WHERE id = $1
        RETURNING id, firebase_user_id, user_email, razorpay_order_id,
                  razorpay_payment_id, amount_paise, currency, status,
                  payment_method, failure_reason, created_at, updated_at`,
      [
        current.id,
        razorpayPaymentId,
        nextStatus,
        paymentMethod,
        failureReason,
        JSON.stringify({
          ...metadata,
          lastWebhookEvent: eventType,
          lastWebhookEventId: eventId
        })
      ]
    );

    await client.query('COMMIT');
    return { duplicate: false, payment: updated.rows[0] };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const listPaymentTransactions = async ({ limit = 100, offset = 0 } = {}) => {
  const result = await pool.query(
    `SELECT id, firebase_user_id, user_email, razorpay_order_id,
            razorpay_payment_id, amount_paise, currency, status,
            payment_method, failure_reason, created_at, updated_at
       FROM payment_transactions
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
};

const mapStudentProfile = (row) => row ? ({
  uid: row.firebase_user_id,
  email: row.email,
  fullName: row.full_name,
  dateOfBirth: row.date_of_birth,
  guardianName: row.guardian_name,
  guardianEmail: row.guardian_email,
  guardianPhone: row.guardian_phone,
  isGuardianVerified: row.is_guardian_verified,
  role: row.role,
  createdAt: row.created_at,
  updatedAt: row.updated_at
}) : null;

export const initializeStudentProfiles = async () => {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS student_profiles (
      firebase_user_id TEXT PRIMARY KEY,
      email TEXT NOT NULL DEFAULT '',
      full_name TEXT NOT NULL DEFAULT '',
      date_of_birth DATE,
      guardian_name TEXT NOT NULL DEFAULT '',
      guardian_email TEXT NOT NULL DEFAULT '',
      guardian_phone TEXT NOT NULL DEFAULT '',
      is_guardian_verified BOOLEAN NOT NULL DEFAULT FALSE,
      role TEXT NOT NULL DEFAULT 'student',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`
  );
};

export const findStudentProfile = async (firebaseUserId) => {
  const result = await pool.query(
    `SELECT firebase_user_id, email, full_name, date_of_birth,
            guardian_name, guardian_email, guardian_phone,
            is_guardian_verified, role, created_at, updated_at
       FROM student_profiles
      WHERE firebase_user_id = $1
      LIMIT 1`,
    [firebaseUserId]
  );
  return mapStudentProfile(result.rows[0]);
};

export const upsertStudentProfile = async ({
  firebaseUserId,
  email = '',
  fullName = '',
  dateOfBirth = '',
  guardianName = '',
  guardianEmail = '',
  guardianPhone = '',
  isGuardianVerified = false,
  role = 'student'
}) => {
  const result = await pool.query(
    `INSERT INTO student_profiles (
       firebase_user_id, email, full_name, date_of_birth,
       guardian_name, guardian_email, guardian_phone,
       is_guardian_verified, role
     )
     VALUES ($1, $2, $3, NULLIF($4, '')::date, $5, $6, $7, $8, $9)
     ON CONFLICT (firebase_user_id) DO UPDATE SET
       email = EXCLUDED.email,
       full_name = EXCLUDED.full_name,
       date_of_birth = EXCLUDED.date_of_birth,
       guardian_name = EXCLUDED.guardian_name,
       guardian_email = EXCLUDED.guardian_email,
       guardian_phone = EXCLUDED.guardian_phone,
       is_guardian_verified = EXCLUDED.is_guardian_verified,
       role = EXCLUDED.role,
       updated_at = now()
     RETURNING firebase_user_id, email, full_name, date_of_birth,
               guardian_name, guardian_email, guardian_phone,
               is_guardian_verified, role, created_at, updated_at`,
    [
      firebaseUserId,
      email,
      fullName,
      dateOfBirth,
      guardianName,
      guardianEmail,
      guardianPhone,
      Boolean(isGuardianVerified),
      role
    ]
  );
  return mapStudentProfile(result.rows[0]);
};

export const listStudentProfiles = async ({ limit = 25, offset = 0, search = '' } = {}) => {
  const searchPattern = `%${search}%`;
  const [profilesResult, countResult] = await Promise.all([
    pool.query(
      `SELECT firebase_user_id, email, full_name, date_of_birth,
              guardian_name, guardian_email, guardian_phone,
              is_guardian_verified, role, created_at, updated_at
         FROM student_profiles
        WHERE role = 'student'
          AND ($3 = '' OR full_name ILIKE $4 OR email ILIKE $4
               OR guardian_name ILIKE $4 OR guardian_email ILIKE $4)
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2`,
      [limit, offset, search, searchPattern]
    ),
    pool.query(
      `SELECT COUNT(*)::int AS total
         FROM student_profiles
        WHERE role = 'student'
          AND ($1 = '' OR full_name ILIKE $2 OR email ILIKE $2
               OR guardian_name ILIKE $2 OR guardian_email ILIKE $2)`,
      [search, searchPattern]
    )
  ]);

  return {
    students: profilesResult.rows.map(mapStudentProfile),
    total: countResult.rows[0]?.total || 0
  };
};

export const closeDatabase = () => pool.end();