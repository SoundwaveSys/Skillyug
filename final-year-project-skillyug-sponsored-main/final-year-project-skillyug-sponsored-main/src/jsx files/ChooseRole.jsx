import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css files/ChooseRole.css";
import ParticleBackground from "../components/StarBg";

const ChooseRole = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const roles = {
    student: {
      title: "Student",
      icon: "🎓",
      permissions: [
        "Access interactive learning games",
        "Track personal progress and analytics",
        "Take adaptive quizzes and tests",
        "Earn badges and rewards",
        "Access learning library",
        "Participate in puzzle challenges"
      ],
      enabled: true
    },
    admin: {
      title: "Admin",
      icon: "👨‍💼",
      permissions: [
        "Manage student accounts",
        "Create and modify course content",
        "View detailed analytics and reports",
        "Manage assessments and grades",
        "Configure system settings",
        "Monitor platform activity"
      ],
      enabled: false,
      disabledMessage: "Admin accounts are managed by the system administrator"
    }
  };

  const handleRoleClick = (role) => {
    // Only allow selection if role is enabled
    if (roles[role].enabled) {
      setSelectedRole(selectedRole === role ? null : role);
    }
  };

  const handleContinue = () => {
    if (selectedRole === "student") {
      // Only allow students to continue through UI registration
      navigate("/student-info");
    }
    // Admin selection is disabled, so this won't be reached
  };

  return (
    <div className="choose-role-page">
      <ParticleBackground />
      
      <div className="choose-role-container">
        <h1 className="choose-role-title">Choose a Role</h1>
        
        <div className="role-panels">
          <div 
            className={`role-panel ${selectedRole === "student" ? "selected" : ""}`}
            onClick={() => handleRoleClick("student")}
          >
            <div className="role-panel-header">
              <span className="role-icon">{roles.student.icon}</span>
              <h2>{roles.student.title}</h2>
            </div>
            <div className="role-permissions">
              <h3>What you can do:</h3>
              <ul>
                {roles.student.permissions.map((permission, index) => (
                  <li key={index}>{permission}</li>
                ))}
              </ul>
            </div>
          </div>

          <div 
            className={`role-panel ${selectedRole === "admin" ? "selected" : ""} ${!roles.admin.enabled ? "disabled" : ""}`}
            onClick={() => handleRoleClick("admin")}
            style={{
              opacity: roles.admin.enabled ? 1 : 0.5,
              cursor: roles.admin.enabled ? 'pointer' : 'not-allowed',
              pointerEvents: roles.admin.enabled ? 'auto' : 'none'
            }}
          >
            {!roles.admin.enabled && (
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: '#f0f0f0',
                color: '#666',
                padding: '0.5rem 1rem',
                borderRadius: '1rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🔒 Restricted
              </div>
            )}
            <div className="role-panel-header">
              <span className="role-icon">{roles.admin.icon}</span>
              <h2>{roles.admin.title}</h2>
            </div>
            <div className="role-permissions">
              <h3>What you can do:</h3>
              <ul>
                {roles.admin.permissions.map((permission, index) => (
                  <li key={index}>{permission}</li>
                ))}
              </ul>
            </div>
            {!roles.admin.enabled && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: 'rgba(255, 193, 7, 0.1)',
                border: '1px solid rgba(255, 193, 7, 0.3)',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                color: '#856404'
              }}>
                ℹ️ {roles.admin.disabledMessage}
              </div>
            )}
          </div>
        </div>

        <button 
          className="continue-role-btn" 
          onClick={handleContinue}
          disabled={!selectedRole}
        >
          Continue
        </button>

        <button 
          className="back-role-btn" 
          onClick={() => navigate("/create-account")}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default ChooseRole;
