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
  const [fieldErrors, setFieldErrors] = useState({});

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === "guardianPhone"
      ? value.replace(/\D/g, "").slice(0, 10)
      : value;
    setFieldErrors(prev => ({ ...prev, [name]: "" }));
    setFormData(prev => ({
      ...prev,
      [name]: nextValue
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

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.fullName.trim()) nextErrors.fullName = "Enter the student's full name.";
    if (!formData.dateOfBirth) nextErrors.dateOfBirth = "Choose a date of birth.";
    if (formData.dateOfBirth && new Date(formData.dateOfBirth) > new Date()) {
      nextErrors.dateOfBirth = "Date of birth cannot be in the future.";
    }
    if (!formData.guardianName.trim()) nextErrors.guardianName = "Enter a guardian's name.";
    if (!/^\d{10}$/.test(formData.guardianPhone)) {
      nextErrors.guardianPhone = "Enter a 10-digit phone number.";
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;
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
        navigate("/home");
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
        <div className="profile-info-header">
          <div>
            <p className="profile-info-kicker">PrepMark · Step 1 of 1</p>
            <h1 className="profile-info-title">A little about you</h1>
            <p className="profile-info-subtitle">These details help us shape a learning experience that feels right for your family.</p>
          </div>
          <button type="button" className="profile-home-btn" onClick={() => navigate("/home")}>
            Home
          </button>
        </div>

        {error && (
          <div className="profile-error" role="alert">
            <span aria-hidden="true">!</span>
            {error}
          </div>
        )}

        <form className="profile-info-form" onSubmit={handleSubmit}>
          <fieldset className="form-section">
            <legend>Student details</legend>
            <div className="form-row">
            <div className="form-group">
              <label htmlFor="fullName">Full name <span className="required-mark" aria-hidden="true">*</span></label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                disabled={loading}
                aria-invalid={Boolean(fieldErrors.fullName)}
                aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined}
              />
              {fieldErrors.fullName && <p id="fullName-error" className="field-error">{fieldErrors.fullName}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of birth <span className="required-mark" aria-hidden="true">*</span></label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={loading}
                aria-invalid={Boolean(fieldErrors.dateOfBirth)}
                aria-describedby={fieldErrors.dateOfBirth ? "dateOfBirth-error" : undefined}
              />
              {fieldErrors.dateOfBirth && <p id="dateOfBirth-error" className="field-error">{fieldErrors.dateOfBirth}</p>}
            </div>
            </div>

            <div className="form-row" style={{ marginTop: "1rem" }}>
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
              <p className="field-hint">Calculated from your date of birth.</p>
            </div>
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>Family contact</legend>
            <div className="form-row">
            <div className="form-group">
              <label htmlFor="guardianName">Guardian's name <span className="required-mark" aria-hidden="true">*</span></label>
              <input
                type="text"
                id="guardianName"
                name="guardianName"
                value={formData.guardianName}
                onChange={handleChange}
                placeholder="Enter guardian's full name"
                disabled={loading}
                aria-invalid={Boolean(fieldErrors.guardianName)}
                aria-describedby={fieldErrors.guardianName ? "guardianName-error" : undefined}
              />
              {fieldErrors.guardianName && <p id="guardianName-error" className="field-error">{fieldErrors.guardianName}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="guardianPhone">Guardian's phone <span className="required-mark" aria-hidden="true">*</span></label>
              <input
                type="tel"
                id="guardianPhone"
                name="guardianPhone"
                value={formData.guardianPhone}
                onChange={handleChange}
                placeholder="10-digit phone number"
                inputMode="numeric"
                maxLength={10}
                disabled={loading}
                aria-invalid={Boolean(fieldErrors.guardianPhone)}
                aria-describedby={fieldErrors.guardianPhone ? "guardianPhone-error" : undefined}
              />
              {fieldErrors.guardianPhone && <p id="guardianPhone-error" className="field-error">{fieldErrors.guardianPhone}</p>}
            </div>
            </div>
          </fieldset>

          <button type="submit" className="profile-submit-btn" disabled={loading}>
            {loading ? "Saving your details..." : "Save and go to Home"}
          </button>
        </form>

        <button type="button" className="profile-back-btn" onClick={() => navigate("/choose-role")} disabled={loading}>
          Back to role selection
        </button>
      </div>
    </div>
  );
};

export default StudentInfo;
