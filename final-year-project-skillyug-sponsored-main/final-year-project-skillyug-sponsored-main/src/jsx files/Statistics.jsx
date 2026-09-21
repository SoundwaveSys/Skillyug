import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserStatistics, getUserRank, fetchGlobalLeaderboard, checkAndAwardBadges } from '../firebase/firestore';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  RadialLinearScale,
  ArcElement
} from 'chart.js';
import { Line, Bar, PolarArea, Doughnut, Scatter } from 'react-chartjs-2';
import '../css files/Statistics.css';
import MainNavbar from '../components/MainNavbar';
import Footer from '../components/Footer';
import ParticleBackground from '../components/StarBg';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  ArcElement
);

const Statistics = () => {
  const { user, loading: authLoading } = useAuth();
  // We use `user` because AuthContext exports `user`, not `currentUser`
  const currentUser = user;
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [rankData, setRankData] = useState(null);
  const [badges, setBadges] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Badge definitions
  const BADGE_DEFINITIONS = {
    daily_quiz_50: { name: 'Quiz Master', icon: '🎯', desc: 'Complete 50 daily quizzes', color: '#3b82f6' },
    exam_10: { name: 'Exam Pro', icon: '📝', desc: 'Complete 10 exams', color: '#10b981' },
    perfect_10: { name: 'Perfectionist', icon: '💯', desc: 'Get perfect score 10 times', color: '#f59e0b' },
    streak_7: { name: 'Week Warrior', icon: '🔥', desc: '7-day streak', color: '#ef4444' },
    streak_30: { name: 'Monthly Master', icon: '⭐', desc: '30-day streak', color: '#8b5cf6' },
    xp_1000: { name: 'XP Hunter', icon: '⚡', desc: 'Earn 1000 XP', color: '#ec4899' },
    xp_5000: { name: 'XP Legend', icon: '👑', desc: 'Earn 5000 XP', color: '#fbbf24' },
    quest_10: { name: 'Quest Seeker', icon: '🗺️', desc: 'Complete 10 quests', color: '#14b8a6' },
    quest_40: { name: 'Quest Champion', icon: '🏆', desc: 'Complete all 40 quests', color: '#f97316' },
    practice_100: { name: 'Practice Guru', icon: '📚', desc: 'Complete 100 practice sessions', color: '#06b6d4' }
  };

  useEffect(() => {
    if (currentUser) {
      loadStatistics();
    } else if (!authLoading) {
      // If no user is logged in and auth finished loading, load local stats
      loadLocalStats();
      setLoading(false);
    }
  }, [currentUser, authLoading]);

  const loadLocalStats = () => {
    console.log('Loading local storage stats for unauthenticated user');
    const localExamHistory = JSON.parse(localStorage.getItem('examHistory') || '[]');
    const parsedExams = localExamHistory.map(log => ({
      ...log,
      timestamp: { toMillis: () => new Date(log.date).getTime(), toDate: () => new Date(log.date) }
    }));
    
    const localPracticeHistory = JSON.parse(localStorage.getItem('practiceLogs') || '[]');
    const parsedPractice = localPracticeHistory.map(log => ({
      ...log,
      percentage: log.score && log.totalQuestions ? ((log.score / log.totalQuestions) * 100).toFixed(1) : 0,
      timestamp: { toMillis: () => new Date(log.date).getTime(), toDate: () => new Date(log.date) }
    }));

    setStats({
      success: true,
      examHistory: parsedExams,
      practiceHistory: parsedPractice,
      dailyQuizHistory: [],
      userData: {
        streak: parseInt(localStorage.getItem('userStreak') || '0'),
        totalXP: parseInt(localStorage.getItem('totalXP') || '0'),
      }
    });
  };

  const loadStatistics = async () => {
    try {
      setLoading(true);
      
      console.log('Loading statistics for user:', currentUser.uid);
      
      // Fetch user statistics and ranking
      const [statsResult, rankResult] = await Promise.all([
        fetchUserStatistics(currentUser.uid),
        getUserRank(currentUser.uid)
      ]);
      
      console.log('Stats result:', statsResult);
      console.log('Rank result:', rankResult);
      
      if (statsResult.success && statsResult.examHistory) {
        setStats(statsResult);
        
        // Check for new badges
        const badgeResult = await checkAndAwardBadges(currentUser.uid, statsResult);
        if (badgeResult.success && badgeResult.newBadges.length > 0) {
          console.log('New badges unlocked:', badgeResult.newBadges);
        }
        
        // Set user badges
        const userBadges = statsResult.userData?.badges || [];
        setBadges(userBadges);
      } else {
        // Fallback to local storage
        console.log('Falling back to local storage stats');
        const localExamHistory = JSON.parse(localStorage.getItem('examHistory') || '[]');
        // Need to parse local storage times safely
        const parsedExams = localExamHistory.map(log => ({
          ...log,
          timestamp: { toMillis: () => new Date(log.date).getTime(), toDate: () => new Date(log.date) }
        }));
        
        const localPracticeHistory = JSON.parse(localStorage.getItem('practiceLogs') || '[]');
        const parsedPractice = localPracticeHistory.map(log => ({
          ...log,
          percentage: log.score && log.totalQuestions ? ((log.score / log.totalQuestions) * 100).toFixed(1) : 0,
          timestamp: { toMillis: () => new Date(log.date).getTime(), toDate: () => new Date(log.date) }
        }));

        setStats({
          success: true,
          examHistory: parsedExams,
          practiceHistory: parsedPractice,
          dailyQuizHistory: [],
          userData: {
            streak: parseInt(localStorage.getItem('userStreak') || '0'),
            totalXP: parseInt(localStorage.getItem('totalXP') || '0'),
          }
        });
      }
      
      if (rankResult.success) {
        setRankData(rankResult);
      } else {
        console.error('Failed to fetch rank:', rankResult.error);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics from real data
  const calculateAnalytics = () => {
    if (!stats) {
      console.log('No stats available for analytics calculation');
      // Return default empty analytics for new users
      return {
        totalExams: 0,
        totalPractice: 0,
        totalDailyQuiz: 0,
        avgExamScore: 0,
        avgPracticeScore: 0,
        studyHours: 0,
        totalTests: 0,
        currentStreak: 0,
        totalXP: 0,
        questProgress: 0,
        subjectPerformance: [],
        weeklyProgress: [],
        perfectScores: 0,
        recentTests: []
      };
    }

    const { examHistory = [], practiceHistory = [], dailyQuizHistory = [], userData = {} } = stats;
    
    console.log('Calculating analytics:', {
      examHistory: examHistory?.length || 0,
      practiceHistory: practiceHistory?.length || 0,
      dailyQuizHistory: dailyQuizHistory?.length || 0
    });
    
    // Total tests and practice
    const totalExams = examHistory.length;
    const totalPractice = practiceHistory.length;
    const totalDailyQuiz = dailyQuizHistory.length;
    
    // Calculate average scores
    const examScores = examHistory.map(e => parseFloat(e.percentage) || 0);
    const practiceScores = practiceHistory.map(p => parseFloat(p.percentage) || 0);
    
    const avgExamScore = examScores.length > 0 
      ? (examScores.reduce((a, b) => a + b, 0) / examScores.length).toFixed(1) 
      : 0;
    
    const avgPracticeScore = practiceScores.length > 0 
      ? (practiceScores.reduce((a, b) => a + b, 0) / practiceScores.length).toFixed(1) 
      : 0;
    
    // Calculate total study hours (from time spent in exams and practice)
    const examMinutes = examHistory.reduce((total, exam) => total + (exam.timeSpent || 0), 0);
    const practiceMinutes = practiceHistory.reduce((total, p) => total + (p.timeSpent || 0), 0);
    const totalMinutes = examMinutes + practiceMinutes;
    const studyHours = (totalMinutes / 60).toFixed(1);
    
    // Subject-wise performance
    const subjectStats = {};
    
    [...examHistory, ...practiceHistory].forEach(item => {
      const subject = item.subject || item.examType || 'General';
      if (!subjectStats[subject]) {
        subjectStats[subject] = { scores: [], count: 0 };
      }
      subjectStats[subject].scores.push(parseFloat(item.percentage) || 0);
      subjectStats[subject].count++;
    });
    
    const subjectPerformance = Object.entries(subjectStats).map(([subject, data]) => ({
      subject,
      avgScore: (data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(1),
      tests: data.count,
      improvement: calculateImprovement(data.scores)
    }));
    
    // Recent performance trend (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentTests = [...examHistory, ...practiceHistory]
      .filter(item => item.timestamp?.toMillis() > thirtyDaysAgo)
      .sort((a, b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0));
    
    const weeklyProgress = groupByWeek(recentTests);
    
    // Perfect scores count
    const perfectScores = examHistory.filter(e => parseFloat(e.percentage) >= 100).length;
    
    // Score Distribution
    const scoreDistribution = {
      excellent: 0, // >= 90
      veryGood: 0,  // 75-89
      good: 0,      // 60-74
      average: 0,   // 40-59
      needsImprovement: 0 // < 40
    };

    [...examHistory, ...practiceHistory].forEach(item => {
      const score = parseFloat(item.percentage) || 0;
      if (score >= 90) scoreDistribution.excellent++;
      else if (score >= 75) scoreDistribution.veryGood++;
      else if (score >= 60) scoreDistribution.good++;
      else if (score >= 40) scoreDistribution.average++;
      else scoreDistribution.needsImprovement++;
    });

    // Scatter Plot Data (Time Spent vs Score)
    const timeVsScore = [...examHistory, ...practiceHistory]
      .filter(item => item.timeSpent && item.percentage)
      .map(item => ({
        x: Math.round(item.timeSpent / 60), // Time in minutes
        y: parseFloat(item.percentage)
      }));
    
    return {
      totalExams,
      totalPractice,
      totalDailyQuiz,
      avgExamScore,
      avgPracticeScore,
      studyHours,
      totalTests: totalExams + totalPractice,
      currentStreak: userData.streak || 0,
      totalXP: userData.totalXP || 0,
      questProgress: userData.questProgress || 0,
      subjectPerformance,
      weeklyProgress,
      perfectScores,
      scoreDistribution,
      timeVsScore,
      recentTests: [...examHistory, ...practiceHistory]
        .sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0))
        .slice(0, 10)
    };
  };

  const calculateImprovement = (scores) => {
    if (scores.length < 2) return 0;
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    return (secondAvg - firstAvg).toFixed(1);
  };

  const groupByWeek = (tests) => {
    const weeks = {};
    tests.forEach(test => {
      const date = test.timestamp?.toDate();
      if (!date) return;
      
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = { tests: [], scores: [] };
      }
      weeks[weekKey].tests.push(test);
      weeks[weekKey].scores.push(parseFloat(test.percentage) || 0);
    });
    
    return Object.entries(weeks).map(([week, data]) => ({
      week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      tests: data.tests.length,
      avgScore: (data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(1)
    }));
  };

  const analytics = calculateAnalytics();

  if (authLoading || loading) {
    return (
      <div className="stats-container">
        <ParticleBackground />
        <MainNavbar />
        <div className="stats-content">
          <div className="loading-message">Loading your statistics...</div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show stats even if empty (first time users)
  if (!stats) {
    return (
      <div className="stats-container">
        <ParticleBackground />
        <MainNavbar />
        <div className="stats-content">
          <div className="error-message">
            No statistics available yet. Start taking quizzes and exams to see your progress!
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="stats-container">
      <ParticleBackground />
      <MainNavbar />
      
      <div className="stats-content">
        {/* Header */}
        <div className="stats-header">
          <div className="stats-header-left">
            <h1 className="stats-title">Your Statistics</h1>
            <p className="stats-subtitle">Track your progress and performance</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="stats-tabs">
          <button 
            className={`stats-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`stats-tab ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            📈 Performance
          </button>
          <button 
            className={`stats-tab ${activeTab === 'badges' ? 'active' : ''}`}
            onClick={() => setActiveTab('badges')}
          >
            🏆 Badges
          </button>
        </div>

        {/* Charts & Graphs Setup */}
        {activeTab === 'performance' && (
          <div className="stats-tab-content performance-tab">
            <div className="charts-grid">
              
              {/* Line Chart for Weekly Progress */}
              <div className="chart-card">
                <h3>Weekly Trend</h3>
                {analytics.weeklyProgress.length > 0 ? (
                  <div className="chart-wrapper">
                    <Line 
                      data={{
                        labels: analytics.weeklyProgress.map(w => w.week),
                        datasets: [
                          {
                            label: 'Average Score (%)',
                            data: analytics.weeklyProgress.map(w => w.avgScore),
                            borderColor: '#8b5cf6',
                            backgroundColor: 'rgba(139, 92, 246, 0.2)',
                            tension: 0.4,
                            fill: true,
                          }
                        ]
                      }} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom', labels: { color: '#fff' } }
                        },
                        scales: {
                          y: { min: 0, max: 100, ticks: { color: '#bbb' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                          x: { ticks: { color: '#bbb' }, grid: { color: 'rgba(255,255,255,0.1)' } }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <p className="no-data-msg">Not enough weekly data yet.</p>
                )}
              </div>

              {/* Bar Chart for Subject Performance */}
              <div className="chart-card">
                <h3>Performance by Subject</h3>
                {analytics.subjectPerformance.length > 0 ? (
                  <div className="chart-wrapper">
                    <Bar 
                      data={{
                        labels: analytics.subjectPerformance.map(s => s.subject),
                        datasets: [
                          {
                            label: 'Average Score (%)',
                            data: analytics.subjectPerformance.map(s => s.avgScore),
                            backgroundColor: '#10b981',
                            borderRadius: 6
                          }
                        ]
                      }} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom', labels: { color: '#fff' } }
                        },
                        scales: {
                          y: { min: 0, max: 100, ticks: { color: '#bbb' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                          x: { ticks: { color: '#bbb' }, grid: { display: false } }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <p className="no-data-msg">Take some tests to see your subject breakdown.</p>
                )}
              </div>

              {/* Polar Area Chart for Activity Breakdown */}
              <div className="chart-card">
                <h3>Activity Breakdown</h3>
                <div className="chart-wrapper">
                  <PolarArea 
                    data={{
                      labels: ['Exams', 'Practice', 'Daily Quizzes'],
                      datasets: [
                        {
                          data: [
                            analytics.totalExams, 
                            analytics.totalPractice, 
                            analytics.totalDailyQuiz
                          ],
                          backgroundColor: [
                            'rgba(239, 68, 68, 0.6)',
                            'rgba(16, 185, 129, 0.6)',
                            'rgba(59, 130, 246, 0.6)'
                          ],
                          borderWidth: 1,
                          borderColor: 'rgba(255,255,255,0.2)'
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { color: '#fff' } }
                      },
                      scales: {
                        r: { ticks: { display: false }, grid: { color: 'rgba(255,255,255,0.1)' } }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Score Distribution Doughnut Chart */}
              <div className="chart-card">
                <h3>Score Distribution</h3>
                <div className="chart-wrapper">
                  <Doughnut 
                    data={{
                      labels: ['Excellent (90%+)', 'Very Good (75-89%)', 'Good (60-74%)', 'Average (40-59%)', 'Needs Improvement (<40%)'],
                      datasets: [
                        {
                          data: [
                            analytics.scoreDistribution?.excellent || 0,
                            analytics.scoreDistribution?.veryGood || 0,
                            analytics.scoreDistribution?.good || 0,
                            analytics.scoreDistribution?.average || 0,
                            analytics.scoreDistribution?.needsImprovement || 0,
                          ],
                          backgroundColor: [
                            '#10b981', // green
                            '#3b82f6', // blue
                            '#f59e0b', // yellow
                            '#f97316', // orange
                            '#ef4444'  // red
                          ],
                          borderWidth: 1,
                          borderColor: '#1a103c'
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { color: '#fff', font: { size: 11 } } }
                      },
                      cutout: '65%'
                    }}
                  />
                </div>
              </div>

              {/* Time Spent vs Score Scatter Plot */}
              <div className="chart-card activity-breakdown">
                <h3>Time Spent vs. Score Correlation</h3>
                {analytics.timeVsScore?.length > 0 ? (
                  <div className="chart-wrapper">
                    <Scatter 
                      data={{
                        datasets: [
                          {
                            label: 'Tests Taken',
                            data: analytics.timeVsScore,
                            backgroundColor: '#ec4899',
                            pointRadius: 6,
                            pointHoverRadius: 8
                          }
                        ]
                      }} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            callbacks: {
                              label: (ctx) => `Time: ${ctx.raw.x} mins, Score: ${ctx.raw.y}%`
                            }
                          }
                        },
                        scales: {
                          y: { 
                            min: 0, 
                            max: 100, 
                            title: { display: true, text: 'Score (%)', color: '#fff' },
                            ticks: { color: '#bbb' }, 
                            grid: { color: 'rgba(255,255,255,0.1)' } 
                          },
                          x: { 
                            title: { display: true, text: 'Duration (Minutes)', color: '#fff' },
                            ticks: { color: '#bbb' }, 
                            grid: { color: 'rgba(255,255,255,0.1)' } 
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <p className="no-data-msg">Complete a test with a timer to see correlation data.</p>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="stats-tab-content">
            {/* Quick Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📝</div>
                <div className="stat-value">{analytics.totalExams}</div>
                <div className="stat-label">Exams Taken</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">✏️</div>
                <div className="stat-value">{analytics.totalPractice}</div>
                <div className="stat-label">Practice Sessions</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-value">{analytics.totalDailyQuiz}</div>
                <div className="stat-label">Daily Quizzes</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">⏱️</div>
                <div className="stat-value">{analytics.studyHours}h</div>
                <div className="stat-label">Study Hours</div>
              </div>
              
              <div className="stat-card highlight">
                <div className="stat-icon">🔥</div>
                <div className="stat-value">{analytics.currentStreak}</div>
                <div className="stat-label">Day Streak</div>
              </div>
              
              <div className="stat-card highlight">
                <div className="stat-icon">⚡</div>
                <div className="stat-value">{analytics.totalXP}</div>
                <div className="stat-label">Total XP</div>
              </div>
              
              {rankData && (
                <>
                  <div className="stat-card special">
                    <div className="stat-icon">🏅</div>
                    <div className="stat-value">#{rankData.rank}</div>
                    <div className="stat-label">Global Rank</div>
                  </div>
                  
                  <div className="stat-card special">
                    <div className="stat-icon">📊</div>
                    <div className="stat-value">{rankData.percentile}%</div>
                    <div className="stat-label">Top Percentile</div>
                  </div>
                </>
              )}
            </div>

            {/* Average Scores */}
            <div className="stats-section">
              <h2 className="section-title">Average Performance</h2>
              <div className="score-cards">
                <div className="score-card">
                  <div className="score-header">
                    <span className="score-label">Exam Average</span>
                    <span className="score-value">{analytics.avgExamScore}%</span>
                  </div>
                  <div className="score-bar">
                    <div 
                      className="score-fill exam"
                      style={{ width: `${analytics.avgExamScore}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="score-card">
                  <div className="score-header">
                    <span className="score-label">Practice Average</span>
                    <span className="score-value">{analytics.avgPracticeScore}%</span>
                  </div>
                  <div className="score-bar">
                    <div 
                      className="score-fill practice"
                      style={{ width: `${analytics.avgPracticeScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Tests */}
            <div className="stats-section">
              <h2 className="section-title">Recent Tests</h2>
              <div className="recent-tests">
                {analytics.recentTests.length > 0 ? (
                  analytics.recentTests.map((test, index) => (
                    <div key={index} className="test-item">
                      <div className="test-info">
                        <div className="test-name">
                          {test.examType || test.subject || 'Test'}
                        </div>
                        <div className="test-date">
                          {test.timestamp?.toDate().toLocaleDateString()}
                        </div>
                      </div>
                      <div className="test-score">
                        <span className={`score ${parseFloat(test.percentage) >= 75 ? 'good' : parseFloat(test.percentage) >= 50 ? 'average' : 'poor'}`}>
                          {parseFloat(test.percentage).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No tests taken yet. Start practicing to see your progress!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="stats-tab-content">
            {/* Subject Performance */}
            <div className="stats-section">
              <h2 className="section-title">Subject-wise Performance</h2>
              <div className="subject-performance">
                {analytics.subjectPerformance.length > 0 ? (
                  analytics.subjectPerformance.map((subject, index) => (
                    <div key={index} className="subject-card">
                      <div className="subject-header">
                        <h3 className="subject-name">{subject.subject}</h3>
                        <span className="subject-score">{subject.avgScore}%</span>
                      </div>
                      <div className="subject-stats">
                        <span className="subject-tests">{subject.tests} tests</span>
                        <span className={`subject-improvement ${parseFloat(subject.improvement) >= 0 ? 'positive' : 'negative'}`}>
                          {parseFloat(subject.improvement) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(subject.improvement))}%
                        </span>
                      </div>
                      <div className="subject-bar">
                        <div 
                          className="subject-fill"
                          style={{ 
                            width: `${subject.avgScore}%`,
                            backgroundColor: `hsl(${subject.avgScore * 1.2}, 70%, 50%)`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No subject data available yet.</p>
                )}
              </div>
            </div>

            {/* Weekly Progress */}
            {analytics.weeklyProgress.length > 0 && (
              <div className="stats-section">
                <h2 className="section-title">Weekly Progress (Last 30 Days)</h2>
                <div className="weekly-chart">
                  {analytics.weeklyProgress.map((week, index) => (
                    <div key={index} className="week-bar">
                      <div 
                        className="bar-fill"
                        style={{ height: `${week.avgScore}%` }}
                        title={`${week.avgScore}% avg`}
                      ></div>
                      <div className="bar-label">{week.week}</div>
                      <div className="bar-count">{week.tests} tests</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Achievements */}
            <div className="stats-section">
              <h2 className="section-title">Key Achievements</h2>
              <div className="achievements-grid">
                <div className="achievement-card">
                  <div className="achievement-icon">💯</div>
                  <div className="achievement-value">{analytics.perfectScores}</div>
                  <div className="achievement-label">Perfect Scores</div>
                </div>
                
                <div className="achievement-card">
                  <div className="achievement-icon">🗺️</div>
                  <div className="achievement-value">{analytics.questProgress}/40</div>
                  <div className="achievement-label">Quests Completed</div>
                </div>
                
                <div className="achievement-card">
                  <div className="achievement-icon">📚</div>
                  <div className="achievement-value">{analytics.totalTests}</div>
                  <div className="achievement-label">Total Tests</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="stats-tab-content">
            <div className="stats-section">
              <h2 className="section-title">Your Badges ({badges.length}/{Object.keys(BADGE_DEFINITIONS).length})</h2>
              <p className="section-subtitle">Unlock badges by completing achievements</p>
              
              <div className="badges-grid">
                {Object.entries(BADGE_DEFINITIONS).map(([badgeId, badge]) => {
                  const isUnlocked = badges.includes(badgeId);
                  return (
                    <div 
                      key={badgeId} 
                      className={`badge-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                      style={{ borderColor: isUnlocked ? badge.color : '#333' }}
                    >
                      <div 
                        className="badge-icon"
                        style={{ 
                          backgroundColor: isUnlocked ? badge.color : '#1a1a2e',
                          opacity: isUnlocked ? 1 : 0.3
                        }}
                      >
                        {badge.icon}
                      </div>
                      <div className="badge-info">
                        <h3 className="badge-name">{badge.name}</h3>
                        <p className="badge-desc">{badge.desc}</p>
                        {isUnlocked && <span className="badge-status">✓ Unlocked</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Badge Progress Hints */}
            <div className="stats-section">
              <h2 className="section-title">Progress to Next Badges</h2>
              <div className="badge-progress-list">
                {Object.entries(BADGE_DEFINITIONS)
                  .filter(([badgeId]) => !badges.includes(badgeId))
                  .slice(0, 5)
                  .map(([badgeId, badge]) => {
                    let progress = 0;
                    let total = 100;
                    let progressText = '';
                    
                    // Calculate progress based on badge type
                    if (badgeId === 'daily_quiz_50') {
                      progress = analytics.totalDailyQuiz;
                      total = 50;
                      progressText = `${progress}/50 daily quizzes`;
                    } else if (badgeId === 'exam_10') {
                      progress = analytics.totalExams;
                      total = 10;
                      progressText = `${progress}/10 exams`;
                    } else if (badgeId === 'perfect_10') {
                      progress = analytics.perfectScores;
                      total = 10;
                      progressText = `${progress}/10 perfect scores`;
                    } else if (badgeId === 'streak_7') {
                      progress = analytics.currentStreak;
                      total = 7;
                      progressText = `${progress}/7 days streak`;
                    } else if (badgeId === 'streak_30') {
                      progress = analytics.currentStreak;
                      total = 30;
                      progressText = `${progress}/30 days streak`;
                    } else if (badgeId === 'xp_1000') {
                      progress = analytics.totalXP;
                      total = 1000;
                      progressText = `${progress}/1000 XP`;
                    } else if (badgeId === 'xp_5000') {
                      progress = analytics.totalXP;
                      total = 5000;
                      progressText = `${progress}/5000 XP`;
                    } else if (badgeId === 'quest_10') {
                      progress = analytics.questProgress;
                      total = 10;
                      progressText = `${progress}/10 quests`;
                    } else if (badgeId === 'quest_40') {
                      progress = analytics.questProgress;
                      total = 40;
                      progressText = `${progress}/40 quests`;
                    } else if (badgeId === 'practice_100') {
                      progress = analytics.totalPractice;
                      total = 100;
                      progressText = `${progress}/100 practice sessions`;
                    }
                    
                    const percentage = Math.min((progress / total) * 100, 100);
                    
                    return (
                      <div key={badgeId} className="badge-progress-item">
                        <div className="badge-progress-header">
                          <span className="badge-progress-icon">{badge.icon}</span>
                          <div className="badge-progress-info">
                            <span className="badge-progress-name">{badge.name}</span>
                            <span className="badge-progress-text">{progressText}</span>
                          </div>
                        </div>
                        <div className="badge-progress-bar">
                          <div 
                            className="badge-progress-fill"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: badge.color
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Statistics;
