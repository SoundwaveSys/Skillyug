import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateUserProfile } from "../firebase/auth";
import "../css files/ProfileInfo.css";
import ParticleBackground from "../components/StarBg";

const StudentInfo = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    age: "",
    guardianName: "",
    guardianPhone: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-calculate age from date of birth
    if (name === "dateOfBirth" && value) {
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFormData(prev => ({ ...prev, age: age.toString() }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Update user profile with all student and guardian information
      const result = await updateUserProfile({
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone
      });

      if (result.success) {
        // Navigate to guardian verification (OTP)
        navigate("/guardian-verification", { 
          state: { 
            phoneNumber: formData.guardianPhone,
            guardianName: formData.guardianName 
          } 
        });
      } else {
        setError(result.error || "Failed to save profile information");
      }
    } catch (err) {
      console.error("Error saving student info:", err);
      setError("An error occurred while saving your information");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-info-page">
      <ParticleBackground />
      
      <div className="profile-info-container">
        <h1 className="profile-info-title">Student Information</h1>
        <p className="profile-info-subtitle">Complete your profile details</p>

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

        <form className="profile-info-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth *</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                readOnly
                placeholder="Auto-calculated"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="guardianName">Guardian's Name *</label>
              <input
                type="text"
                id="guardianName"
                name="guardianName"
                value={formData.guardianName}
                onChange={handleChange}
                placeholder="Enter guardian's full name"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="guardianPhone">Guardian's Phone *</label>
              <input
                type="tel"
                id="guardianPhone"
                name="guardianPhone"
                value={formData.guardianPhone}
                onChange={handleChange}
                placeholder="10-digit phone number"
                pattern="[0-9]{10}"
                maxLength="10"
                disabled={loading}
                required
              />
            </div>
          </div>

          <button type="submit" className="profile-submit-btn" disabled={loading}>
            {loading ? 'Saving...' : 'Continue to Verification'}
          </button>
        </form>

        <button className="profile-back-btn" onClick={() => navigate("/choose-role")} disabled={loading}>
          Back
        </button>
      </div>
    </div>
  );
};

export default StudentInfo;
