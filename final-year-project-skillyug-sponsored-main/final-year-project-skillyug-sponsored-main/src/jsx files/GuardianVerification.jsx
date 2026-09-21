import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css files/GuardianVerification.css";
import ParticleBackground from "../components/StarBg";

const GuardianVerification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get guardian info passed from StudentInfo
  const guardianName = location.state?.guardianName || "";
  const phoneNumber = location.state?.phoneNumber || "";

  const handleSendOTP = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate OTP sending
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to OTP verification page
      navigate("/verify-otp", { state: { phoneNumber, guardianName } });
    }, 1000);
  };

  return (
    <div className="guardian-verification-page">
      <ParticleBackground />
      
      <div className="guardian-verification-container">
        <h1 className="guardian-verification-title">Guardian Verification</h1>
        <p className="guardian-verification-subtitle">We'll send an OTP to verify your guardian's phone number</p>

        <div className="verification-details" style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#999', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>
              Guardian Name
            </label>
            <p style={{ color: 'white', fontSize: '1rem', margin: 0 }}>
              {guardianName}
            </p>
          </div>
          <div>
            <label style={{ color: '#999', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>
              Phone Number
            </label>
            <p style={{ color: 'white', fontSize: '1rem', margin: 0 }}>
              {phoneNumber}
            </p>
          </div>
        </div>

        <form className="guardian-verification-form" onSubmit={handleSendOTP}>
          <button type="submit" className="send-otp-btn" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send OTP"}
          </button>
        </form>

        <button className="guardian-back-btn" onClick={() => navigate("/student-info")} disabled={isLoading}>
          Back
        </button>
      </div>
    </div>
  );
};

export default GuardianVerification;
