import React, { useEffect, useState } from 'react';
import '../css files/AdminHome.css';
import AdminNavbar from '../components/AdminNavbar';
import Footer from '../components/Footer';
import { auth } from '../firebase/config';

const AdminHome = () => {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeView, setActiveView] = useState('students');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1
  });

  useEffect(() => {
    const loadAdminData = async () => {
      setLoading(true);
      setError('');
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('Admin session is unavailable.');
        const token = await user.getIdToken();
        const url = activeView === 'students'
          ? `/api/admin/students?page=${pagination.page}&limit=${pagination.limit}&search=${encodeURIComponent(search)}`
          : '/api/admin/payments';
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Unable to load administrator data.');
        }
        if (activeView === 'students') {
          setStudents(result.students);
          setPagination(result.pagination);
        } else {
          setPayments(result.payments);
        }
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };
    loadAdminData();
  }, [activeView, pagination.page, pagination.limit, search]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPagination((current) => ({ ...current, page: 1 }));
    setSearch(searchInput.trim());
  };

  const formatDate = (value) => value
    ? new Date(value).toLocaleString()
    : '—';

  return (
    <div className="admin-home">
      <AdminNavbar />
      <div className="admin-content">
        <div className="admin-view-tabs" aria-label="Administrator dashboard sections">
          <button
            type="button"
            className={activeView === 'students' ? 'active' : ''}
            onClick={() => setActiveView('students')}
          >
            Registered students
          </button>
          <button
            type="button"
            className={activeView === 'payments' ? 'active' : ''}
            onClick={() => setActiveView('payments')}
          >
            Payment transactions
          </button>
        </div>

        {activeView === 'students' && (
          <>
            <div className="admin-payments-header">
              <div>
                <p className="admin-eyebrow">Account management</p>
                <h1>Registered students</h1>
              </div>
              <span className="admin-payment-count">{pagination.total} records</span>
            </div>

            <form className="admin-search" onSubmit={handleSearch}>
              <label htmlFor="student-search">Search students</label>
              <div>
                <input
                  id="student-search"
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Name, email, guardian, or phone"
                  maxLength={100}
                />
                <button type="submit">Search</button>
              </div>
            </form>

            {loading && <p className="admin-state">Loading registered students…</p>}
            {error && <p className="admin-state admin-error" role="alert">{error}</p>}
            {!loading && !error && students.length === 0 && (
              <p className="admin-state">
                {search ? 'No students match your search.' : 'No registered students have been recorded yet.'}
              </p>
            )}
            {!loading && !error && students.length > 0 && (
              <>
                <div className="admin-table-wrap">
                  <table className="admin-payments-table admin-students-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Date of birth</th>
                        <th>Guardian</th>
                        <th>Guardian phone</th>
                        <th>Verification</th>
                        <th>Registered</th>
                        <th>Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.uid}>
                          <td>
                            <strong>{student.fullName || 'Name not provided'}</strong>
                            <small>{student.email}</small>
                          </td>
                          <td>{student.dateOfBirth || '—'}</td>
                          <td>
                            <strong>{student.guardianName || 'Name not provided'}</strong>
                            <small>{student.guardianEmail || 'No email provided'}</small>
                          </td>
                          <td>{student.guardianPhone || '—'}</td>
                          <td>
                            <span className={`admin-status ${student.isGuardianVerified ? 'admin-status-paid' : 'admin-status-pending'}`}>
                              {student.isGuardianVerified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td>{formatDate(student.createdAt)}</td>
                          <td>{formatDate(student.updatedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="admin-pagination">
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}
                  >
                    Previous
                  </button>
                  <span>Page {pagination.page} of {pagination.totalPages}</span>
                  <button
                    type="button"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {activeView === 'payments' && (
          <>
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
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminHome;
