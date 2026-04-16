import React, { useEffect, useState } from 'react';
import axios from '../api/axiosConfig';
import './Profile.css';

const Profile = () => {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState({});
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState('bookings');
  const [notifications, setNotifications] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ service_id: '', rating: 5, comment: '' });

  // Availability management state (for admin)
  const isAdmin = localStorage.getItem('adminToken');
  const [availabilityMode, setAvailabilityMode] = useState(false);
  const [selectedServiceForAvailability, setSelectedServiceForAvailability] = useState(null);
  const [servicesList, setServicesList] = useState([]);
  const [availability, setAvailability] = useState({}); // date -> {is_available, times}
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedDateForTime, setSelectedDateForTime] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [timeInput, setTimeInput] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchBookings();
    fetchServices();
    fetchNotifications();

    // Set interval for real-time notification updates
    const notificationInterval = setInterval(() => {
      fetchNotifications();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(notificationInterval);
  }, []);

  const fetchServices = async () => {
    try {
      const resp = await axios.post('/services/get-all', {});
      if (resp.data && resp.data.success) {
        const servicesMap = {};
        const servicesList = [];
        resp.data.services.forEach(s => {
          servicesMap[s.id] = s.name || 'Unknown Service';
          servicesList.push({ id: s.id, name: s.name });
        });
        setServices(servicesMap);
        setServicesList(servicesList);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const fetchAvailability = async (serviceId) => {
    try {
      const month = String(selectedMonth.getMonth() + 1).padStart(2, '0');
      const year = selectedMonth.getFullYear();
      const resp = await axios.get(`/availability/service/${serviceId}?month=${month}&year=${year}`);
      
      if (resp.data && resp.data.success) {
        const availMap = {};
        resp.data.data.forEach(item => {
          // Keep the date string as is (YYYY-MM-DD format from database)
          const dateStr = item.available_date;
          availMap[dateStr] = {
            is_available: item.is_available,
            available_times: item.available_times || []
          };
        });
        setAvailability(availMap);
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
    }
  };

  const updateAvailability = async (serviceId, dateStr, isAvailable, times = []) => {
    try {
      console.log('Sending availability update:', {
        available_date: dateStr,
        is_available: isAvailable,
        available_times: times
      });

      const resp = await axios.post(`/availability/service/${serviceId}`, {
        available_date: dateStr,
        is_available: isAvailable,
        available_times: times && times.length > 0 ? times : null
      });

      console.log('Response:', resp.data);

      if (resp.data.success) {
        setAvailability(prev => ({
          ...prev,
          [dateStr]: { is_available: isAvailable, available_times: times }
        }));
        setStatusMessage({ text: `✅ Date ${new Date(dateStr + 'T00:00:00').toLocaleDateString()} marked as available!`, type: 'success' });
        setTimeout(() => setStatusMessage({ text: '', type: '' }), 3000);
      } else {
        setStatusMessage({ text: `Error: ${resp.data.message}`, type: 'error' });
      }
    } catch (err) {
      console.error('Error updating availability:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Unknown error';
      setStatusMessage({ text: `Error: ${errorMsg}`, type: 'error' });
    }
  };

  const formatTime12h = (time24) => {
    if (!time24) return '';
    if (time24.includes('AM') || time24.includes('PM')) return time24;
    const parts = time24.split(':');
    if (parts.length < 2) return time24;
    const hour = parseInt(parts[0], 10);
    const m = parts[1];
    const meridiem = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}:${m} ${meridiem}`;
  };

  // Generate time slots from 9 AM to 10 PM (every 30 minutes in 24h format)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 21; hour++) {
      const hh = hour.toString().padStart(2, '0');
      slots.push({ value: `${hh}:00`, label: formatTime12h(`${hh}:00`) });
      if (hour < 21) { // Don't add 30-min slot after 9:30 PM
        slots.push({ value: `${hh}:30`, label: formatTime12h(`${hh}:30`) });
      }
    }
    return slots;
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const resp = await axios.post('/bookings/get-all', { user_id: user.id || user.userID });
      if (resp.data && resp.data.success) {
        setBookings(resp.data.bookings || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchNotifications = async () => {
    try {
      const resp = await axios.post('/notifications/get-all', { user_id: user.id || user.userID });
      if (resp.data && resp.data.success) {
        setNotifications(resp.data.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await axios.post('/notifications/mark-read', { id });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...feedbackForm,
      user_id: user.id || user.userID
    };

    if (!payload.service_id) {
        setStatusMessage({ text: 'Please select a service from the list.', type: 'error' });
        return;
    }

    try {
      const resp = await axios.post('/reviews/submit', payload);
      if (resp.data.success) {
        setStatusMessage({ text: 'Review submitted! Thank you.', type: 'success' });
        setShowFeedbackModal(false);
        setFeedbackForm({ service_id: '', rating: 5, comment: '' });
        setTimeout(() => setStatusMessage({ text: '', type: '' }), 3000);
      } else {
        setStatusMessage({ text: 'Error: ' + (resp.data.message || 'Submission failed'), type: 'error' });
      }
    } catch (err) {
      console.error('Feedback error details:', err.response?.data || err.message);
      setStatusMessage({ text: 'Error: ' + (err.response?.data?.message || 'Server error'), type: 'error' });
    }
  };

  const handleDelete = async (bookingID) => {
    if (!window.confirm('Delete booking #' + bookingID + '?')) return;
    try {
      const resp = await axios.post('/bookings/delete', { id: bookingID });
      if (resp.data && resp.data.success) {
        setBookings((prev) => prev.filter(b => b.id !== bookingID));
        setStatusMessage({ text: `Booking deleted`, type: 'success' });
        setTimeout(() => setStatusMessage({ text: '', type: '' }), 3000);
      }
    } catch (err) {
      setStatusMessage({ text: 'Error deleting booking', type: 'error' });
    }
  };

  const startEdit = (booking) => {
    setEditingId(booking.id);
    setEditDate(booking.booking_date || booking.date || '');
    setEditTime(booking.booking_time || booking.time || '');
    setEditNotes(booking.notes || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDate('');
    setEditTime('');
    setEditNotes('');
  };

  const saveEdit = async (bookingID) => {
    if (!editDate || !editTime) {
      setStatusMessage({ text: 'Date and time are required', type: 'error' });
      return;
    }

    try {
      const resp = await axios.post('/bookings/update', { id: bookingID, booking_date: editDate, booking_time: editTime, notes: editNotes });
      if (resp.data && resp.data.success) {
        setBookings((prev) => prev.map(b => b.id === bookingID ? { ...b, booking_date: editDate, booking_time: editTime, notes: editNotes } : b));
        setStatusMessage({ text: `Booking updated`, type: 'success' });
        setTimeout(() => setStatusMessage({ text: '', type: '' }), 3000);
        cancelEdit();
      }
    } catch (err) {
      setStatusMessage({ text: 'Error updating booking', type: 'error' });
    }
  };

  const getBookingsForDate = (date) => {
    return bookings.filter(b => b.booking_date === date.toISOString().split('T')[0]);
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
      const dayBookings = getBookingsForDate(date);
      days.push(
        <div key={day} className={`calendar-day ${dayBookings.length > 0 ? 'has-booking' : ''}`}>
          <div className="day-number">{day}</div>
          {dayBookings.length > 0 && <div className="booking-dot">{dayBookings.length}</div>}
        </div>
      );
    }

    return days;
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <h2>No user data</h2>
          <p>Please login to see your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-card glass-card">
        <div className="profile-header">
          <div className="profile-avatar">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
          <div className="profile-info">
            <h2 className="profile-name">{user.name}</h2>
            <p className="profile-email">{user.email}</p>
            <p className="profile-contact">📞 {user.contact || 'N/A'}</p>
          </div>
          {isAdmin && (
            <button 
              className="admin-btn" 
              onClick={() => {
                setAvailabilityMode(!availabilityMode);
                if (!availabilityMode) {
                  setSelectedServiceForAvailability(null);
                  setAvailability({});
                }
              }}
            >
              {availabilityMode ? '❌ Close' : '⚙️ Manage Availability'}
            </button>
          )}
        </div>

        {/* User Tabs */}
        {!availabilityMode && (
          <div className="profile-tabs">
            <button className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
              📅 Bookings
            </button>
            <button className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
              🔔 Notifications {notifications.filter(n => !n.is_read).length > 0 && <span className="notif-count">{notifications.filter(n => !n.is_read).length}</span>}
            </button>
            <button className={`tab-btn feedback-btn`} onClick={() => setShowFeedbackModal(true)}>
              ⭐ Give Feedback
            </button>
          </div>
        )}

        {/* Availability Management Section (Admin Only) */}
        {isAdmin && availabilityMode && (
          <div className="availability-section">
            <h3>📅 Manage Service Availability</h3>
            
            <div className="availability-controls">
              <label>Select Service:</label>
              <select 
                value={selectedServiceForAvailability || ''}
                onChange={(e) => {
                  const serviceId = parseInt(e.target.value);
                  setSelectedServiceForAvailability(serviceId);
                  if (serviceId) {
                    fetchAvailability(serviceId);
                  }
                }}
              >
                <option value="">-- Choose a service --</option>
                {servicesList.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              {selectedServiceForAvailability && (
                <div className="month-nav">
                  <button 
                    onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
                    disabled={selectedMonth.getFullYear() === new Date().getFullYear() && selectedMonth.getMonth() === new Date().getMonth()}
                    style={{ 
                      opacity: selectedMonth.getFullYear() === new Date().getFullYear() && selectedMonth.getMonth() === new Date().getMonth() ? 0.5 : 1, 
                      cursor: selectedMonth.getFullYear() === new Date().getFullYear() && selectedMonth.getMonth() === new Date().getMonth() ? 'not-allowed' : 'pointer' 
                    }}
                  >← Previous</button>
                  <span>{selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  <button onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}>Next →</button>
                </div>
              )}
            </div>

            {selectedServiceForAvailability && (
              <div className="availability-calendar">
                <div className="cal-grid">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="cal-header">{day}</div>
                  ))}
                  
                  {(() => {
                    const year = selectedMonth.getFullYear();
                    const month = selectedMonth.getMonth();
                    const firstDay = new Date(year, month, 1).getDay();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const cells = [];
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    // Empty cells
                    for (let i = 0; i < firstDay; i++) {
                      cells.push(<div key={`empty-${i}`} className="cal-day empty"></div>);
                    }

                    // Days
                    for (let day = 1; day <= daysInMonth; day++) {
                      const currentDate = new Date(year, month, day);
                      const isPastDate = currentDate < today;
                      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const avail = availability[dateStr];

                      cells.push(
                        <div 
                          key={day} 
                          className={`cal-day ${avail?.is_available === true ? 'available' : avail?.is_available === false ? 'unavailable' : ''} ${isPastDate ? 'past-date' : ''}`}
                          onClick={() => {
                            if (isPastDate) return;
                            setSelectedDateForTime(dateStr);
                            setAvailableTimes(avail?.available_times || []);
                            setTimeInput('');
                            setShowTimeModal(true);
                          }}
                          style={isPastDate ? { opacity: 0.5, cursor: 'not-allowed', backgroundColor: 'rgba(255, 255, 255, 0.05)' } : {}}
                        >
                          <div className="day-num">{day}</div>
                          {avail && !isPastDate && (
                            <div className={`day-dot ${avail?.is_available === true ? 'green' : 'red'}`}>
                              {avail?.is_available === true ? '🟢' : '🔴'}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return cells;
                  })()}
                </div>

                <div className="cal-legend">
                  <span>🟢 = Available</span>
                  <span>🔴 = Unavailable</span>
                  <span>⭕ = Not Set</span>
                </div>
              </div>
            )}

            {/* Time Modal */}
            {showTimeModal && selectedDateForTime && (
              <div className="time-modal-overlay" onClick={() => setShowTimeModal(false)}>
                <div className="time-modal" onClick={(e) => e.stopPropagation()}>
                  <h4>Set Availability for {new Date(selectedDateForTime + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                  
                  <div className="availability-toggle">
                    <button 
                      className={`toggle-btn ${availability[selectedDateForTime]?.is_available === true ? 'active' : ''}`}
                      onClick={() => {
                        if (availability[selectedDateForTime]?.is_available === true) {
                          // Already available, clicking again doesn't change anything
                          return;
                        }
                        updateAvailability(selectedServiceForAvailability, selectedDateForTime, true, availableTimes);
                      }}
                    >
                      🟢 Mark as Available
                    </button>
                    {availability[selectedDateForTime]?.is_available === true && (
                      <button 
                        className="toggle-btn remove"
                        onClick={() => {
                          updateAvailability(selectedServiceForAvailability, selectedDateForTime, false, []);
                          setShowTimeModal(false);
                          setAvailableTimes([]);
                          setTimeInput('');
                        }}
                        style={{ marginLeft: '10px', backgroundColor: '#e74c3c', color: 'white' }}
                      >
                        🔴 Mark as Unavailable
                      </button>
                    )}
                  </div>

                  {availability[selectedDateForTime]?.is_available === true && (
                    <div className="time-slots">
                      <label>Available Times (9 AM - 10 PM):</label>
                      <div className="time-input">
                        <select 
                          value={timeInput}
                          onChange={(e) => setTimeInput(e.target.value)}
                        >
                          <option value="">-- Select Time Slot --</option>
                          {generateTimeSlots().map((slot) => (
                            <option key={slot.value} value={slot.value}>
                              {slot.label}
                            </option>
                          ))}
                        </select>
                        <button onClick={() => {
                          if (timeInput.trim() && !availableTimes.includes(timeInput)) {
                            setAvailableTimes([...availableTimes, timeInput.trim()]);
                            setTimeInput('');
                          }
                        }}>Add Slot</button>
                      </div>

                      <div className="time-list">
                        {availableTimes.map((t, i) => (
                          <span key={i} className="time-tag">
                            🕐 {formatTime12h(t)}
                            <button onClick={() => setAvailableTimes(availableTimes.filter((_, idx) => idx !== i))}>✕</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="modal-actions">
                    <button className="btn-cancel" onClick={() => setShowTimeModal(false)}>Close</button>
                    <button 
                      className="btn-save"
                      onClick={() => {
                        if (availability[selectedDateForTime]?.is_available === true) {
                          updateAvailability(selectedServiceForAvailability, selectedDateForTime, true, availableTimes);
                          setShowTimeModal(false);
                          setTimeInput('');
                        }
                      }}
                      disabled={availability[selectedDateForTime]?.is_available !== true}
                    >
                      Save Availability
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bookings Display */}
        {!availabilityMode && activeTab === 'bookings' && (
          <div className="bookings-section">
            <h3 className="section-title">My Bookings</h3>
            {loading ? (
              <div className="loading-spinner">Loading...</div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">No bookings found.</div>
            ) : (
              <div className="bookings-list">
                {bookings.map((booking) => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-main">
                      <h4>{services[booking.service_id] || 'Service'}</h4>
                      <p>📅 {booking.booking_date || booking.date} | 🕐 {formatTime12h(booking.booking_time || booking.time)}</p>
                      <p className={`status-text status-${booking.status?.toLowerCase() || 'pending'}`}>
                        {booking.status || 'Pending'}
                      </p>
                    </div>
                    <div className="booking-actions">
                      <button className="del-btn" onClick={() => handleDelete(booking.id)} title="Delete Booking">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications Display */}
        {!availabilityMode && activeTab === 'notifications' && (
          <div className="notifications-section">
            <h3 className="section-title">Your Notifications</h3>
            {notifications.length === 0 ? (
              <div className="empty-state">No notifications yet.</div>
            ) : (
              <div className="notif-list">
                {notifications.map((n) => (
                  <div key={n.id} className={`notif-card ${n.is_read ? 'read' : 'unread'}`} onClick={() => markNotificationRead(n.id)}>
                    <div className="notif-header">
                      <span className="notif-type">{n.type === 'appointment' ? '📅' : 'ℹ️'} {n.title}</span>
                      <span className="notif-date">{new Date(n.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="notif-msg">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && (
          <div className="feedback-modal-overlay" onClick={() => setShowFeedbackModal(false)}>
            <div className="feedback-modal-content feedback-glass-card" onClick={e => e.stopPropagation()}>
              <button className="close-feedback-btn" onClick={() => setShowFeedbackModal(false)}>×</button>
              <h3>Give Your Feedback</h3>
              <form onSubmit={handleFeedbackSubmit}>
                <div className="form-group">
                  <label>Select Service:</label>
                  <select 
                    required 
                    value={feedbackForm.service_id} 
                    onChange={e => setFeedbackForm({...feedbackForm, service_id: e.target.value})}
                  >
                    <option value="">-- Choose --</option>
                    {servicesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Rating:</label>
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5].map(num => (
                      <span 
                        key={num} 
                        className={`feedback-star ${feedbackForm.rating >= num ? 'filled' : ''}`}
                        onClick={() => setFeedbackForm({...feedbackForm, rating: num})}
                      >⭐</span>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Comment:</label>
                  <textarea 
                    value={feedbackForm.comment} 
                    onChange={e => setFeedbackForm({...feedbackForm, comment: e.target.value})}
                    placeholder="Tell us about your experience..."
                  ></textarea>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowFeedbackModal(false)}>Cancel</button>
                  <button type="submit" className="submit-btn feedback-submit-btn">Submit Review</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {statusMessage.text && (
          <div className={`status-toast ${statusMessage.type}`}>
            {statusMessage.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;