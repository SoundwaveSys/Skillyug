import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import "../css files/Pricing.css";
import ParticleBackground from "../components/StarBg";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { auth } from "../firebase/config";

const _features = [
  "Interactive games for fun learning",
  "Personalized analytics to track progress",
  "Adaptive content for every skill level",
  "Safe, child-friendly environment"
];

const Pricing = () => {
  const navigate = useNavigate();
  const [paymentError, setPaymentError] = useState("");
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      const pendingOrderId = localStorage.getItem("pendingRazorpayOrder");
      if (!user || !pendingOrderId) return;

      try {
        const response = await fetch(`/api/payment-status/${encodeURIComponent(pendingOrderId)}`, {
          headers: { Authorization: `Bearer ${await user.getIdToken()}` }
        });
        const result = await response.json();
        if (!response.ok || !result.success) return;

        if (result.payment.status === "paid") {
          localStorage.removeItem("pendingRazorpayOrder");
          navigate("/home");
        } else if (["failed", "cancelled"].includes(result.payment.status)) {
          localStorage.removeItem("pendingRazorpayOrder");
          setPaymentError(result.payment.failureReason || "Your previous payment was not completed.");
        } else {
          setPaymentError("A previous payment is still pending. Complete it or wait before retrying.");
        }
      } catch {
        setPaymentError("Unable to check the status of your previous payment.");
      }
    });
  }, [navigate]);

  const loadRazorpay = () => new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Razorpay checkout could not be loaded."));
    document.body.appendChild(script);
  });

  const handleProceedToPayment = async () => {
    setPaymentError("");

    const user = auth.currentUser;
    if (!user) {
      setPaymentError("Please sign in before starting a payment.");
      return;
    }

    setIsPaymentLoading(true);
    try {
      const idToken = await user.getIdToken();
      await loadRazorpay();
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({})
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to create a Razorpay order.");
      }
      localStorage.setItem("pendingRazorpayOrder", result.order.id);

      const reportPaymentState = async (status, failureReason = "") => {
        try {
          await fetch(`/api/payment-status/${encodeURIComponent(result.order.id)}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${await user.getIdToken()}`
            },
            body: JSON.stringify({ status, failureReason })
          });
        } catch {
          // The persisted order can be reconciled on the next page load.
        }
      };

      const checkout = new window.Razorpay({
        key: result.keyId,
        amount: result.order.amount,
        currency: result.order.currency,
        name: "PrepMark",
        description: "PrepMark Premium membership",
        order_id: result.order.id,
        prefill: {
          email: user.email || ""
        },
        handler: async (paymentResponse) => {
          try {
            const verification = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${await user.getIdToken()}`
              },
              body: JSON.stringify(paymentResponse)
            });
            const verificationResult = await verification.json();
            if (!verification.ok || !verificationResult.success) {
              setPaymentError(verificationResult.error || "Payment verification failed.");
              setIsPaymentLoading(false);
              return;
            }
            localStorage.removeItem("pendingRazorpayOrder");
            setIsPaymentLoading(false);
            navigate("/home");
          } catch {
            setIsPaymentLoading(false);
            setPaymentError("Payment verification could not be completed. Please contact support before retrying.");
          }
        },
        modal: {
          ondismiss: async () => {
            await reportPaymentState("cancelled", "Checkout was closed before payment completed.");
            localStorage.removeItem("pendingRazorpayOrder");
            setIsPaymentLoading(false);
            setPaymentError("Payment was cancelled. No access was granted.");
          }
        },
        theme: { color: "#3521b5" }
      });

      checkout.on("payment.failed", async (failure) => {
        await reportPaymentState(
          "failed",
          failure.error?.description || "Razorpay checkout reported a failed payment."
        );
        localStorage.removeItem("pendingRazorpayOrder");
        setPaymentError(failure.error?.description || "Payment failed. Please try again.");
        setIsPaymentLoading(false);
      });
      checkout.open();
    } catch (error) {
      setPaymentError(error.message || "Unable to start payment.");
      setIsPaymentLoading(false);
    }
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
              <button
                className="price-payment-button"
                onClick={handleProceedToPayment}
                disabled={isPaymentLoading}
              >
                {isPaymentLoading ? "Starting payment…" : "Proceed to Payment"}
              </button>
              {paymentError && (
                <p className="price-payment-error" role="alert">{paymentError}</p>
              )}
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
    {isPaymentLoading && (
      <div className="price-qr-modal-overlay" role="status">
        <div className="price-qr-modal-content">
          <h3 className="price-qr-modal-title">Starting secure payment…</h3>
          <p>Please wait while Razorpay checkout loads.</p>
        </div>
      </div>
    )}
    </>
  );
};

export default Pricing;

