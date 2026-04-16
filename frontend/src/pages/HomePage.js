import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';
import BannerSlider from '../components/BannerSlider';

const HomePage = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const handleBrowseServices = () => {
    if (isLoggedIn) {
      navigate('/services');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="home-page">
      {/* Banner Slider Section */}
      <BannerSlider />

      {/* Services Preview Section */}
      <section className="services-preview glass-section">
        <h2>Our Services</h2>
        <div className="services-grid">
          <div className="service-card glass-card">
            <span className="service-icon">💇‍♀️</span>
            <h3>Hair Styling</h3>
            <p>Professional cuts and styling for all hair types</p>
          </div>
          <div className="service-card glass-card">
            <span className="service-icon">💅</span>
            <h3>Nail Care</h3>
            <p>Manicures, pedicures, and nail art</p>
          </div>
          <div className="service-card glass-card">
            <span className="service-icon">✨</span>
            <h3>Facial</h3>
            <p>Rejuvenating treatments for glowing skin</p>
          </div>
        </div>
        <button className="cta-button" onClick={handleBrowseServices}>
          View All Services
        </button>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-us glass-section">
        <h2>Why Choose Us</h2>
        <div className="features-grid">
          <div className="feature-card glass-card">
            <span className="feature-icon">⭐</span>
            <h3>Expert Staff</h3>
            <p>Highly trained professionals</p>
          </div>
          <div className="feature-card glass-card">
            <span className="feature-icon">🌟</span>
            <h3>Premium Products</h3>
            <p>Top quality beauty products</p>
          </div>
          <div className="feature-card glass-card">
            <span className="feature-icon">💫</span>
            <h3>Modern Facilities</h3>
            <p>State-of-the-art equipment</p>
          </div>
          <div className="feature-card glass-card">
            <span className="feature-icon">✨</span>
            <h3>Relaxing Atmosphere</h3>
            <p>Comfortable and luxurious space</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section glass-section">
        <h2>Ready to Transform?</h2>
        <p>Book your appointment today and experience luxury beauty services</p>
        <div className="cta-buttons">
          <button className="primary-button" onClick={handleBrowseServices}>
            Book Appointment
          </button>
          <Link to="/contact" className="secondary-button">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;