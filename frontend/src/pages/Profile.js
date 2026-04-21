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
  const [activeTab, setActiveTab] = useState('bookings');
  const [notifications, setNotifications] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ service_id: '', rating: 5, comment: '' });
  const isAdmin = localStorage.getItem('adminToken');
  const [servicesList, setServicesList] = useState([]);


  useEffect(() => {
    if (!user) return;
    fetchBookings();
    fetchServices();
    fetchNotifications();

    // Set interval for real-time updates
    const updateInterval = setInterval(() => {
      fetchNotifications();
      fetchBookings(true); // silent update
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(updateInterval);
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


  const fetchBookings = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const resp = await axios.post('/bookings/get-all', { user_id: user.id || user.userID });
      if (resp.data && resp.data.success) {
        setBookings(resp.data.bookings || []);
      }
    } catch (err) {
      console.error(err);
    }
    if (!silent) setLoading(false);
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


  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 21; hour++) {
      const hh = hour.toString().padStart(2, '0');
      slots.push({ value: `${hh}:00`, label: formatTime12h(`${hh}:00`) });
      slots.push({ value: `${hh}:30`, label: formatTime12h(`${hh}:30`) });
    }
    slots.push({ value: '22:00', label: formatTime12h('22:00') });
    return slots;
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

  const handleCancelBooking = async (bookingID) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This will notify the staff.')) return;
    try {
      const resp = await axios.post('/bookings/cancel', { id: bookingID });
      if (resp.data && resp.data.success) {
        setBookings((prev) => prev.map(b => b.id === bookingID ? { ...b, status: 'cancelled' } : b));
        setStatusMessage({ text: `Booking cancelled successfully`, type: 'success' });
        setTimeout(() => setStatusMessage({ text: '', type: '' }), 3000);
      }
    } catch (err) {
      setStatusMessage({ text: 'Error cancelling booking', type: 'error' });
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
      // For Admins, update directly. For Users, send a request.
      const endpoint = isAdmin ? '/bookings/update' : '/bookings/request-reschedule';
      const resp = await axios.post(endpoint, { 
        id: bookingID, 
        date: editDate, 
        time: editTime, 
        booking_date: editDate, // fallback for direct update
        booking_time: editTime, 
        notes: editNotes 
      });

      if (resp.data && resp.data.success) {
        if (isAdmin) {
          setBookings((prev) => prev.map(b => b.id === bookingID ? { ...b, booking_date: editDate, booking_time: editTime, notes: editNotes } : b));
          setStatusMessage({ text: `Booking updated directly`, type: 'success' });
        } else {
          setBookings((prev) => prev.map(b => b.id === bookingID ? { ...b, reschedule_status: 'pending' } : b));
          setStatusMessage({ text: `Reschedule request sent to admin!`, type: 'success' });
        }
        setTimeout(() => setStatusMessage({ text: '', type: '' }), 3000);
        cancelEdit();
      }
    } catch (err) {
      setStatusMessage({ text: 'Error processing request', type: 'error' });
    }
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
        </div>

        {/* User Tabs - Hidden for Admin */}
        {!isAdmin && (
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

        {/* Bookings Display - Hidden for Admin */}
        {!isAdmin && activeTab === 'bookings' && (
          <div className="bookings-section">
            <h3 className="section-title">My Bookings</h3>
            {loading ? (
              <div className="loading-spinner">Loading...</div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">No bookings found.</div>
            ) : (
              <div className="bookings-list">
                {bookings.map((booking) => (
                  <div key={booking.id} className={`booking-card ${booking.status === 'cancelled' ? 'cancelled-card' : ''}`}>
                    <div className="booking-main">
                      <h4>{services[booking.service_id] || 'Service'}</h4>
                      <p>📅 {booking.booking_date || booking.date} | 🕐 {formatTime12h(booking.booking_time || booking.time)}</p>
                      <p className={`status-text status-${booking.status?.toLowerCase() || 'pending'}`}>
                        {booking.status || 'Pending'}
                      </p>
                      {booking.reschedule_status === 'pending' && <p className="reschedule-pending-tag">⏳ Reschedule pending admin approval</p>}
                    </div>
                    {editingId === booking.id ? (
                      <div className="edit-form-mobile">
                         <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                         <select value={editTime} onChange={e => setEditTime(e.target.value)}>
                            {generateTimeSlots().map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                         </select>
                         <div className="edit-actions">
                            <button className="save-btn" onClick={() => saveEdit(booking.id)}>Request Change</button>
                            <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
                         </div>
                      </div>
                    ) : (
                      <div className="booking-actions">
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <>
                            <button className="edit-btn" onClick={() => startEdit(booking)} title="Request Reschedule">
                              ✏️ Request Change
                            </button>
                            <button className="cancel-booking-btn" onClick={() => handleCancelBooking(booking.id)} title="Cancel Booking">
                              ❌ Cancel
                            </button>
                          </>
                        )}
                        <button className="del-btn-minimal" onClick={() => handleCancelBooking(booking.id)} title="Remove">
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications Display - Hidden for Admin */}
        {!isAdmin && activeTab === 'notifications' && (
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