import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css files/ExamHistory.css';
import MainNavbar from '../components/MainNavbar';
import Footer from '../components/Footer';
import ParticleBackground from '../components/StarBg';

const ExamHistory = () => {
  const navigate = useNavigate();
  const [examLogs, setExamLogs] = useState([]);
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => {
    // Load exam history from localStorage
    const storedLogs = localStorage.getItem('examHistory');
    if (storedLogs) {
      const logs = JSON.parse(storedLogs);
      const sanitizedLogs = logs.map(log => ({
        ...log,
        percentage: Number(log.percentage || 0)
      }));
      setExamLogs(sanitizedLogs);
    }
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0 
      ? `${hours}h ${mins}m ${secs}s`
      : `${mins}m ${secs}s`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-IN', options);
  };

  const getExamTypeName = (type) => {
    const examTypes = {
      'mat': 'Mental Ability Test',
      'sat': 'Scholastic Aptitude Test',
      'full': 'NMMS Full Exam'
    };
    return examTypes[type] || type;
  };

  const getVerdictBadge = (percentage) => {
    if (percentage >= 90) return { text: 'Excellent', class: 'excellent' };
    if (percentage >= 75) return { text: 'Very Good', class: 'very-good' };
    if (percentage >= 60) return { text: 'Good', class: 'good' };
    if (percentage >= 40) return { text: 'Average', class: 'average' };
    return { text: 'Needs Improvement', class: 'needs-improvement' };
  };

  const handleDownloadGradeCard = (log) => {
    // Generate a simple text-based grade card for download
    const gradeCardContent = `
═══════════════════════════════════════════════════
            NMMS EXAMINATION GRADE CARD
═══════════════════════════════════════════════════

Student Performance Report
Generated on: ${new Date().toLocaleString('en-IN')}

───────────────────────────────────────────────────
EXAM DETAILS
───────────────────────────────────────────────────
Exam Type: ${getExamTypeName(log.examType)}
Date & Time: ${formatDate(log.date)}
Duration: ${formatTime(log.timeSpent)}

───────────────────────────────────────────────────
PERFORMANCE SUMMARY
───────────────────────────────────────────────────
Total Questions: ${log.totalQuestions}
Attempted: ${log.attempted}
Correct Answers: ${log.correct}
Wrong Answers: ${log.wrong}
Unattempted: ${log.unattempted}

───────────────────────────────────────────────────
SCORE DETAILS
───────────────────────────────────────────────────
Score: ${log.score} / ${log.totalQuestions}
Percentage: ${log.percentage.toFixed(2)}%
Grade: ${getVerdictBadge(log.percentage).text}

───────────────────────────────────────────────────
REMARKS
───────────────────────────────────────────────────
${log.percentage >= 75 
  ? 'Outstanding performance! Keep up the excellent work.' 
  : log.percentage >= 60 
  ? 'Good effort! Focus on improving weak areas.' 
  : 'Needs more practice. Review the concepts thoroughly.'}

═══════════════════════════════════════════════════
This is a system-generated grade card.
No signature required.
═══════════════════════════════════════════════════
    `.trim();

    // Create and download the file
    const blob = new Blob([gradeCardContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GradeCard_${log.examType}_${new Date(log.date).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all exam history? This action cannot be undone.')) {
      localStorage.removeItem('examHistory');
      setExamLogs([]);
    }
  };

  const sortedLogs = [...examLogs].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.date) - new Date(a.date);
      case 'date-asc':
        return new Date(a.date) - new Date(b.date);
      case 'score-desc':
        return b.percentage - a.percentage;
      case 'score-asc':
        return a.percentage - b.percentage;
      default:
        return 0;
    }
  });

  // Calculate stats
  const totalAttempts = examLogs.length;
  const avgScore = examLogs.length > 0 
    ? (examLogs.reduce((sum, log) => sum + log.percentage, 0) / examLogs.length).toFixed(1)
    : 0;
  const excellentScores = examLogs.filter(log => log.percentage >= 90).length;
  const highestScore = examLogs.length > 0 
    ? Math.max(...examLogs.map(log => log.percentage)).toFixed(1)
    : 0;

  return (
    <>
      <MainNavbar />
      <div className="exam-history-page">
        <ParticleBackground />
        
        <div className="exam-history-container">
          <div className="history-header">
            <div>
              <h1 className="history-title">📚 Exam History</h1>
              <p className="history-subtitle">Track your exam performance over time</p>
            </div>
            <button className="back-btn" onClick={() => {
              navigate('/exams');
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }, 100);
            }}>
              ← Back to Exams
            </button>
          </div>

          {examLogs.length > 0 ? (
            <>
              {/* Stats Overview */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📝</div>
                  <div className="stat-info">
                    <div className="stat-value">{totalAttempts}</div>
                    <div className="stat-label">Total Attempts</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-info">
                    <div className="stat-value">{avgScore}%</div>
                    <div className="stat-label">Average Score</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🌟</div>
                  <div className="stat-info">
                    <div className="stat-value">{excellentScores}</div>
                    <div className="stat-label">Excellent Scores</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🏆</div>
                  <div className="stat-info">
                    <div className="stat-value">{highestScore}%</div>
                    <div className="stat-label">Highest Score</div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="history-controls">
                <div className="sort-controls">
                  <label htmlFor="sortBy">Sort by:</label>
                  <select 
                    id="sortBy"
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                  >
                    <option value="date-desc">Latest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="score-desc">Highest Score</option>
                    <option value="score-asc">Lowest Score</option>
                  </select>
                </div>
                <button className="clear-history-btn" onClick={handleClearHistory}>
                  🗑️ Clear History
                </button>
              </div>

              {/* Exam History Table */}
              <div className="history-table-container">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Date & Time</th>
                      <th>Exam Type</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Time Taken</th>
                      <th>Verdict</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedLogs.map((log, index) => {
                      const verdict = getVerdictBadge(log.percentage);
                      return (
                        <tr key={index} className="history-row">
                          <td className="index-cell">{index + 1}</td>
                          <td className="date-cell">{formatDate(log.date)}</td>
                          <td className="exam-type-cell">{getExamTypeName(log.examType)}</td>
                          <td className="score-cell">
                            <span className="score-fraction">
                              {log.correct}/{log.totalQuestions}
                            </span>
                          </td>
                          <td className="percentage-cell">
                            <div className="percentage-bar-container">
                              <div 
                                className="percentage-bar" 
                                style={{ width: `${log.percentage}%` }}
                              ></div>
                              <span className="percentage-text">{log.percentage.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="time-cell">{formatTime(log.timeSpent)}</td>
                          <td className="verdict-cell">
                            <span className={`verdict-badge ${verdict.class}`}>
                              {verdict.text}
                            </span>
                          </td>
                          <td className="action-cell">
                            <button 
                              className="download-btn"
                              onClick={() => handleDownloadGradeCard(log)}
                              title="Download Grade Card"
                            >
                              📥 Download
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h2 className="empty-title">No Exam History Yet</h2>
              <p className="empty-description">
                Your exam attempts will appear here. Start taking exams to build your history!
              </p>
              <button className="start-exam-btn" onClick={() => navigate('/exam')}>
                Take Your First Exam
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ExamHistory;
