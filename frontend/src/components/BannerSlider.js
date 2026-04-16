import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BannerSlider.css';

const BannerSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const slides = [
    {
      title: "Transform Your Look",
      subtitle: "Premium Hair Styling & Treatments",
      description: "Experience luxury beauty services tailored just for you",
      buttonText: "Book Now",
      action: () => navigate(isLoggedIn ? '/services' : '/auth'),
      image: `${process.env.PUBLIC_URL || ''}/hero-img-1.jpg`
    },
    {
      title: "Pamper Yourself",
      subtitle: "Relaxing Spa & Wellness",
      description: "Discover our range of rejuvenating treatments",
      buttonText: "View Services",
      action: () => navigate('/services'),
      image: `${process.env.PUBLIC_URL || ''}/hero-img-2.jpg`
    },
    {
      title: "Professional Care",
      subtitle: "Expert Beauty Services",
      description: "Let our skilled professionals take care of you",
      buttonText: "Learn More",
      action: () => navigate('/about'),
      image: `${process.env.PUBLIC_URL || ''}/hero-img-3.jpg`
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="banner-slider">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`slide ${index === currentSlide ? 'active' : ''}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="slide-content glass-effect">
            <h1>{slide.title}</h1>
            <h2>{slide.subtitle}</h2>
            <p>{slide.description}</p>
            <button className="slide-button" onClick={slide.action}>{slide.buttonText}</button>
          </div>
        </div>
      ))}
      
      <div className="slider-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => handleDotClick(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerSlider;