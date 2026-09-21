import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Footer Pages/PrivacyPolicy.css';
import ParticleBackground from '../StarBg';
import Navbar from '../Navbar';
import Footer from '../Footer';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleNavigation = (path) => {
    window.scrollTo(0, 0);
    navigate(path);
  };

  const privacySections = [
    {
      icon: '🔍',
      title: 'Information Collection',
      description: 'We collect personal information (name, email, phone), usage data, and payment information necessary to provide our educational services.'
    },
    {
      icon: '🎯',
      title: 'Data Usage',
      description: 'Your data helps us personalize your learning experience, track progress, improve our platform, and provide customer support.'
    },
    {
      icon: '🛡️',
      title: 'Security',
      description: 'We use industry-standard encryption, secure storage, and access controls to protect your personal information.'
    },
    {
      icon: '🤝',
      title: 'Information Sharing',
      description: 'We never sell your data. We only share information with service providers, for legal requirements, or with your explicit consent.'
    },
    {
      icon: '👑',
      title: 'Your Rights',
      description: 'You have the right to access, correct, delete, and export your data. Contact us to exercise these rights.'
    },
    {
      icon: '🍪',
      title: 'Cookies',
      description: 'We use essential, performance, and preference cookies to enhance your experience. You can manage cookie settings in your browser.'
    }
  ];

  return (
    <>
      <Navbar />
      <div className="privpol-privacy-wrap">
        
        
        <div className="privpol-privacy-container">
          <div className="privpol-privacy-hero">
            <h1 className="privpol-privacy-title">Privacy Policy</h1>
            <p className="privpol-privacy-sub">Your privacy is our priority</p>
            <p className="privpol-privacy-date">Last Updated: January 2024</p>
          </div>

          <div className="privpol-privacy-intro">
            <p>
              At Skillyug Education, we are committed to protecting your personal information and your right to privacy. 
              This Privacy Policy explains how we collect, use, and safeguard your data when you use PrepMark and our educational services.
            </p>
          </div>

          <div className="privpol-privacy-cards">
            {privacySections.map((section, index) => (
              <div key={index} className="privpol-privacy-card">
                <div className="privpol-card-icon">{section.icon}</div>
                <h2>{section.title}</h2>
                <p>{section.description}</p>
              </div>
            ))}
          </div>

          
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;

