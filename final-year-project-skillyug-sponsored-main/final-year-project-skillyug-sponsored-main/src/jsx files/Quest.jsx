import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavbar from '../components/MainNavbar';
import Footer from '../components/Footer';
import '../css files/Quest.css';
import { fetchRandomQuestionsFlat } from '../firebase/firestore';
import { getUserProfile, updateUserProfile } from '../firebase/auth';

const Quest = () => {
  const navigate = useNavigate();
  
  const QUEST_XP_REWARD = 100;
  const QUESTIONS_PER_QUEST = 10;
  const REQUIRED_SCORE = 10; // Must get 10/10 to progress
  
  // Generate random scattered positions for 40 quests
  const generateQuestPositions = () => {
    const positions = [];
    const usedAreas = [];
    
    for (let i = 0; i < 40; i++) {
      let x, y;
      let attempts = 0;
      
      // Try to find a position that doesn't overlap with others
      do {
        // Distribute vertically with some randomness
        const baseY = 150 + (i * 170) + (Math.random() - 0.5) * 100;
        y = baseY;
        
        // Alternate sides with randomness
        if (i % 2 === 0) {
          x = 20 + Math.random() * 30; // Left side: 20-50%
        } else {
          x = 50 + Math.random() * 30; // Right side: 50-80%
        }
        
        // Check for overlaps
        const tooClose = usedAreas.some(pos => {
          const distance = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
          return distance < 15; // Minimum 15% distance
        });
        
        if (!tooClose || attempts > 20) break;
        attempts++;
      } while (attempts < 20);
      
      positions.push({ x, y });
      usedAreas.push({ x, y });
    }
    
    return positions;
  };
  
  // Generate path curve control points (consistent, not random each render)
  const generatePathCurves = (positions) => {
    return positions.map((pos, index) => {
      if (index < positions.length - 1) {
        const next = positions[index + 1];
        // Use position-based seed for consistent curves
        const seed = (pos.x + pos.y + next.x + next.y) % 20 - 10;
        return {
          midX: (pos.x + next.x) / 2 + seed,
          midY: (pos.y + next.y) / 2
        };
      }
      return null;
    }).filter(Boolean);
  };
  
  const [questPositions] = useState(generateQuestPositions());
  const [pathCurves] = useState(() => generatePathCurves(questPositions));
  
  // Define 40 quest targets/levels
  const questDefinitions = [
    { id: 1, name: "First Steps", description: "Begin your adventure", subject: null, icon: "🌱" },
    { id: 2, name: "Math Basics", description: "Learn the fundamentals", subject: "Mathematics", icon: "🔢" },
    { id: 3, name: "Science Intro", description: "Discover the world", subject: "Science", icon: "🔬" },
    { id: 4, name: "History Dawn", description: "Ancient times", subject: "History", icon: "📜" },
    { id: 5, name: "English Start", description: "Language basics", subject: "English", icon: "📚" },
    { id: 6, name: "Logic Puzzles", description: "Think critically", subject: null, icon: "🧩" },
    { id: 7, name: "Math Advanced", description: "Complex calculations", subject: "Mathematics", icon: "➕" },
    { id: 8, name: "Physics Intro", description: "Laws of nature", subject: "Science", icon: "⚡" },
    { id: 9, name: "Chemistry Start", description: "Elements and compounds", subject: "Science", icon: "🧪" },
    { id: 10, name: "Biology Basics", description: "Life sciences", subject: "Science", icon: "🌿" },
    { id: 11, name: "Geography World", description: "Explore continents", subject: null, icon: "🌍" },
    { id: 12, name: "History Medieval", description: "Middle ages", subject: "History", icon: "⚔️" },
    { id: 13, name: "Math Expert", description: "Master level math", subject: "Mathematics", icon: "📐" },
    { id: 14, name: "English Grammar", description: "Perfect your writing", subject: "English", icon: "✍️" },
    { id: 15, name: "Science Lab", description: "Experiments await", subject: "Science", icon: "🔭" },
    { id: 16, name: "Logic Master", description: "Advanced reasoning", subject: null, icon: "🎯" },
    { id: 17, name: "Physics Forces", description: "Motion and energy", subject: "Science", icon: "🚀" },
    { id: 18, name: "Chemistry Reactions", description: "Chemical changes", subject: "Science", icon: "⚗️" },
    { id: 19, name: "Biology Cells", description: "Microscopic world", subject: "Science", icon: "🦠" },
    { id: 20, name: "History Modern", description: "Recent events", subject: "History", icon: "🏛️" },
    { id: 21, name: "Math Calculus", description: "Advanced concepts", subject: "Mathematics", icon: "∞" },
    { id: 22, name: "English Literature", description: "Great works", subject: "English", icon: "📖" },
    { id: 23, name: "Geography Oceans", description: "Underwater world", subject: null, icon: "🌊" },
    { id: 24, name: "Physics Electricity", description: "Power and circuits", subject: "Science", icon: "💡" },
    { id: 25, name: "Chemistry Organic", description: "Carbon compounds", subject: "Science", icon: "🍃" },
    { id: 26, name: "Biology Genetics", description: "DNA and heredity", subject: "Science", icon: "🧬" },
    { id: 27, name: "History Ancient", description: "Civilizations", subject: "History", icon: "🏺" },
    { id: 28, name: "Math Statistics", description: "Data analysis", subject: "Mathematics", icon: "📊" },
    { id: 29, name: "English Poetry", description: "Verse and rhythm", subject: "English", icon: "🎭" },
    { id: 30, name: "Logic Proofs", description: "Mathematical logic", subject: null, icon: "🔍" },
    { id: 31, name: "Physics Quantum", description: "Subatomic world", subject: "Science", icon: "⚛️" },
    { id: 32, name: "Chemistry Lab", description: "Practical work", subject: "Science", icon: "🔬" },
    { id: 33, name: "Biology Ecology", description: "Ecosystems", subject: "Science", icon: "🌲" },
    { id: 34, name: "Geography Climate", description: "Weather patterns", subject: null, icon: "🌡️" },
    { id: 35, name: "History Wars", description: "Conflicts and peace", subject: "History", icon: "🎖️" },
    { id: 36, name: "Math Mastery", description: "Ultimate challenge", subject: "Mathematics", icon: "👑" },
    { id: 37, name: "English Master", description: "Language expert", subject: "English", icon: "🎓" },
    { id: 38, name: "Science Champion", description: "All sciences", subject: "Science", icon: "🏆" },
    { id: 39, name: "Ultimate Quest", description: "Final challenge", subject: null, icon: "💎" },
    { id: 40, name: "Legend Status", description: "Complete mastery", subject: null, icon: "⭐" },
  ];
  
  const [quests, setQuests] = useState([]);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [questQuestions, setQuestQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [totalXP, setTotalXP] = useState(0);

  // Load user progress from Firebase
  useEffect(() => {
    const loadUserProgress = async () => {
      try {
        const profile = await getUserProfile();
        if (profile) {
          setTotalXP(profile.totalXP || 0);
          
          // Load quest progress from Firebase
          const questProgress = profile.questProgress || [];
          
          // Initialize quests based on saved progress
          const initializedQuests = questDefinitions.map((questDef, index) => {
            const savedProgress = questProgress.find(q => q.id === questDef.id);
            return {
              ...questDef,
              completed: savedProgress?.completed || false,
              locked: index === 0 ? false : (questProgress[index - 1]?.completed !== true),
            };
          });
          
          setQuests(initializedQuests);
        }
      } catch (error) {
        console.error('Error loading user progress:', error);
        // Initialize with default locked state
        const defaultQuests = questDefinitions.map((questDef, index) => ({
          ...questDef,
          completed: false,
          locked: index !== 0,
        }));
        setQuests(defaultQuests);
      }
    };

    loadUserProgress();
  }, []);

  const handleQuestClick = async (quest) => {
    if (quest.locked) return;
    
    setSelectedQuest(quest);
    setQuizStarted(false);
    setShowResult(false);
  };

  const startQuest = async () => {
    setIsLoading(true);
    setShowResult(false); // Hide results modal if retrying
    try {
      // Fetch 10 random questions for this quest
      const result = await fetchRandomQuestionsFlat(selectedQuest.subject, QUESTIONS_PER_QUEST);
      
      if (result.success && result.questions && result.questions.length > 0) {
        // Transform questions to quiz format
        const transformedQuestions = result.questions.map(q => {
          // Firestore returns: options array and correct index
          const correctAnswerText = q.options[q.correct]; // Get actual answer text from index
          
          return {
            id: q.id,
            question: q.question,
            options: q.options,
            correctAnswer: correctAnswerText,
            correctIndex: q.correct // Store index for reference
          };
        });
        
        console.log('Loaded questions:', transformedQuestions);
        
        setQuestQuestions(transformedQuestions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setQuizStarted(true);
      } else {
        alert('Unable to load quest questions. Please try again.');
      }
    } catch (error) {
      console.error('Error loading quest questions:', error);
      alert('Error loading questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    if (selectedAnswer !== null) return; // Already answered
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    const currentQuestion = questQuestions[currentQuestionIndex];
    
    // Check if answer is correct (trim whitespace for comparison)
    const isCorrect = selectedAnswer?.trim() === currentQuestion.correctAnswer?.trim();
    
    console.log('Answer check:', {
      selected: selectedAnswer,
      correct: currentQuestion.correctAnswer,
      isCorrect
    });
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    // Move to next question or show results
    if (currentQuestionIndex < questQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      // Quiz complete - show results
      const finalScore = isCorrect ? score + 1 : score;
      setScore(finalScore);
      setShowResult(true);
      setQuizStarted(false); // Close quiz modal
    }
  };

  const handleQuestComplete = async () => {
    // Check if user got perfect score (10/10)
    if (score === REQUIRED_SCORE) {
      try {
        // Award XP
        const newTotalXP = totalXP + QUEST_XP_REWARD;
        setTotalXP(newTotalXP);
        
        // Count completed quests
        const completedCount = quests.filter(q => q.completed).length + 1; // +1 for current quest
        
        // Update quest progress
        const updatedQuests = quests.map((q, index) => {
          if (q.id === selectedQuest.id) {
            // Unlock next quest
            if (index < quests.length - 1) {
              quests[index + 1].locked = false;
            }
            return { ...q, completed: true };
          }
          return q;
        });
        
        setQuests(updatedQuests);
        
        // Save to Firebase
        await updateUserProfile({
          totalXP: newTotalXP,
          questProgress: completedCount,
        });
        
        // Save quest completion to practice history
        await savePracticeHistory(currentUser.uid, {
          type: 'Quest',
          subject: selectedQuest.subject,
          questNumber: selectedQuest.id,
          correct: score,
          total: QUESTIONS_PER_QUEST,
          percentage: (score / QUESTIONS_PER_QUEST * 100).toFixed(1),
          xpEarned: QUEST_XP_REWARD,
          timeSpent: 0, // Could track this if needed
          completedAt: new Date().toISOString()
        });
        
        console.log('✅ Quest progress saved to Firebase');
        
        // Close modal
        setSelectedQuest(null);
        setShowResult(false);
        setQuizStarted(false);
      } catch (error) {
        console.error('Error saving quest progress:', error);
        alert('Error saving progress. Please try again.');
      }
    } else {
      // Failed - must retry
      setShowResult(false);
      setQuizStarted(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedQuest(null);
    setQuizStarted(false);
    setShowResult(false);
    setQuestQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
  };

  return (
    <>
      <MainNavbar />
      <div className="quest-container">
        

        <div className="quest-path-wrapper">
          {/* SVG for curved connecting lines */}
          <svg className="quest-connecting-lines" viewBox="0 0 100 7000" preserveAspectRatio="none">
            {quests.map((quest, index) => {
              if (index < quests.length - 1) {
                const pos1 = questPositions[index];
                const pos2 = questPositions[index + 1];
                const curve = pathCurves[index];
                
                const pathData = `M ${pos1.x} ${pos1.y} Q ${curve.midX} ${curve.midY}, ${pos2.x} ${pos2.y}`;
                
                return (
                  <path
                    key={`line-${quest.id}`}
                    d={pathData}
                    className={quest.completed ? "quest-line-completed" : "quest-line-locked"}
                    fill="none"
                  />
                );
              }
              return null;
            })}
          </svg>

          {/* Quest Checkpoints - just white dots with icons */}
          {quests.map((quest, index) => {
            const pos = questPositions[index];
            
            return (
              <div
                key={quest.id}
                className={`quest-checkpoint ${quest.completed ? 'completed' : ''} ${quest.locked ? 'locked' : ''}`}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}px`,
                }}
                onClick={() => handleQuestClick(quest)}
                title={quest.locked ? 'Locked' : quest.completed ? 'Completed' : 'Click to start'}
              >
                <div className="quest-checkpoint-circle">
                  <span className="quest-checkpoint-icon">{quest.icon}</span>
                  {quest.completed && <div className="quest-checkpoint-check">✓</div>}
                  {quest.locked && <div className="quest-checkpoint-lock">🔒</div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quest Info Modal */}
        {selectedQuest && !quizStarted && (
          <div className="quest-modal-overlay" onClick={handleCloseModal}>
            <div className="quest-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="quest-modal-close" onClick={handleCloseModal}>&times;</button>
              <div className="quest-modal-header">
                <span className="quest-modal-icon">{selectedQuest.icon}</span>
                <h2 className="quest-modal-title">{selectedQuest.name}</h2>
              </div>
              <div className="quest-modal-body">
                <p className="quest-description">{selectedQuest.description}</p>
                <div className="quest-requirements">
                  <h3>Quest Rules:</h3>
                  <ul>
                    <li>📝 Answer {QUESTIONS_PER_QUEST} randomized questions</li>
                    <li>🎯 Must get ALL {REQUIRED_SCORE} correct to unlock next quest</li>
                    <li>⭐ Reward: <strong>{QUEST_XP_REWARD} XP</strong> (only on perfect score)</li>
                    {selectedQuest.subject && <li>📚 Subject: {selectedQuest.subject}</li>}
                  </ul>
                </div>
                <div className="quest-modal-actions">
                  <button className="quest-btn-start" onClick={startQuest} disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Start Quest'}
                  </button>
                  <button className="quest-btn-cancel" onClick={handleCloseModal}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Modal */}
        {selectedQuest && quizStarted && !showResult && questQuestions.length > 0 && (
          <div className="quest-modal-overlay">
            <div className="quest-quiz-modal">
              <div className="quest-quiz-header">
                <h2>{selectedQuest.name}</h2>
                <div className="quest-quiz-progress">
                  Question {currentQuestionIndex + 1} of {QUESTIONS_PER_QUEST}
                </div>
                <div className="quest-quiz-score">Score: {score}/{currentQuestionIndex}</div>
              </div>
              
              <div className="quest-quiz-body">
                <h3 className="quest-question">{questQuestions[currentQuestionIndex].question}</h3>
                
                <div className="quest-options">
                  {questQuestions[currentQuestionIndex].options.map((option, index) => (
                    <button
                      key={index}
                      className={`quest-option ${selectedAnswer === option ? 'selected' : ''} ${
                        selectedAnswer !== null
                          ? option === questQuestions[currentQuestionIndex].correctAnswer
                            ? 'correct'
                            : option === selectedAnswer
                            ? 'incorrect'
                            : ''
                          : ''
                      }`}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={selectedAnswer !== null}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                
                {selectedAnswer !== null && (
                  <button className="quest-btn-next" onClick={handleNextQuestion}>
                    {currentQuestionIndex < questQuestions.length - 1 ? 'Next Question' : 'View Results'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results Modal */}
        {selectedQuest && showResult && (
          <div className="quest-modal-overlay">
            <div className="quest-results-modal">
              <h2>Quest {score === REQUIRED_SCORE ? 'Complete!' : 'Failed'}</h2>
              <div className={`quest-results-score ${score === REQUIRED_SCORE ? 'perfect' : 'failed'}`}>
                {score}/{QUESTIONS_PER_QUEST}
              </div>
              
              {score === REQUIRED_SCORE ? (
                <div className="quest-success-message">
                  <p className="quest-congrats">🎉 Perfect Score!</p>
                  <p className="quest-xp-earned">+{QUEST_XP_REWARD} XP Earned!</p>
                  <p className="quest-new-total">New Total: {totalXP + QUEST_XP_REWARD} XP</p>
                  <button className="quest-btn-claim" onClick={handleQuestComplete}>
                    Claim Reward & Continue
                  </button>
                </div>
              ) : (
                <div className="quest-fail-message">
                  <p className="quest-try-again">You need {REQUIRED_SCORE}/{QUESTIONS_PER_QUEST} to complete this quest.</p>
                  <p className="quest-retry-hint">Try again to unlock the next quest!</p>
                  <div className="quest-modal-actions">
                    <button className="quest-btn-retry" onClick={startQuest}>
                      Retry Quest
                    </button>
                    <button className="quest-btn-cancel" onClick={handleCloseModal}>
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Quest;
