import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import { useToast } from '../components/ToastContainer';
import './Services.css';

const Services = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();
  const isLoggedIn = !!localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [bookingData, setBookingData] = useState({ date: '', time: '', notes: '' });
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState([]);
  const [fetchingDates, setFetchingDates] = useState(false);

  // Fetch services from database and poll for real-time updates
  useEffect(() => {
    fetchServices();
    
    // Poll every 5 seconds for real-time service updates (e.g., admin adding/editing)
    const intervalId = setInterval(() => {
      fetchServices(true); // pass true to indicate silent background fetch
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  const fetchServices = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const resp = await axios.post('/services/get-all', {});
      
      if (resp.data && resp.data.success) {
        const dbServices = resp.data.services || [];
        
        // Map database services to UI format - show ALL services (active and inactive)
        const mappedServices = dbServices.map(service => {
          const isActive = service.is_active === 1 || service.is_active === '1' || service.is_active === true;
          return {
            id: service.id,
            name: service.service_name || service.name,
            category: service.category || 'Hair',
            price: parseFloat(service.price),
            duration: service.duration || '30 mins',
            description: service.description,
            image: service.image || service.image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop',
            is_active: isActive,
            rating: 4.8,
            reviews: Math.floor(Math.random() * 200) + 20,
          };
        });
        
        setServices(mappedServices);
        
        if (mappedServices.length === 0 && !isBackground) {
          showWarning('No services found. Please check back later.');
        }
      } else {
        if (!isBackground) showWarning('No services available');
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      if (!isBackground) showError('Failed to load services: ' + (err.response?.data?.message || err.message));
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const categories = ['All', 'Hair', 'Nails', 'Makeup', 'Skincare', 'Spa'];
  
  const filteredServices = activeCategory === 'All' 
    ? services 
    : services.filter(s => s.category === activeCategory);

  const [availableSlots, setAvailableSlots] = useState([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);

  // Fetch available slots when date changes or periodically for real-time updates
  useEffect(() => {
    let intervalId;
    if (showModal && bookingData.date) {
      fetchAvailableSlots();
      // Poll every 5 seconds for real-time slot updates
      intervalId = setInterval(() => {
        fetchAvailableSlots(true); // pass true to indicate silent background fetch
      }, 5000);
    }
    return () => clearInterval(intervalId); // Cleanup on unmount or date change
  }, [bookingData.date, showModal]);

  const fetchAvailableSlots = async (isBackground = false) => {
    if (!isBackground) setFetchingSlots(true);
    try {
      const resp = await axios.post('/bookings/get-available-slots', { 
        date: bookingData.date,
        serviceId: selectedService.id
      });
      if (resp.data && resp.data.success) {
        setAvailableSlots(resp.data.slots);
        
        // If user already selected a time, but admin removed it and it's no longer available, clear it
        if (bookingData.time) {
          const slotExistsAndAvailable = resp.data.slots.find(s => s.time === bookingData.time && s.available);
          if (!slotExistsAndAvailable) {
            setBookingData(prev => ({ ...prev, time: '' }));
          }
        }
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      if (!isBackground) setFetchingSlots(false);
    }
  };

  const handleServiceClick = async (service) => {
    const hasToken = !!localStorage.getItem('token') || !!localStorage.getItem('adminToken');
    if (!hasToken) {
      showWarning('Please login to book a service');
      navigate('/auth');
      return;
    }
    setSelectedService(service);
    setShowModal(true);
    setBookingData({ date: '', time: '', notes: '' });
    setAvailableSlots([]);
    setAvailableDates([]);
    
    // Fetch available dates for this service
    setFetchingDates(true);
    try {
      const resp = await axios.get(`/availability/service/${service.id}/available-dates`);
      if (resp.data && resp.data.success) {
        setAvailableDates(resp.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching available dates:', error);
    } finally {
      setFetchingDates(false);
    }
  };

  const handleBooking = async () => {
    if (!bookingData.date || !bookingData.time) {
      showWarning('Please select both date and time');
      return;
    }

    try {
      let userId = null;
      if (user && (user.userID || user.id)) {
        userId = user.userID || user.id;
      }

      if (!userId) {
        showError('Please login again to continue');
        return;
      }

      // Convert 12h time (e.g. "4:30 PM") to 24h format if needed
      let formattedTime = bookingData.time;
      if (formattedTime.includes('AM') || formattedTime.includes('PM')) {
        const [time, modifier] = formattedTime.split(' ');
        let [hours, minutes] = time.split(':');
        
        if (hours === '12') {
          hours = '00';
        }
        if (modifier === 'PM') {
          hours = parseInt(hours, 10) + 12;
        }
        
        // Ensure 2 digits for hours
        hours = hours.toString().padStart(2, '0');
        formattedTime = `${hours}:${minutes}`;
      }

      const payload = {
        user_id: userId,
        service_id: selectedService.id,
        booking_date: bookingData.date,
        booking_time: formattedTime,
        customer_name: user?.name || 'Customer',
        customer_email: user?.email || '',
        customer_contact: user?.contact || '',
        notes: bookingData.notes || ''
      };

      const resp = await axios.post('/bookings/create', payload);
      if (resp.data && resp.data.success) {
        showSuccess(`Booking confirmed for ${selectedService.name}!`);
        setShowModal(false);
        setBookingData({ date: '', time: '', notes: '' });
        setSelectedService(null);
      } else {
        showError(resp.data?.message || 'Failed to create booking');
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        showError('This slot was just taken. Please choose another time.');
        fetchAvailableSlots();
      } else {
        showError('Network error. Please try again.');
      }
    }
  };

  const generateTimeSlots = () => {
    // Determine if slots are stored in 24-hr format and format to 12-hr for UI
    return availableSlots.map(slot => {
      let timeParts = slot.time.split(':');
      if (timeParts.length === 2) {
        let h = parseInt(timeParts[0], 10);
        let m = timeParts[1];
        let meridiem = h >= 12 ? 'PM' : 'AM';
        let displayH = h > 12 ? h - 12 : (h === 0 ? 12 : h);
        return {
          ...slot,
          displayTime: `${displayH}:${m} ${meridiem}`,
          originalTime: slot.time
        };
      }
      return { ...slot, displayTime: slot.time, originalTime: slot.time };
    });
  };

  return (
    <div className="services-page">
      {/* Hero Header */}
      <div className="services-hero">
        <div className="services-hero-overlay"></div>
        <div className="services-hero-content">
          <span className="services-hero-badge">Premium Services</span>
          <h1>Our Services</h1>
          <p>Discover our premium range of beauty and wellness services tailored just for you</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="category-filter-section">
        <div className="category-container">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'All' && '✨'} 
              {cat === 'Hair' && '💇‍♀️'} 
              {cat === 'Nails' && '💅'} 
              {cat === 'Makeup' && '💄'} 
              {cat === 'Skincare' && '🧴'} 
              {cat === 'Spa' && '🧖‍♀️'} 
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="services-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="no-services">
            <p>No services available in this category</p>
          </div>
        ) : (
          <div className="services-grid">
          {filteredServices.map((service) => (
            <div key={service.id} className={`service-card ${!service.is_active ? 'inactive' : ''}`}>
              {/* Service Image */}
              <div className="service-image-wrapper">
                <img 
                  src={service.image} 
                  alt={service.name}
                  className="service-image"
                  loading="lazy"
                />
                <div className="service-category-tag">{service.category}</div>
                <div className={`service-status-badge ${service.is_active ? 'active' : 'inactive'}`}>
                  {service.is_active ? '✓ ACTIVE' : '✕ INACTIVE'}
                </div>
                {service.rating >= 4.9 && (
                  <div className="service-popular-tag">⭐ Popular</div>
                )}
              </div>

              {/* Service Content */}
              <div className="service-content">
                <div className="service-header">
                  <h3 className="service-name">{service.name}</h3>
                  <div className="service-rating">
                    <span className="rating-star">★</span>
                    <span className="rating-value">{service.rating}</span>
                    <span className="rating-count">({service.reviews})</span>
                  </div>
                </div>

                <p className="service-description">{service.description}</p>

                <div className="service-meta">
                  <div className="meta-item">
                    <span className="meta-icon">⏱️</span>
                    <span>{service.duration}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">📍</span>
                    <span>In-Salon</span>
                  </div>
                </div>

                <div className="service-footer">
                  <div className="service-price">
                    <span className="price-label">Starting from</span>
                    <span className="price-value">Rs {service.price.toLocaleString()}</span>
                  </div>
                  <button 
                    className={`book-btn ${!service.is_active ? 'disabled' : ''}`}
                    disabled={!service.is_active}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!service.is_active) {
                        showWarning(`Sorry! "${service.name}" is currently unavailable.`);
                        return;
                      }
                      handleServiceClick(service);
                    }}
                  >
                    {service.is_active ? 'Book Now' : 'Unavailable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Booking Modal */}
      {showModal && selectedService && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowModal(false)}>×</button>
            
            <div className="modal-image-section">
              <img src={selectedService.image} alt={selectedService.name} />
              <div className="modal-image-overlay">
                <span className="modal-category-badge">{selectedService.category}</span>
              </div>
            </div>

            <div className="modal-content-section">
              <div className="modal-header">
                <h2>{selectedService.name}</h2>
                <div className="modal-rating">
                  <span className="star">★</span> 
                  <span>{selectedService.rating}</span>
                  <span className="reviews">({selectedService.reviews} reviews)</span>
                </div>
              </div>

              <p className="modal-description">{selectedService.description}</p>

              <div className="modal-details-grid">
                <div className="detail-card">
                  <span className="detail-icon">⏱️</span>
                  <span className="detail-label">Duration</span>
                  <span className="detail-value">{selectedService.duration}</span>
                </div>
                <div className="detail-card">
                  <span className="detail-icon">📍</span>
                  <span className="detail-label">Location</span>
                  <span className="detail-value">In-Salon</span>
                </div>
                <div className="detail-card highlight">
                  <span className="detail-icon">💰</span>
                  <span className="detail-label">Price</span>
                  <span className="detail-value">Rs {selectedService.price.toLocaleString()}</span>
                </div>
              </div>

              <div className="booking-form-section">
                <h3>📅 Schedule Your Appointment</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Select Date</label>
                    <select
                      value={bookingData.date}
                      onChange={(e) => setBookingData({...bookingData, date: e.target.value, time: ''})}
                      disabled={fetchingDates || availableDates.length === 0}
                    >
                      <option value="">
                        {fetchingDates ? 'Loading dates...' : (availableDates.length === 0 ? 'No dates available' : 'Choose a date')}
                      </option>
                      {availableDates.map(date => (
                        <option key={date} value={date}>
                          {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Select Time</label>
                    <select
                      value={bookingData.time}
                      onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                      disabled={fetchingSlots || !bookingData.date}
                    >
                      <option value="">{fetchingSlots ? 'Loading slots...' : 'Choose a time slot'}</option>
                      {generateTimeSlots().map((slot) => (
                        <option 
                          key={slot.originalTime} 
                          value={slot.originalTime} 
                          disabled={!slot.available}
                          style={{ color: slot.available ? 'inherit' : '#ccc' }}
                        >
                          {slot.displayTime} {!slot.available ? '(Booked)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Special Requests (Optional)</label>
                  <textarea
                    placeholder="Any specific preferences or requirements..."
                    value={bookingData.notes}
                    onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>

              <div className="booking-summary">
                <div className="summary-item">
                  <span>Service</span>
                  <span>{selectedService.name}</span>
                </div>
                <div className="summary-item">
                  <span>Duration</span>
                  <span>{selectedService.duration}</span>
                </div>
                <div className="summary-item total">
                  <span>Total Amount</span>
                  <span>Rs {selectedService.price.toLocaleString()}</span>
                </div>
              </div>

              <button className="confirm-btn" onClick={handleBooking}>
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
