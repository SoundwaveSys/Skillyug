import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchRandomQuestionsFlat, fetchQuestionsBySubject, fetchQuestionsByChapter } from '../firebase/firestore';
import '../css files/PracticePage.css';
import MainNavbar from "../components/MainNavbar";
import Footer from "../components/Footer";
import ParticleBackground from "../components/StarBg";


const PracticePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get quiz data from navigation state
  const quizData = location.state?.quizData || {
    title: 'Practice Quiz',
    questions: 25,
    duration: '30 min',
    difficulty: 'Medium',
    subject: null
  };
  
  console.log('🎯 PracticePage received quizData:', quizData);
  console.log('📍 Location state:', location.state);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debug logging
  console.log('🔍 DEBUG - Component State:', {
    loading,
    error,
    questionsCount: questions.length,
    quizStarted,
    quizData
  });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch questions from Firestore
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        let result;
        
        console.log('📚 Quiz Data:', quizData);
        
        // If chapter-wise quiz, fetch questions for specific chapter
        if (quizData.isChapterWise && quizData.subject && quizData.chapter) {
          console.log(`📖 Loading chapter-wise: Subject="${quizData.subject}", Chapter="${quizData.chapter}"`);
          result = await fetchQuestionsByChapter(quizData.subject, quizData.chapter, quizData.questions || 20);
        }
        // If subject is specified in quizData, fetch subject-specific questions
        else if (quizData.subject) {
          console.log(`📊 Loading subject-wise: Subject="${quizData.subject}"`);
          result = await fetchQuestionsBySubject(quizData.subject, quizData.questions || 25);
        } 
        // Otherwise fetch random questions
        else {
          console.log('🎲 Loading random questions');
          result = await fetchRandomQuestionsFlat(null, quizData.questions || 25);
        }
        
        console.log('📥 Fetch result:', result);
        
        if (result && result.success && result.questions && result.questions.length > 0) {
          // Transform questions to match component format
          const transformedQuestions = result.questions.map((q, index) => ({
            id: q.id || index + 1,
            question: q.question,
            options: q.options || [q.opt1, q.opt2, q.opt3, q.opt4],
            correct: q.correct,
            type: q.subject,
            chapter: q.chapter
          }));
          console.log(`✅ Loaded ${transformedQuestions.length} questions`);
          setQuestions(transformedQuestions);
          setError(null); // Clear any previous errors
        } else {
          console.log('❌ No questions found in result');
          const errorMsg = result?.error || `No questions found for ${quizData.subject || 'this topic'}${quizData.chapter ? ` - ${quizData.chapter}` : ''}`;
          console.log('Setting error:', errorMsg);
          setError(errorMsg);
          setQuestions([]); // Make sure questions is empty
        }
      } catch (err) {
        console.error('❌ Error loading questions:', err);
        setError(`Failed to load questions: ${err.message}`);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [quizData.subject, quizData.chapter, quizData.isChapterWise]); // Added specific dependencies

  // Timer effect
  useEffect(() => {
    let timer;
    if (quizStarted && !quizCompleted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, quizCompleted, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(answers[currentQuestion + 1] || '');
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedAnswer(answers[currentQuestion - 1] || '');
    }
  };

  const handleSubmitQuiz = () => {
    setQuizCompleted(true);
    
    // Save practice log to localStorage
    const score = calculateScore();
    const practiceLog = {
      date: new Date().toISOString(),
      topic: quizData.title,
      score: `${score.correct}/${score.total}`,
      correct: score.correct,
      total: score.total,
      percentage: score.percentage,
      timeTaken: formatTime(30 * 60 - timeLeft)
    };
    
    // Get existing logs or initialize empty array
    const existingLogs = JSON.parse(localStorage.getItem('practiceLogs') || '[]');
    // Add new log at the beginning
    existingLogs.unshift(practiceLog);
    // Save back to localStorage
    localStorage.setItem('practiceLogs', JSON.stringify(existingLogs));
    
    setShowResults(true);
  };

  const handleBackToPractice = () => {
    window.scrollTo(0, 0);
    navigate('/practice');
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correct) {
        correct++;
      }
    });
    return { correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100) };
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 90) return { message: "Excellent! Outstanding performance! 🏆", color: "#10b981" };
    if (percentage >= 80) return { message: "Great job! Very good score! 🎉", color: "#059669" };
    if (percentage >= 70) return { message: "Good work! Keep it up! 👍", color: "#0891b2" };
    if (percentage >= 60) return { message: "Not bad! Room for improvement. 📚", color: "#0284c7" };
    return { message: "Keep practicing! You'll get better! 💪", color: "#dc2626" };
  };

  if (loading) {
    return (
      <>
        <MainNavbar />
        <div className="pp-practice-page-container">
          <div className="pp-loading-container">
            <div className="pp-loading-spinner"></div>
            <p>Loading questions from database...</p>
            <div style={{ marginTop: '20px', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.9rem' }}>
              <strong>Debug Info:</strong><br />
              Subject: {quizData.subject || 'None'}<br />
              Chapter: {quizData.chapter || 'None'}<br />
              Is Chapter-wise: {quizData.isChapterWise ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <MainNavbar />
        <div className="pp-practice-page-container">
          <div className="pp-error-container">
            <h2>⚠️ Unable to Load Questions</h2>
            <p>{error}</p>
            <p style={{ fontSize: '0.9rem', marginTop: '1rem', opacity: 0.8 }}>
              Check browser console for more details
            </p>
            <button onClick={() => navigate('/practice')} className="pp-back-button">
              Back to Practice
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  if (questions.length === 0 && !loading) {
    return (
      <>
        <MainNavbar />
        <div className="pp-practice-page-container">
          <div className="pp-error-container">
            <h2>📚 No Questions Available</h2>
            <p>No questions found for this topic.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
              Subject: {quizData.subject || 'Not specified'}<br />
              Chapter: {quizData.chapter || 'Not specified'}
            </p>
            <button onClick={() => navigate('/practice')} className="pp-back-button">
              Back to Practice
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!quizStarted) {
    return (
      <>
        <MainNavbar />
        <div className="pp-practice-page-container">
          <div className="pp-quiz-intro">
            <div className="pp-quiz-intro-content">
              <div className="pp-quiz-intro-header">
                <h1>🎯 {quizData.title}</h1>
                <p className="pp-quiz-subtitle">तुमच्या ज्ञानाची चाचणी घ्यायला तयार व्हा!</p>
              </div>

              <div className="pp-quiz-info-cards">
                <div className="pp-info-card">
                  <div className="pp-info-icon">📝</div>
                  <div className="pp-info-details">
                    <span className="pp-info-label">प्रश्न</span>
                    <span className="pp-info-value">{questions.length}</span>
                  </div>
                </div>
                <div className="pp-info-card">
                  <div className="pp-info-icon">⏱️</div>
                  <div className="pp-info-details">
                    <span className="pp-info-label">कालावधी</span>
                    <span className="pp-info-value">{quizData.duration}</span>
                  </div>
                </div>
              </div>

              <div className="pp-quiz-instructions">
                <h3>📋 सूचना</h3>
                <ul>
                  <li>उत्तर द्यायच्या आधी प्रत्येक प्रश्न काळजीपूर्वक वाचा</li>
                  <li>मागील/पुढील बटणाचा वापर करून तुम्ही प्रश्नांदरम्यान फिरू शकता</li>
                  <li>निवडलेली उत्तरे आपोआप जतन होतात</li>
                  <li>वेळ संपण्याआधी तुमची परीक्षा सबमिट करा</li>
                  <li>सबमिट करण्यापूर्वी तुम्ही उत्तरांचे पुनरावलोकन आणि बदल करू शकता</li>
                </ul>
              </div>

              <div className="pp-quiz-actions">
                <button className="pp-start-quiz-btn" onClick={handleStartQuiz}>
                  <span>परीक्षा सुरू करा</span>
                 
                </button>
                <button className="pp-back-btn-pr" onClick={handleBackToPractice}>
                  <span>मागे जा</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const scoreMessage = getScoreMessage(score.percentage);

    return (
      <>
        <MainNavbar />
        <ParticleBackground />
        <div className="pp-practice-page-container">
          <div className="pp-results-container">
            <div className="pp-results-card">
              {/* Header */}
              <div className="pp-results-header-compact">
                <div className="pp-completion-badge">
                  <span className="pp-badge-icon">✓</span>
                  <span className="pp-badge-text">Quiz Completed</span>
                </div>
                <h2 className="pp-quiz-title">{quizData.title}</h2>
              </div>

              {/* Main Score Display */}
              <div className="pp-main-score-section">
                <div className="pp-score-card">
                  <div className="pp-score-label">Your Score</div>
                  <div className="pp-score-big" style={{ color: scoreMessage.color }}>
                    {score.correct}/{score.total}
                  </div>
                  <div className="pp-score-percent" style={{ color: scoreMessage.color }}>
                    {score.percentage}%
                  </div>
                  <div className="pp-verdict-badge" style={{ 
                    backgroundColor: scoreMessage.color + '20',
                    borderColor: scoreMessage.color 
                  }}>
                    <span style={{ color: scoreMessage.color }}>{scoreMessage.message}</span>
                  </div>
                </div>

                {/* Time Display */}
                <div className="pp-time-card">
                  <div className="pp-time-icon">⏱️</div>
                  <div className="pp-time-value">{formatTime(30 * 60 - timeLeft)}</div>
                  <div className="pp-time-label">Time Taken</div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="pp-quick-stats">
                <div className="pp-quick-stat pp-stat-correct">
                  <span className="pp-quick-stat-icon">✓</span>
                  <span className="pp-quick-stat-value">{score.correct}</span>
                  <span className="pp-quick-stat-label">Correct</span>
                </div>
                <div className="pp-quick-stat pp-stat-wrong">
                  <span className="pp-quick-stat-icon">✗</span>
                  <span className="pp-quick-stat-value">{score.total - score.correct}</span>
                  <span className="pp-quick-stat-label">Wrong</span>
                </div>
                <div className="pp-quick-stat pp-stat-accuracy">
                  <span className="pp-quick-stat-icon">📊</span>
                  <span className="pp-quick-stat-value">{score.percentage}%</span>
                  <span className="pp-quick-stat-label">Accuracy</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pp-results-actions-compact">
                <button className="pp-btn-retake" onClick={() => window.location.reload()}>
                  <span className="pp-btn-icon">🔄</span>
                  <span>Retake Quiz</span>
                </button>
                <button className="pp-btn-logs" onClick={() => navigate('/practice-logs')}>
                  <span className="pp-btn-icon">📊</span>
                  <span>Practice Logs</span>
                </button>
                <button className="pp-btn-back" onClick={handleBackToPractice}>
                  <span className="pp-btn-icon">←</span>
                  <span>Back to Practice</span>
                </button>
              </div>
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
      <div className="pp-practice-page-container">
        <div className="pp-examtest-container">
          {/* Top Header */}
          <div className="pp-examtest-header">
            <div className="pp-header-brand">
              <img src="/assets/PrepMark.png" alt="PrepMark" className="pp-brand-logo" />
            </div>
            <div className="pp-header-title">
              {quizData.title}
            </div>
            <div className="pp-header-timer">
              <div className="pp-timer-box">
                <span className="pp-timer-icon">⏱</span>
                <span className="pp-timer-value">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          {/* Main Layout */}
          <div className="pp-examtest-main">
            {/* Left Panel - Questions (60vw) */}
            <div className="pp-examtest-left">
              <div className="pp-question-panel">
                {/* Question Header */}
                <div className="pp-question-header-bar">
                  <span className="pp-question-num">Question {currentQuestion + 1} / {questions.length}</span>
                </div>

                {/* Question Display */}
                <div className="pp-question-display">
                  <h3 className="pp-question-text">{questions[currentQuestion].question}</h3>
                </div>

                {/* Options */}
                <div className="pp-options-container">
                  {questions[currentQuestion].options.map((option, index) => (
                    <div
                      key={index}
                      className={`pp-option-card ${answers[currentQuestion] === index ? 'pp-selected' : ''}`}
                      onClick={() => handleAnswerSelect(index)}
                    >
                      <div className="pp-option-radio">
                        <div className="pp-radio-outer">
                          {answers[currentQuestion] === index && <div className="pp-radio-inner"></div>}
                        </div>
                      </div>
                      <div className="pp-option-label">{String.fromCharCode(65 + index)}</div>
                      <div className="pp-option-content">{option}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="pp-question-nav-footer">
                <button
                  className="pp-nav-button pp-prev-btn"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestion === 0}
                >
                  ← Previous
                </button>
                <button
                  className="pp-nav-button pp-next-btn"
                  onClick={handleNextQuestion}
                  disabled={currentQuestion === questions.length - 1}
                >
                  Next →
                </button>
              </div>
            </div>

            {/* Right Panel - Navigation & Stats */}
            <div className="pp-examtest-right">
              {/* Question Grid */}
              <div className="pp-question-grid-panel">
                <div className="pp-grid-header">Question Navigator</div>
                <div className="pp-question-grid">
                  {questions.map((question, index) => {
                    const isAnswered = answers[index] !== undefined;
                    const isCurrent = index === currentQuestion;
                    
                    return (
                      <button
                        key={index}
                        className={`pp-grid-box ${isCurrent ? 'pp-current' : ''} ${isAnswered ? 'pp-answered' : ''}`}
                        onClick={() => {
                          setCurrentQuestion(index);
                          setSelectedAnswer(answers[index] || '');
                        }}
                      >
                        {isAnswered ? '✓' : index + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stats Panel */}
              <div className="pp-stats-panel">
                <div className="pp-stats-grid">
                  <div className="pp-stat-item pp-answered-stat">
                    <div className="pp-stat-value">{Object.keys(answers).length}</div>
                    <div className="pp-stat-label">Answered</div>
                  </div>
                  <div className="pp-stat-item pp-unattempted-stat">
                    <div className="pp-stat-value">{questions.length - Object.keys(answers).length}</div>
                    <div className="pp-stat-label">Unattempted</div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button className="pp-submit-button" onClick={handleSubmitQuiz}>
                Submit Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PracticePage;