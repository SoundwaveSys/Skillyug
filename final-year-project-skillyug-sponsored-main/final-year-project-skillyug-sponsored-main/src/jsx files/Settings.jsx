import React, { useState } from 'react';
import '../css files/Settings.css';
import MainNavbar from '../components/MainNavbar';
import Footer from '../components/Footer';
import ParticleBackground from '../components/StarBg';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [settings, setSettings] = useState({
    // Account Settings
    username: 'student123',
    email: 'student@example.com',
    phoneNumber: '+91 98765 43210',
    guardianEmail: 'guardian@example.com',
    profileVisibility: 'friends',
    twoFactorAuth: false,
    showEmail: false,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    studyReminders: true,
    achievementAlerts: true,
    weeklyReports: true,
    testResultsNotif: true,
    streakReminders: true,
    messageNotif: true,
    
    // Study Preferences
    dailyGoal: 60,
    reminderTime: '18:00',
    difficulty: 'medium',
    soundEffects: true,
    showHints: true,
    autoSubmit: false,
    questionsPerTest: 20,
    timePerQuestion: 120,
    showCorrectAnswer: true,
    allowReview: true,
    randomizeQuestions: true,
    
    // Appearance
    theme: 'dark',
    fontSize: 'medium',
    animations: true,
    reducedMotion: false,
    highContrast: false,
    language: 'english',
    
    // Privacy & Security
    dataSharing: false,
    autoSave: true,
    sessionTimeout: 30,
    showProgress: true,
    analyticsTracking: true,
    
    // Accessibility
    screenReader: false,
    keyboardNav: true,
    voiceAssist: false,
    textToSpeech: false
  });

  const [showSaveNotification, setShowSaveNotification] = useState(false);

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleInputChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      const defaultSettings = {
        username: 'student123',
        email: 'student@example.com',
        phoneNumber: '+91 98765 43210',
        guardianEmail: 'guardian@example.com',
        profileVisibility: 'friends',
        twoFactorAuth: false,
        showEmail: false,
        emailNotifications: true,
        pushNotifications: true,
        studyReminders: true,
        achievementAlerts: true,
        weeklyReports: true,
        testResultsNotif: true,
        streakReminders: true,
        messageNotif: true,
        dailyGoal: 60,
        reminderTime: '18:00',
        difficulty: 'medium',
        soundEffects: true,
        showHints: true,
        autoSubmit: false,
        questionsPerTest: 20,
        timePerQuestion: 120,
        showCorrectAnswer: true,
        allowReview: true,
        randomizeQuestions: true,
        theme: 'dark',
        fontSize: 'medium',
        animations: true,
        reducedMotion: false,
        highContrast: false,
        language: 'english',
        dataSharing: false,
        autoSave: true,
        sessionTimeout: 30,
        showProgress: true,
        analyticsTracking: true,
        screenReader: false,
        keyboardNav: true,
        voiceAssist: false,
        textToSpeech: false
      };
      setSettings(defaultSettings);
      localStorage.setItem('appSettings', JSON.stringify(defaultSettings));
      setShowSaveNotification(true);
      setTimeout(() => setShowSaveNotification(false), 3000);
    }
  };

  const ToggleSwitch = ({ checked, onChange, label }) => (
    <div className="toggle-container">
      <div 
        className={`toggle-switch ${checked ? 'active' : ''}`}
        onClick={onChange}
      >
        <div className="toggle-slider"></div>
      </div>
    </div>
  );

  return (
    <>
      <MainNavbar />
      <ParticleBackground />
      <div className="settings-page">
        <div className="settings-content-wrapper">
          
          {/* Header */}
          <div className="settings-page-header">
            <div className="settings-header-content">
              <h1 className="settings-main-title">⚙️ Settings</h1>
              <p className="settings-main-subtitle">Customize your learning experience and preferences</p>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="settings-tabs">
            <button 
              className={`settings-tab ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              <span className="tab-icon">👤</span>
              <span className="tab-label">Account</span>
            </button>
            <button 
              className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <span className="tab-icon">🔔</span>
              <span className="tab-label">Notifications</span>
            </button>
            <button 
              className={`settings-tab ${activeTab === 'study' ? 'active' : ''}`}
              onClick={() => setActiveTab('study')}
            >
              <span className="tab-icon">📚</span>
              <span className="tab-label">Study</span>
            </button>
            <button 
              className={`settings-tab ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              <span className="tab-icon">🎨</span>
              <span className="tab-label">Appearance</span>
            </button>
            <button 
              className={`settings-tab ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              <span className="tab-icon">🔒</span>
              <span className="tab-label">Privacy</span>
            </button>
            <button 
              className={`settings-tab ${activeTab === 'accessibility' ? 'active' : ''}`}
              onClick={() => setActiveTab('accessibility')}
            >
              <span className="tab-icon">♿</span>
              <span className="tab-label">Accessibility</span>
            </button>
          </div>

          {/* Settings Sections */}
          <div className="settings-sections">
            
            {/* ACCOUNT TAB */}
            {activeTab === 'account' && (
              <div className="settings-section active">
                
                {/* Profile Information */}
                <div className="settings-card">
                  <div className="card-header">
                    <h3 className="card-title">Profile Information</h3>
                    <p className="card-description">Manage your personal information</p>
                  </div>
                  <div className="card-body">
                    <div className="form-group">
                      <label className="form-label">Username</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={settings.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        placeholder="Enter username"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input 
                        type="email" 
                        className="form-input" 
                        value={settings.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter email"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input 
                        type="tel" 
                        className="form-input" 
                        value={settings.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Guardian Email</label>
                      <input 
                        type="email" 
                        className="form-input" 
                        value={settings.guardianEmail}
                        onChange={(e) => handleInputChange('guardianEmail', e.target.value)}
                        placeholder="Enter guardian email"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Security */}
                <div className="settings-card">
                  <div className="card-header">
                    <h3 className="card-title">Security Settings</h3>
                    <p className="card-description">Manage your account security</p>
                  </div>
                  <div className="card-body">
                    <div className="setting-row">
                      <div className="setting-info">
                        <h4 className="setting-name">Two-Factor Authentication</h4>
                        <p className="setting-desc">Add an extra layer of security to your account</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.twoFactorAuth}
                        onChange={() => handleToggle('twoFactorAuth')}
                      />
                    </div>
                    
                    <div className="setting-row">
                      <div className="setting-info">
                        <h4 className="setting-name">Show Email Publicly</h4>
                        <p className="setting-desc">Display your email on your profile</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.showEmail}
                        onChange={() => handleToggle('showEmail')}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Profile Visibility</label>
                      <select 
                        className="form-select"
                        value={settings.profileVisibility}
                        onChange={(e) => handleInputChange('profileVisibility', e.target.value)}
                      >
                        <option value="public">Public - Everyone can see</option>
                        <option value="friends">Friends - Only friends can see</option>
                        <option value="private">Private - Only you can see</option>
                      </select>
                    </div>
                    
                    <button className="action-btn secondary">Change Password</button>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="settings-section active">
                
                <div className="settings-card">
                  <div className="card-header">
                    <h3 className="card-title">Notification Preferences</h3>
                    <p className="card-description">Choose what notifications you want to receive</p>
                  </div>
                  <div className="card-body">
                    <div className="setting-row">
                      <div className="setting-info">
                        <h4 className="setting-name">📧 Email Notifications</h4>
                        <p className="setting-desc">Receive updates and announcements via email</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.emailNotifications}
                        onChange={() => handleToggle('emailNotifications')}
                      />
                    </div>
                    
                    <div className="setting-row">
                      <div className="setting-info">
                        <h4 className="setting-name">📱 Push Notifications</h4>
                        <p className="setting-desc">Get instant notifications on your device</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.pushNotifications}
                        onChange={() => handleToggle('pushNotifications')}
                      />
                    </div>
                    
                    <div className="setting-row">
                      <div className="setting-info">
                        <h4 className="setting-name">⏰ Study Reminders</h4>
                        <p className="setting-desc">Daily reminders to maintain your study streak</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.studyReminders}
                        onChange={() => handleToggle('studyReminders')}
                      />
                    </div>
                    
                    <div className="setting-row">
                      <div className="setting-info">
                        <h4 className="setting-name">🏆 Achievement Alerts</h4>
                        <p className="setting-desc">Get notified when you unlock achievements</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.achievementAlerts}
                        onChange={() => handleToggle('achievementAlerts')}
                      />
                    </div>
                    
                    <div className="setting-row">
                      <div className="setting-info">
                        <h4 className="setting-name">📊 Weekly Reports</h4>
                        <p className="setting-desc">Receive weekly progress summaries via email</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.weeklyReports}
                        onChange={() => handleToggle('weeklyReports')}
                      />
                    </div>
                    
                    <div className="setting-row">
                      <div className="setting-info">
                        <h4 className="setting-name">📝 Test Results Notifications</h4>
                        <p className="setting-desc">Alerts when test results are available</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.testResultsNotif}
                        onChange={() => handleToggle('testResultsNotif')}
                      />
                    </div>
                    
                    <div className="setting-row">
                      <div className="setting-info">
                        <h4 className="setting-name">🔥 Streak Reminders</h4>
                        <p className="setting-desc">Don't break your streak! Get reminders</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.streakReminders}
                        onChange={() => handleToggle('streakReminders')}
                      />
                    </div>
                    
                    <div className="setting-row">
                      <div className="setting-info">
                        <h4 className="setting-name">💬 Message Notifications</h4>
                        <p className="setting-desc">Get notified about new messages</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.messageNotif}
                        onChange={() => handleToggle('messageNotif')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STUDY TAB */}
            {activeTab === 'study' && (
              <div className="settings-section active">
                
                <div className="settings-card">
                  <div className="card-header">
                    <h3 className="card-title">Study Preferences</h3>
                    <p className="card-description">Customize your learning experience</p>
                  </div>
                  <div className="card-body">
                    <div className="form-group">
                      <label className="form-label">
                        Daily Study Goal: <span className="form-value">{settings.dailyGoal} minutes</span>
                      </label>
                      <input 
                        type="range" 
                        className="form-range" 
                        min="15" 
                        max="180" 
                        step="15"
                        value={settings.dailyGoal}
                        onChange={(e) => handleInputChange('dailyGoal', parseInt(e.target.value))}
                      />
                      <div className="range-labels">
                        <span>15 min</span>
                        <span>180 min</span>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Study Reminder Time</label>
                      <input 
                        type="time" 
                        className="form-input" 
                        value={settings.reminderTime}
                        onChange={(e) => handleInputChange('reminderTime', e.target.value)}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Default Difficulty Level</label>
                      <select 
                        className="form-select"
                        value={settings.difficulty}
                        onChange={(e) => handleInputChange('difficulty', e.target.value)}
                      >
                        <option value="easy">Easy - Beginner Level</option>
                        <option value="medium">Medium - Intermediate Level</option>
                        <option value="hard">Hard - Advanced Level</option>
                        <option value="mixed">Mixed - All Levels</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Questions Per Practice Test</label>
                      <select 
                        className="form-select"
                        value={settings.questionsPerTest}
                        onChange={(e) => handleInputChange('questionsPerTest', parseInt(e.target.value))}
                      >
                        <option value="10">10 Questions</option>
                        <option value="20">20 Questions</option>
                        <option value="30">30 Questions</option>
                        <option value="50">50 Questions</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        Time Per Question: <span className="form-value">{settings.timePerQuestion} seconds</span>
                      </label>
                      <input 
                        type="range" 
                        className="form-range" 
                        min="30" 
                        max="300" 
                        step="30"
                        value={settings.timePerQuestion}
                        onChange={(e) => handleInputChange('timePerQuestion', parseInt(e.target.value))}
                      />
                      <div className="range-labels">
                        <span>30 sec</span>
                        <span>300 sec</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <div className="card-header">
                    <h3 className="card-title">Quiz Settings</h3>
                    <p className="card-description">Configure quiz behavior</p>
                  </div>
                  <div className="card-body">
                    <div className="setting-row">
                      <div className="setting-info">
                        <h4 className="setting-name">🔊 Sound Effects</h4>
                        <p className="setting-desc">Play sounds for correct/incorrect answers</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.soundEffects}
                        onChange={() => handleToggle('soundEffects')}
                      />
                    </div>
                    
                    <div className="setting-row">
                      <div className="setting-info">
                        <h4 className="setting-name">💡 Show Hints</h4>
                        <p className="setting-desc">Display hints during quizzes</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.showHints}
                        onChange={() => handleToggle('showHints')}
                      />
                    </div>
                    
                    <div className="setting-row">
                      <div className="setting-info">
                        <h4 className="setting-name">✅ Show Correct Answer</h4>
                        <p className="setting-desc">Show correct answer after submission</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.showCorrectAnswer}
                        onChange={() => handleToggle('showCorrectAnswer')}
                      />
                    </div>
                    
                    <div className="setting-row">
                      <div className="setting-info">
                        <h4 className="setting-name">📝 Allow Review</h4>
                        <p className="setting-desc">Review questions after test completion</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.allowReview}
                        onChange={() => handleToggle('allowReview')}
                      />
                    </div>
                    
                    <div className="setting-row">
                      <div className="setting-info">
                        <h4 className="setting-name">🔀 Randomize Questions</h4>
                        <p className="setting-desc">Shuffle question order in tests</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.randomizeQuestions}
                        onChange={() => handleToggle('randomizeQuestions')}
                      />
                    </div>
                    
                    <div className="setting-row">
                      <div className="setting-info">
                        <h4 className="setting-name">⚡ Auto Submit</h4>
                        <p className="setting-desc">Automatically submit when time expires</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.autoSubmit}
                        onChange={() => handleToggle('autoSubmit')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <div className="settings-section active">
                
                <div className="settings-card">
                  <div className="card-header">
                    <h3 className="card-title">Display Settings</h3>
                    <p className="card-description">Customize how the app looks</p>
                  </div>
                  <div className="card-body">
                    <div className="form-group">
                      <label className="form-label">Theme</label>
                      <div className="theme-options">
                        <div 
                          className={`theme-option ${settings.theme === 'light' ? 'selected' : ''}`}
                          onClick={() => handleInputChange('theme', 'light')}
                        >
                          <div className="theme-preview light">
                            <div className="preview-bar"></div>
                            <div className="preview-content"></div>
                          </div>
                          <span className="theme-label">☀️ Light</span>
                        </div>
                        <div 
                          className={`theme-option ${settings.theme === 'dark' ? 'selected' : ''}`}
                          onClick={() => handleInputChange('theme', 'dark')}
                        >
                          <div className="theme-preview dark">
                            <div className="preview-bar"></div>
                            <div className="preview-content"></div>
                          </div>
                          <span className="theme-label">🌙 Dark</span>
                        </div>
                        <div 
                          className={`theme-option ${settings.theme === 'auto' ? 'selected' : ''}`}
                          onClick={() => handleInputChange('theme', 'auto')}
                        >
                          <div className="theme-preview auto">
                            <div className="preview-bar"></div>
                            <div className="preview-content"></div>
                          </div>
                          <span className="theme-label">🔄 Auto</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Font Size</label>
                      <div className="size-options">
                        <button 
                          className={`size-btn ${settings.fontSize === 'small' ? 'active' : ''}`}
                          onClick={() => handleInputChange('fontSize', 'small')}
                        >
                          Small
                        </button>
                        <button 
                          className={`size-btn ${settings.fontSize === 'medium' ? 'active' : ''}`}
                          onClick={() => handleInputChange('fontSize', 'medium')}
                        >
                          Medium
                        </button>
                        <button 
                          className={`size-btn ${settings.fontSize === 'large' ? 'active' : ''}`}
                          onClick={() => handleInputChange('fontSize', 'large')}
                        >
                          Large
                        </button>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Language</label>
                      <select 
                        className="form-select"
                        value={settings.language}
                        onChange={(e) => handleInputChange('language', e.target.value)}
                      >
                        <option value="english">English</option>
                        <option value="marathi">मराठी (Marathi)</option>
                        <option value="hindi">हिंदी (Hindi)</option>
                      </select>
                    </div>
                    
                    <div className="setting-row">
                      <div className="setting-info">
                        <h4 className="setting-name">✨ Animations</h4>
                        <p className="setting-desc">Enable smooth transitions and animations</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.animations}
                        onChange={() => handleToggle('animations')}
                      />
                    </div>
                    
                    <div className="setting-row">
                      <div className="setting-info">
                        <h4 className="setting-name">🎭 Reduced Motion</h4>
                        <p className="setting-desc">Minimize motion effects for accessibility</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.reducedMotion}
                        onChange={() => handleToggle('reducedMotion')}
                      />
                    </div>
                    
                    <div className="setting-row">
                      <div className="setting-info">
                        <h4 className="setting-name">🔍 High Contrast</h4>
                        <p className="setting-desc">Increase contrast for better visibility</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.highContrast}
                        onChange={() => handleToggle('highContrast')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PRIVACY TAB */}
            {activeTab === 'privacy' && (
              <div className="settings-section active">
                
                <div className="settings-card">
                  <div className="card-header">
                    <h3 className="card-title">Privacy & Data</h3>
                    <p className="card-description">Control your data and privacy settings</p>
                  </div>
                  <div className="card-body">
                    <div className="setting-row">
                      <div className="setting-info">
                        <h4 className="setting-name">📊 Data Sharing</h4>
                        <p className="setting-desc">Share anonymous usage data to improve the app</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.dataSharing}
                        onChange={() => handleToggle('dataSharing')}
                      />
                    </div>
                    
                    <div className="setting-row">
                      <div className="setting-info">
                        <h4 className="setting-name">💾 Auto Save</h4>
                        <p className="setting-desc">Automatically save your progress</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.autoSave}
                        onChange={() => handleToggle('autoSave')}
                      />
                    </div>
                    
                    <div className="setting-row">
                      <div className="setting-info">
                        <h4 className="setting-name">📈 Show Progress Publicly</h4>
                        <p className="setting-desc">Allow others to see your progress</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.showProgress}
                        onChange={() => handleToggle('showProgress')}
                      />
                    </div>
                    
                    <div className="setting-row">
                      <div className="setting-info">
                        <h4 className="setting-name">📉 Analytics Tracking</h4>
                        <p className="setting-desc">Track your learning analytics</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.analyticsTracking}
                        onChange={() => handleToggle('analyticsTracking')}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        Session Timeout: <span className="form-value">{settings.sessionTimeout} minutes</span>
                      </label>
                      <input 
                        type="range" 
                        className="form-range" 
                        min="10" 
                        max="120" 
                        step="10"
                        value={settings.sessionTimeout}
                        onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                      />
                      <div className="range-labels">
                        <span>10 min</span>
                        <span>120 min</span>
                      </div>
                    </div>
                    
                    <div className="privacy-actions">
                      <button className="action-btn secondary">Download My Data</button>
                      <button className="action-btn danger">Delete Account</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ACCESSIBILITY TAB */}
            {activeTab === 'accessibility' && (
              <div className="settings-section active">
                
                <div className="settings-card">
                  <div className="card-header">
                    <h3 className="card-title">Accessibility Options</h3>
                    <p className="card-description">Make the app more accessible</p>
                  </div>
                  <div className="card-body">
                    <div className="setting-row">
                      <div className="setting-info">
                        <h4 className="setting-name">📖 Screen Reader Support</h4>
                        <p className="setting-desc">Optimize for screen readers</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.screenReader}
                        onChange={() => handleToggle('screenReader')}
                      />
                    </div>
                    
                    <div className="setting-row">
                      <div className="setting-info">
                        <h4 className="setting-name">⌨️ Keyboard Navigation</h4>
                        <p className="setting-desc">Navigate using keyboard shortcuts</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.keyboardNav}
                        onChange={() => handleToggle('keyboardNav')}
                      />
                    </div>
                    
                    <div className="setting-row">
                      <div className="setting-info">
                        <h4 className="setting-name">🎤 Voice Assistant</h4>
                        <p className="setting-desc">Enable voice commands and assistance</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.voiceAssist}
                        onChange={() => handleToggle('voiceAssist')}
                      />
                    </div>
                    
                    <div className="setting-row">
                      <div className="setting-info">
                        <h4 className="setting-name">🔊 Text to Speech</h4>
                        <p className="setting-desc">Read questions and answers aloud</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.textToSpeech}
                        onChange={() => handleToggle('textToSpeech')}
                      />
                    </div>
                    
                    <div className="accessibility-info">
                      <h4 className="info-title">💡 Keyboard Shortcuts</h4>
                      <div className="shortcuts-list">
                        <div className="shortcut-item">
                          <span className="shortcut-key">Ctrl + S</span>
                          <span className="shortcut-desc">Save Settings</span>
                        </div>
                        <div className="shortcut-item">
                          <span className="shortcut-key">Ctrl + R</span>
                          <span className="shortcut-desc">Reset Settings</span>
                        </div>
                        <div className="shortcut-item">
                          <span className="shortcut-key">Tab</span>
                          <span className="shortcut-desc">Navigate Options</span>
                        </div>
                        <div className="shortcut-item">
                          <span className="shortcut-key">Space</span>
                          <span className="shortcut-desc">Toggle Switch</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="settings-actions">
            <button className="action-btn primary" onClick={handleSave}>
              💾 Save Changes
            </button>
            <button className="action-btn secondary" onClick={handleReset}>
              🔄 Reset to Default
            </button>
          </div>

          {/* Save Notification */}
          {showSaveNotification && (
            <div className="save-notification">
              <span className="notification-icon">✅</span>
              <span className="notification-text">Settings saved successfully!</span>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Settings;
