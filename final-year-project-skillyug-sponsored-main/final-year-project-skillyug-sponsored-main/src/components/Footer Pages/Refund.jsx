import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Footer';
import Navbar from '../Navbar';
import ParticleBackground from '../StarBg';

import '../Footer Pages/Refund.css';

const Refund = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleNavigation = (path) => {
    window.scrollTo(0, 0);
    navigate(path);
  };

  const refundSections = [
    {
      icon: '🚫',
      title: 'No Refund Policy',
      description: 'All payments for our educational services are final and non-refundable. Once processed, payments cannot be reversed or credited back under any circumstances.'
    },
    {
      icon: '⏰',
      title: 'Instant Access',
      description: 'Digital content and premium features are delivered immediately upon payment. This instant delivery makes all transactions final and non-reversible.'
    },
    {
      icon: '❌',
      title: 'No Exceptions',
      description: 'Our no-refund policy applies to all situations including technical issues, change of mind, exam results, duplicate payments, unused services, or billing disputes.'
    },
    {
      icon: '🔄',
      title: 'Cancellation Policy',
      description: 'You may cancel your subscription anytime to prevent future charges. However, no refunds will be issued for the current billing period or any previous charges.'
    },
    {
      icon: '💳',
      title: 'Account Credits',
      description: 'For billing errors or duplicate payments, we provide account credits for future use instead of refunds. These credits can be applied to any of our services.'
    },
    {
      icon: '🛠️',
      title: 'Technical Support',
      description: 'We offer comprehensive 24/7 technical support to resolve any platform or content issues. Support is provided instead of refunds for technical problems.'
    },
    {
      icon: '✅',
      title: 'Before Purchase',
      description: 'Review course content, check system requirements, and try free resources before purchasing. Contact support with any questions to make an informed decision.'
    },
    {
      icon: '🎯',
      title: 'Plan Upgrades',
      description: 'You can upgrade your subscription plan anytime by paying the difference. Downgrades take effect in the next billing cycle with no refunds for the current period.'
    },
    {
      icon: '⚖️',
      title: 'Legal Agreement',
      description: 'By completing payment, you acknowledge and agree to this no-refund and cancellation policy. This agreement is binding and forms part of our Terms of Service.'
    }
  ];

  return (
    <>
      <Navbar />
      <div className="refnd-refund-wrap">
        
        
        <div className="refnd-refund-container">
          <div className="refnd-refund-hero">
            <h1 className="refnd-refund-title">Refund & Cancellation Policy</h1>
            <p className="refnd-refund-sub">All payments are final - Read before purchase</p>
            <p className="refnd-refund-date">Last Updated: January 2024</p>
          </div>

          <div className="refnd-refund-intro">
            <p>
              At Skillyug Education, all payments made for our educational services are final and non-refundable. 
              This policy ensures fair pricing for all users and allows us to maintain high-quality educational content. 
              Please review this policy carefully before making any purchase.
            </p>
          </div>

          <div className="refnd-refund-cards">
            {refundSections.map((section, index) => (
              <div key={index} className="refnd-refund-card">
                <div className="refnd-card-icon">{section.icon}</div>
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

export default Refund;

