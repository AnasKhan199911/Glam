// ===== CONTACT US PAGE COMPONENT =====
// This page allows users to contact the salon
// It has a contact form, location info, hours, and contact details

import React, { useState } from 'react';
import '../pages/ContactUs.css';
import { useToast } from '../components/ToastContainer';

// ContactUs is the main component for the contact page
export default function ContactUs() {
  const { showSuccess, showWarning } = useToast();
  // formData state stores the contact form inputs
  // Includes: name, email, phone, subject, message
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  // formSubmitted state tracks if form was successfully submitted
  const [formSubmitted, setFormSubmitted] = useState(false);

  // handleInputChange updates formData when user types in input fields
  // Automatically updates the specific field that changed
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // handleSubmit processes the form submission
  // Validates that all fields are filled in
  // Shows success message if form is valid
  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if all fields are filled
    if (!formData.name || !formData.email || !formData.phone || !formData.subject || !formData.message) {
      showWarning('Please fill in all fields');
      return;
    }

    // In a real app, this would send data to a server
    // For now, we just show a success message
    console.log('Contact form submitted:', formData);

    // Show success message
    setFormSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setFormSubmitted(false);
    }, 3000);
  };

  return (
    <div className="contact-page">
      {/* Contact header section */}
      <div className="contact-header">
        <h1>📞 Get In Touch</h1>
        <p>We'd love to hear from you! Send us a message and we'll respond as soon as possible.</p>
      </div>

      <div className="contact-container">
        {/* Contact form section - left side on desktop */}
        <div className="contact-form-section">
          <h2>Send us a Message</h2>

          {/* Show success message if form was submitted */}
          {formSubmitted && (
            <div className="success-message">
              ✅ Thank you! Your message has been sent. We'll get back to you soon!
            </div>
          )}

          {/* Contact form with all input fields */}
          <form onSubmit={handleSubmit} className="contact-form">
            {/* Name input field */}
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
              />
            </div>

            {/* Email input field */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
              />
            </div>

            {/* Phone input field */}
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
              />
            </div>

            {/* Subject input field */}
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="What is this about?"
              />
            </div>

            {/* Message textarea field */}
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Type your message here..."
                rows="6"
              ></textarea>
            </div>

            {/* Submit button */}
            <button type="submit" className="submit-btn">
              Send Message
            </button>
          </form>
        </div>

        {/* Contact information section - right side on desktop */}
        <div className="contact-info-section">
          <h2>Contact Information</h2>

          {/* Address card */}
          <div className="info-card">
            <div className="info-icon">📍</div>
            <h3>Address</h3>
            <p>123 Beauty Lane<br />Fashion District<br />New York, NY 10001</p>
          </div>

          {/* Phone card */}
          <div className="info-card">
            <div className="info-icon">☎️</div>
            <h3>Phone</h3>
            <p>Main: +1 (555) 123-4567<br />Whatsapp: +1 (555) 234-5678</p>
          </div>

          {/* Email card */}
          <div className="info-card">
            <div className="info-icon">✉️</div>
            <h3>Email</h3>
            <p>info@glamconnect.com<br />support@glamconnect.com</p>
          </div>

          {/* Hours card */}
          <div className="info-card">
            <div className="info-icon">⏰</div>
            <h3>Business Hours</h3>
            <p>Monday - Friday: 10:00 AM - 7:00 PM<br />
               Saturday: 10:00 AM - 8:00 PM<br />
               Sunday: 12:00 PM - 6:00 PM<br />
               <strong>Closed on Holidays</strong></p>
          </div>

          {/* Follow us section */}
          <div className="social-links">
            <h3>Follow Us</h3>
            <div className="social-icons">
              <a href="#facebook" className="social-icon">f</a>
              <a href="#instagram" className="social-icon">📷</a>
              <a href="#twitter" className="social-icon">𝕏</a>
              <a href="#youtube" className="social-icon">▶</a>
            </div>
          </div>
        </div>
      </div>

      {/* Map placeholder section */}
      <div className="map-section">
        <h2>Our Location</h2>
        <div className="map-placeholder">
          <div style={{fontSize: '48px', marginBottom: '10px'}}>🗺️</div>
          <p>Map Integration Placeholder</p>
          <p style={{fontSize: '14px', color: '#999'}}>In a real app, Google Maps would be embedded here</p>
        </div>
      </div>
    </div>
  );
}
