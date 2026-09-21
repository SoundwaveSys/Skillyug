import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css files/Pricing.css";
import ParticleBackground from "../components/StarBg";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const features = [
  "Interactive games for fun learning",
  "Personalized analytics to track progress",
  "Adaptive content for every skill level",
  "Safe, child-friendly environment"
];

const Pricing = () => {
  const navigate = useNavigate();
  const [showQRModal, setShowQRModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    let timer;
    if (showQRModal && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showQRModal, timeLeft]);

  useEffect(() => {
    if (showQRModal) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [showQRModal]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProceedToPayment = () => {
    setTimeLeft(300);
    setShowQRModal(true);
  };

  const handleCloseModal = () => {
    setShowQRModal(false);
    // Simulate payment verification - navigate to create account
    navigate("/create-account");
  };

  const handleGenerateNewCode = () => {
    setTimeLeft(300);
  };

  return (
    <>
      <Navbar />
      <div className="price-pricing-page">
        <ParticleBackground />
        <div className="price-pricing-title">
          <h1><img src="/assets/PrepMark.png" alt="PrepMark Logo" className="price-prepmark-logo2" />Pricing Plans</h1>
        </div>
        <div className="price-pricing-containers">
          <div className="price-pricing-container-3">
        <div className="price-pricing-container-3-top"><h1>Payment Plan</h1></div>
          <div className="price-pricing-container-3-bottom">
            <div className="price-payment-plan-card">
              <div className="price-payment-price">₹100</div>
              <div className="price-payment-methods-label">Payment Modes Accepted</div>
              <div className="price-payment-methods">
                <div className="price-payment-method-logo" title="Google Pay">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="Google Pay" />
                </div>
                <div className="price-payment-method-logo" title="PhonePe">
                  <img src="/assets/phonepelogo.jpg" alt="PhonePe" />
                </div>
                <div className="price-payment-method-logo" title="BHIM UPI">
                  <img src="/assets/bhimpaylogo.png" alt="BHIM" />
                </div>
                <div className="price-payment-method-logo" title="UPI">
                  <img src="/assets/paytmlogo.png" alt="Paytm" />
                </div>
              </div>
              <button className="price-payment-button" onClick={handleProceedToPayment}>Proceed to Payment</button>
            </div>
          </div>
      </div>
          <div className="price-pricing-container-1">
            <div className="price-pricing-container-1-top"><h1>What do Students Get?</h1></div>
            <div className="price-pricing-container-1-bottom">
              <div className="price-pricing-container-1-bottom-1">
                <div className="price-pricing-container-1-bottom-1-1">
                  <div className="price-student-cell">
                    <div className="price-student-summary">
                      <div className="price-student-cell-top" aria-hidden="true">📝</div>
                      <div className="price-student-cell-bottom">Exam Mock Runs</div>
                    </div>
                    <div className="price-student-details">
                      <div className="price-details-icon">📝</div>
                      <h2>Exam Mock Runs</h2>
                      <p>Simulate real exam conditions to build confidence and familiarity with test formats.</p>
                      <ul>
                        <li>Full-length practice exams</li>
                        <li>Realistic exam environment</li>
                        <li>Comprehensive score reports</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="price-pricing-container-1-bottom-1-2">
                  <div className="price-student-cell">
                    <div className="price-student-summary">
                      <div className="price-student-cell-top" aria-hidden="true">✍️</div>
                      <div className="price-student-cell-bottom">Practice Tests</div>
                    </div>
                    <div className="price-student-details">
                      <div className="price-details-icon">✍️</div>
                      <h2>Practice Tests</h2>
                      <p>Sharpen your skills with unlimited practice tests designed to reinforce learning.</p>
                      <ul>
                        <li>Topic-wise practice sets</li>
                        <li>Instant answer verification</li>
                        <li>Detailed solutions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="price-pricing-container-1-bottom-2">
                <div className="price-pricing-container-1-bottom-2-1">
                  <div className="price-student-cell">
                    <div className="price-student-summary">
                      <div className="price-student-cell-top" aria-hidden="true">⏱️</div>
                      <div className="price-student-cell-bottom">Time Management</div>
                    </div>
                    <div className="price-student-details">
                      <div className="price-details-icon">⏱️</div>
                      <h2>Time Management</h2>
                      <p>Master exam pacing with timed tests that teach you to answer efficiently and accurately.</p>
                      <ul>
                        <li>Timed practice sessions</li>
                        <li>Speed tracking analytics</li>
                        <li>Pacing recommendations</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="price-pricing-container-1-bottom-2-2">
                  <div className="price-student-cell">
                    <div className="price-student-summary">
                      <div className="price-student-cell-top" aria-hidden="true">💡</div>
                      <div className="price-student-cell-bottom">Feedback & Growth</div>
                    </div>
                    <div className="price-student-details">
                      <div className="price-details-icon">💡</div>
                      <h2>Continuous Improvement</h2>
                      <p>Get personalized insights and recommendations to continuously enhance your performance.</p>
                      <ul>
                        <li>Instant performance feedback</li>
                        <li>Personalized improvement tips</li>
                        <li>Progress tracking metrics</li>
                      </ul>
                    </div>
                  </div>
                </div>
            </div>
            <div className="price-pricing-container-1-bottom-3">
                <div className="price-pricing-container-1-bottom-3-1">
                  <div className="price-student-cell">
                    <div className="price-student-summary">
                      <div className="price-student-cell-top" aria-hidden="true">🏆</div>
                      <div className="price-student-cell-bottom">Badges & Tiers</div>
                    </div>
                    <div className="price-student-details">
                      <div className="price-details-icon">🏆</div>
                      <h2>Badges & Tiers</h2>
                      <p>Earn rewards and unlock new levels as you progress, making learning exciting and engaging.</p>
                      <ul>
                        <li>Achievement badges</li>
                        <li>Tier progression system</li>
                        <li>Milestone celebrations</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="price-pricing-container-1-bottom-3-2">
                  <div className="price-student-cell">
                    <div className="price-student-summary">
                      <div className="price-student-cell-top" aria-hidden="true">🎯</div>
                      <div className="price-student-cell-bottom">Targeted Quizzes</div>
                    </div>
                    <div className="price-student-details">
                      <div className="price-details-icon">🎯</div>
                      <h2>Selective Practice </h2>
                      <p>Focus on specific topics and concepts with targeted quizzes for efficient, personalized learning.</p>
                      <ul>
                        <li>Concept-specific quizzes</li>
                        <li>Adaptive difficulty levels</li>
                        <li>Custom practice sessions</li>
                      </ul>
                    </div>
                  </div>
                </div>
            </div>
          </div>
      </div>
       <div className="price-pricing-container-2">
        <div className="price-pricing-container-2-top"><h1>What do Guardians Get?</h1></div>
          <div className="price-pricing-container-2-bottom">
            <div className="price-pricing-container-2-bottom-1">
                <div className="price-pricing-container-2-bottom-1-1">
                  <div className="price-guardian-cell">
                    <div className="price-guardian-summary">
                      <div className="price-guardian-cell-top" aria-hidden="true">👥</div>
                      <div className="price-guardian-cell-bottom">Stay Involved</div>
                    </div>
                    <div className="price-guardian-details">
                      <div className="price-details-icon">👥</div>
                      <h2>Active Involvement</h2>
                      <p>Stay connected with your ward's learning journey through real-time updates and interactive features.</p>
                      <ul>
                        <li>Real-time learning updates</li>
                        <li>Interactive dashboard access</li>
                        <li>Direct communication tools</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="price-pricing-container-2-bottom-1-2">
                  <div className="price-guardian-cell">
                    <div className="price-guardian-summary">
                      <div className="price-guardian-cell-top" aria-hidden="true">📊</div>
                      <div className="price-guardian-cell-bottom">Ward's Standing</div>
                    </div>
                    <div className="price-guardian-details">
                      <div className="price-details-icon">📊</div>
                      <h2>See Where Your Ward Stands</h2>
                      <p>Get a clear view of your ward's current academic position and competitive standing.</p>
                      <ul>
                        <li>Comparative performance metrics</li>
                        <li>Rank and percentile tracking</li>
                        <li>Subject-wise positioning</li>
                      </ul>
                    </div>
                  </div>
                </div>
            </div>
            <div className="price-pricing-container-2-bottom-2">
                <div className="price-pricing-container-2-bottom-2-1">
                  <div className="price-guardian-cell">
                    <div className="price-guardian-summary">
                      <div className="price-guardian-cell-top" aria-hidden="true">📈</div>
                      <div className="price-guardian-cell-bottom">Track Progress</div>
                    </div>
                    <div className="price-guardian-details">
                      <div className="price-details-icon">📈</div>
                      <h2>Keep Track of Performance</h2>
                      <p>Monitor your ward's academic progress with comprehensive performance tracking tools.</p>
                      <ul>
                        <li>Continuous progress monitoring</li>
                        <li>Topic mastery indicators</li>
                        <li>Historical trend analysis</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="price-pricing-container-2-bottom-2-2">
                  <div className="price-guardian-cell">
                    <div className="price-guardian-summary">
                      <div className="price-guardian-cell-top" aria-hidden="true">🔔</div>
                      <div className="price-guardian-cell-bottom">Smart Alerts</div>
                    </div>
                    <div className="price-guardian-details">
                      <div className="price-details-icon">🔔</div>
                      <h2>Alerts If Performance Drops</h2>
                      <p>Receive timely notifications when your ward's performance dips, so you can provide support quickly.</p>
                      <ul>
                        <li>Instant performance alerts</li>
                        <li>Early warning notifications</li>
                        <li>Actionable improvement suggestions</li>
                      </ul>
                    </div>
                  </div>
                </div>
            </div>
            <div className="price-pricing-container-2-bottom-3">
                <div className="price-pricing-container-2-bottom-3-1">
                  <div className="price-guardian-cell">
                    <div className="price-guardian-summary">
                      <div className="price-guardian-cell-top" aria-hidden="true">📋</div>
                      <div className="price-guardian-cell-bottom">Exam Reports</div>
                    </div>
                    <div className="price-guardian-details">
                      <div className="price-details-icon">📋</div>
                      <h2>Grade Sheets After Each Exam</h2>
                      <p>Access detailed grade sheets immediately after every exam for complete transparency.</p>
                      <ul>
                        <li>Instant exam grade sheets</li>
                        <li>Detailed score breakdowns</li>
                        <li>Answer key with explanations</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="price-pricing-container-2-bottom-3-2">
                  <div className="price-guardian-cell">
                    <div className="price-guardian-summary">
                      <div className="price-guardian-cell-top" aria-hidden="true">📊</div>
                      <div className="price-guardian-cell-bottom">Data Insights</div>
                    </div>
                    <div className="price-guardian-details">
                      <div className="price-details-icon">📊</div>
                      <h2>Detailed Insights into Performance by Statistics</h2>
                      <p>Leverage comprehensive statistical analysis to understand performance trends and patterns.</p>
                      <ul>
                        <li>Advanced performance analytics</li>
                        <li>Visual data representations</li>
                        <li>Strength/weakness heatmaps</li>
                      </ul>
                    </div>
                  </div>
                </div>
            </div>
          </div>
      </div>
      
      </div>
    </div>
    <Footer />
    {showQRModal && (
      <div className="price-qr-modal-overlay" onClick={handleCloseModal}>
        <div className="price-qr-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="price-qr-modal-close" onClick={handleCloseModal}>✕</button>
          <h3 className="price-qr-modal-title">Scan Code for Payment</h3>
          <div className="price-qr-code-container">
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=merchant@upi&pn=SkillyugEducation&am=100&cu=INR" 
              alt="Payment QR Code" 
              className="price-qr-code-image"
            />
          </div>
          <div className="price-qr-modal-footer">
            <div className="price-qr-timer-small">Expires: {formatTime(timeLeft)}</div>
            <button className="price-generate-new-code-btn-small" onClick={handleGenerateNewCode}>
              New Code
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Pricing;

