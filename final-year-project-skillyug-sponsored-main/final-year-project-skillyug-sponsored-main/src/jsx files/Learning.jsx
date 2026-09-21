import React, { useState } from "react";
import "../css files/Learning.css";
import MainNavbar from "../components/MainNavbar";
import Footer from "../components/Footer";

const Learning = () => {
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [testCompleted, setTestCompleted] = useState(false);

  // MAT and SAT Topics with Questions
  const testData = {
    MAT: {
      name: "Mental Ability Test",
      icon: "🧠",
      description: "Test your mental reasoning and logical thinking",
      topics: [
        {
          id: "pattern",
          name: "Pattern Recognition",
          icon: "🔢",
          questions: [
            {
              id: 1,
              question: "What comes next in the series: 2, 4, 8, 16, ?",
              options: ["24", "32", "20", "28"],
              correct: 1,
              explanation: "The pattern is multiplying by 2 each time. 16 × 2 = 32"
            },
            {
              id: 2,
              question: "Complete the pattern: A, C, E, G, ?",
              options: ["H", "I", "J", "K"],
              correct: 1,
              explanation: "The pattern skips one letter each time. After G comes H (skip) then I."
            },
            {
              id: 3,
              question: "What number should replace the question mark: 5, 10, 20, 40, ?",
              options: ["60", "70", "80", "90"],
              correct: 2,
              explanation: "Each number is doubled. 40 × 2 = 80"
            }
          ]
        },
        {
          id: "analogy",
          name: "Verbal Analogy",
          icon: "📝",
          questions: [
            {
              id: 1,
              question: "Doctor : Hospital :: Teacher : ?",
              options: ["Student", "School", "Book", "Class"],
              correct: 1,
              explanation: "A doctor works in a hospital, and a teacher works in a school."
            },
            {
              id: 2,
              question: "Book : Pages :: Tree : ?",
              options: ["Leaves", "Roots", "Trunk", "Branches"],
              correct: 0,
              explanation: "A book is made of pages, and a tree has leaves."
            },
            {
              id: 3,
              question: "Pen : Write :: Knife : ?",
              options: ["Sharp", "Cut", "Metal", "Kitchen"],
              correct: 1,
              explanation: "A pen is used to write, and a knife is used to cut."
            }
          ]
        },
        {
          id: "spatial",
          name: "Spatial Reasoning",
          icon: "🎯",
          questions: [
            {
              id: 1,
              question: "How many triangles are there in a square divided by its two diagonals?",
              options: ["2", "4", "6", "8"],
              correct: 3,
              explanation: "The two diagonals create 8 triangles in total within the square."
            },
            {
              id: 2,
              question: "If you fold a paper twice and cut a corner, how many holes will you get when unfolded?",
              options: ["1", "2", "3", "4"],
              correct: 3,
              explanation: "Each fold doubles the number of holes. 2 folds = 2² = 4 holes."
            },
            {
              id: 3,
              question: "A cube is painted red on all faces and cut into 27 smaller cubes. How many have no red faces?",
              options: ["0", "1", "8", "9"],
              correct: 1,
              explanation: "Only the center cube (1) has no painted faces."
            }
          ]
        }
      ]
    },
    SAT: {
      name: "Scholastic Aptitude Test",
      icon: "📚",
      description: "Assess your academic skills across various subjects",
      topics: [
        {
          id: "math",
          name: "Mathematics",
          icon: "🔢",
          questions: [
            {
              id: 1,
              question: "If x + 5 = 12, what is the value of x?",
              options: ["5", "6", "7", "8"],
              correct: 2,
              explanation: "Subtract 5 from both sides: x = 12 - 5 = 7"
            },
            {
              id: 2,
              question: "What is 25% of 80?",
              options: ["15", "20", "25", "30"],
              correct: 1,
              explanation: "25% of 80 = (25/100) × 80 = 20"
            },
            {
              id: 3,
              question: "The area of a rectangle with length 8cm and width 5cm is?",
              options: ["13 cm²", "26 cm²", "40 cm²", "80 cm²"],
              correct: 2,
              explanation: "Area = length × width = 8 × 5 = 40 cm²"
            }
          ]
        },
        {
          id: "science",
          name: "General Science",
          icon: "🔬",
          questions: [
            {
              id: 1,
              question: "What is the chemical formula for water?",
              options: ["H₂O", "CO₂", "O₂", "H₂"],
              correct: 0,
              explanation: "Water consists of 2 hydrogen atoms and 1 oxygen atom: H₂O"
            },
            {
              id: 2,
              question: "Which planet is closest to the Sun?",
              options: ["Venus", "Earth", "Mercury", "Mars"],
              correct: 2,
              explanation: "Mercury is the closest planet to the Sun in our solar system."
            },
            {
              id: 3,
              question: "What gas do plants absorb from the atmosphere?",
              options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
              correct: 2,
              explanation: "Plants absorb CO₂ during photosynthesis to produce oxygen."
            }
          ]
        },
        {
          id: "english",
          name: "English Language",
          icon: "📖",
          questions: [
            {
              id: 1,
              question: "Choose the correct synonym for 'Happy':",
              options: ["Sad", "Joyful", "Angry", "Tired"],
              correct: 1,
              explanation: "Joyful means feeling or expressing great happiness, making it a synonym of happy."
            },
            {
              id: 2,
              question: "What is the past tense of 'run'?",
              options: ["Runned", "Ran", "Running", "Runs"],
              correct: 1,
              explanation: "The irregular past tense of 'run' is 'ran'."
            },
            {
              id: 3,
              question: "Which sentence is grammatically correct?",
              options: [
                "She don't like apples",
                "She doesn't likes apples",
                "She doesn't like apples",
                "She not like apples"
              ],
              correct: 2,
              explanation: "Correct subject-verb agreement with third person singular: 'She doesn't like apples'"
            }
          ]
        }
      ]
    }
  };

  const handleTestSelect = (testType) => {
    setSelectedTest(testType);
    setSelectedTopic(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnsweredQuestions([]);
    setTestCompleted(false);
  };

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setAnsweredQuestions([]);
    setTestCompleted(false);
  };

  const handleAnswerSelect = (answerIndex) => {
    if (showFeedback) return; // Prevent changing answer after feedback shown
    
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);
    
    const currentQuestion = selectedTopic.questions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correct;
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setAnsweredQuestions([...answeredQuestions, {
      questionId: currentQuestion.id,
      selected: answerIndex,
      correct: currentQuestion.correct,
      isCorrect
    }]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < selectedTopic.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setTestCompleted(true);
    }
  };

  const handleRetakeTest = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setAnsweredQuestions([]);
    setTestCompleted(false);
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setAnsweredQuestions([]);
    setTestCompleted(false);
  };

  const handleBackToTests = () => {
    setSelectedTest(null);
    setSelectedTopic(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setAnsweredQuestions([]);
    setTestCompleted(false);
  };

  const currentQuestion = selectedTopic?.questions[currentQuestionIndex];

  return (
    <>
      <MainNavbar />
      <div className="learning-section">
        <div className="learning-container">
          {/* Header */}
          <div className="learning-header">
            <h1>📚 Learning Center</h1>
            <p>Choose your test and start practicing!</p>
          </div>

          {/* Test Selection View */}
          {!selectedTest && (
            <div className="test-selection">
              <div className="test-cards">
                <div className="test-card" onClick={() => handleTestSelect('MAT')}>
                  <div className="test-icon">{testData.MAT.icon}</div>
                  <h2>{testData.MAT.name}</h2>
                  <p>{testData.MAT.description}</p>
                  <div className="test-topics-count">
                    {testData.MAT.topics.length} Topics
                  </div>
                </div>

                <div className="test-card" onClick={() => handleTestSelect('SAT')}>
                  <div className="test-icon">{testData.SAT.icon}</div>
                  <h2>{testData.SAT.name}</h2>
                  <p>{testData.SAT.description}</p>
                  <div className="test-topics-count">
                    {testData.SAT.topics.length} Topics
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Topic Selection View */}
          {selectedTest && !selectedTopic && (
            <div className="topic-selection">
              <button className="back-btn" onClick={handleBackToTests}>
                ← Back to Tests
              </button>
              
              <div className="selected-test-header">
                <span className="test-icon-large">{testData[selectedTest].icon}</span>
                <h2>{testData[selectedTest].name}</h2>
              </div>

              <div className="topics-grid">
                {testData[selectedTest].topics.map((topic) => (
                  <div 
                    key={topic.id} 
                    className="topic-card"
                    onClick={() => handleTopicSelect(topic)}
                  >
                    <div className="topic-icon">{topic.icon}</div>
                    <h3>{topic.name}</h3>
                    <div className="topic-questions">
                      {topic.questions.length} Questions
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Question View */}
          {selectedTest && selectedTopic && !testCompleted && (
            <div className="question-view">
              <button className="back-btn" onClick={handleBackToTopics}>
                ← Back to Topics
              </button>

              <div className="test-progress">
                <div className="progress-info">
                  <span>Question {currentQuestionIndex + 1} of {selectedTopic.questions.length}</span>
                  <span>Score: {score}/{selectedTopic.questions.length}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${((currentQuestionIndex + 1) / selectedTopic.questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="question-card">
                <div className="question-header">
                  <span className="topic-badge">
                    {selectedTopic.icon} {selectedTopic.name}
                  </span>
                </div>

                <h2 className="question-text">{currentQuestion.question}</h2>

                <div className="options-container">
                  {currentQuestion.options.map((option, index) => {
                    let optionClass = "option";
                    
                    if (showFeedback) {
                      if (index === currentQuestion.correct) {
                        optionClass += " correct";
                      } else if (index === selectedAnswer && index !== currentQuestion.correct) {
                        optionClass += " incorrect";
                      } else {
                        optionClass += " disabled";
                      }
                    } else if (selectedAnswer === index) {
                      optionClass += " selected";
                    }

                    return (
                      <div
                        key={index}
                        className={optionClass}
                        onClick={() => handleAnswerSelect(index)}
                      >
                        <span className="option-label">{String.fromCharCode(65 + index)}</span>
                        <span className="option-text">{option}</span>
                        {showFeedback && index === currentQuestion.correct && (
                          <span className="feedback-icon">✓</span>
                        )}
                        {showFeedback && index === selectedAnswer && index !== currentQuestion.correct && (
                          <span className="feedback-icon">✗</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {showFeedback && (
                  <div className={`explanation ${selectedAnswer === currentQuestion.correct ? 'correct-explanation' : 'incorrect-explanation'}`}>
                    <div className="explanation-header">
                      {selectedAnswer === currentQuestion.correct ? (
                        <><span className="emoji">🎉</span> Correct!</>
                      ) : (
                        <><span className="emoji">💡</span> Incorrect</>
                      )}
                    </div>
                    <p>{currentQuestion.explanation}</p>
                  </div>
                )}

                {showFeedback && (
                  <button className="next-btn" onClick={handleNextQuestion}>
                    {currentQuestionIndex < selectedTopic.questions.length - 1 ? 'Next Question →' : 'View Results →'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Test Completed View */}
          {testCompleted && (
            <div className="test-completed">
              <div className="results-card">
                <div className="results-icon">
                  {score === selectedTopic.questions.length ? '🏆' : 
                   score >= selectedTopic.questions.length * 0.7 ? '🎉' : 
                   score >= selectedTopic.questions.length * 0.5 ? '👍' : '📚'}
                </div>
                
                <h2>Test Completed!</h2>
                
                <div className="score-display">
                  <div className="score-circle">
                    <span className="score-number">{score}</span>
                    <span className="score-total">/ {selectedTopic.questions.length}</span>
                  </div>
                  <p className="score-percentage">
                    {Math.round((score / selectedTopic.questions.length) * 100)}%
                  </p>
                </div>

                <div className="performance-message">
                  {score === selectedTopic.questions.length && (
                    <p>🌟 Perfect Score! Excellent work!</p>
                  )}
                  {score >= selectedTopic.questions.length * 0.7 && score < selectedTopic.questions.length && (
                    <p>Great job! You're doing really well!</p>
                  )}
                  {score >= selectedTopic.questions.length * 0.5 && score < selectedTopic.questions.length * 0.7 && (
                    <p>Good effort! Keep practicing to improve!</p>
                  )}
                  {score < selectedTopic.questions.length * 0.5 && (
                    <p>Keep learning! Practice makes perfect!</p>
                  )}
                </div>

                <div className="results-actions">
                  <button className="retake-btn" onClick={handleRetakeTest}>
                    🔄 Retake Test
                  </button>
                  <button className="topics-btn" onClick={handleBackToTopics}>
                    📚 Choose Another Topic
                  </button>
                  <button className="home-btn" onClick={handleBackToTests}>
                    🏠 Back to Tests
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Learning;
