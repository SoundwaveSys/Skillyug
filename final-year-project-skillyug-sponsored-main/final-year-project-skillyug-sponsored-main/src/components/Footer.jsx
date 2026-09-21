import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-wave" aria-hidden="true">
        <svg className="footer-wave-svg" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <defs>
            {/* Animated gradient for illumination */}
            <linearGradient id="orange-glow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#cc4915" stopOpacity="1" />
              <stop offset="100%" stopColor="#cc4915" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="green-glow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(13, 131, 23)" stopOpacity="1" />
              <stop offset="100%" stopColor="rgb(13, 131, 23)" stopOpacity="1" />
            </linearGradient>
            {/* Softer, subtler glow */}
            <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {/* Main wave */}
          {/* <path fill="#0a174e" d="M0,64L48,53.3C96,43,192,21,288,26.7C384,32,480,64,576,80C672,96,768,96,864,85.3C960,75,1056,53,1152,53.3C1248,53,1344,75,1392,85.3L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" /> */}
          {/* Orange accent with varying thickness and glow */}
          <path fill="none" stroke="url(#orange-glow)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.95"
            filter="url(#glow)"
            strokeDasharray="40 20 60 30 80 20 60 40 100 30 60 20 80 40 60 30 100"
            strokeDashoffset="0">
            <animate attributeName="stroke-width" values="10;13;11;14;10" dur="6s" repeatCount="indefinite" />
            <animate attributeName="stroke-dashoffset" values="0;60;120;180;0" dur="7s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.95;1;0.85;1;0.95" dur="6s" repeatCount="indefinite" />
            <animate attributeName="d" values="M0,64L48,53.3C96,43,192,21,288,26.7C384,32,480,64,576,80C672,96,768,96,864,85.3C960,75,1056,53,1152,53.3C1248,53,1344,75,1392,85.3L1440,96;M0,64L48,53.3C96,43,192,21,288,30C384,36,480,68,576,84C672,100,768,100,864,89.3C960,79,1056,57,1152,57.3C1248,57,1344,79,1392,89.3L1440,100;M0,64L48,53.3C96,43,192,21,288,26.7C384,32,480,64,576,80C672,96,768,96,864,85.3C960,75,1056,53,1152,53.3C1248,53,1344,75,1392,85.3L1440,96" dur="10s" repeatCount="indefinite" />
          </path>
          {/* Green accent with varying thickness and glow */}
          <path fill="none" stroke="url(#green-glow)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.95"
            filter="url(#glow)" transform="translate(0,10)"
            strokeDasharray="60 30 40 20 80 40 60 30 100 20 60 40 80 30 60 20 100"
            strokeDashoffset="0">
            <animate attributeName="stroke-width" values="10;13;11;14;10" dur="6s" repeatCount="indefinite" />
            <animate attributeName="stroke-dashoffset" values="0;80;160;240;0" dur="7s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.95;1;0.85;1;0.95" dur="6s" repeatCount="indefinite" />
            <animate attributeName="d" values="M0,64L48,53.3C96,43,192,21,288,26.7C384,32,480,64,576,80C672,96,768,96,864,85.3C960,75,1056,53,1152,53.3C1248,53,1344,75,1392,85.3L1440,96;M0,64L48,53.3C96,43,192,21,288,30C384,36,480,68,576,84C672,100,768,100,864,89.3C960,79,1056,57,1152,57.3C1248,57,1344,79,1392,89.3L1440,100;M0,64L48,53.3C96,43,192,21,288,26.7C384,32,480,64,576,80C672,96,768,96,864,85.3C960,75,1056,53,1152,53.3C1248,53,1344,75,1392,85.3L1440,96" dur="10s" repeatCount="indefinite" />
          </path>
        </svg>
      </div>
  <div className="footer-content" style={{ marginTop: '32px' }}>
        <div className="footer-section company">
          <h2>Company</h2>
          <ul>
            <li><Link to="/about-us">About Us</Link></li>
            <li><Link to="/contact-us">Contact Us</Link></li>
          </ul>
        </div>
        <div className="footer-section links">
          <h2>Links</h2>
          <ul>
            
            <li><Link to="/terms-conditions">Terms and Conditions</Link></li>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/refund-policy">Refund and Cancellation Policy</Link></li>
          </ul>
        </div>
        <div className="footer-section download">
          <h2>Download App</h2>
          <div className="footer-apps">
            <a href="https://github.com/Sumdiboii" target="_blank" rel="noopener noreferrer">
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="footer-app-icon" />
            </a>
            <a href="https://github.com/Sumdiboii" target="_blank" rel="noopener noreferrer">
              <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" className="footer-app-icon" />
            </a>
          </div>
        </div>
        <div className="footer-section follow">
          <h2>Follow Us</h2>
          <div className="footer-socials">
            <a href="https://github.com/Sumdiboii" target="_blank" rel="noopener noreferrer"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" className="footer-social-icon" /></a>
            <a href="https://github.com/Sumdiboii" target="_blank" rel="noopener noreferrer"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" className="footer-social-icon" /></a>
            <a href="https://github.com/Sumdiboii" target="_blank" rel="noopener noreferrer"><img src="https://cdn-icons-png.flaticon.com/512/145/145807.png" alt="LinkedIn" className="footer-social-icon" /></a>
            <a href="https://github.com/Sumdiboii" target="_blank" rel="noopener noreferrer"><img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube" className="footer-social-icon" /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>&copy; 2025 All Rights Reserved</span>
      </div>
    </footer>
  );
};

export default Footer;
