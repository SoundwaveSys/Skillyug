import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../css files/Home.css";
import MainNavbar from "../components/MainNavbar";
import ParticleBackground from "../components/StarBg";
import Chatbot from "../components/Chatbot";
import Footer from "../components/Footer";
import { fetchRandomQuestionsFlat, saveDailyQuizResult } from "../firebase/firestore";
import { getUserProfile, updateUserProfile } from "../firebase/auth";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUser = user;
  
  // XP System Configuration
  const XP_PER_LEVEL = 100; // 100 XP needed per level
  const DAILY_QUIZ_XP = 15; // XP awarded for completing daily quiz
  
  // User data
  const [userName, setUserName] = useState("Student");
  const [userLoading, setUserLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [xpLevel, setXpLevel] = useState(1);
  const [xpProgress, setXpProgress] = useState(0); // percentage of current level
  const [totalXP, setTotalXP] = useState(0);
  
  // Quest progress (daily goal)
  const [questProgress, setQuestProgress] = useState(65); // percentage
  const [questTarget] = useState("Complete 5 activities today");
  const [questCompleted, setQuestCompleted] = useState(3);
  const [questTotal] = useState(5);
  
  // Daily Quiz
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [hasCompletedDailyQuiz, setHasCompletedDailyQuiz] = useState(false);
  const [dailyQuizQuestions, setDailyQuizQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showQuizResult, setShowQuizResult] = useState(false);

  // Calculate XP level and progress dynamically
  const calculateXPStats = (xp) => {
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    const xpInCurrentLevel = xp % XP_PER_LEVEL;
    const progress = (xpInCurrentLevel / XP_PER_LEVEL) * 100;
    
    return { level, progress };
  };

  // Update XP level and progress whenever totalXP changes
  useEffect(() => {
    const { level, progress } = calculateXPStats(totalXP);
    setXpLevel(level);
    setXpProgress(progress);
  }, [totalXP]);

  // Load user profile on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setUserLoading(true);
        const result = await getUserProfile();
        
        if (result.success && result.profile) {
          // Set user name from profile
          const name = result.profile.fullName || result.profile.displayName || "Student";
          setUserName(name.split(' ')[0]); // Get first name only
          
          // Update XP and streak from profile
          const userXP = result.profile.totalXP || 0;
          const userStreak = result.profile.streak || 0;
          
          setTotalXP(userXP);
          setStreak(userStreak);
          
          // Also save to localStorage for offline access
          localStorage.setItem('totalXP', userXP.toString());
          localStorage.setItem('userStreak', userStreak.toString());
        } else {
          // Load from localStorage if profile fetch fails
          const savedXP = localStorage.getItem('totalXP');
          const savedStreak = localStorage.getItem('userStreak');
          
          if (savedXP) setTotalXP(parseInt(savedXP));
          if (savedStreak) setStreak(parseInt(savedStreak));
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        // Fallback to localStorage
        const savedXP = localStorage.getItem('totalXP');
        const savedStreak = localStorage.getItem('userStreak');
        
        if (savedXP) setTotalXP(parseInt(savedXP));
        if (savedStreak) setStreak(parseInt(savedStreak));
        setUserName("Student");
      } finally {
        setUserLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  // Load daily quiz status from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const lastCompleted = localStorage.getItem('dailyQuizDate');
    const streakData = localStorage.getItem('userStreak');
    
    if (lastCompleted === today) {
      setHasCompletedDailyQuiz(true);
    }
    
    if (streakData) {
      setStreak(parseInt(streakData));
    }
  }, []);

  // Fetch daily quiz questions
  useEffect(() => {
    const fetchDailyQuestions = async () => {
      const today = new Date().toDateString();
      const cachedQuestionsKey = 'dailyQuizQuestions';
      const cachedDateKey = 'dailyQuizQuestionsDate';
      
      // Check if we have cached questions for today
      const cachedDate = localStorage.getItem(cachedDateKey);
      const cachedQuestions = localStorage.getItem(cachedQuestionsKey);
      
      if (cachedDate === today && cachedQuestions) {
        // Use cached questions
        setDailyQuizQuestions(JSON.parse(cachedQuestions));
        setLoadingQuestions(false);
        return;
      }
      
      try {
        // Fetch 3 random questions from any subject
        const result = await fetchRandomQuestionsFlat(null, 3);
        
        if (result.success && result.questions && result.questions.length > 0) {
          // Transform Firestore questions to match expected format
          const transformedQuestions = result.questions.map((q, index) => ({
            id: index + 1,
            question: q.question,
            options: [q.opt1, q.opt2, q.opt3, q.opt4],
            correctAnswer: q.ans - 1, // Convert 1-4 to 0-3
            subject: q.subject,
            chapter: q.chapter
          }));
          
          setDailyQuizQuestions(transformedQuestions);
          
          // Cache questions for today
          localStorage.setItem(cachedQuestionsKey, JSON.stringify(transformedQuestions));
          localStorage.setItem(cachedDateKey, today);
        } else {
          console.error('No questions returned from database');
          setDailyQuizQuestions([]);
        }
      } catch (error) {
        console.error('Error fetching daily quiz questions:', error);
        // Set empty array if fetch fails
        setDailyQuizQuestions([]);
      } finally {
        setLoadingQuestions(false);
      }
    };
    
    fetchDailyQuestions();
  }, []);

  const handleOpenQuiz = () => {
    setShowQuizModal(true);
    setQuizAnswers({});
    setQuizSubmitted(false);
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  };

  const handleQuizAnswerSelect = (questionId, optionIndex) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleQuizSubmit = async () => {
    let correctCount = 0;
    dailyQuizQuestions.forEach(q => {
      if (quizAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    
    setQuizSubmitted(true);
    
    // Award XP for completing daily quiz (regardless of score)
    const newTotalXP = totalXP + DAILY_QUIZ_XP;
    setTotalXP(newTotalXP);
    localStorage.setItem('totalXP', newTotalXP.toString());
    
    // Update streak for completing the daily quiz (regardless of score)
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem('userStreak', newStreak.toString());
    
    // Mark quiz as completed for today
    const today = new Date().toDateString();
    localStorage.setItem('dailyQuizDate', today);
    setHasCompletedDailyQuiz(true);
    
    // Save XP and streak to Firebase
    try {
      await updateUserProfile({
        totalXP: newTotalXP,
        streak: newStreak,
        lastQuizCompleted: new Date().toISOString()
      });
      
      // Save daily quiz result to history
      await saveDailyQuizResult(currentUser.uid, {
        correct: correctCount,
        total: dailyQuizQuestions.length,
        percentage: (correctCount / dailyQuizQuestions.length * 100).toFixed(1),
        xpEarned: DAILY_QUIZ_XP,
        completedAt: new Date().toISOString()
      });
      
      console.log('✅ Daily quiz result and XP saved to Firebase');
    } catch (error) {
      console.error('❌ Failed to save daily quiz to Firebase:', error);
      // Continue anyway - data is in localStorage
    }
  };

  const handleCloseQuizModal = () => {
    setShowQuizModal(false);
    document.body.style.overflow = 'unset';
    document.documentElement.style.overflow = 'unset';
  };

  return (
    <>
      <MainNavbar />
      <div className="home-page">
        <ParticleBackground />
        
        <div className="home-container">
          
          {/* Welcome Message */}
          <div className="welcome-section">
            <h1 className="welcome-title">
              Welcome <span className="username-highlight">{userName}!</span>
            </h1>
            
            <div className="home-buttons">
              <button 
                className={`home-btn daily-quiz-btn ${hasCompletedDailyQuiz ? 'completed' : ''}`} 
                onClick={handleOpenQuiz}
                disabled={hasCompletedDailyQuiz}
                style={{ opacity: hasCompletedDailyQuiz ? 0.7 : 1, cursor: hasCompletedDailyQuiz ? 'not-allowed' : 'pointer' }}
              >
                <img src="/assets/dailyquizpic.png" alt="Daily Quiz" className="daily-quiz-full" />
                {hasCompletedDailyQuiz && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#4CAF50',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    ✓ Completed
                  </div>
                )}
              </button>
              <button className="home-btn daily-streak-btn">
                <div className="streak-top">
                  <span>Daily Quiz Streak</span>
                </div>
                <div className="streak-bottom">
                  <span className="streak-count">{streak}</span>
                  <span className="streak-label">Days</span>
                </div>
              </button>
              <button className="home-btn quest-btn" onClick={() => navigate('/quest')}>
                <img src="/assets/map.png" alt="Map" className="quest-map-full" />
              </button>
            </div>
            
            <div className="home-buttons-bottom">
              <button className="home-btn fourth-btn" title={`Level ${xpLevel} - ${totalXP} XP (${Math.floor(xpProgress)}% to Level ${xpLevel + 1})`}>
                <div className="xp-level-star">
                  <span className="xp-level-number">{xpLevel}</span>
                </div>
                <div className="xp-bar-container">
                  <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }}></div>
                  <span style={{
                    position: 'absolute',
                    width: '100%',
                    textAlign: 'center',
                    fontSize: '0.7rem',
                    color: '#fff',
                    fontWeight: '600',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                    lineHeight: '20px'
                  }}>
                    {totalXP} XP
                  </span>
                </div>
              </button>
            </div>
          </div>

         

        </div>
        
        <Chatbot />
        
        {/* Daily Quiz Modal */}
        {showQuizModal && (
          <div className="quiz-modal-overlay" onClick={handleCloseQuizModal}>
            <div className="quiz-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="quiz-modal-close" onClick={handleCloseQuizModal}>&times;</button>
              {loadingQuestions ? (
                <div className="quiz-loading">
                  <p>Loading today's quiz...</p>
                </div>
              ) : dailyQuizQuestions.length === 0 ? (
                <div className="quiz-error">
                  <p>Unable to load quiz questions. Please try again later.</p>
                </div>
              ) : !quizSubmitted ? (
                <>
                  <h2 className="quiz-modal-title">Daily Quiz Challenge</h2>
                  <div className="quiz-questions-container">
                    {dailyQuizQuestions.map((q, index) => (
                      <div key={q.id} className="quiz-question-block">
                        <p className="quiz-question-text">
                          <span className="quiz-q-number">{index + 1}.</span> {q.question}
                        </p>
                        <div className="quiz-options-grid">
                          {q.options.map((option, optIndex) => (
                            <button
                              key={optIndex}
                              className={`quiz-option ${quizAnswers[q.id] === optIndex ? 'selected' : ''}`}
                              onClick={() => handleQuizAnswerSelect(q.id, optIndex)}
                            >
                              <span className="quiz-option-label">{String.fromCharCode(65 + optIndex)}</span>
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    className="quiz-submit-btn" 
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(quizAnswers).length < dailyQuizQuestions.length}
                  >
                    Submit Quiz
                  </button>
                </>
              ) : (
                <>
                  <h2 className="quiz-modal-title">Quiz Results</h2>
                  <div className="quiz-results-container">
                      <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '12px',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                          +{DAILY_QUIZ_XP} XP Earned!
                        </div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                          Total: {totalXP} XP • Level {xpLevel}
                        </div>
                      </div>
                    <div className="quiz-score-display">
                      <div className="quiz-score-circle">
                        <span className="quiz-score-number">
                          {dailyQuizQuestions.filter(q => quizAnswers[q.id] === q.correctAnswer).length}
                        </span>
                        <span className="quiz-score-total">/ {dailyQuizQuestions.length}</span>
                      </div>
                      <p className="quiz-score-label">
                        {dailyQuizQuestions.filter(q => quizAnswers[q.id] === q.correctAnswer).length >= 3 
                          ? '🎉 Great Job!' 
                          : '💪 Keep Practicing!'}
                      </p>
                    </div>
                    {dailyQuizQuestions.map((q, index) => (
                      <div key={q.id} className="quiz-result-item">
                        <span className="quiz-result-q">Q{index + 1}</span>
                        <span className={`quiz-result-status ${quizAnswers[q.id] === q.correctAnswer ? 'correct' : 'wrong'}`}>
                          {quizAnswers[q.id] === q.correctAnswer ? '✓' : '✗'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button className="quiz-close-btn" onClick={handleCloseQuizModal}>
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        
      </div>
      <Footer />
    </>
  );
};

export default Home;