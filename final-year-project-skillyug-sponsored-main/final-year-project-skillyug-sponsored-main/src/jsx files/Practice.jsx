import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllSubjects, getChaptersBySubject } from '../firebase/firestore';
import '../css files/Practice.css';
import MainNavbar from "../components/MainNavbar";
import Footer from "../components/Footer";
import ParticleBackground from '../components/StarBg';

const Practice = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('quick');
  const [syllabusTab, setSyllabusTab] = useState('sat'); // For MAT/SAT tabs in Section 2 (default to SAT)
  const [satSubTab, setSatSubTab] = useState('science'); // For SAT sub-categories (default to science)
  const [socialSubTab, setSocialSubTab] = useState('history'); // For Social Science sub-categories
  
  // Chapter-wise quiz state
  const [selectedSubject, setSelectedSubject] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(false);

  // Fetch available subjects from Firestore on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      const result = await getAllSubjects();
      if (result.success) {
        setAvailableSubjects(result.subjects);
        if (result.subjects.length > 0) {
          setSelectedSubject(result.subjects[0]); // Set first subject as default
        }
      }
    };
    fetchSubjects();
  }, []);

  // Fetch chapters when subject changes
  useEffect(() => {
    const fetchChapters = async () => {
      if (!selectedSubject) return;
      
      setLoadingChapters(true);
      const result = await getChaptersBySubject(selectedSubject);
      if (result.success) {
        setChapters(result.chapters);
      }
      setLoadingChapters(false);
    };
    
    if (selectedSubject) {
      fetchChapters();
    }
  }, [selectedSubject]);

  // Load chapters when SAT Science tab is selected
  useEffect(() => {
    if (syllabusTab === 'sat' && satSubTab === 'science') {
      const loadChapters = async () => {
        setLoadingChapters(true);
        const result = await getChaptersBySubject('विज्ञान');
        if (result.success) {
          setChapters(result.chapters);
        } else {
          setChapters([]);
        }
        setLoadingChapters(false);
      };
      loadChapters();
    }
  }, [satSubTab, syllabusTab]);

  // Load chapters when social science sub-tabs change
  useEffect(() => {
    const loadChapters = async () => {
      if (syllabusTab !== 'sat' || satSubTab !== 'social') {
        return; // Only load when SAT Social Science tab is active
      }
      
      setLoadingChapters(true);
      let subject = '';
      if (socialSubTab === 'history') {
        subject = 'इतिहास';
      } else if (socialSubTab === 'civics') {
        subject = 'नागरिकशास्त्र';
      } else if (socialSubTab === 'geography') {
        subject = 'भूगोल';
      }
      
      if (subject) {
        const result = await getChaptersBySubject(subject);
        if (result.success) {
          setChapters(result.chapters);
        } else {
          setChapters([]);
        }
      }
      setLoadingChapters(false);
    };
    loadChapters();
  }, [socialSubTab, satSubTab, syllabusTab]);

  const quickPracticeOptions = [
    {
      icon: '⚡',
      title: 'Quick Quiz',
      description: '5 random questions from mixed topics',
      questions: 5,
      time: '5 min',
      difficulty: 'Mixed'
    },
    {
      icon: '🎯',
      title: 'Focus Mode',
      description: 'Practice specific weak areas',
      questions: 10,
      time: '10 min',
      difficulty: 'Adaptive'
    },
    {
      icon: '🏃',
      title: 'Speed Round',
      description: 'Answer as many as you can in time',
      questions: '∞',
      time: '3 min',
      difficulty: 'Mixed'
    },
    {
      icon: '🧠',
      title: 'Brain Teaser',
      description: 'Challenging logic puzzles',
      questions: 3,
      time: '15 min',
      difficulty: 'Hard'
    }
  ];

  const mockTests = [
    {
      icon: '📚',
      title: 'NMMS Practice Test 1',
      description: 'Complete mock test covering all NMMS topics',
      questions: 90,
      time: 120,
      difficulty: 'medium',
      subjects: ['Math', 'Science', 'Social Science', 'Mental Ability']
    },
    {
      icon: '🔬',
      title: 'SAT Subject Test - Math',
      description: 'Mathematics Level 2 practice test',
      questions: 50,
      time: 60,
      difficulty: 'hard',
      subjects: ['Algebra', 'Geometry', 'Trigonometry', 'Statistics']
    },
    {
      icon: '📖',
      title: 'NMMS Mental Ability Test',
      description: 'Focus on reasoning and logical thinking',
      questions: 45,
      time: 45,
      difficulty: 'medium',
      subjects: ['Pattern Recognition', 'Logical Reasoning', 'Spatial Ability']
    },
    {
      icon: '🧮',
      title: 'SAT Math Practice',
      description: 'Calculator and no-calculator sections',
      questions: 58,
      time: 80,
      difficulty: 'hard',
      subjects: ['Algebra', 'Problem Solving', 'Advanced Math']
    },
    {
      icon: '🌍',
      title: 'General Knowledge Quiz',
      description: 'Current affairs and general awareness',
      questions: 30,
      time: 30,
      difficulty: 'easy',
      subjects: ['Current Affairs', 'History', 'Geography', 'Science']
    },
    {
      icon: '🔢',
      title: 'Quick Math Challenge',
      description: 'Speed math problems for competitive exams',
      questions: 25,
      time: 20,
      difficulty: 'medium',
      subjects: ['Arithmetic', 'Algebra', 'Geometry']
    }
  ];

  const skillsData = [
    { name: 'Algebra', level: 85, color: '#4CAF50', icon: '📊' },
    { name: 'Geometry', level: 72, color: '#2196F3', icon: '📐' },
    { name: 'Logic', level: 90, color: '#FF9800', icon: '🧩' },
    { name: 'Physics', level: 68, color: '#9C27B0', icon: '⚛️' },
    { name: 'Chemistry', level: 75, color: '#f44336', icon: '🧪' },
    { name: 'Biology', level: 82, color: '#4CAF50', icon: '🧬' },
    { name: 'History', level: 77, color: '#795548', icon: '🏛️' },
    { name: 'Geography', level: 80, color: '#607D8B', icon: '🌍' }
  ];

  // MAT Quiz Data - Based on Syllabus.jsx
  const matQuizzes = [
    {
      id: 1,
      title: 'सादृश्यता',
      description: 'शब्द, संख्या आणि आकृतीच्या सादृश्यता',
      questions: 20,
      duration: '15 मिनिटे',
      difficulty: 'Medium',
      topics: ['शब्द सादृश्यता', 'संख्या सादुश्यता', 'आकृति सादुश्यता', 'मिश्र नमुने', 'तुलनात्मक विचार'],
      icon: '🔗'
    },
    {
      id: 2,
      title: 'वर्गीकरण',
      description: 'बेजोड घटक ओळखा व वर्गीकरण करा',
      questions: 20,
      duration: '15 मिनिटे',
      difficulty: 'Easy',
      topics: ['शब्द वर्गीकरण', 'संख्या वर्गीकरण', 'आकृति वर्गीकरण', 'मिश्र गट', 'बेजोड शोधणे'],
      icon: '🎯'
    },
    {
      id: 3,
      title: 'संख्या आणि अक्षर श्रेणी',
      description: 'अनुक्रम नमुने पूर्ण करा व ओळखा',
      questions: 20,
      duration: '15 मिनिटे',
      difficulty: 'Medium',
      topics: ['संख्या श्रेणी', 'अक्षर श्रेणी', 'मिश्र श्रेणी', 'वाढती मालिका', 'चढ-उतार पद्धती'],
      icon: '🔢'
    },
    {
      id: 4,
      title: 'कोडिंग-डिकोडिंग',
      description: 'संकेतांचा उलगडा करा व नमुने शोधा',
      questions: 20,
      duration: '15 मिनिटे',
      difficulty: 'Medium',
      topics: ['अक्षर कोडिंग', 'संख्या कोडिंग', 'चिन्ह कोडिंग', 'मिश्र कोडिंग', 'संदेश डिकोडिंग'],
      icon: '🔐'
    },
    {
      id: 5,
      title: 'नमुना संज्ञान',
      description: 'नमुने ओळखा, पूर्ण करा व विश्लेषण करा',
      questions: 20,
      duration: '15 मिनिटे',
      difficulty: 'Hard',
      topics: ['दृष्य नमुने', 'संख्या नमुने', 'आकार नमुने', 'जटिल अनुक्रम', 'तार्किक नमुने'],
      icon: '👁️'
    },
    {
      id: 6,
      title: 'लपलेली आकृती',
      description: 'आकृत्या शोधा, ओळखा व विश्लेषण करा',
      questions: 20,
      duration: '15 मिनिटे',
      difficulty: 'Hard',
      topics: ['लपविलेली आकृती', 'आकार ओळख', 'दृष्य विश्लेषण', 'जटिल रचना', 'अवकाशीय तर्क'],
      icon: '🕵️'
    },
    {
      id: 7,
      title: 'रक्त नाते',
      description: 'नातेसंबंध समस्या सोडवा व विश्लेषण करा',
      questions: 20,
      duration: '15 मिनिटे',
      difficulty: 'Medium',
      topics: ['कौटुंबिक नाते', 'वंशावली', 'पिढीची समस्या', 'जटिल नाते', 'कौटुंबिक वृक्ष'],
      icon: '👨‍👩‍👧‍👦'
    },
    {
      id: 8,
      title: 'दिशा ज्ञान',
      description: 'दिशा, मार्ग शोधा व अंतर मोजा',
      questions: 20,
      duration: '15 मिनिटे',
      difficulty: 'Easy',
      topics: ['कंपास दिशा', 'अंतर मोजमाप', 'मार्ग शोधणे', 'चलन मागोवा', 'दिशा तर्कशक्ती'],
      icon: '🧭'
    },
    {
      id: 9,
      title: 'तार्किक आणि गणितीय कोडी',
      description: 'कोडी, समस्या सोडवा व तर्क करा',
      questions: 20,
      duration: '15 मिनिटे',
      difficulty: 'Hard',
      topics: ['तार्किक कोडी', 'गणितीय कोडी', 'समस्या सोडवणे', 'गंभीर चिंतन', 'विश्लेषणात्मक तर्क'],
      icon: '🧩'
    },
    {
      id: 10,
      title: 'अवकाशीय दृष्यीकरण',
      description: 'आरसा, 3D तर्क व दृष्यीकरण करा',
      questions: 20,
      duration: '15 मिनिटे',
      difficulty: 'Hard',
      topics: ['आरसा प्रतिबिंब', 'कागद दुमडणे', 'घन समस्या', '3D दृष्यीकरण', 'अवकाशीय तर्क'],
      icon: '🔄'
    }
  ];

  // Note: SAT chapter data is now loaded dynamically from Firestore
  // No need for hardcoded satScienceQuizzes, satHistoryQuizzes, satCivicsQuizzes, satGeographyQuizzes arrays

  const startQuiz = (quiz, examType, subCategory = null) => {
    // Navigate to PracticePage with quiz data
    navigate('/practice-quiz', {
      state: {
        quizData: {
          ...quiz,
          examType: examType,
          subCategory: subCategory
        }
      }
    });
  };

  // Handler for starting chapter-wise quiz
  const startChapterQuiz = (chapterId, chapterName, subject, questionCount = 20) => {
    navigate('/practice-quiz', {
      state: {
        quizData: {
          title: chapterName,
          subject: subject,
          chapter: chapterName,  // Pass chapter name for Firestore query
          chapterId: chapterId,  // Keep ID for reference
          questions: questionCount,
          duration: '15 मिनिटे',
          examType: 'SAT',
          isChapterWise: true
        }
      }
    });
  };

  // Handler for subject tab changes - load chapters for that subject
  const handleSubjectTabChange = async (subject) => {
    setLoadingChapters(true);
    try {
      const result = await getChaptersBySubject(subject);
      if (result.success) {
        setChapters(result.chapters);
      } else {
        setChapters([]);
        console.error('Failed to load chapters:', result.error);
      }
    } catch (error) {
      console.error('Error loading chapters:', error);
      setChapters([]);
    } finally {
      setLoadingChapters(false);
    }
  };

  const startQuickPractice = (practice) => {
    alert(`Starting ${practice.title}! This would navigate to the practice session.`);
  };

  const startTest = (test) => {
    alert(`Starting ${test.title}! This would navigate to the full test.`);
  };

  const previewTest = (test) => {
    alert(`Preview for ${test.title}: This would show sample questions and test format.`);
  };

  const startSkillAssessment = (skill) => {
    alert(`Starting ${skill.name} skill assessment! This would test your current level.`);
  };

  return (
    <>
      <MainNavbar />
      <div className="practice-page">
        
        {/* Section 1: Practice Dashboard */}
        <section className="practice-dashboard-section">
          <ParticleBackground />
          <div className="dashboard-header">
            <h1>🎯 Practice Dashboard</h1>
            <p>Track your progress, recent activity, and jump into practice!</p>
          </div>
          <div className="dashboard-content">
            
            <div className="dashboard-actions">
              <button 
                className="dashboard-btn primary" 
                onClick={() => navigate('/practice-quiz', { 
                  state: { 
                    quizData: {
                      title: 'Quick Practice Quiz',
                      questions: 20,
                      duration: '30 min',
                      difficulty: 'Mixed'
                    }
                  }
                })}
              >
                Start Quick Practice
              </button>
              <button 
                className="dashboard-btn secondary"
                onClick={() => navigate('/practice-logs')}
              >
                Practice Log
              </button>
            </div>
          </div>
        </section>

        {/* Section 2: MAT/SAT Quiz Container */}
        <section className="quiz-syllabus-section">
          <div className="syllabus-header">
            <h2>📚 Syllabus-Based Quizzes</h2>
            <p>Choose your exam type and practice with structured quiz sets</p>
          </div>

          {/* MAT/SAT Tabs */}
          <div className="syllabus-tabs">
            <button 
              className={`syllabus-tab ${syllabusTab === 'mat' ? 'active' : ''}`}
              onClick={() => setSyllabusTab('mat')}
            >
              <span className="tab-icon">🧠</span>
              <span className="tab-text">MAT (Mental Ability Test)</span>
            </button>
            <button 
              className={`syllabus-tab ${syllabusTab === 'sat' ? 'active' : ''}`}
              onClick={() => setSyllabusTab('sat')}
            >
              <span className="tab-icon">🎓</span>
              <span className="tab-text">SAT (Scholastic Assessment)</span>
            </button>
          </div>

          {/* Quiz Content */}
          <div className="quiz-content">
            {syllabusTab === 'mat' && (
              <div className="mat-quizzes">
                <div className="quiz-grid">
                  {matQuizzes.map((quiz) => (
                    <div key={quiz.id} className="quiz-card">
                      <div className="quiz-header">
                        <div className="quiz-info">
                          <h3 className="quiz-title">{quiz.title}</h3>
                          <p className="quiz-description">{quiz.description}</p>
                        </div>
                      </div>

                      <div className="quiz-stats">
                        <div className="quiz-stat">
                          <span className="stat-label">प्रश्न</span>
                          <span className="stat-value">{quiz.questions}</span>
                        </div>
                        <div className="quiz-stat">
                          <span className="stat-label">कालावधी</span>
                          <span className="stat-value">{quiz.duration}</span>
                        </div>
                      </div>

                      <div className="quiz-topics">
                        <h4>समाविष्ट विषय:</h4>
                        <div className="topics-list">
                          {quiz.topics.map((topic, index) => (
                            <span key={index} className="topic-tag">{topic}</span>
                          ))}
                        </div>
                      </div>

                      <div className="quiz-actions">
                        <button 
                          className="quiz-btn start-btn"
                          onClick={() => startQuiz(quiz, 'MAT')}
                        >
                          चाचणी सुरू करा
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {syllabusTab === 'sat' && (
              <div className="sat-quizzes">
                {/* SAT Sub-tabs */}
                <div className="sat-sub-tabs">
                  <button 
                    className={`sat-sub-tab ${satSubTab === 'math' ? 'active' : ''}`}
                    onClick={() => setSatSubTab('math')}
                  >
                    📊 Mathematics
                  </button>
                  <button 
                    className={`sat-sub-tab ${satSubTab === 'science' ? 'active' : ''}`}
                    onClick={() => setSatSubTab('science')}
                  >
                    🔬 Science
                  </button>
                  <button 
                    className={`sat-sub-tab ${satSubTab === 'social' ? 'active' : ''}`}
                    onClick={() => setSatSubTab('social')}
                  >
                    🌍 Social Science
                  </button>
                </div>

                {/* SAT Math Quizzes */}
                {satSubTab === 'math' && (
                  <div className="quiz-grid">
                    <div className="no-chapters-message">
                      <p>Mathematics questions are not available yet.</p>
                      <p style={{fontSize: '0.9rem', marginTop: '0.5rem', color: 'rgba(255,255,255,0.7)'}}>
                        Please select Science or Social Science from the tabs above.
                      </p>
                    </div>
                  </div>
                )}

                {/* SAT Science Quizzes */}
                {satSubTab === 'science' && (
                  <div className="quiz-grid">
                    {loadingChapters ? (
                      <div className="loading-message">Loading chapters...</div>
                    ) : chapters.length > 0 ? (
                      chapters.map((chapter) => (
                        <div key={chapter.id} className="quiz-card">
                          <div className="quiz-header">
                            <div className="quiz-info">
                              <h3 className="quiz-title">{chapter.name}</h3>
                              <p className="quiz-description">घटक {chapter.id}</p>
                            </div>
                          </div>

                          <div className="quiz-stats">
                            <div className="quiz-stat">
                              <span className="stat-label">Questions</span>
                              <span className="stat-value">20</span>
                            </div>
                            <div className="quiz-stat">
                              <span className="stat-label">Duration</span>
                              <span className="stat-value">15 मिनिटे</span>
                            </div>
                          </div>

                          <div className="quiz-actions">
                            <button 
                              className="quiz-btn start-btn"
                              onClick={() => startChapterQuiz(chapter.id, chapter.name, 'विज्ञान', 20)}
                            >
                              Start Quiz
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-chapters-message">
                        No chapters available. Please upload questions to the database.
                      </div>
                    )}
                  </div>
                )}

                {/* SAT Social Science Quizzes */}
                {satSubTab === 'social' && (
                  <div className="social-science-section">
                    {/* Social Science Sub-tabs */}
                    <div className="sat-sub-tabs">
                      <button 
                        className={`sat-sub-tab ${socialSubTab === 'history' ? 'active' : ''}`}
                        onClick={() => setSocialSubTab('history')}
                      >
                        🏛️ History
                      </button>
                      <button 
                        className={`sat-sub-tab ${socialSubTab === 'civics' ? 'active' : ''}`}
                        onClick={() => setSocialSubTab('civics')}
                      >
                        ⚖️ Civics
                      </button>
                      <button 
                        className={`sat-sub-tab ${socialSubTab === 'geography' ? 'active' : ''}`}
                        onClick={() => setSocialSubTab('geography')}
                      >
                        🌍 Geography
                      </button>
                    </div>

                    {/* History Quizzes */}
                    {socialSubTab === 'history' && (
                      <div className="quiz-grid">
                        {loadingChapters ? (
                          <div className="loading-message">Loading chapters...</div>
                        ) : chapters.length > 0 ? (
                          chapters.map((chapter) => (
                            <div key={chapter.id} className="quiz-card">
                              <div className="quiz-header">
                                <div className="quiz-info">
                                  <h3 className="quiz-title">{chapter.name}</h3>
                                  <p className="quiz-description">घटक {chapter.id}</p>
                                </div>
                              </div>

                              <div className="quiz-stats">
                                <div className="quiz-stat">
                                  <span className="stat-label">Questions</span>
                                  <span className="stat-value">20</span>
                                </div>
                                <div className="quiz-stat">
                                  <span className="stat-label">Duration</span>
                                  <span className="stat-value">15 मिनिटे</span>
                                </div>
                              </div>

                              <div className="quiz-actions">
                                <button 
                                  className="quiz-btn start-btn"
                                  onClick={() => startChapterQuiz(chapter.id, chapter.name, 'इतिहास', 20)}
                                >
                                  Start Quiz
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="no-chapters-message">
                            No chapters available. Please upload questions to the database.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Civics Quizzes */}
                    {socialSubTab === 'civics' && (
                      <div className="quiz-grid">
                        {loadingChapters ? (
                          <div className="loading-message">Loading chapters...</div>
                        ) : chapters.length > 0 ? (
                          chapters.map((chapter) => (
                            <div key={chapter.id} className="quiz-card">
                              <div className="quiz-header">
                                <div className="quiz-info">
                                  <h3 className="quiz-title">{chapter.name}</h3>
                                  <p className="quiz-description">घटक {chapter.id}</p>
                                </div>
                              </div>

                              <div className="quiz-stats">
                                <div className="quiz-stat">
                                  <span className="stat-label">Questions</span>
                                  <span className="stat-value">20</span>
                                </div>
                                <div className="quiz-stat">
                                  <span className="stat-label">Duration</span>
                                  <span className="stat-value">15 मिनिटे</span>
                                </div>
                              </div>

                              <div className="quiz-actions">
                                <button 
                                  className="quiz-btn start-btn"
                                  onClick={() => startChapterQuiz(chapter.id, chapter.name, 'नागरिकशास्त्र', 20)}
                                >
                                  Start Quiz
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="no-chapters-message">
                            No chapters available. Please upload questions to the database.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Geography Quizzes */}
                    {socialSubTab === 'geography' && (
                      <div className="quiz-grid">
                        {loadingChapters ? (
                          <div className="loading-message">Loading chapters...</div>
                        ) : chapters.length > 0 ? (
                          chapters.map((chapter) => (
                            <div key={chapter.id} className="quiz-card">
                              <div className="quiz-header">
                                <div className="quiz-info">
                                  <h3 className="quiz-title">{chapter.name}</h3>
                                  <p className="quiz-description">घटक {chapter.id}</p>
                                </div>
                              </div>

                              <div className="quiz-stats">
                                <div className="quiz-stat">
                                  <span className="stat-label">Questions</span>
                                  <span className="stat-value">20</span>
                                </div>
                                <div className="quiz-stat">
                                  <span className="stat-label">Duration</span>
                                  <span className="stat-value">15 मिनिटे</span>
                                </div>
                              </div>

                              <div className="quiz-actions">
                                <button 
                                  className="quiz-btn start-btn"
                                  onClick={() => startChapterQuiz(chapter.id, chapter.name, 'भूगोल', 20)}
                                >
                                  Start Quiz
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="no-chapters-message">
                            No chapters available. Please upload questions to the database.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Section 3 will be added next */}
      </div>
      <Footer />
    </>
  );
};

export default Practice;