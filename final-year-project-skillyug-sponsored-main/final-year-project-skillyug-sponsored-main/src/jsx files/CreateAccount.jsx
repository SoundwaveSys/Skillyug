import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerWithEmail } from "../firebase/auth";
import { auth } from "../firebase/config";
import "../css files/CreateAccount.css";
import ParticleBackground from "../components/StarBg";
import Footer from "../components/Footer";

const CreateAccount = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate passwords match
    if (password !== rePassword) {
      setError("Passwords do not match!");
      return;
    }
    
    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    setLoading(true);

    try {
      const paidOrderId = localStorage.getItem("verifiedRazorpayOrder");
      if (!paidOrderId) {
        setError("Complete payment before creating your account.");
        return;
      }
      const validationResponse = await fetch("/api/validate-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ orderId: paidOrderId })
      });
      const validationResult = await validationResponse.json();
      if (!validationResponse.ok || !validationResult.success) {
        setError(validationResult.error || "Complete payment before creating your account.");
        return;
      }

      // Register user with Firebase
      const result = await registerWithEmail(email, password, {
        role: 'student'
      });
      
      if (result.success) {
        if (!auth.currentUser) {
          setError("Verified payment information was not found. Please contact support.");
          return;
        }
        const claimResponse = await fetch("/api/claim-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await auth.currentUser.getIdToken()}`
          },
          credentials: "same-origin",
          body: JSON.stringify({ orderId: paidOrderId })
        });
        const claimResult = await claimResponse.json();
        if (!claimResponse.ok || !claimResult.success) {
          setError(claimResult.error || "Unable to link your payment to this account.");
          return;
        }
        localStorage.removeItem("verifiedRazorpayOrder");
        navigate("/choose-role");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-account-page">
      {/* Particles in the background */}
      <ParticleBackground />
      
      <div className="create-account-card">
        <div className="create-account-header">
          <img src="assets/blue-skillyug-logo-1.jpg" alt="Skillyug" className="create-account-logo" />
          <h2 className="create-account-title">Create Account</h2>
          <p className="create-account-subtitle">Sign up to start your learning journey</p>
        </div>

        <form className="create-account-form" onSubmit={handleSubmit}>
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
          
          <label className="create-account-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="create-account-input"
            required
            disabled={loading}
          />

          <label className="create-account-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="create-account-input"
            required
            disabled={loading}
            minLength="6"
          />

          <label className="create-account-label" htmlFor="repassword">Re-enter Password</label>
          <input
            id="repassword"
            type="password"
            placeholder="••••••••"
            value={rePassword}
            onChange={(e) => setRePassword(e.target.value)}
            className="create-account-input"
            required
            disabled={loading}
          />

          <button type="submit" className="create-account-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Continue'}
          </button>
        </form>

        <button type="button" className="create-account-back-btn" onClick={() => { navigate("/"); window.scrollTo(0, 0); }}>
          Back 
        </button>
      </div>
      
    </div>
  );
};

export default CreateAccount;
