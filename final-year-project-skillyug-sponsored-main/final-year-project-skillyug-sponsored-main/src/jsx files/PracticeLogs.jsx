import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css files/PracticeLogs.css';
import MainNavbar from "../components/MainNavbar";
import Footer from "../components/Footer";
import ParticleBackground from "../components/StarBg";

const PracticeLogs = () => {
  const navigate = useNavigate();
  const [practiceLogs, setPracticeLogs] = useState([]);

  useEffect(() => {
    // Load practice logs from localStorage
    const savedLogs = localStorage.getItem('practiceLogs');
    if (savedLogs) {
      setPracticeLogs(JSON.parse(savedLogs));
    }
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreBadge = (percentage) => {
    if (percentage >= 80) return { text: 'Excellent', color: '#10b981' };
    if (percentage >= 60) return { text: 'Good', color: '#3b82f6' };
    if (percentage >= 40) return { text: 'Average', color: '#f59e0b' };
    return { text: 'Need Practice', color: '#ef4444' };
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all practice logs?')) {
      localStorage.removeItem('practiceLogs');
      setPracticeLogs([]);
    }
  };

  const handleDeleteLog = (index) => {
    if (window.confirm('Delete this log?')) {
      const updatedLogs = practiceLogs.filter((_, i) => i !== index);
      setPracticeLogs(updatedLogs);
      localStorage.setItem('practiceLogs', JSON.stringify(updatedLogs));
    }
  };

  return (
    <>
      <MainNavbar />
      <ParticleBackground />
      <div className="pl-container">
        <div className="pl-content">
          {/* Header */}
          <div className="pl-header">
            <div className="pl-header-content">
              <h1 className="pl-title">Practice Logs</h1>
              <p className="pl-subtitle">Track your progress and review your practice attempts</p>
            </div>
            <div className="pl-header-actions">
              <button className="pl-btn-clear" onClick={handleClearLogs} disabled={practiceLogs.length === 0}>
                <span className="pl-btn-icon">🗑️</span>
                Clear All
              </button>
              <button className="pl-btn-back" onClick={() => navigate('/practice')}>
                <span className="pl-btn-icon">←</span>
                Back to Practice
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          {practiceLogs.length > 0 && (
            <div className="pl-stats-overview">
              <div className="pl-stat-card">
                <div className="pl-stat-icon">📝</div>
                <div className="pl-stat-value">{practiceLogs.length}</div>
                <div className="pl-stat-label">Total Attempts</div>
              </div>
              <div className="pl-stat-card">
                <div className="pl-stat-icon">⭐</div>
                <div className="pl-stat-value">
                  {Math.round(
                    practiceLogs.reduce((sum, log) => sum + log.percentage, 0) / practiceLogs.length
                  )}%
                </div>
                <div className="pl-stat-label">Avg Score</div>
              </div>
              <div className="pl-stat-card">
                <div className="pl-stat-icon">🎯</div>
                <div className="pl-stat-value">
                  {practiceLogs.filter(log => log.percentage >= 80).length}
                </div>
                <div className="pl-stat-label">Excellent Scores</div>
              </div>
            </div>
          )}

          {/* Logs Table */}
          {practiceLogs.length === 0 ? (
            <div className="pl-empty-state">
              <div className="pl-empty-icon">📊</div>
              <h2 className="pl-empty-title">No Practice Logs Yet</h2>
              <p className="pl-empty-text">Complete practice quizzes to see your history here</p>
              <button className="pl-btn-start" onClick={() => navigate('/practice')}>
                <span className="pl-btn-icon">🚀</span>
                Start Practicing
              </button>
            </div>
          ) : (
            <div className="pl-table-container">
              <table className="pl-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date & Time</th>
                    <th>Topic</th>
                    <th>Score</th>
                    <th>Correct</th>
                    <th>Time Taken</th>
                    <th>Verdict</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {practiceLogs.map((log, index) => {
                    const badge = getScoreBadge(log.percentage);
                    return (
                      <tr key={index} className="pl-table-row">
                        <td className="pl-cell-number">{practiceLogs.length - index}</td>
                        <td className="pl-cell-date">{formatDate(log.date)}</td>
                        <td className="pl-cell-topic">
                          <div className="pl-topic-badge">{log.topic}</div>
                        </td>
                        <td className="pl-cell-score">
                          <span className="pl-score-display" style={{ color: badge.color }}>
                            {log.percentage}%
                          </span>
                        </td>
                        <td className="pl-cell-correct">
                          {log.correct}/{log.total}
                        </td>
                        <td className="pl-cell-time">{log.timeTaken}</td>
                        <td className="pl-cell-verdict">
                          <span 
                            className="pl-verdict-badge" 
                            style={{ 
                              backgroundColor: badge.color + '20',
                              color: badge.color,
                              borderColor: badge.color
                            }}
                          >
                            {badge.text}
                          </span>
                        </td>
                        <td className="pl-cell-action">
                          <button 
                            className="pl-btn-delete" 
                            onClick={() => handleDeleteLog(index)}
                            title="Delete"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PracticeLogs;
