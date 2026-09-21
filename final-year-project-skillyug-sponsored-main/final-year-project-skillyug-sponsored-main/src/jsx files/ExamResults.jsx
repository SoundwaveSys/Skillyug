import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css files/ExamResults.css';
import MainNavbar from '../components/MainNavbar';
import Footer from '../components/Footer';

const ExamResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    examType, 
    totalQuestions, 
    attempted, 
    correct, 
    wrong, 
    unattempted, 
    score, 
    percentage, 
    timeSpent 
  } = location.state || {};

  // If no data, redirect back
  if (!location.state) {
    navigate('/exam');
    return null;
  }

  // Save exam history to localStorage
  useEffect(() => {
    const examLog = {
      examType,
      totalQuestions,
      attempted,
      correct,
      wrong,
      unattempted,
      score,
      percentage,
      timeSpent,
      date: new Date().toISOString()
    };

    // Get existing history
    const existingHistory = localStorage.getItem('examHistory');
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    
    // Add new log
    history.push(examLog);
    
    // Save updated history
    localStorage.setItem('examHistory', JSON.stringify(history));
  }, [examType, totalQuestions, attempted, correct, wrong, unattempted, score, percentage, timeSpent]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0 
      ? `${hours}h ${mins}m ${secs}s`
      : `${mins}m ${secs}s`;
  };

  const avgTimePerQuestion = Math.floor(timeSpent / totalQuestions);

  const handleDownloadGradeCard = () => {
    // TODO: Implement PDF generation
    alert('Grade card download functionality will be implemented soon!');
  };

  const getPerformanceLevel = () => {
    if (percentage >= 90) return { level: 'Excellent', color: '#4caf50', emoji: '🌟' };
    if (percentage >= 75) return { level: 'Very Good', color: '#8bc34a', emoji: '✨' };
    if (percentage >= 60) return { level: 'Good', color: '#ffc107', emoji: '👍' };
    if (percentage >= 40) return { level: 'Average', color: '#ff9800', emoji: '📈' };
    return { level: 'Needs Improvement', color: '#f44336', emoji: '💪' };
  };

  const performance = getPerformanceLevel();

  // Generate question grid data (mock data for visualization)
  const questionGrid = Array.from({ length: totalQuestions }, (_, i) => {
    if (i < correct) return { id: i + 1, status: 'correct' };
    if (i < correct + wrong) return { id: i + 1, status: 'wrong' };
    return { id: i + 1, status: 'unattempted' };
  });

  return (
    <div className="exam-results-page">
      <MainNavbar />
      
      <div className="results-container">
        {/* Header Section */}
        <div className="results-header">
          <div className="header-content">
            <h1 className="results-title">Exam Results</h1>
            <p className="exam-type">{examType}</p>
          </div>
          <div className="performance-badge" style={{ borderColor: performance.color }}>
            <span className="performance-emoji">{performance.emoji}</span>
            <span className="performance-level" style={{ color: performance.color }}>
              {performance.level}
            </span>
          </div>
        </div>

        {/* Guardian Notification */}
        <div className="guardian-notification">
          <div className="notification-icon">📧</div>
          <div className="notification-text">
            <strong>Grade Card Sent!</strong>
            <p>Your detailed performance report has been sent to your guardian's email.</p>
          </div>
        </div>

        {/* Score Overview */}
        <div className="score-overview">
          <div className="score-circle">
            <svg viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="12"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke={performance.color}
                strokeWidth="12"
                strokeDasharray={`${(percentage / 100) * 565.48} 565.48`}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
              />
            </svg>
            <div className="score-text">
              <div className="percentage">{percentage}%</div>
              <div className="score-label">Score</div>
            </div>
          </div>

          <div className="score-details">
            <div className="detail-card">
              <div className="detail-icon">📊</div>
              <div className="detail-info">
                <div className="detail-value">{score} / {totalQuestions}</div>
                <div className="detail-label">Total Score</div>
              </div>
            </div>
            <div className="detail-card">
              <div className="detail-icon">⏱️</div>
              <div className="detail-info">
                <div className="detail-value">{formatTime(timeSpent)}</div>
                <div className="detail-label">Time Taken</div>
              </div>
            </div>
            <div className="detail-card">
              <div className="detail-icon">⚡</div>
              <div className="detail-info">
                <div className="detail-value">{avgTimePerQuestion}s</div>
                <div className="detail-label">Avg Time/Question</div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="statistics-section">
          <h2 className="section-title">Performance Breakdown</h2>
          <div className="stats-grid">
            <div className="stat-card correct">
              <div className="stat-header">
                <span className="stat-icon">✓</span>
                <span className="stat-title">Correct</span>
              </div>
              <div className="stat-value">{correct}</div>
              <div className="stat-bar">
                <div className="stat-fill" style={{ width: `${(correct / totalQuestions) * 100}%` }}></div>
              </div>
            </div>

            <div className="stat-card wrong">
              <div className="stat-header">
                <span className="stat-icon">✗</span>
                <span className="stat-title">Wrong</span>
              </div>
              <div className="stat-value">{wrong}</div>
              <div className="stat-bar">
                <div className="stat-fill" style={{ width: `${(wrong / totalQuestions) * 100}%` }}></div>
              </div>
            </div>

            <div className="stat-card unattempted">
              <div className="stat-header">
                <span className="stat-icon">○</span>
                <span className="stat-title">Unattempted</span>
              </div>
              <div className="stat-value">{unattempted}</div>
              <div className="stat-bar">
                <div className="stat-fill" style={{ width: `${(unattempted / totalQuestions) * 100}%` }}></div>
              </div>
            </div>

            <div className="stat-card attempted">
              <div className="stat-header">
                <span className="stat-icon">📝</span>
                <span className="stat-title">Attempted</span>
              </div>
              <div className="stat-value">{attempted}</div>
              <div className="stat-bar">
                <div className="stat-fill" style={{ width: `${(attempted / totalQuestions) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Navigator Grid */}
        <div className="question-navigator-section">
          <h2 className="section-title">Question-wise Analysis</h2>
          <div className="navigator-legend">
            <div className="legend-item">
              <span className="legend-box correct-box"></span>
              <span>Correct</span>
            </div>
            <div className="legend-item">
              <span className="legend-box wrong-box"></span>
              <span>Wrong</span>
            </div>
            <div className="legend-item">
              <span className="legend-box unattempted-box"></span>
              <span>Unattempted</span>
            </div>
          </div>

          <div className="questions-grid">
            {questionGrid.map((question) => (
              <div 
                key={question.id} 
                className={`question-box ${question.status}`}
                title={`Question ${question.id}: ${question.status}`}
              >
                {question.status === 'correct' && '✓'}
                {question.status === 'wrong' && '✗'}
                {question.status === 'unattempted' && question.id}
              </div>
            ))}
          </div>
        </div>

        {/* Insights Section */}
        <div className="insights-section">
          <h2 className="section-title">Insights & Recommendations</h2>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-icon">🎯</div>
              <h3>Accuracy</h3>
              <p className="insight-value">{attempted > 0 ? ((correct / attempted) * 100).toFixed(1) : 0}%</p>
              <p className="insight-desc">
                {attempted > 0 && (correct / attempted) >= 0.8 
                  ? 'Excellent accuracy! Keep it up!' 
                  : 'Focus on accuracy over speed in practice.'}
              </p>
            </div>

            <div className="insight-card">
              <div className="insight-icon">⏰</div>
              <h3>Time Management</h3>
              <p className="insight-value">{avgTimePerQuestion}s/Q</p>
              <p className="insight-desc">
                {avgTimePerQuestion < 60 
                  ? 'Great time management!' 
                  : 'Practice more to improve speed.'}
              </p>
            </div>

            <div className="insight-card">
              <div className="insight-icon">💯</div>
              <h3>Completion Rate</h3>
              <p className="insight-value">{((attempted / totalQuestions) * 100).toFixed(1)}%</p>
              <p className="insight-desc">
                {attempted === totalQuestions 
                  ? 'Perfect! All questions attempted.' 
                  : 'Try to attempt all questions next time.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn-download" onClick={handleDownloadGradeCard}>
            <span className="btn-icon">📄</span>
            Download Grade Card
          </button>
          <button className="btn-secondary" onClick={() => {
            window.scrollTo(0, 0);
            navigate('/exams');
          }}>
            <span className="btn-icon">🔄</span>
            Take Another Test
          </button>
          <button className="btn-secondary" onClick={() => navigate('/home')}>
            <span className="btn-icon">🏠</span>
            Back to Home
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ExamResults;
