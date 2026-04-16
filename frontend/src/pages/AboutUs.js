import React, { useState, useEffect } from 'react';
import axios from '../api/axiosConfig';
import './AboutUs.css';

// ===== ABOUT US COMPONENT =====
// This page tells the story of GlamConnect salon
// Shows mission, vision, team, and why customers should choose us

const AboutUs = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const resp = await axios.post('/staff/get-all');
        if (resp.data && resp.data.success) {
          // Only show active staff members on the About page
          setStaff(resp.data.staff.filter(s => s.is_active));
        }
      } catch (err) {
        console.error('Error fetching staff:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  return (
    <div className="about-us-page">
      {/* ===== HEADER SECTION ===== */}
      <div className="about-header">
        <h1>About GlamConnect</h1>
        <p>Discover Our Story and Vision</p>
      </div>

      {/* ===== OUR STORY SECTION ===== */}
      <section className="our-story">
        <div className="story-content">
          <div className="story-text">
            <h2>Our Story</h2>
            <p>
              GlamConnect was founded in 2020 with a simple mission: to provide world-class beauty 
              and wellness services in an inclusive, welcoming environment. What started as a small 
              salon with just 3 stylists has grown into a thriving unisex salon with a team of 15+ 
              passionate professionals.
            </p>
            <p>
              We believe that everyone deserves to feel beautiful and confident. That's why we've 
              created a space where clients of all backgrounds can come to relax, rejuvenate, and 
              express their unique style.
            </p>
          </div>
          <div className="story-image">
            <div className="image-placeholder">🏢</div>
          </div>
        </div>
      </section>

      {/* ===== MISSION & VISION SECTION ===== */}
      <section className="mission-vision">
        <h2>Our Mission & Vision</h2>
        <div className="mission-grid">
          <div className="mission-card">
            <div className="mission-icon">🎯</div>
            <h3>Our Mission</h3>
            <p>
              To provide exceptional beauty and wellness services while creating a welcoming 
              community where everyone feels valued, respected, and beautiful.
            </p>
          </div>
          <div className="mission-card">
            <div className="mission-icon">🌟</div>
            <h3>Our Vision</h3>
            <p>
              To be the most trusted and innovative unisex salon, known for our expert professionals, 
              premium products, and outstanding customer care.
            </p>
          </div>
        </div>
      </section>

      {/* ===== OUR VALUES SECTION ===== */}
      <section className="our-values">
        <h2>Our Core Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon">💎</div>
            <h3>Excellence</h3>
            <p>We're committed to delivering the highest quality services every single time.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">❤️</div>
            <h3>Care</h3>
            <p>We genuinely care about our clients' needs and well-being.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">🤝</div>
            <h3>Inclusivity</h3>
            <p>We celebrate diversity and welcome everyone with open arms.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">🔄</div>
            <h3>Innovation</h3>
            <p>We stay updated with latest trends and techniques in the beauty industry.</p>
          </div>
        </div>
      </section>

      {/* ===== TEAM SECTION ===== */}
      <section className="our-team">
        <h2>Meet Our Team</h2>
        <p className="team-intro">
          Our talented team of professionals is dedicated to making you look and feel your best
        </p>
        
        {loading ? (
          <div className="team-loading">Loading our amazing team...</div>
        ) : staff.length === 0 ? (
          <div className="team-empty">Our team is growing. Check back soon!</div>
        ) : (
          <div className="team-grid">
            {staff.map((member) => (
              <div key={member.id} className="team-member">
                <div className="member-avatar">
                  {member.profile_image ? (
                    <img src={member.profile_image} alt={member.full_name} className="member-img" />
                  ) : (
                    <div className="member-avatar-placeholder">
                      {member.role === 'stylist' ? '💇‍♀️' : 
                       member.role === 'beautician' ? '💄' : 
                       member.role === 'therapist' ? '🧖‍♀️' : '👤'}
                    </div>
                  )}
                </div>
                <h3>{member.full_name}</h3>
                <p className="member-role">
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1).replace('_', ' ')}
                </p>
                <p className="member-bio">
                  {member.specialization ? `${member.specialization} • ` : ''}
                  {member.experience_years > 0 ? `${member.experience_years}+ years experience` : member.bio}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== WHY CHOOSE US SECTION ===== */}
      <section className="why-choose-section">
        <h2>Why Choose GlamConnect?</h2>
        <div className="reasons-grid">
          <div className="reason">
            <span className="reason-number">01</span>
            <h3>Expert Team</h3>
            <p>Highly trained professionals with years of industry experience</p>
          </div>
          <div className="reason">
            <span className="reason-number">02</span>
            <h3>Premium Quality</h3>
            <p>Using only the best and most luxurious products</p>
          </div>
          <div className="reason">
            <span className="reason-number">03</span>
            <h3>Personalized Service</h3>
            <p>Each service is customized to meet your unique needs</p>
          </div>
          <div className="reason">
            <span className="reason-number">04</span>
            <h3>Affordable Luxury</h3>
            <p>Premium services at competitive prices</p>
          </div>
          <div className="reason">
            <span className="reason-number">05</span>
            <h3>Comfortable Environment</h3>
            <p>Relaxing atmosphere designed for your comfort</p>
          </div>
          <div className="reason">
            <span className="reason-number">06</span>
            <h3>Easy Booking</h3>
            <p>Book appointments online anytime, anywhere</p>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS SECTION ===== */}
      <section className="testimonials-section">
        <h2>What Our Clients Say</h2>
        <div className="testimonials-container">
          <div className="testimonial">
            <p className="testimonial-quote">
              "GlamConnect completely transformed my look! The team is so professional and friendly. 
              Highly recommended!"
            </p>
            <p className="testimonial-author">- Priya Sharma</p>
          </div>
          <div className="testimonial">
            <p className="testimonial-quote">
              "Best salon experience ever! The staff made me feel so comfortable and the results were 
              absolutely amazing."
            </p>
            <p className="testimonial-author">- Arun Patel</p>
          </div>
          <div className="testimonial">
            <p className="testimonial-quote">
              "I've been coming here for 2 years and I love it. The quality of service is consistent 
              and always excellent!"
            </p>
            <p className="testimonial-author">- Mira Singh</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
