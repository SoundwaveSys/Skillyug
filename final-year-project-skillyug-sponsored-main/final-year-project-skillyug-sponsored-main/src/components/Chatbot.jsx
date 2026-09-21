import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your PrepMark assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = () => {
    if (inputMessage.trim() === '') return;

    const newMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Knowledge base with keywords and responses
    const knowledgeBase = [
      // Greetings
      {
        keywords: ['hi', 'hello', 'hey', 'namaste', 'नमस्ते'],
        response: "नमस्ते! 👋 Welcome to PrepMark by Skillyug Education Academy. I'm here to help you with NMMS exam preparation. How can I assist you today?"
      },
      
      // About PrepMark
      {
        keywords: ['what is prepmark', 'about prepmark', 'prepmark', 'tell me about'],
        response: "PrepMark is India's #1 aptitude and brain training platform for NMMS (National Means-cum-Merit Scholarship) exam preparation. We offer:\n• Interactive MAT & SAT practice tests\n• Personalized analytics\n• Adaptive learning\n• Marathi & English content\n• 5000+ questions"
      },
      
      // About Skillyug
      {
        keywords: ['skillyug', 'who made this', 'company', 'developer'],
        response: "PrepMark is developed by Skillyug Education Academy - a premier institution dedicated to empowering students with practical skills and knowledge. We focus on hands-on learning, mentorship, and real-world projects to ensure every learner is industry-ready."
      },
      
      // NMMS Exam
      {
        keywords: ['nmms', 'exam', 'scholarship', 'what is nmms'],
        response: "NMMS (National Means-cum-Merit Scholarship) is a scholarship program for Class 8 students. The exam has two parts:\n• MAT (Mental Ability Test) - 90 questions\n• SAT (Scholastic Aptitude Test) - 90 questions\nPrepMark helps you prepare for both sections!"
      },
      
      // MAT (Mental Ability Test)
      {
        keywords: ['mat', 'mental ability', 'logical reasoning', 'aptitude'],
        response: "MAT (Mental Ability Test) covers:\n• Pattern Recognition\n• Analogies\n• Classification\n• Series Completion\n• Coding-Decoding\n• Logical Reasoning\n• Spatial Reasoning\nOur platform has 2500+ MAT questions in Marathi!"
      },
      
      // SAT (Scholastic Aptitude Test)
      {
        keywords: ['sat', 'scholastic', 'subjects', 'academics'],
        response: "SAT (Scholastic Aptitude Test) includes:\n• Mathematics\n• Science (Physics, Chemistry, Biology)\n• Social Studies (History, Geography, Civics)\n• English/Marathi Language\nWe provide 2500+ SAT questions covering all subjects!"
      },
      
      // Pricing
      {
        keywords: ['price', 'cost', 'subscription', 'plan', 'payment', 'fees'],
        response: "📊 PrepMark offers flexible pricing:\n• Monthly Plan: ₹299/month\n• Quarterly Plan: ₹799 (Save 11%)\n• Annual Plan: ₹2,499 (Save 30%)\n\nAll plans include:\n✓ Full access to 5000+ questions\n✓ Detailed analytics\n✓ Progress tracking\n✓ Mock tests"
      },
      
      // Free Trial
      {
        keywords: ['free', 'trial', 'demo', 'test it'],
        response: "Yes! We offer a 7-day FREE trial 🎉\nNo credit card required!\n\nDuring the trial you get:\n• Access to sample questions\n• 2 mock tests\n• Basic analytics\n• All features preview\n\nClick 'Pricing Plans' to start your free trial!"
      },
      
      // Features
      {
        keywords: ['feature', 'what can i do', 'capabilities', 'functions', 'how does it work', 'working'],
        response: "PrepMark Features:\n📚 5000+ Questions (Marathi & English)\n📊 Personalized Analytics\n🎯 Adaptive Learning System\n📈 Progress Tracking\n🏆 Performance Reports\n📱 Mobile & Tablet Support\n🔒 Safe & Ad-free Environment\n💯 Mock Tests"
      },
      
      // Quiz System
      {
        keywords: ['quiz', 'quizzes', 'how to take quiz', 'quiz system'],
        response: "📝 Quiz System:\n\nPrepMark offers 3 types of quizzes:\n\n1️⃣ Quick Practice (10-15 questions)\n• Topic-specific\n• Instant feedback\n• No time limit\n\n2️⃣ Chapter Tests (30-40 questions)\n• Complete chapter coverage\n• Timed practice\n• Detailed explanations\n\n3️⃣ Subject Tests (50+ questions)\n• Full subject practice\n• Real exam simulation\n• Performance analytics"
      },
      
      // Proctored Tests
      {
        keywords: ['proctored', 'proctoring', 'monitored test', 'exam mode', 'actual test'],
        response: "🎯 Proctored Test Mode:\n\nExperience REAL exam conditions!\n\n✅ Features:\n• Full-screen mode (no exit)\n• 90 minutes time limit\n• Auto-submit on timeout\n• Browser activity monitoring\n• No copy/paste allowed\n• Randomized questions\n• Anti-cheating measures\n\n📊 Results include:\n• Detailed scorecard\n• Answer analysis\n• Time per question\n• Comparison with toppers"
      },
      
      // MAT Subjects/Topics
      {
        keywords: ['mat topics', 'mat subjects', 'mental ability topics', 'mat syllabus'],
        response: "📚 MAT Topics Covered:\n\n1. Pattern Recognition\n2. Analogies & Similarities\n3. Classification & Odd One Out\n4. Number Series\n5. Letter Series\n6. Coding-Decoding\n7. Blood Relations\n8. Direction Sense\n9. Ranking & Arrangements\n10. Logical Venn Diagrams\n11. Mirror & Water Images\n12. Paper Folding & Cutting\n\n🎯 2500+ questions available!"
      },
      
      // SAT Subjects/Topics
      {
        keywords: ['sat topics', 'sat subjects', 'scholastic topics', 'sat syllabus'],
        response: "📚 SAT Subjects Covered:\n\n📐 Mathematics:\n• Arithmetic, Algebra, Geometry\n• Mensuration, Statistics\n\n🔬 Science:\n• Physics (Motion, Energy, Light)\n• Chemistry (Elements, Reactions)\n• Biology (Life Processes, Ecology)\n\n🌍 Social Studies:\n• History (Indian Freedom Movement)\n• Geography (Resources, Climate)\n• Civics (Constitution, Rights)\n\n📖 Language (English/Marathi)"
      },
      
      // How to Start
      {
        keywords: ['how to start', 'getting started', 'begin', 'first time'],
        response: "🚀 Getting Started with PrepMark:\n\n1️⃣ Create Account\n• Click 'Sign Up'\n• Choose Student/Parent role\n\n2️⃣ Complete Profile\n• Add your details\n• Select subjects\n\n3️⃣ Take Diagnostic Test\n• Assesses your level\n• Identifies weak areas\n\n4️⃣ Get Personalized Plan\n• Custom study schedule\n• Topic recommendations\n\n5️⃣ Start Learning!\n• Practice quizzes\n• Track progress"
      },
      
      // Time Management
      {
        keywords: ['time', 'timer', 'time limit', 'how long', 'duration'],
        response: "⏱️ Test Timings:\n\n📝 Practice Quizzes:\n• Quick Practice: Unlimited time\n• Chapter Tests: 30-45 minutes\n• Subject Tests: 60 minutes\n\n🎯 Proctored Mock Tests:\n• MAT Section: 90 minutes (90 Qs)\n• SAT Section: 90 minutes (90 Qs)\n• Full Test: 180 minutes (180 Qs)\n\n💡 Tip: Practice with timer to improve speed!"
      },
      
      // Scoring System
      {
        keywords: ['scoring', 'marks', 'points', 'grading', 'evaluation'],
        response: "📊 Scoring System:\n\n✅ Correct Answer: +1 mark\n❌ Wrong Answer: -0.25 (negative marking)\n⚪ Unattempted: 0 marks\n\n🎯 Performance Levels:\n• 90-100%: Excellent ⭐⭐⭐\n• 75-89%: Very Good ⭐⭐\n• 60-74%: Good ⭐\n• Below 60%: Needs Improvement\n\nDetailed solutions provided for all questions!"
      },
      
      // Solutions & Explanations
      {
        keywords: ['solution', 'answer', 'explanation', 'how to solve', 'detailed solution'],
        response: "📖 Solutions & Explanations:\n\nAfter completing any quiz:\n\n✅ Get instant access to:\n• Correct answers\n• Step-by-step solutions\n• Concept explanations\n• Tips & shortcuts\n• Related questions\n\n📱 Video explanations for difficult questions!\n\n💡 Review wrong answers to improve faster!"
      },
      
      // Leaderboard
      {
        keywords: ['leaderboard', 'rank', 'ranking', 'topper', 'competition'],
        response: "🏆 Leaderboard & Rankings:\n\nCompete with students across India!\n\n📊 Rankings based on:\n• Quiz accuracy\n• Test scores\n• Practice consistency\n• Mock test performance\n\n🎯 View rankings:\n• State-wise\n• District-wise\n• School-wise\n• All India\n\n⭐ Top 100 get special badges!"
      },
      
      // Certificates
      {
        keywords: ['certificate', 'achievement', 'award', 'completion'],
        response: "🏅 Certificates & Achievements:\n\nEarn certificates for:\n\n✅ Course Completion\n• Finish all topics in a subject\n\n✅ High Scores\n• Score 90%+ in proctored tests\n\n✅ Consistency\n• Practice 30 days continuously\n\n✅ Challenge Winner\n• Top 10 in monthly competitions\n\n📜 Download & share your achievements!"
      },
      
      // Study Plan
      {
        keywords: ['study plan', 'schedule', 'how to prepare', 'preparation'],
        response: "Recommended Study Plan:\n\n📅 Daily (30-45 mins):\n• Week 1-2: MAT Basics\n• Week 3-4: SAT Mathematics\n• Week 5-6: SAT Science\n• Week 7-8: SAT Social Studies\n• Week 9-10: Revision & Mock Tests\n\n💡 Tip: Take one mock test every week to track progress!"
      },
      
      // Practice Tests
      {
        keywords: ['test', 'practice', 'mock test', 'quiz', 'questions'],
        response: "Practice Tests Available:\n\n✅ Topic-wise Practice\n• MAT: 40+ topics\n• SAT: 50+ topics\n\n✅ Mock Tests\n• Full-length tests (180 questions)\n• Time-based simulation\n• Detailed solutions\n\nAccess from Home > Practice section!"
      },
      
      // Progress Tracking
      {
        keywords: ['progress', 'analytics', 'report', 'performance', 'score'],
        response: "Track Your Progress:\n\n📊 Analytics Dashboard shows:\n• Overall accuracy\n• Subject-wise performance\n• Time management\n• Weak areas\n• Improvement trends\n• Rank predictions\n\n👨‍👩‍👧 Parents can access reports too!"
      },
      
      // Marathi Language
      {
        keywords: ['marathi', 'मराठी', 'language', 'regional'],
        response: "हो! PrepMark मराठी मध्ये उपलब्ध आहे! 🎉\n\nAll 5000+ questions available in:\n• Marathi (मराठी)\n• English\n\nYou can switch language anytime from Settings. Our interface supports Devanagari script perfectly!"
      },
      
      // Contact/Support
      {
        keywords: ['contact', 'support', 'help', 'email', 'phone'],
        response: "Need Help? Contact Us:\n\n📧 Email: support@prepmark.com\n📞 Phone: +91-XXXXXXXXXX\n💬 Live Chat: Available 9 AM - 6 PM\n\nOr visit:\nContact Us page → Footer\n\nAverage response time: 2 hours!"
      },
      
      // Technical Issues
      {
        keywords: ['not working', 'error', 'bug', 'problem', 'issue'],
        response: "Sorry for the inconvenience! 😔\n\nQuick fixes:\n1. Refresh the page (F5)\n2. Clear browser cache\n3. Try different browser\n4. Check internet connection\n\nStill not working?\nEmail: support@prepmark.com\nWe'll resolve it within 24 hours!"
      },
      
      // Account
      {
        keywords: ['account', 'login', 'signup', 'register', 'password'],
        response: "Account Help:\n\n🆕 New User?\n→ Click 'Create Account'\n→ Choose Student/Parent role\n→ Complete registration\n\n🔐 Forgot Password?\n→ Click 'Forgot Password' on login\n→ Check your email\n\n👤 Profile settings available in dashboard!"
      },
      
      // Age/Eligibility
      {
        keywords: ['age', 'class', 'eligibility', 'who can use'],
        response: "PrepMark is perfect for:\n\n✅ Class 8 students (NMMS main target)\n✅ Class 6-7 (Advance preparation)\n✅ Class 9-10 (Skill building)\n\nAge: 11-16 years\n\nNote: Parental consent required for students under 13 years."
      },
      
      // Results
      {
        keywords: ['result', 'success rate', 'pass percentage', 'statistics'],
        response: "PrepMark Success Stats:\n\n🎯 92% Average Score Improvement\n⭐ 4.8/5 App Rating\n👥 50,000+ Active Users\n📚 15+ Comprehensive Lessons\n🏆 85% Students qualify NMMS\n\nOur students consistently outperform traditional methods!"
      },
      
      // Device Compatibility
      {
        keywords: ['mobile', 'tablet', 'device', 'app', 'download'],
        response: "PrepMark works on:\n\n📱 Mobile Phones (Android/iOS)\n💻 Laptops/Desktops\n📲 Tablets (iPad/Android)\n\nWeb App: works.prepmark.com\nAndroid App: Google Play Store\niOS App: App Store\n\nNo installation needed for web version!"
      },
      
      // Offline Access
      {
        keywords: ['offline', 'internet', 'without wifi', 'data'],
        response: "Internet Requirements:\n\n🌐 Online access needed for:\n• Loading questions\n• Saving progress\n• Analytics sync\n\n💡 Tip: Download our mobile app for:\n• Limited offline practice\n• Auto-sync when online\n\nMinimum 2G connection works fine!"
      },
      
      // Refund Policy
      {
        keywords: ['refund', 'money back', 'cancel', 'return'],
        response: "Refund Policy:\n\n✅ 7-day money-back guarantee\n✅ No questions asked\n✅ Full refund if not satisfied\n\nConditions:\n• Request within 7 days of purchase\n• Email: refund@prepmark.com\n• Processing time: 5-7 business days\n\nSee Refund Policy in footer for details."
      },
      
      // Default fallback
      {
        keywords: ['default'],
        response: "I'm here to help! You can ask me about:\n\n📚 NMMS Exam & Preparation\n💰 Pricing & Plans\n📊 Features & Analytics\n📱 Technical Support\n🎯 Study Plans\n📞 Contact Information\n\nWhat would you like to know?"
      }
    ];
    
    // Find matching response
    for (let item of knowledgeBase) {
      if (item.keywords.some(keyword => message.includes(keyword))) {
        return item.response;
      }
    }
    
    // Default response if no match found
    return knowledgeBase[knowledgeBase.length - 1].response;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className={`chatbot-button ${isOpen ? 'open' : ''}`} onClick={toggleChatbot}>
        <div className="robot-icon">🤖</div>
        {!isOpen && <div className="chat-pulse"></div>}
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div className="chatbot-panel">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-title">
              <span className="bot-avatar">🤖</span>
              PrepMark Assistant
            </div>
            <button className="close-btn" onClick={toggleChatbot}>×</button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-content">
                  <p>{message.text}</p>
                  <span className="message-time">{message.timestamp}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="message-input"
            />
            <button onClick={sendMessage} className="send-btn">
              <span>📤</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;