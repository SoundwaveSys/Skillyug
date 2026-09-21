import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css files/Syllabus.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ParticleBackground from "../components/StarBg";

const matSyllabus = [
  { icon: "🔗", title: "Analogy", desc: "Word, number, and figure analogies" },
  { icon: "🎯", title: "Classification", desc: "Odd one out - identify the different element" },
  { icon: "🔢", title: "Number & Letter Series", desc: "Complete the sequence patterns" },
  { icon: "�", title: "Coding-Decoding", desc: "Decode patterns and encrypted messages" },
  { icon: "👁️", title: "Pattern Perception", desc: "Identify and complete visual patterns" },
  { icon: "�️", title: "Hidden Figures", desc: "Find embedded shapes and figures" },
  { icon: "👨‍👩‍👧‍👦", title: "Blood Relations", desc: "Family relationship problems" },
  { icon: "🧭", title: "Direction Sense", desc: "Navigation and directional reasoning" },
  { icon: "🧩", title: "Logical & Mathematical Puzzles", desc: "Critical thinking and problem-solving" },
  { icon: "🔄", title: "Spatial Visualization", desc: "Mirror images, folding/unfolding patterns" },
];

const satSyllabus = [
  {
    category: "Mathematics",
    icon: "�",
    topics: [
      "Integers, Fractions, Decimals, Rational Numbers",
      "Exponents & Powers",
      "Algebra (expressions, simple equations, identities)",
      "Geometry (triangles, quadrilaterals, circles, constructions)",
      "Mensuration (perimeter, area, surface area, volume)",
      "Profit & Loss, Percentage, Ratio & Proportion",
      "Simple & Compound Interest",
      "Data Handling (graphs, probability basics)"
    ]
  },
  {
    category: "Science",
    icon: "🔬",
    topics: [
      "Nutrition in Plants & Animals",
      "Heat, Light, Sound",
      "Acids, Bases & Salts",
      "Physical & Chemical Changes",
      "Motion & Time, Force & Pressure",
      "Reproduction in Plants & Animals",
      "Microorganisms",
      "Cell Structure & Human Body Systems",
      "Pollution & Conservation of Environment",
      "Solar System, Stars & Universe"
    ]
  },
  {
    category: "Social Science",
    icon: "🌍",
    topics: [
      "History: Medieval to Modern India, Revolutions, Colonialism",
      "National Movement",
      "Geography: Resources, Agriculture, Industries",
      "Land, Soil, Water, Natural & Human Environment",
      "Civics/Polity: Constitution, Democracy, Rights & Duties",
      "Government & Judiciary, Social Justice",
      "Economics: Basic economic concepts, rural/urban livelihoods",
      "Markets, human resources"
    ]
  }
];

const Syllabus = () => {
  const [activeTab, setActiveTab] = useState("MAT");
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDownloadApp = () => {
    window.scrollTo(0, 0); // Scroll to top before navigation
    navigate("/");
  };

  const handleStartTrial = () => {
    window.scrollTo(0, 0); // Scroll to top before navigation
    navigate("/pricing");
  };

  return (
    <div className="syl-syllabus-page">
      <Navbar />
      <ParticleBackground />

      {/* Educational Objective Section */}
      <div className="syl-main-syllabus-cont">
        <div className="syl-objective-content">
          <div className="syl-objective-header">
            <h1 className="syl-objective-title">Educational Objectives</h1>
            <div className="syl-objective-subtitle">Empowering Students Through Quality Education</div>
          </div>
          
          <div className="syl-objectives-grid">
            <div className="syl-objective-card">
              <div className="syl-objective-icon">🎯</div>
              <h3>Academic Excellence</h3>
              <p>Prepare students for competitive examinations like NMMS with comprehensive study materials and practice tests</p>
            </div>
            
            <div className="syl-objective-card">
              <div className="syl-objective-icon">🧠</div>
              <h3>Critical Thinking</h3>
              <p>Develop analytical and logical reasoning skills through structured mental ability training and problem-solving techniques</p>
            </div>
            
            <div className="syl-objective-card">
              <div className="syl-objective-icon">📚</div>
              <h3>Holistic Learning</h3>
              <p>Provide balanced education covering Mathematics, Science, and Social Studies aligned with NCERT curriculum</p>
            </div>
            
            <div className="syl-objective-card">
              <div className="syl-objective-icon">💰</div>
              <h3>Affordable Learning</h3>
              <p>Make quality education accessible to all students through cost-effective learning solutions and scholarship opportunities</p>
            </div>
            
            <div className="syl-objective-card">
              <div className="syl-objective-icon">💻</div>
              <h3>E-Learning Promotion</h3>
              <p>Leverage digital technology to deliver interactive online courses, virtual classrooms, and mobile learning experiences</p>
            </div>
            
            <div className="syl-objective-card">
              <div className="syl-objective-icon">🌟</div>
              <h3>Future Ready</h3>
              <p>Equip students with essential skills and knowledge to excel in higher education and professional careers</p>
            </div>
          </div>
        </div>
      </div>

      {/* NMMS Syllabus Section */}
      <div className="syl-sub1-syllabus-cont">
        <div className="syl-syllabus-content">
          <div className="syl-syllabus-header">
            <h2 className="syl-syllabus-title">📘 NMMS Exam Syllabus</h2>
            <p className="syl-syllabus-description">
              Comprehensive syllabus for National Means-cum-Merit Scholarship examination
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="syl-tab-navigation">
            <button 
              className={`syl-tab-btn ${activeTab === "MAT" ? "active" : ""}`}
              onClick={() => setActiveTab("MAT")}
            >
              🧠 Mental Ability Test (MAT)
            </button>
            <button 
              className={`syl-tab-btn ${activeTab === "SAT" ? "active" : ""}`}
              onClick={() => setActiveTab("SAT")}
            >
              📚 Scholastic Aptitude Test (SAT)
            </button>
          </div>

          {/* MAT Content */}
          {activeTab === "MAT" && (
            <div className="syl-tab-content">
              <div className="syl-tab-description">
                <p>Covers reasoning and problem-solving skills</p>
              </div>
              <div className="syl-syllabus-grid">
                {matSyllabus.map((item, index) => (
                  <div key={index} className="syl-syllabus-card">
                    <div className="syl-card-icon">{item.icon}</div>
                    <h4 className="syl-card-title">{item.title}</h4>
                    <p className="syl-card-description">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SAT Content */}
          {activeTab === "SAT" && (
            <div className="syl-tab-content">
              <div className="syl-tab-description">
                <p>Based on Class 7 & 8 NCERT/State syllabus</p>
              </div>
              <div className="syl-sat-subjects">
                {satSyllabus.map((subject, index) => (
                  <div key={index} className="syl-subject-section">
                    <div className="syl-subject-header">
                      <span className="syl-subject-icon">{subject.icon}</span>
                      <h3 className="syl-subject-title">{subject.category}</h3>
                    </div>
                    <div className="syl-topics-grid">
                      {subject.topics.map((topic, topicIndex) => (
                        <div key={topicIndex} className="syl-topic-item">
                          <span className="syl-topic-bullet"></span>
                          <span className="syl-topic-text">{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    
      
      

      <Footer />
    </div>
  );
};export default Syllabus;

