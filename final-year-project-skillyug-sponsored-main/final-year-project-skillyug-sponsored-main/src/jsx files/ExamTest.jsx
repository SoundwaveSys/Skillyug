import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { fetchRandomQuestionsFlat, fetchQuestionsForExam } from '../firebase/firestore';
import '../css files/ExamTest.css';

const ExamTest = () => {
  const navigate = useNavigate();
  const { examType } = useParams();
  const location = useLocation();
  const { proctored, duration } = location.state || { proctored: true, duration: 60 };

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert minutes to seconds
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [showAstronautWarning, setShowAstronautWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  // Fetch questions from Firestore based on exam type
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        let result;
        
        if (examType === 'mat') {
          // MAT - Mental Ability Test (90 questions)
          // Fetch random questions from all subjects
          result = await fetchRandomQuestionsFlat(null, 90);
        } else if (examType === 'sat') {
          // SAT - Scholastic Aptitude Test (90 questions)
          // Fetch from your database subjects: विज्ञान, इतिहास, भूगोल, नागरिकशास्त्र
          result = await fetchQuestionsForExam([
            { subject: 'विज्ञान', count: 30 },
            { subject: 'इतिहास', count: 20 },
            { subject: 'भूगोल', count: 20 },
            { subject: 'नागरिकशास्त्र', count: 20 }
          ]);
        } else if (examType === 'full') {
          // Full NMMS Exam (180 questions) - All subjects
          result = await fetchQuestionsForExam([
            { subject: 'विज्ञान', count: 60 },
            { subject: 'इतिहास', count: 40 },
            { subject: 'भूगोल', count: 40 },
            { subject: 'नागरिकशास्त्र', count: 40 }
          ]);
        }
        
        if (result.success && result.questions.length > 0) {
          // Transform questions to match component format
          const transformedQuestions = result.questions.map((q, index) => ({
            id: q.id || index + 1,
            question: q.question,
            options: q.options || [q.opt1, q.opt2, q.opt3, q.opt4],
            correct: q.correct,
            topic: q.subject,
            chapter: q.chapter,
            marks: 1
          }));
          setQuestions(transformedQuestions);
        } else {
          setError('No questions found in database. Please upload questions first.');
        }
      } catch (err) {
        console.error('Error loading questions:', err);
        setError('Failed to load questions. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [examType]);

  const currentQuestionData = questions[currentQuestion];

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !testCompleted) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, testCompleted]);

  // Countdown timer for astronaut warning
  useEffect(() => {
    let countdownInterval;
    if (showAstronautWarning && countdown > 0) {
      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [showAstronautWarning, countdown]);

  // Fullscreen monitoring
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !testCompleted) {
        setWarningMessage("You left fullscreen mode! Test ends in");
        setCountdown(100);
        setShowAstronautWarning(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [testCompleted]);

  // Prevent tab switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !testCompleted) {
        setWarningMessage("Stop switiching the tab! Test now ends in");
        setCountdown(5);
        setShowAstronautWarning(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [testCompleted]);

  const handleReturnToFullscreen = () => {
    setShowAstronautWarning(false);
    setCountdown(5);
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Failed to enter fullscreen:', err);
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionData.id]: optionIndex
    }));
  };

  const handleFlagQuestion = () => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestionData.id)) {
        newSet.delete(currentQuestionData.id);
      } else {
        newSet.add(currentQuestionData.id);
      }
      return newSet;
    });
  };

  const handleQuestionNavigation = (index) => {
    setCurrentQuestion(index);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmitTest = () => {
    setShowSubmitModal(true);
  };

  const confirmSubmit = () => {
    setTestCompleted(true);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    calculateResults();
  };

  const handleAutoSubmit = () => {
    setTestCompleted(true);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    calculateResults();
  };

  const calculateResults = () => {
    const correctAnswers = questions.filter(q => 
      selectedAnswers[q.id] === q.correct
    ).length;
    const wrongAnswers = Object.keys(selectedAnswers).length - correctAnswers;
    const unattempted = questions.length - Object.keys(selectedAnswers).length;
    const score = correctAnswers - (wrongAnswers * 0.25);
    const percentage = ((score / questions.length) * 100).toFixed(2);

    // Store results in state or navigate with results
    navigate('/exam-results', {
      state: {
        examType: examType === 'mat' ? 'Mental Ability Test' : examType === 'sat' ? 'Scholastic Aptitude Test' : 'NMMS Mock Examination',
        totalQuestions: questions.length,
        attempted: Object.keys(selectedAnswers).length,
        correct: correctAnswers,
        wrong: wrongAnswers,
        unattempted: unattempted,
        score: score.toFixed(2),
        percentage: percentage,
        timeSpent: duration * 60 - timeLeft
      }
    });
  };

  const getQuestionStatus = (index) => {
    const question = questions[index];
    const isAnswered = selectedAnswers[question.id] !== undefined;
    const isFlagged = flaggedQuestions.has(question.id);
    const isCurrent = index === currentQuestion;

    if (isCurrent) return 'current';
    if (isFlagged) return 'flagged';
    if (isAnswered) return 'answered';
    return 'unanswered';
  };

  if (testCompleted) {
    return null; // Will navigate to results page
  }

  if (loading) {
    return (
      <div className="et-examtest-container">
        <div className="et-loading-container">
          <div className="et-loading-spinner"></div>
          <p>Loading questions from database...</p>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="et-examtest-container">
        <div className="et-error-container">
          <h2>⚠️ Unable to Load Questions</h2>
          <p>{error || 'No questions available for this exam type.'}</p>
          <button onClick={() => navigate('/exam')} className="et-back-button">
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="et-examtest-container">
      {/* Top Header */}
      <div className="et-examtest-header">
        <div className="et-header-brand">
          <img src="/assets/PrepMark.png" alt="PrepMark" className="et-brand-logo" />
        </div>
        <div className="et-header-title">
          {examType === 'mat' ? 'Mental Ability Test' : examType === 'sat' ? 'Scholastic Aptitude Test' : 'NMMS Mock Examination'}
        </div>
        <div className="et-header-timer">
          <div className="et-timer-box">
            <span className="et-timer-icon">⏱</span>
            <span className="et-timer-value">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="et-examtest-main">
        {/* Left Panel - Questions (60vw) */}
        <div className="et-examtest-left">
          <div className="et-question-panel">
            {/* Question Header */}
            <div className="et-question-header-bar">
              <span className="et-question-num">Question {currentQuestion + 1} / {questions.length}</span>
              <button 
                className={`et-flag-button ${flaggedQuestions.has(currentQuestionData.id) ? 'active' : ''}`}
                onClick={handleFlagQuestion}
              >
                <span className="et-flag-icon">🚩</span>
                <span className="et-flag-text">{flaggedQuestions.has(currentQuestionData.id) ? 'Flagged' : 'Flag'}</span>
              </button>
            </div>

            {/* Question Display */}
            <div className="et-question-display">
              <h3 className="et-question-text">{currentQuestionData.question}</h3>
            </div>

            {/* Options */}
            <div className="et-options-container">
              {currentQuestionData.options.map((option, index) => (
                <div
                  key={index}
                  className={`et-option-card ${selectedAnswers[currentQuestionData.id] === index ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <div className="et-option-radio">
                    <div className="et-radio-outer">
                      {selectedAnswers[currentQuestionData.id] === index && <div className="et-radio-inner"></div>}
                    </div>
                  </div>
                  <div className="et-option-label">{String.fromCharCode(65 + index)}</div>
                  <div className="et-option-content">{option}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="et-question-nav-footer">
            <button
              className="et-nav-button et-prev-btn"
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
            >
              ← Previous
            </button>
            <button
              className="et-nav-button et-next-btn"
              onClick={handleNextQuestion}
              disabled={currentQuestion === questions.length - 1}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Right Panel - Navigation & Stats */}
        <div className="et-examtest-right">
          {/* Question Grid */}
          <div className="et-question-grid-panel">
            <div className="et-grid-header">Question Navigator</div>
            <div className="et-question-grid">
              {questions.map((question, index) => {
                const isAnswered = selectedAnswers[question.id] !== undefined;
                const isFlagged = flaggedQuestions.has(question.id);
                const isCurrent = index === currentQuestion;
                
                return (
                  <button
                    key={question.id}
                    className={`et-grid-box ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''} ${isFlagged ? 'flagged' : ''}`}
                    onClick={() => handleQuestionNavigation(index)}
                  >
                    {isAnswered ? '✓' : isFlagged ? '🚩' : index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats Panel */}
          <div className="et-stats-panel">
            <div className="et-stats-grid">
              <div className="et-stat-item et-answered-stat">
                <div className="et-stat-value">{Object.keys(selectedAnswers).length}</div>
                <div className="et-stat-label">Answered</div>
              </div>
              <div className="et-stat-item et-flagged-stat">
                <div className="et-stat-value">{flaggedQuestions.size}</div>
                <div className="et-stat-label">Flagged</div>
              </div>
              <div className="et-stat-item et-unattempted-stat">
                <div className="et-stat-value">{questions.length - Object.keys(selectedAnswers).length}</div>
                <div className="et-stat-label">Unattempted</div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button className="et-submit-button" onClick={handleSubmitTest}>
            Submit Test
          </button>
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="et-submit-modal-overlay" onClick={() => setShowSubmitModal(false)}>
          <div className="et-submit-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="et-modal-icon">⚠️</div>
            <h2 className="et-modal-heading">Confirm Submission</h2>
            <p className="et-modal-message">Are you sure you want to submit your test?</p>
            <div className="et-modal-summary">
              <div className="et-summary-item">
                <span className="et-summary-label">Answered:</span>
                <span className="et-summary-value">{Object.keys(selectedAnswers).length}</span>
              </div>
              <div className="et-summary-item">
                <span className="et-summary-label">Unattempted:</span>
                <span className="et-summary-value">{questions.length - Object.keys(selectedAnswers).length}</span>
              </div>
            </div>
            <p className="et-modal-note">You cannot change answers after submission</p>
            <div className="et-modal-buttons">
              <button className="et-modal-cancel" onClick={() => setShowSubmitModal(false)}>
                Cancel
              </button>
              <button className="et-modal-confirm" onClick={confirmSubmit}>
                Submit Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Warning Modal */}
      {showAstronautWarning && (
        <>
          <div className="astronaut-warning-overlay"></div>
          <div className="astronaut-warning-container">
            <div className="speech-bubble">
              <p>{warningMessage}</p>
              <div className="countdown-circle">
                <span className="countdown-number">{countdown}</span>
              </div>
              <button className="return-fullscreen-btn" onClick={handleReturnToFullscreen}>
               Back to Fullscreen
              </button>
              <div className="bubble-pointer"></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExamTest;
