import React, { useEffect, useState } from 'react';
import '../css files/AdminHome.css';
import AdminNavbar from '../components/AdminNavbar';
import Footer from '../components/Footer';
import { auth } from '../firebase/config';

const AdminHome = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('Admin session is unavailable.');
        const response = await fetch('/api/admin/payments', {
          headers: { Authorization: `Bearer ${await user.getIdToken()}` }
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Unable to load payments.');
        }
        setPayments(result.payments);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };
    loadPayments();
  }, []);

  return (
    <div className="admin-home">
      <AdminNavbar />
      <div className="admin-content">
        <div className="admin-payments-header">
          <div>
            <p className="admin-eyebrow">Razorpay Test Mode</p>
            <h1>Payment transactions</h1>
          </div>
          <span className="admin-payment-count">{payments.length} records</span>
        </div>

        {loading && <p className="admin-state">Loading payment transactions…</p>}
        {error && <p className="admin-state admin-error" role="alert">{error}</p>}
        {!loading && !error && payments.length === 0 && (
          <p className="admin-state">No payment transactions have been recorded yet.</p>
        )}
        {!loading && !error && payments.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-payments-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Order</th>
                  <th>Payment</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Method</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <strong>{payment.user_email || 'No email stored'}</strong>
                      <small>{payment.firebase_user_id}</small>
                    </td>
                    <td>{payment.razorpay_order_id}</td>
                    <td>{payment.razorpay_payment_id || '—'}</td>
                    <td>{new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: payment.currency
                    }).format(payment.amount_paise / 100)}</td>
                    <td><span className={`admin-status admin-status-${payment.status}`}>{payment.status}</span></td>
                    <td>{payment.payment_method || '—'}</td>
                    <td>{new Date(payment.updated_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminHome;
