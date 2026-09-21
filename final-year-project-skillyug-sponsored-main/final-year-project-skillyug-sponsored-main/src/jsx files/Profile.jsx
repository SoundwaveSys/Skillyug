import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css files/Profile.css';
import MainNavbar from '../components/MainNavbar';
import Footer from '../components/Footer';
import { getUserProfile, updateUserProfile } from '../firebase/auth';

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Student profile data from Firebase
  const [studentInfo, setStudentInfo] = useState({
    uid: '',
    fullName: '',
    email: '',
    dateOfBirth: '',
    age: '',
    guardianName: '',
    guardianPhone: ''
  });

  const [tempInfo, setTempInfo] = useState({ ...studentInfo });
  const [totalXP, setTotalXP] = useState(0);

  // Load user profile on component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await getUserProfile();
      
      if (result.success) {
        const profile = result.profile;
        
        // Calculate age from dateOfBirth if available
        const age = profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : '';
        
        const profileData = {
          uid: profile.uid || '',
          fullName: profile.fullName || '',
          email: profile.email || '',
          dateOfBirth: profile.dateOfBirth || '',
          age: age,
          guardianName: profile.guardianName || '',
          guardianPhone: profile.guardianPhone || ''
        };
        
        setStudentInfo(profileData);
        setTempInfo(profileData);

        const userXP = profile.totalXP || parseInt(localStorage.getItem('totalXP') || '0');
        setTotalXP(userXP);
      } else {
        setError('Failed to load profile. Please try again.');
        // Redirect to login if not authenticated
        if (result.error.includes('No user logged in')) {
          navigate('/login');
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('An error occurred while loading your profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTempInfo({ ...studentInfo });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      
      // Prepare data to update (exclude uid and email)
      const updateData = {
        fullName: tempInfo.fullName,
        dateOfBirth: tempInfo.dateOfBirth,
        guardianName: tempInfo.guardianName,
        guardianPhone: tempInfo.guardianPhone
      };
      
      const result = await updateUserProfile(updateData);
      
      if (result.success) {
        setStudentInfo({ ...tempInfo });
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('An error occurred while saving your profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempInfo({ ...studentInfo });
    setError('');
  };

  const handleInputChange = (field, value) => {
    setTempInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Auto-calculate age when date of birth changes
  const calculateAge = (dob) => {
    if (!dob) return '';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDOBChange = (value) => {
    handleInputChange('dateOfBirth', value);
    const newAge = calculateAge(value);
    handleInputChange('age', newAge);
  };

  // XP and Badge Calculations
  const XP_PER_LEVEL = 100;
  const xpLevel = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  const xpInCurrentLevel = totalXP % XP_PER_LEVEL;
  const xpProgress = (xpInCurrentLevel / XP_PER_LEVEL) * 100;

  const BADGES = [
    { levelRequirement: 1, name: "Novice Explorer", icon: "🌱", desc: "Started the learning journey" },
    { levelRequirement: 5, name: "Quiz Whiz", icon: "🧠", desc: "Reached Level 5" },
    { levelRequirement: 10, name: "Persistent Scholar", icon: "📚", desc: "Reached Level 10" },
    { levelRequirement: 25, name: "Mastermind", icon: "💡", desc: "Reached Level 25" },
    { levelRequirement: 50, name: "PrepMark Champion", icon: "👑", desc: "Reached Level 50" },
  ];

  if (loading) {
    return (
      <>
        <MainNavbar />
        <div className="profile-page">
          <div className="profile-container">
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p>Loading profile...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <MainNavbar />
      <div className="profile-page">
        <div className="profile-container">
          
          {/* Error Message */}
          {error && (
            <div style={{ 
              background: '#fee', 
              color: '#c33', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1rem',
              border: '1px solid #fcc'
            }}>
              {error}
            </div>
          )}
          
          {/* Profile Header with Avatar and Name */}
          <div className="profile-header-section">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">
                <span className="avatar-icon">👤</span>
              </div>
              <h1 className="profile-name">{isEditing ? tempInfo.fullName : studentInfo.fullName}</h1>
              <p className="profile-role">Student • Grade {isEditing ? tempInfo.grade : studentInfo.grade}</p>
            </div>

            <div className="profile-actions">
              {!isEditing ? (
                <button className="edit-profile-btn" onClick={handleEdit}>
                  <span className="btn-icon">✏️</span>
                  Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="save-btn" onClick={handleSave} disabled={saving}>
                    <span className="btn-icon">💾</span>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="cancel-btn" onClick={handleCancel} disabled={saving}>
                    <span className="btn-icon">✖️</span>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Details Cards */}
          <div className="profile-details-grid">
            
            {/* Account Information */}
            <div className="details-card">
              <h2 className="card-title">🔐 Account Information</h2>
              <div className="info-group">
                <div className="info-item">
                  <label className="info-label">User ID</label>
                  <p className="info-value" style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#666' }}>
                    {studentInfo.uid}
                  </p>
                  <small style={{ color: '#999', fontSize: '0.75rem' }}>Unique identifier (cannot be changed)</small>
                </div>

                <div className="info-item">
                  <label className="info-label">Email Address</label>
                  <p className="info-value">{studentInfo.email}</p>
                  <small style={{ color: '#999', fontSize: '0.75rem' }}>Email cannot be changed</small>
                </div>
              </div>
            </div>
            
            {/* Personal Information */}
            <div className="details-card">
              <h2 className="card-title">📋 Personal Information</h2>
              <div className="info-group">
                <div className="info-item">
                  <label className="info-label">Full Name</label>
                  {!isEditing ? (
                    <p className="info-value">{studentInfo.fullName || 'Not set'}</p>
                  ) : (
                    <input
                      type="text"
                      className="info-input"
                      value={tempInfo.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Enter full name"
                    />
                  )}
                </div>

                <div className="info-row">
                  <div className="info-item">
                    <label className="info-label">Date of Birth</label>
                    {!isEditing ? (
                      <p className="info-value">
                        {studentInfo.dateOfBirth 
                          ? new Date(studentInfo.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                          : 'Not set'}
                      </p>
                    ) : (
                      <input
                        type="date"
                        className="info-input"
                        value={tempInfo.dateOfBirth}
                        onChange={(e) => handleDOBChange(e.target.value)}
                      />
                    )}
                  </div>

                  <div className="info-item">
                    <label className="info-label">Age</label>
                    <p className="info-value">
                      {(isEditing ? tempInfo.age : studentInfo.age) || 'Not set'}
                      {(isEditing ? tempInfo.age : studentInfo.age) && ' years'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Guardian Information */}
            <div className="details-card full-width">
              <h2 className="card-title">👨‍👩‍👦 Guardian Information</h2>
              <div className="info-group">
                <div className="info-row">
                  <div className="info-item">
                    <label className="info-label">Guardian Name</label>
                    {!isEditing ? (
                      <p className="info-value">{studentInfo.guardianName || 'Not set'}</p>
                    ) : (
                      <input
                        type="text"
                        className="info-input"
                        value={tempInfo.guardianName}
                        onChange={(e) => handleInputChange('guardianName', e.target.value)}
                        placeholder="Enter guardian name"
                      />
                    )}
                  </div>

                  <div className="info-item">
                    <label className="info-label">Guardian Phone</label>
                    {!isEditing ? (
                      <p className="info-value">{studentInfo.guardianPhone || 'Not set'}</p>
                    ) : (
                      <input
                        type="tel"
                        className="info-input"
                        value={tempInfo.guardianPhone}
                        onChange={(e) => handleInputChange('guardianPhone', e.target.value)}
                        placeholder="Enter phone number"
                        pattern="[0-9]{10}"
                        maxLength="10"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements and XP Section */}
            <div className="details-card full-width achievements-section">
              <h2 className="card-title">🏆 Badges & Achievements</h2>
              
              <div className="profile-xp-container">
                <div className="profile-xp-header">
                  <div className="profile-xp-level-badge">Lv. {xpLevel}</div>
                  <div className="profile-xp-text">
                    <span className="profile-xp-current">{totalXP} XP</span> Total
                  </div>
                </div>
                <div className="profile-xp-bar-bg">
                  <div className="profile-xp-bar-fill" style={{ width: `${xpProgress}%` }}></div>
                </div>
                <div className="profile-xp-hint">{XP_PER_LEVEL - xpInCurrentLevel} XP to next level</div>
              </div>

              <div className="badges-grid">
                {BADGES.map((badge, idx) => {
                  const unlocked = xpLevel >= badge.levelRequirement;
                  return (
                    <div key={idx} className={`badge-card ${unlocked ? 'unlocked' : 'locked'}`}>
                      <div className="badge-icon">{badge.icon}</div>
                      <div className="badge-info">
                        <h3>{badge.name}</h3>
                        <p>{badge.desc}</p>
                      </div>
                      {!unlocked && <div className="badge-lock">🔒 Unlocks at Lv. {badge.levelRequirement}</div>}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;