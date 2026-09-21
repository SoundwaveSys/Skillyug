// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "../css files/AdminLogin.css";
// import ParticleBackground from "../components/StarBg";

// const AdminLogin = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [adminKey, setAdminKey] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Add admin login logic here - for now, directly navigate to Home
//     // In a real app, you would validate admin credentials and admin key
//     if (adminKey.trim() === "") {
//       alert("Please enter the admin key");
//       return;
//     }
//     navigate("/home");
//   };

//   const handleGoogle = () => {
//     // Hook your Google OAuth here for admin
//     alert("Admin Google OAuth - requires additional verification");
//   };

//   return (
//     <div className="admin-login-page">
//       {/* Particles in the background */}
//       <ParticleBackground />
//       <button
//         className="admin-login-back-btn"
//         style={{
//           position: 'absolute',
//           top: 32,
//           left: 32,
//           background: '#fff',
//           color: '#0a174e',
//           border: 'none',
//           borderRadius: '1.5rem',
//           padding: '0.6rem 1.6rem',
//           fontWeight: 600,
//           fontSize: '1rem',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
//           cursor: 'pointer',
//           zIndex: 1000
//         }}
//         onClick={() => navigate("/login")}
//       >
//         ← Back to Login
//       </button>
//       <div className="admin-login-card">
//         <div className="admin-login-header">
//           <img src="assets/PrepMark.png" alt="Skillyug" className="admin-login-logo" />
//           <div className="admin-badge">
//             <span>🔐 ADMIN ACCESS</span>
//           </div>
//           <h2 className="admin-login-title">Administrator Login</h2>
//           <p className="admin-login-subtitle">Secure access for system administrators</p>
//         </div>

//         <button type="button" className="admin-google-btn" onClick={handleGoogle}>
//           <img
//             className="google-icon"
//             src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
//             alt="Google"
//           />
//           Continue with Google (Admin)
//         </button>

//         <div className="admin-divider"><span>or</span></div>

//         <form className="admin-login-form" onSubmit={handleSubmit}>
//           <label className="admin-login-label" htmlFor="admin-email">Admin Email</label>
//           <input
//             id="admin-email"
//             type="email"
//             placeholder="admin@skillyug.com"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="admin-login-input"
//             required
//           />

//           <label className="admin-login-label" htmlFor="admin-password">Password</label>
//           <input
//             id="admin-password"
//             type="password"
//             placeholder="••••••••"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="admin-login-input"
//             required
//           />

//           <label className="admin-login-label" htmlFor="admin-key">
//             Admin Access Key
//             <span className="required-indicator">*</span>
//           </label>
//           <input
//             id="admin-key"
//             type="password"
//             placeholder="Enter admin access key"
//             value={adminKey}
//             onChange={(e) => setAdminKey(e.target.value)}
//             className="admin-login-input admin-key-input"
//             required
//           />

//           <div className="admin-login-actions">
//             <label className="admin-remember">
//               <input type="checkbox" />
//               <span>Remember admin session</span>
//             </label>
//             <a href="#" className="admin-forgot-link">Contact IT Support</a>
//           </div>

//           <button type="submit" className="admin-login-btn">
//             <span>🔐</span>
//             Secure Admin Login
//           </button>
//         </form>

//         <div className="admin-security-notice">
//           <p>⚠️ This is a secure admin portal. All access attempts are logged and monitored.</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminLogin;


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../firebase/auth";
import "../css files/AdminLogin.css";
import ParticleBackground from "../components/StarBg";
import Footer from "../components/Footer";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authKey, setAuthKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginAdmin(email, password, authKey);
      
      if (result.success) {
        // Admin login successful - navigate to admin home
        navigate("/admin-home");
      } else {
        // Show error message
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Admin login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserLogin = () => {
    // Navigate to admin login page
    navigate("/login");
  };

  return (
    <div className="adlgn-admin-login-page">
      {/* Particles in the background */}
      <ParticleBackground />
     
      <div className="adlgn-admin-login-card">
        <div className="adlgn-admin-login-header">
          <img src="assets/blue-skillyug-logo-1.jpg" alt="Skillyug" className="adlgn-admin-login-logo" />
          <h2 className="adlgn-admin-login-title" >Admin Login</h2>
          <p className="adlgn-admin-login-subtitle">Sign in to continue to your dashboard</p>
        </div>

         <button type="button" className="adlgn-user-btn" onClick={handleUserLogin}>
          <img
            className="adlgn-user-icon"
            src="assets/skillyug-logo-removebg-preview.png"
            alt="User Logo"
          />
          User Login
        </button>

        <form className="adlgn-admin-login-form" onSubmit={handleSubmit}>
          {error && (
            <div style={{
              padding: '0.75rem',
              marginBottom: '1rem',
              backgroundColor: '#fee',
              color: '#c33',
              borderRadius: '0.5rem',
              fontSize: '0.9rem',
              border: '1px solid #fcc'
            }}>
              {error}
            </div>
          )}
          
          <label className="adlgn-admin-login-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="adlgn-admin-login-input"
            required
            disabled={loading}
          />

          <label className="adlgn-admin-login-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="adlgn-admin-login-input"
            required
            disabled={loading}
          />

          <label className="adlgn-admin-login-label" htmlFor="authkey">Authentication Key</label>
          <input
            id="authkey"
            type="password"
            placeholder="Enter admin key"
            value={authKey}
            onChange={(e) => setAuthKey(e.target.value)}
            className="adlgn-admin-login-input"
            required
            disabled={loading}
          />

          <div className="adlgn-admin-login-actions">
            <a href="#" className="adlgn-admin-forgot-link">Forgot password?</a>
          </div>

          <button type="submit" className="adlgn-admin-login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>

         <button type="button" className="adlgn-back2-btn" onClick={() => { navigate("/"); window.scrollTo(0, 0); }}>
          
          Back 
        </button>

        
      </div>
      
    </div>
  );
};

export default AdminLogin;
