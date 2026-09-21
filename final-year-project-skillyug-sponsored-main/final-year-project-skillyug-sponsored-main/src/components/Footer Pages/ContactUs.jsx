import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Footer Pages/ContactUs.css';
import ParticleBackground from '../StarBg';
import Navbar from '../Navbar';
import Footer from '../Footer';

const ContactUs = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    message: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ email: '', message: '' });
  };

  const handleNavigation = (path) => {
    window.scrollTo(0, 0);
    navigate(path);
  };

  return (
    <>
      <Navbar />
      
      <div className="contus-contact-wrap">
        
        
        <div className="contus-contact-container">
          <div className="contus-contact-hero">
            <h1 className="contus-contact-title">Contact Us</h1>
            <p className="contus-contact-sub">Get in touch with Skillyug Education</p>
          </div>

          <div className="contus-contact-grid">
            {/* Contact Info & Map Section */}
            <div className="contus-contact-left">
              <div className="contus-contact-info-card">
                
                <div className="contus-info-list">
                  <div className="contus-info-item">
                    <span className="contus-info-icon">📧</span>
                    <div>
                      <h3>Email - support@skillyug.com</h3>
                      
                    </div>
                  </div>
                  <div className="contus-info-item">
                    <span className="contus-info-icon">📱</span>
                    <div>
                      <h3>Phone - +91 9876543210</h3>
                      
                    </div>
                  </div>
                </div>
              </div>

              <div className="contus-map-container">
                <iframe
                  title="Skillyug Education Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248849.886539092!2d77.49085284872588!3d12.953945614926863!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1733154000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: '20px' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>

            {/* Contact Form Section */}
            <div className="contus-contact-right">
              <div className="contus-form-card">
                <h2>Send us a Message</h2>
                <form onSubmit={handleSubmit} className="contus-contact-form">
                  <div className="contus-form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Your email address"
                    />
                  </div>

                  <div className="contus-form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="8"
                      placeholder="Your message..."
                    ></textarea>
                  </div>

                  <button type="submit" className="contus-btn btn-primary">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactUs;

