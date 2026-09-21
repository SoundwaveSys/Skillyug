import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../css files/LandingPage.css";
import Navbar from "../components/Navbar";
import ParticleBackground from "../components/StarBg";
import Footer from "../components/Footer";
import AstronautSVG from "../components/Astronaut";
import Ship from "../components/Astronaut";
import HexagonProfileSlider from "../components/VerticalSlider";
import QuizFireworks from "../components/QuizFireworks";
import Chatbot from "../components/Chatbot";


const LandingPage = () => {
    const navigate = useNavigate();
    const [scrolledDown, setScrolledDown] = React.useState(false);
    const [skillyugFlipped, setSkillyugFlipped] = useState(false);
    const lastScroll = React.useRef(window.scrollY);
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);

    const handlePlay = () => {
        if (videoRef.current) {
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    };

    const handleTogglePlayback = (event) => {
        if (event) {
            event.stopPropagation();
        }
        if (!videoRef.current) {
            return;
        }
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleVideoPlay = () => {
        setIsPlaying(true);
    };

    const handleVideoPause = () => {
        setIsPlaying(false);
    };

    const handleVideoLoaded = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0.1;
        }
    };

    React.useEffect(() => {
        const handleScroll = () => {
            const curr = window.scrollY;
            if (curr > lastScroll.current + 10) {
                setScrolledDown(true);
            } else if (curr < lastScroll.current - 10) {
                setScrolledDown(false);
            }
            lastScroll.current = curr;
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    return (
		<div className="lp-landing-page">
            <Navbar />
            
			<div className="lp-landingpage-1">
                <ParticleBackground />
                <div className="lp-left-container-landingpage-1">
                    <div className="lp-left-container-landingpage-1-top">
                        <img src="/assets/PrepMark.png" alt="PrepMark Logo" className="lp-prepmark-logo" />
                    </div>
                    <div className="lp-left-container-landingpage-1-bottom">
                        <div className="lp-left-container-landingpage-1-bottom-top">
                            <span className="lp-prepmark-subtitle">Empowering children with India's #1 aptitude and brain training platform</span>
                        </div>
                        <div className="lp-left-container-landingpage-1-bottom-bottom">
                            <div className="lp-left-container-landingpage-1-bottom-bottom-1">
                                <button className="lp-prepmark-btn get-started" onClick={() => navigate("/pricing")}>Pricing Plans</button>
                            </div>
                            <div className="lp-left-container-landingpage-1-bottom-bottom-2">
                                <button className="lp-prepmark-btn about-us">About Us</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lp-right-container-landingpage-1">
                    <div className={`lp-red-scroll-box${scrolledDown ? ' out' : ''}`}>
                        <Ship />
                    </div>
                </div>
            </div>

                        <div className="lp-landingpage-2">
                                <div className="lp-left-container-landingpage-2 lp-skillyug-flip-wrap"
                                    onMouseEnter={() => setSkillyugFlipped(true)}
                                    onMouseLeave={() => setSkillyugFlipped(false)}
                                >
                                    <div className={`lp-skillyug-flipcard${skillyugFlipped ? ' flipped' : ''}`}>
                                        <div className="lp-skillyug-flipcard-inner">
                                            <div className="lp-skillyug-flipcard-front">
                                                <img
                                                    src="/assets/skillyug-logo-removebg-preview.png"
                                                    alt="Skillyug Logo"
                                                    className="lp-skillyug-logo"
                                                />
                                            </div>
                                            <div className="lp-skillyug-flipcard-back">
                                                <div className="lp-skillyug-flipcard-content">
                                                    <h1>Skillyug Education Academy</h1>
                                                    <p>
                                                        Skillyug Education Academy is a premier institution dedicated to empowering students with practical skills and knowledge for the modern world. Our programs focus on hands-on learning, mentorship, and real-world projects to ensure every learner is industry-ready.
                                                    </p>
                                                    {/* <ul>
                                                        <li>Expert faculty and mentors</li>
                                                        <li>Industry-driven curriculum</li>
                                                        <li>Workshops, internships, and live projects</li>
                                                        <li>Personalized career guidance</li>
                                                        <li>Vibrant student community</li>
                                                    </ul> */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                <div className="lp-right-container-landingpage-2">
                                    <div className="lp-right-container-landingpage-2-top">
                                        <div className="lp-flipcard">
                                            <div className="lp-flipcard-inner">
                                                <div className="lp-flipcard-front">
                                                    <div className="lp-right-container-landingpage-2-top-1">
                                                        <div className="lp-right-container-landingpage-2-top-1-top">
                                                            <img src="/assets/leaf.png" alt="Brain" className="lp-brain-img" />
                                                        </div>
                                                        <div className="lp-right-container-landingpage-2-top-1-bottom">
                                                            <span className="lp-app-feature-desc">Interactive games for fun learning.</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="lp-flipcard-back">
                                                    <span className="lp-app-feature-back">Flip for fun fact: Games help boost memory and logic!</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="lp-flipcard">
                                            <div className="lp-flipcard-inner">
                                                <div className="lp-flipcard-front">
                                                    <div className="lp-right-container-landingpage-2-top-2">
                                                        <div className="lp-right-container-landingpage-2-top-2-top">
                                                            <img src="/assets/leaf.png" alt="Brain" className="lp-brain-img" />
                                                        </div>
                                                        <div className="lp-right-container-landingpage-2-top-2-bottom">
                                                            <span className="lp-app-feature-desc">Personalized analytics to track progress.</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="lp-flipcard-back">
                                                    <span className="lp-app-feature-back">Flip for fun fact: Analytics show your improvement over time!</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="lp-right-container-landingpage-2-bottom">
                                        <div className="lp-flipcard">
                                            <div className="lp-flipcard-inner">
                                                <div className="lp-flipcard-front">
                                                    <div className="lp-right-container-landingpage-2-bottom-1">
                                                        <div className="lp-right-container-landingpage-2-bottom-1-top">
                                                            <img src="/assets/leaf.png" alt="Brain" className="lp-brain-img" />
                                                        </div>
                                                        <div className="lp-right-container-landingpage-2-bottom-1-bottom">
                                                            <span className="lp-app-feature-desc">Adaptive content for every skill level.</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="lp-flipcard-back">
                                                    <span className="lp-app-feature-back">Flip for fun fact: Content adapts to your learning speed!</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="lp-flipcard">
                                            <div className="lp-flipcard-inner">
                                                <div className="lp-flipcard-front">
                                                    <div className="lp-right-container-landingpage-2-bottom-2">
                                                        <div className="lp-right-container-landingpage-2-bottom-2-top">
                                                            <img src="/assets/leaf.png" alt="Brain" className="lp-brain-img" />
                                                        </div>
                                                        <div className="lp-right-container-landingpage-2-bottom-2-bottom">
                                                            <span className="lp-app-feature-desc">Safe, child-friendly environment.</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="lp-flipcard-back">
                                                    <span className="lp-app-feature-back">Flip for fun fact: Our platform is ad-free and secure!</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                </div>
            </div>

            {/* New section: App video (left) + vertical gallery (right) */}
            <div className="lp-landingpage-2-5">
                 <div className="lp-lp25-right">
                    <HexagonProfileSlider />
                 </div>
                <div className="lp-lp25-left">
                    <div className="lp-vid-title-text">Experience our app in action</div>
                    <div className="lp-lp25-video-wrap" onClick={handleTogglePlayback}>
                        <video
                            ref={videoRef}
                            className="lp-lp25-video"
                            src="/assets/prepmarkvidfinal.mp4"
                            playsInline
                            loop
                            muted={isMuted}
                            preload="auto"
                            onPlay={handleVideoPlay}
                            onPause={handleVideoPause}
                            onLoadedData={handleVideoLoaded}
                        ></video>
                        <div className="lp-video-controls">
                            {!isPlaying && (
                                <button className="lp-play-button" onClick={handleTogglePlayback}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                                </button>
                            )}
                            {(isPlaying) && (
                                <div className="lp-controls-bar">
                                    <button className="lp-mute-button" onClick={(event) => { event.stopPropagation(); handleMute(); }}>
                                        {isMuted ? 
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0a6.5 6.5 0 0 1-1.18 3.89L21 19.07A8.47 8.47 0 0 0 21 12h-2zm-1.5-6.13L15.87 4.4A8.47 8.47 0 0 1 21 12h-2a6.48 6.48 0 0 0-4-5.87zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25A6.43 6.43 0 0 1 19 12a6.48 6.48 0 0 0-2.13-4.87L3 4.27zM12 4L7.83 8.17 12 12.34V4z"/></svg> : 
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                                        }
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="lp-lp25-right">
                    <HexagonProfileSlider />
                </div>
            </div>

                    {/* App Download Section with Astronaut */}
                    <div className="lp-download-section">
                        <div className="lp-download-container">
                            {/* Main Stars Background */}
                            <div className="lp-stars-container-lp">
                                {Array.from({ length: 20 }).map((_, i) => {
                                    // Better distribution using sectors
                                    const sector = i % 4; // 4 sectors
                                    const sectorX = (sector % 2) * 50; // Left or right half
                                    const sectorY = Math.floor(sector / 2) * 50; // Top or bottom half
                                    const randomX = sectorX + Math.random() * 45; // Random within sector
                                    const randomY = sectorY + Math.random() * 45; // Random within sector
                                    
                                    return (
                                        <div
                                            key={i}
                                            className="lp-floating-star"
                                            style={{
                                                left: `${Math.min(randomX + 5, 95)}%`,
                                                top: `${Math.min(randomY + 5, 95)}%`,
                                                animationDelay: `${Math.random() * 8}s`,
                                                animationDuration: `${4 + Math.random() * 4}s`
                                            }}
                                        >
                                            ✦
                                        </div>
                                    );
                                })}
                            </div>

                           
                            

                            {/* Main Content */}
                            <div className="lp-download-content">
                                

                                {/* Text Content */}
                                <div className="lp-download-text-content">
                                    <h1 className="lp-download-title">
                                        <span className="lp-title-line">Download PrepMark</span>
                                        <span className="lp-title-line">Start Learning Today</span>
                                    </h1>
                                    <p className="lp-download-subtitle">
                                        Experience personalized learning on-the-go with our award-winning mobile app
                                    </p>

                                    {/* App Store Buttons */}
                                    <div className="lp-app-stores">
                                        <a href="https://github.com/Sumdiboii" target="_blank" rel="noopener noreferrer" className="lp-app-store-btn lp-google-play">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="lp-app-store-image" />
                                        </a>
                                        <a href="https://github.com/Sumdiboii" target="_blank" rel="noopener noreferrer" className="lp-app-store-btn lp-app-store">
                                            <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on the App Store" className="lp-app-store-image" />
                                        </a>
                                    </div>

                                    
                                </div>
                                <div className="lp-rocket-cont"><Ship /></div>
                            </div>

                            {/* Additional Well-Distributed Stars */}
                            <div className="lp-additional-stars">
                                {Array.from({ length: 30 }).map((_, i) => {
                                    // 6x5 grid pattern for better coverage
                                    const gridX = (i % 6) * 16.67; // 6 columns: 0%, 16.67%, 33.33%, 50%, 66.67%, 83.33%
                                    const gridY = Math.floor(i / 6) * 20; // 5 rows: 0%, 20%, 40%, 60%, 80%
                                    const randomX = gridX + (Math.random() - 0.5) * 12; // ±6% randomness
                                    const randomY = gridY + (Math.random() - 0.5) * 15; // ±7.5% randomness
                                    
                                    return (
                                        <div
                                            key={i}
                                            className="lp-additional-star"
                                            style={{
                                                left: `${Math.max(2, Math.min(98, randomX))}%`,
                                                top: `${Math.max(2, Math.min(98, randomY))}%`,
                                                animationDelay: `${Math.random() * 15}s`,
                                                animationDuration: `${3 + Math.random() * 5}s`
                                            }}
                                        >
                                            ✧
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                         <div className="lp-landingpage-3">
                                 <ParticleBackground />
                                 <div className="lp-left-container-landingpage-3">
                                        <h2 className="lp-lp3-title">Student Results Comparison</h2>
                                        <div className="lp-lp3-chart-wrap">
                                            <svg className="lp-lp3-chart" viewBox="0 0 420 260" role="img" aria-label="Traditional vs PrepMark scores">
                                                <defs>
                                                    <linearGradient id="pmGrad" x1="0" x2="0" y1="0" y2="1">
                                                        <stop offset="0%" stopColor="#1a237e" />
                                                        <stop offset="100%" stopColor="#283593" />
                                                    </linearGradient>
                                                </defs>
                                                {/* white background */}
                                                <rect x="0" y="0" width="420" height="260" fill="#fff" />
                                                {/* axes */}
                                                <line x1="40" y1="220" x2="400" y2="220" stroke="#1a237e" strokeWidth="2" />
                                                <line x1="40" y1="30" x2="40" y2="220" stroke="#1a237e" strokeWidth="2" />
                                                {/* y grid lines */}
                                                {Array.from({length:4}).map((_,i)=>{
                                                    const y = 220 - (i+1)*40;
                                                    return <line key={i} x1="40" y1={y} x2="400" y2={y} stroke="#1a237e22" strokeWidth="1" />
                                                })}
                                                {/* categories */}
                                                {[
                                                    { label: 'Math', t: 60, p: 84 },
                                                    { label: 'Memory', t: 55, p: 88 },
                                                    { label: 'Logic', t: 58, p: 90 },
                                                    { label: 'Speed', t: 50, p: 82 },
                                                ].map((c, idx) => {
                                                    const groupX = 70 + idx * 80;
                                                    const tH = c.t * 1.6; // scale
                                                    const pH = c.p * 1.6;
                                                    return (
                                                        <g key={c.label}>
                                                            {/* Traditional bar (orange) */}
                                                            <rect x={groupX} y={220 - tH} width="24" height={tH} fill="#cc4915" rx="4" />
                                                            {/* PrepMark bar (green) */}
                                                            <rect x={groupX + 28} y={220 - pH} width="24" height={pH} fill="rgb(13, 131, 23)" rx="4" />
                                                            {/* label */}
                                                            <text x={groupX + 14} y="240" fill="#1a237e" fontSize="12" textAnchor="middle">{c.label}</text>
                                                        </g>
                                                    )
                                                })}
                                                {/* legend */}
                                                <g className="lp-lp3-legend" >
                                                    <rect x="240" y="34" width="12" height="12" fill="#b77a62ff;" rx="5" />
                                                    <text x="258" y="44" fill="#1a237e" fontSize="12">Traditional</text>
                                                    <rect x="240" y="54" width="12" height="12" fill="rgba(45, 214, 59, 1);" rx="5" />
                                                    <text x="258" y="64" fill="#1a237e" fontSize="12">PrepMark</text>
                                                </g>
                                            </svg>
                                        </div>
                                 </div>
                                 <div className="lp-right-container-landingpage-3">
                                     <div className="lp-lp3-stats-grid">
                                         <div className="lp-statt-card">
                                             <div className="lp-statt-value">15</div>
                                             <div className="lp-statt-label">Lessons</div>
                                         </div>
                                         <div className="lp-statt-card">
                                             <div className="lp-statt-value">50k</div>
                                             <div className="lp-statt-label">Users</div>
                                         </div>
                                         <div className="lp-statt-card">
                                             <div className="lp-statt-value">92%</div>
                                             <div className="lp-statt-label">Avg. Score Lift</div>
                                         </div>
                                         <div className="lp-statt-card">
                                             <div className="lp-statt-value">4.8★</div>
                                             <div className="lp-statt-label">App Rating</div>
                                         </div>
                                         <div className="lp-statt-card">
                                             <div className="lp-statt-value">92%</div>
                                             <div className="lp-statt-label">Avg. Score Lift</div>
                                         </div>
                                         <div className="lp-statt-card">
                                             <div className="lp-statt-value">4.8★</div>
                                             <div className="lp-statt-label">App Rating</div>
                                         </div>
                                     </div>
                                 </div>
                        </div>
<div className="lp-mock-quiz-section">
    {(() => {
        const [activeTab, setActiveTab] = React.useState('easy');
        const [currentQuestion, setCurrentQuestion] = React.useState(0);
        const [selectedAnswer, setSelectedAnswer] = React.useState(null);
        const [showResult, setShowResult] = React.useState(false);
        const [questions, setQuestions] = React.useState([]);
        const [showFireworks, setShowFireworks] = React.useState(false);

        const questionBank = {
            easy: [
                {
                    question: "If a train travels 60 km in 1 hour, how far will it travel in 3 hours?",
                    options: ["120 km", "180 km", "150 km", "200 km"],
                    correct: 1,
                    explanation: "Distance = Speed × Time. At 60 km/hour for 3 hours: 60 × 3 = 180 km."
                },
                {
                    question: "What comes next in the sequence: 2, 4, 6, 8, ?",
                    options: ["9", "10", "11", "12"],
                    correct: 1,
                    explanation: "This is an arithmetic sequence with a common difference of 2. So 8 + 2 = 10."
                },
                {
                    question: "If all cats are animals and Fluffy is a cat, what can we conclude?",
                    options: ["Fluffy is not an animal", "Fluffy is an animal", "Fluffy might be an animal", "Cannot determine"],
                    correct: 1,
                    explanation: "This is basic logical reasoning. Since all cats are animals and Fluffy is a cat, Fluffy must be an animal."
                }
            ],
            medium: [
                {
                    question: "A rectangle has a length of 12 cm and width of 8 cm. What is its area?",
                    options: ["96 cm²", "40 cm²", "20 cm²", "48 cm²"],
                    correct: 0,
                    explanation: "Area of rectangle = Length × Width = 12 × 8 = 96 cm²."
                },
                {
                    question: "If A = 1, B = 2, C = 3, what is the sum of the letters in 'CAB'?",
                    options: ["5", "6", "7", "8"],
                    correct: 1,
                    explanation: "C = 3, A = 1, B = 2. Sum = 3 + 1 + 2 = 6."
                },
                {
                    question: "In a class of 30 students, 18 play football and 20 play cricket. How many play both?",
                    options: ["6", "8", "10", "12"],
                    correct: 1,
                    explanation: "Using the formula: Both = (Football + Cricket) - Total = (18 + 20) - 30 = 8 students play both."
                }
            ],
            hard: [
                {
                    question: "If 3x + 7 = 22, what is the value of x?",
                    options: ["3", "4", "5", "6"],
                    correct: 2,
                    explanation: "3x + 7 = 22. Subtract 7: 3x = 15. Divide by 3: x = 5."
                },
                {
                    question: "A clock shows 3:15. What is the angle between hour and minute hands?",
                    options: ["0°", "7.5°", "15°", "22.5°"],
                    correct: 1,
                    explanation: "At 3:15, minute hand is at 90° (pointing at 3). Hour hand moves 0.5° per minute, so it's at 90° + (15 × 0.5°) = 97.5°. Difference = 7.5°."
                },
                {
                    question: "If P → Q is true and Q is false, what can we say about P?",
                    options: ["P is true", "P is false", "P can be true or false", "Cannot determine"],
                    correct: 1,
                    explanation: "In logic, if P → Q (if P then Q) is true and Q is false, then P must be false. This is because a true statement cannot lead to a false conclusion."
                }
            ]
        };

        React.useEffect(() => {
            const shuffled = [...questionBank[activeTab]].sort(() => Math.random() - 0.5);
            setQuestions(shuffled);
            setCurrentQuestion(0);
            setSelectedAnswer(null);
            setShowResult(false);
            setShowFireworks(false); // Reset fireworks when changing difficulty
        }, [activeTab]);

        const handleAnswerSelect = (answerIndex) => {
            setSelectedAnswer(answerIndex);
        };

        const handleSubmit = () => {
            if (selectedAnswer !== null) {
                setShowResult(true);
                
                // Check if answer is correct and trigger fireworks
                const currentQ = questions[currentQuestion];
                if (selectedAnswer === currentQ?.correct) {
                    setShowFireworks(true);
                    // Hide fireworks after 4 seconds for better performance
                    setTimeout(() => {
                        setShowFireworks(false);
                    }, 4000);
                }
            }
        };

        const nextQuestion = () => {
            setShowFireworks(false); // Reset fireworks when moving to next question
            
            if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
                setSelectedAnswer(null);
                setShowResult(false);
            } else {
                // Reset to first question
                setCurrentQuestion(0);
                setSelectedAnswer(null);
                setShowResult(false);
            }
        };

        const currentQ = questions[currentQuestion];
        const isCorrect = selectedAnswer === currentQ?.correct;

        return (
            <div className="lp-quiz-container">
                <h2 className="lp-quiz-title">Try Our Demo Quiz</h2>
                <p className="lp-quiz-subtitle">Test your aptitude and logical reasoning skills</p>
                
                <div className="lp-quiz-tabs">
                    {['easy', 'medium', 'hard'].map(level => (
                        <button
                            key={level}
                            className={`lp-quiz-tab ${activeTab === level ? 'lp-active' : ''}`}
                            onClick={() => setActiveTab(level)}
                        >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                    ))}
                </div>

                {currentQ && (
                    <div className="lp-quiz-content">
                        <div className="lp-question-header">
                            <span className="lp-question-counter">
                                Question {currentQuestion + 1} of {questions.length}
                            </span>
                            <span className="lp-difficulty-badge">{activeTab.toUpperCase()}</span>
                        </div>

                        <div className="lp-question-card">
                            <h3 className="lp-question-text">{currentQ.question}</h3>
                            
                            <div className="lp-options-grid">
                                {currentQ.options.map((option, index) => (
                                    <button
                                        key={index}
                                        className={`lp-option-btn ${
                                            selectedAnswer === index ? 'lp-selected' : ''
                                        } ${
                                            showResult ? 
                                                (index === currentQ.correct ? 'lp-correct' : 
                                                 selectedAnswer === index ? 'lp-incorrect' : '') 
                                                : ''
                                        }`}
                                        onClick={() => !showResult && handleAnswerSelect(index)}
                                        disabled={showResult}
                                    >
                                        <span className="lp-option-letter">
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                        <span className="lp-option-text">{option}</span>
                                    </button>
                                ))}
                            </div>

                            {showResult && (
                                <div className={`lp-result-section ${isCorrect ? 'lp-correct' : 'lp-incorrect'}`}>
                                    <div className="lp-result-header">
                                        <span className="lp-result-icon">
                                            {isCorrect ? '✅' : '❌'}
                                        </span>
                                        <span className="lp-result-text">
                                            {isCorrect ? 'Correct!' : 'Incorrect'}
                                        </span>
                                    </div>
                                    <div className="lp-explanation">
                                        <strong>Explanation:</strong> {currentQ.explanation}
                                    </div>
                                </div>
                            )}

                            <div className="lp-quiz-actions">
                                {!showResult ? (
                                    <button
                                        className="lp-submit-btn"
                                        onClick={handleSubmit}
                                        disabled={selectedAnswer === null}
                                    >
                                        Submit Answer
                                    </button>
                                ) : (
                                    <button
                                        className="lp-next-btn"
                                        onClick={nextQuestion}
                                    >
                                        {currentQuestion < questions.length - 1 ? 'Next Question' : 'Try Again'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Fireworks celebration for correct answers */}
                {showFireworks && <QuizFireworks />}
            </div>
        );
    })()}</div>

            <div className="lp-landingpage-4">
                {/* Reviews slider: two rows, opposite directions */}
                {(() => {
                    const fallbackAvatar = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><circle cx="40" cy="40" r="40" fill="#e0e7ff"/></svg>');
                    const reviewsTop = [
                        { name: 'Aarav', img: 'https://i.pravatar.cc/80?img=12', text: 'PrepMark made learning fun—my math scores jumped in 3 weeks!' },
                        { name: 'Diya', img: 'https://i.pravatar.cc/80?img=15', text: 'The games are engaging and the analytics help me improve.' },
                        { name: 'Kabir', img: 'https://i.pravatar.cc/80?img=20', text: 'Love the personalized lessons. I feel more confident now.' },
                        { name: 'Meera', img: 'https://i.pravatar.cc/80?img=31', text: 'Reports are so clear—great for tracking progress!' },
                        { name: 'Ishaan', img: 'https://i.pravatar.cc/80?img=36', text: 'Adaptive content keeps me challenged without being hard.' },
                    ];
                    const reviewsBottom = [
                        { name: 'Parent—Anita', img: 'https://i.pravatar.cc/80?img=47', text: 'My daughter looks forward to lessons. Huge confidence boost.' },
                        { name: 'Parent—Ravi', img: 'https://i.pravatar.cc/80?img=52', text: 'Reliable progress tracking; we know exactly where to help.' },
                        { name: 'Parent—Neha', img: 'https://i.pravatar.cc/80?img=58', text: 'Safe, structured, and effective. Highly recommend.' },
                        { name: 'Parent—Vikram', img: 'https://i.pravatar.cc/80?img=62', text: 'Scores improved and screen time is finally meaningful.' },
                        { name: 'Parent—Simran', img: 'https://i.pravatar.cc/80?img=66', text: 'Great balance of fun and learning; analytics are A+.' },
                    ];
                    const StarRow = () => (
                        <div className="lp-review-stars" aria-label="5 out of 5 stars" title="5 out of 5">
                            <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                        </div>
                    );
                    const Card = ({ r }) => (
                        <div className="lp-review-card">
                            <div className="lp-review-card-top">
                                <img
                                    className="lp-review-avatar"
                                    src={r.img}
                                    alt={`${r.name} avatar`}
                                    loading="lazy"
                                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackAvatar; }}
                                />
                                <div className="lp-review-meta">
                                    <div className="lp-review-name">{r.name}</div>
                                    <StarRow />
                                </div>
                            </div>
                            <p className="lp-review-text">{r.text}</p>
                        </div>
                    );
                    const Track = ({ items, reverse }) => (
                        <div className={`lp-reviews-track${reverse ? ' lp-reverse' : ''}`}>
                            <div className="lp-track-segment">
                                {items.map((r, i) => <Card key={`a-${i}`} r={r} />)}
                            </div>
                            <div className="lp-track-segment" aria-hidden="true">
                                {items.map((r, i) => <Card key={`b-${i}`} r={r} />)}
                            </div>
                        </div>
                    );
                    return (
                        <div className="lp-reviews-section">
                            <div className="lp-reviews-row lp-row-1">
                                <Track items={reviewsTop} />
                            </div>
                            <div className="lp-reviews-row lp-row-2">
                                <Track items={reviewsBottom} reverse />
                            </div>
                        </div>
                    );
                })()}
            </div>

             <div className="lp-landingpage-5">
                  <ParticleBackground />
                  {(() => {
                    const faqs = [
                        { q: 'What ages is PrepMark suitable for?', a: 'PrepMark is designed for students aged 6–16, with adaptive content that matches each learner\'s level.' },
                        { q: 'How long are the lessons?', a: 'Most lessons take 10–15 minutes, perfect for daily practice without overload.' },
                        { q: 'Do parents get progress reports?', a: 'Yes. Parents can track performance via clear dashboards and weekly summaries.' },
                        { q: 'Is it safe for kids?', a: 'Absolutely. We provide a secure, ad-free, child-friendly environment.' },
                        { q: 'Can I use PrepMark on a tablet or phone?', a: 'Yes! PrepMark works on all modern devices, including tablets and smartphones.' },
                        { q: 'Are there live classes or only self-paced?', a: 'PrepMark offers both self-paced lessons and live interactive sessions.' },
                        { q: 'How do I reset my password?', a: 'Click “Forgot password” on the login page and follow the instructions sent to your email.' },
                        { q: 'Is there a free trial?', a: 'Yes, you can try PrepMark free for 7 days with no obligation.' },
                        { q: 'How do I contact support?', a: 'You can reach our support team via the Help section in your dashboard or email us at support@prepmark.com.' },
                        { q: 'Can parents monitor progress?', a: 'Absolutely! Parents have access to detailed progress reports and weekly summaries.' },
                        { q: 'What subjects are covered?', a: 'PrepMark covers Math, Logic, Memory, Speed, and more, with new content added regularly.' },
                        { q: 'Is my data safe?', a: 'We use industry-standard encryption and never share your data with third parties.' },
                    ];
                    const [expandedIdx, setExpandedIdx] = React.useState(null);
                                        const FAQItem = ({ item, idx }) => {
                                                const isOpen = expandedIdx === idx;
                                                // For expanded, absolutely position over .faqs-wrap
                                                return (
                                                        <div
                                                            className={`lp-faq-item${isOpen ? ' lp-open lp-expanded' : ''}`}
                                                            style={
                                                                isOpen
                                                                    ? {
                                                                            position: 'absolute',
                                                                            top: 0,
                                                                            left: 0,
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            zIndex: 10,
                                                                            background: 'linear-gradient(120deg, #1a237e 60%, #43a047 100%)',
                                                                            color: '#fff',
                                                                            boxShadow: '0 8px 48px 8px #1a237e55',
                                                                            transform: 'scale(1.04) translateY(-8px)',
                                                                            display: 'flex',
                                                                            flexDirection: 'column',
                                                                            justifyContent: 'center',
                                                                            alignItems: 'center',
                                                                            animation: 'faqExpand 0.5s cubic-bezier(.7,.2,.2,1)',
                                                                            transition: 'all 0.5s cubic-bezier(.7,.2,.2,1)',
                                                                        }
                                                                    : {
                                                                            position: 'relative',
                                                                            minHeight: 56,
                                                                            maxHeight: 56,
                                                                            overflow: 'hidden',
                                                                            background: 'rgba(255,255,255,0.08)',
                                                                            borderRadius: 16,
                                                                            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                                                            transition: 'all 0.5s cubic-bezier(.7,.2,.2,1)',
                                                                        }
                                                            }
                                                        >
                                                                <button
                                                                    className="lp-faq-q"
                                                                    style={
                                                                        isOpen
                                                                            ? {
                                                                                    fontSize: '2rem',
                                                                                    fontWeight: 800,
                                                                                    color: '#fff',
                                                                                    background: 'none',
                                                                                    border: 'none',
                                                                                    boxShadow: 'none',
                                                                                    marginBottom: '2rem',
                                                                                    cursor: 'default',
                                                                                    pointerEvents: 'none',
                                                                                    transition: 'all 0.5s cubic-bezier(.7,.2,.2,1)',
                                                                                }
                                                                            : {}
                                                                    }
                                                                    onClick={() => setExpandedIdx(isOpen ? null : idx)}
                                                                >
                                                                        <span>{item.q}</span>
                                                                        <span className={`lp-chev${isOpen ? ' lp-up' : ''}`} aria-hidden>⌄</span>
                                                                </button>
                                                                <div
                                                                    className="lp-faq-a"
                                                                    aria-hidden={!isOpen}
                                                                    style={
                                                                        isOpen
                                                                            ? {
                                                                                    fontSize: '1.3rem',
                                                                                    color: '#fff',
                                                                                    opacity: 1,
                                                                                    height: 'auto',
                                                                                    padding: '1.5rem 2rem 2rem',
                                                                                    background: 'none',
                                                                                    boxShadow: 'none',
                                                                                    textAlign: 'center',
                                                                                    display: 'flex',
                                                                                    flexDirection: 'column',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    transition: 'all 0.5s cubic-bezier(.7,.2,.2,1)',
                                                                                }
                                                                            : {
                                                                                    opacity: 0,
                                                                                    height: 0,
                                                                                    padding: '0 2rem',
                                                                                    pointerEvents: 'none',
                                                                                    transition: 'all 0.5s cubic-bezier(.7,.2,.2,1)',
                                                                                }
                                                                    }
                                                                >
                                                                        {item.a}
                                                                        {isOpen && (
                                                                                <button className="lp-faq-close-btn" onClick={() => setExpandedIdx(null)} style={{transition:'all 0.3s'}}>Close</button>
                                                                        )}
                                                                </div>
                                                        </div>
                                                );
                                        };
                    const ownerImg = '/assets/owner.jpg';
                    const ownerFallback = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><circle cx="60" cy="60" r="60" fill="#e0e7ff"/></svg>');
                    return (
                        <>
                                                    <div className="lp-left-container-landingpage-5">
                                                            <div className="lp-faqs-wrap">
                                                                    <h2 className="lp-faqs-title">Frequently Asked Questions</h2>
                                                                    <div className="lp-faqs-list">                                                                            {faqs.map((f, i) => <FAQItem key={i} item={f} idx={i} />)}
                                                                    </div>
                                                            </div>
                                                            <style>{`
                                                                .lp-faqs-wrap {
                                                                    width: 580px;
                                                                    min-height: 420px;
                                                                    max-height: 480px;
                                                                    overflow: hidden;
                                                                    position: relative;
                                                                    transition: box-shadow 0.3s cubic-bezier(.7,.2,.2,1);
                                                                    // background:red;
                                                                    margin-top:2rem;
                                                                }
                                                                .lp-faqs-list {
                                                                    display: flex;
                                                                    flex-direction: column;
                                                                    gap: 1rem;
                                                                    height: 340px;
                                                                    overflow-y: auto;
                                                                    transition: filter 0.3s cubic-bezier(.7,.2,.2,1);
                                                                    scrollbar-width: thin;
                                                                    
                                                                    
                                                                }
                                                                .lp-faqs-list::-webkit-scrollbar {
                                                                    width: 5px;
                                                                    height: 5px;
                                                                    
                                                                }
                                                                .lp-faqs-list::-webkit-scrollbar-thumb {
                                                                    background: #ffffffff;
                                                                    border-radius: 8px;
                                                                    min-height: 24px;
                                                                    
                                                                }
                                                                .lp-faqs-list::-webkit-scrollbar-track {
                                                                    background: transparent;
                                                                }
                                                                .lp-faqs-list {
                                                                    scrollbar-width: thin;
                                                                    scrollbar-color: #ffffffff transparent;
                                                                    
                                                                }
                                                                .lp-faq-item {
                                                                    background: rgba(255,255,255,0.08);
                                                                    border-radius: 16px;
                                                                    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
                                                                    transition: transform 0.5s cubic-bezier(.7,.2,.2,1), box-shadow 0.5s cubic-bezier(.7,.2,.2,1), z-index 0.2s, min-height 0.5s cubic-bezier(.7,.2,.2,1), max-height 0.5s cubic-bezier(.7,.2,.2,1);
                                                                    position: relative;
                                                                    z-index: 1;
                                                                    min-height: 56px;
                                                                    overflow: hidden;
                                                                }
                                                                .lp-faq-item.open {
                                                                    background: rgba(255,255,255,0.13);
                                                                    box-shadow: 0 4px 24px rgba(0,0,0,0.16);
                                                                }
                                                                .lp-faq-item.expanded {
                                                                    position: absolute;
                                                                    top: 0; left: 0; right: 0; bottom: 0;
                                                                    width: 100%; height: 100%;
                                                                    z-index: 10;
                                                                    background: white;;
                                                                    color: #fff;
                                                                    box-shadow: 0 8px 48px 8px #1a237e55;
                                                                    transform: scale(1.04) translateY(-8px);
                                                                    display: flex;
                                                                    flex-direction: column;
                                                                    justify-content: center;
                                                                    align-items: center;
                                                                    animation: faqExpand 0.5s cubic-bezier(.7,.2,.2,1);
                                                                }
                                                                @keyframes faqExpand {
                                                                    from { transform: scale(0.95) translateY(40px); opacity: 0.5; }
                                                                    to { transform: scale(1.04) translateY(-8px); opacity: 1; }
                                                                }
                                                                .lp-faq-item.expanded .faq-q {
                                                                    font-size: 2rem;
                                                                    font-weight: 800;
                                                                    color: #fff;
                                                                    background: none;
                                                                    border: none;
                                                                    box-shadow: none;
                                                                    margin-bottom: 2rem;
                                                                    cursor: default;
                                                                    pointer-events: none;
                                                                }
                                                                .lp-faq-item.expanded .faq-a {
                                                                    font-size: 1.3rem;
                                                                    color: #fff;
                                                                    opacity: 1;
                                                                    height: auto;
                                                                    padding: 1.5rem 2rem 2rem;
                                                                    background: none;
                                                                    box-shadow: none;
                                                                    text-align: center;
                                                                    display: flex;
                                                                    flex-direction: column;
                                                                    align-items: center;
                                                                    justify-content: center;
                                                                }
                                                                .lp-faq-close-btn {
                                                                    margin-top: 2rem;
                                                                    padding: 0.7rem 2.2rem;
                                                                    font-size: 1.1rem;
                                                                    font-weight: 700;
                                                                    border-radius: 2rem;
                                                                    border: none;
                                                                    background: #fff;
                                                                    color: #1a237e;
                                                                    box-shadow: 0 2px 12px #1a237e33;
                                                                    cursor: pointer;
                                                                    transition: background 0.2s, color 0.2s;
                                                                }
                                                                .lp-faq-close-btn:hover {
                                                                    background: #43a047;
                                                                    color: #fff;
                                                                }
                                                            `}</style>
                                                    </div>
                          <div className="lp-right-container-landingpage-5">
                              <div className="lp-owner-note-card">
                                  <img
                                    className="lp-owner-avatar"
                                    src={ownerImg}
                                    alt="Founder portrait"
                                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = ownerFallback; }}
                                    loading="lazy"
                                  />
                                  <blockquote className="lp-owner-quote">"Every child can build a sharper mind with the right practice—one small win each day."</blockquote>
                                  <p className="lp-owner-speech">Hi, I\'m the founder of PrepMark. We built this platform to make brain training engaging and effective for students. Try a few lessons, watch the progress reports, and you\'ll see confidence grow week by week. Keep learning—your future self will thank you.</p>
                                  <div className="lp-owner-meta">
                                      <div className="lp-owner-name">Rahul Mehta</div>
                                      <div className="lp-owner-role">Founder, PrepMark</div>
                                  </div>
                              </div>
                          </div>
                        </>
                    );
                  })()}
            </div>
           <Footer />
           <Chatbot />
		</div>
	);
};

export default LandingPage;
