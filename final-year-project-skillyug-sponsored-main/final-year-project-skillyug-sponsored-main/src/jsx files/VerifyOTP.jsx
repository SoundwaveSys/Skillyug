import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css files/GuardianVerification.css";
import ParticleBackground from "../components/StarBg";

const VerifyOTP = () => {
  const [otp, setOTP] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const phoneNumber = location.state?.phoneNumber || "";

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate OTP verification
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to home page
      navigate("/home");
    }, 1000);
  };

  const handleResendOTP = () => {
    setTimer(60);
    setCanResend(false);
    // Add resend OTP logic here
    alert("OTP resent successfully!");
  };

  return (
    <div className="guardian-verification-page">
      <ParticleBackground />
      
      <div className="guardian-verification-container">
        <h1 className="guardian-verification-title">Verify OTP</h1>
        <p className="guardian-verification-subtitle">
          Enter the 6-digit code sent to {phoneNumber}
        </p>

        <form className="guardian-verification-form" onSubmit={handleVerifyOTP}>
          <div className="form-group">
            <label htmlFor="otp">Enter OTP *</label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={otp}
              onChange={(e) => setOTP(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit OTP"
              maxLength="6"
              pattern="[0-9]{6}"
              required
            />
          </div>

          <div className="otp-timer">
            {canResend ? (
              <button type="button" className="resend-otp-btn" onClick={handleResendOTP}>
                Resend OTP
              </button>
            ) : (
              <span>Resend OTP in {timer}s</span>
            )}
          </div>

          <button type="submit" className="verify-otp-btn" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>

        <button className="guardian-back-btn" onClick={() => navigate("/guardian-verification")}>
          Back
        </button>
      </div>
    </div>
  );
};

export default VerifyOTP;
