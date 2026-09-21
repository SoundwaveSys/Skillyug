import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Terms.css';
import ParticleBackground from '../StarBg';
import Navbar from '../Navbar';
import Footer from '../Footer';

const Terms = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleNavigation = (path) => {
    window.scrollTo(0, 0);
    navigate(path);
  };

  const termsSections = [
    {
      icon: '📋',
      title: 'Acceptance of Terms',
      description: 'By accessing and using our platform, you agree to these Terms and Conditions. Users must be at least 13 years old with parental consent required for those under 18.'
    },
    {
      icon: '🎓',
      title: 'Educational Services',
      description: 'We provide comprehensive MAT and SAT preparation materials, interactive learning modules, practice tests, progress tracking, and expert guidance to help you succeed.'
    },
    {
      icon: '👤',
      title: 'User Responsibilities',
      description: 'Maintain account security, provide accurate information, and use the platform for educational purposes only. Prohibited activities include credential sharing and content distribution.'
    },
    {
      icon: '💳',
      title: 'Subscription & Payment',
      description: 'Flexible monthly and annual plans with secure payment processing. All fees are non-refundable except as stated in our Refund Policy. Subscriptions auto-renew unless cancelled.'
    },
    {
      icon: '📚',
      title: 'Intellectual Property',
      description: 'All educational materials are owned by Skillyug and protected by copyright. You may use content for personal study but cannot redistribute or use commercially.'
    },
    {
      icon: '🔒',
      title: 'Privacy & Data',
      description: 'We protect your personal information with encryption and secure storage. We never sell your data. Review our Privacy Policy for complete details on data handling.'
    },
    {
      icon: '⚖️',
      title: 'Limitation of Liability',
      description: 'Services provided "as is" without warranties. We cannot guarantee specific exam outcomes. Our liability is limited to the amount you paid for services.'
    },
    {
      icon: '🔄',
      title: 'Modifications',
      description: 'We may update these terms with 30 days notice. You may cancel your account anytime. We reserve the right to suspend accounts for terms violations.'
    },
    {
      icon: '🌍',
      title: 'Governing Law',
      description: 'These terms are governed by Indian law. Disputes resolved through arbitration in New Delhi, India. English version controls in case of translations.'
    }
  ];

  return (
    <>
      <Navbar />
      <div className="trms-terms-wrap">
       
        
        <div className="trms-terms-container">
          <div className="trms-terms-hero">
            <h1 className="trms-terms-title">Terms & Conditions</h1>
            <p className="trms-terms-sub">Your rights and responsibilities on our platform</p>
            <p className="trms-terms-date">Last Updated: January 2024</p>
          </div>

          <div className="trms-terms-intro">
            <p>
              By using Skillyug Education's PrepMark platform, you agree to these Terms and Conditions. 
              Please read them carefully to understand your rights and obligations when accessing our educational services.
            </p>
          </div>

          <div className="trms-terms-cards">
            {termsSections.map((section, index) => (
              <div key={index} className="trms-terms-card">
                <div className="trms-card-icon">{section.icon}</div>
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

export default Terms;


