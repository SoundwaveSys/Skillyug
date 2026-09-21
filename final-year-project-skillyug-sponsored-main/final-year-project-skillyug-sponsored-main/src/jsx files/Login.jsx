import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithEmail } from "../firebase/auth";
import "../css files/Login.css";
import ParticleBackground from "../components/StarBg";
import Footer from "../components/Footer";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginWithEmail(email, password);
      
      if (result.success) {
        // Login successful - navigate to home
        navigate("/home");
      } else {
        // Show error message
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = () => {
    // Navigate to admin login page
    navigate("/admin-login");
  };

  return (
    <div className="lgn-login-page">
      {/* Particles in the background */}
      <ParticleBackground />
      
      <div className="lgn-login-card">
        <div className="lgn-login-header">
          <img src="assets/blue-skillyug-logo-1.jpg" alt="Skillyug" className="lgn-login-logo" />
          <h2 className="lgn-login-title" >Welcome back</h2>
          <p className="lgn-login-subtitle">Sign in to continue to your dashboard</p>
        </div>

         <button type="button" className="lgn-admin-btn" onClick={handleAdminLogin}>
          <img
            className="lgn-admin-icon"
            src="assets/skillyug-logo-removebg-preview.png"
            alt="Admin Logo"
          />
          Administrator Login
        </button>

        <form className="lgn-login-form" onSubmit={handleSubmit}>
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
          
          <label className="lgn-login-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="lgn-login-input"
            required
            disabled={loading}
          />

          <label className="lgn-login-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="lgn-login-input"
            required
            disabled={loading}
          />

          <div className="lgn-login-actions">
            <a href="#" className="lgn-forgot-link">Forgot password?</a>
          </div>

          <button type="submit" className="lgn-login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>

         <button type="button" className="lgn-back1-btn" onClick={() => { navigate("/"); window.scrollTo(0, 0); }}>
          
          Back 
        </button>

        <p className="lgn-login-hint">Don't have an account? <a href="/pricing">Sign up</a></p>
      </div>
      
    </div>
  );
};

export default Login;
