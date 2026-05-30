import React, { useEffect, useState, useRef } from 'react';
import axios from '../api/axiosConfig';
import './Profile.css';

const StarDisplay = ({ rating, size = 'sm' }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <span className={`star-display star-display-${size}`}>
      {stars.map(s => (
        <span key={s} className={s <= Math.round(rating) ? 'star-filled' : 'star-empty'}>★</span>
      ))}
    </span>
  );
};

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
  const paymentVerifiedRef = useRef(false);
  const [notifications, setNotifications] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ service_id: '', rating: 5, comment: '' });
  const isAdmin = localStorage.getItem('adminToken');

  // New state for feedback feature
  const [bookedServices, setBookedServices] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchBookings();
    fetchServices();
    fetchNotifications();
    fetchUserReviews();
    fetchAllReviews();
    fetchBookedServices();

    const updateInterval = setInterval(() => {
      fetchNotifications();
      fetchBookings(true);
    }, 5000);

    return () => clearInterval(updateInterval);
  }, []);

  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    const paymentSuccess = params.get('payment_success');
    const bookingId = params.get('booking_id');
    const sessionId = params.get('session_id');

    if (paymentSuccess === 'true' && bookingId && sessionId && !paymentVerifiedRef.current) {
      paymentVerifiedRef.current = true;
      const verifyPayment = async () => {
        try {
          setStatusMessage({ text: 'Confirming payment with Stripe...', type: 'info' });
          const resp = await axios.post('/payment/confirm-payment', { booking_id: bookingId, session_id: sessionId });
          if (resp.data && resp.data.success) {
            setStatusMessage({ text: 'Payment confirmed! Confirmation email sent.', type: 'success' });
            window.history.replaceState({}, document.title, window.location.pathname);
            fetchBookings();
            fetchNotifications();
          } else {
            setStatusMessage({ text: resp.data.message || 'Payment verification failed.', type: 'error' });
            paymentVerifiedRef.current = false;
          }
        } catch (err) {
          const errorMsg = err.response?.data?.message || 'Error confirming payment. Please contact support.';
          setStatusMessage({ text: errorMsg, type: 'error' });
          paymentVerifiedRef.current = false;
        }
      };
      verifyPayment();
    }
  }, []);

  const fetchServices = async () => {
    try {
      const resp = await axios.post('/services/get-all', {});
      if (resp.data && resp.data.success) {
        const servicesMap = {};
        resp.data.services.forEach(s => {
          servicesMap[s.id] = s.name || 'Unknown Service';
        });
        setServices(servicesMap);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const fetchAllReviews = async () => {
    setReviewsLoading(true);
    try {
      const resp = await axios.post('/reviews/get-all');
      if (resp.data && resp.data.success) {
        setAllReviews(resp.data.reviews || []);
      }
    } catch (err) {
      console.error('Error fetching all reviews', err);
    }
    setReviewsLoading(false);
  };

  const fetchUserReviews = async () => {
    if (!user) return;
    try {
      const resp = await axios.post('/reviews/get-user', { user_id: user.id || user.userID });
      if (resp.data && resp.data.success) {
        setUserReviews(resp.data.reviews || []);
      }
    } catch (err) {
      console.error('Error fetching user reviews:', err);
    }
  };

  const fetchBookedServices = async () => {
    if (!user) return;
    try {
      const resp = await axios.post('/reviews/get-booked-services', { user_id: user.id || user.userID });
      if (resp.data && resp.data.success) {
        setBookedServices(resp.data.services || []);
      }
    } catch (err) {
      console.error('Error fetching booked services:', err);
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

  // Check if user already reviewed a service
  const hasReviewed = (serviceId) => {
    return userReviews.some(r => String(r.service_id) === String(serviceId));
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...feedbackForm, user_id: user.id || user.userID };

    if (!payload.service_id) {
      setStatusMessage({ text: 'Please select a service.', type: 'error' });
      return;
    }

    if (hasReviewed(payload.service_id)) {
      setStatusMessage({ text: 'You have already submitted feedback for this service.', type: 'error' });
      return;
    }

    try {
      const resp = await axios.post('/reviews/submit', payload);
      if (resp.data.success) {
        setStatusMessage({ text: 'Review submitted! Thank you.', type: 'success' });
        setShowFeedbackModal(false);
        setFeedbackForm({ service_id: '', rating: 5, comment: '' });
        fetchUserReviews();
        fetchAllReviews();
        setTimeout(() => setStatusMessage({ text: '', type: '' }), 3000);
      } else if (resp.data.already_reviewed) {
        setStatusMessage({ text: 'You have already submitted feedback for this service.', type: 'error' });
      } else {
        setStatusMessage({ text: 'Error: ' + (resp.data.message || 'Submission failed'), type: 'error' });
      }
    } catch (err) {
      setStatusMessage({ text: 'Error: ' + (err.response?.data?.message || 'Server error'), type: 'error' });
    }
  };

  const handleCancelBooking = async (bookingID) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This will notify the staff.')) return;
    try {
      const resp = await axios.post('/bookings/cancel', { id: bookingID });
      if (resp.data && resp.data.success) {
        setBookings((prev) => prev.map(b => b.id === bookingID ? { ...b, status: 'cancelled' } : b));
        setStatusMessage({ text: 'Booking cancelled successfully', type: 'success' });
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
      const endpoint = isAdmin ? '/bookings/update' : '/bookings/request-reschedule';
      const resp = await axios.post(endpoint, {
        id: bookingID,
        date: editDate,
        time: editTime,
        booking_date: editDate,
        booking_time: editTime,
        notes: editNotes,
      });
      if (resp.data && resp.data.success) {
        if (isAdmin) {
          setBookings((prev) => prev.map(b => b.id === bookingID ? { ...b, booking_date: editDate, booking_time: editTime, notes: editNotes } : b));
          setStatusMessage({ text: 'Booking updated directly', type: 'success' });
        } else {
          setBookings((prev) => prev.map(b => b.id === bookingID ? { ...b, reschedule_status: 'pending' } : b));
          setStatusMessage({ text: 'Reschedule request sent to admin!', type: 'success' });
        }
        setTimeout(() => setStatusMessage({ text: '', type: '' }), 3000);
        cancelEdit();
      }
    } catch (err) {
      setStatusMessage({ text: 'Error processing request', type: 'error' });
    }
  };

  const handlePayment = async (bookingId) => {
    try {
      setStatusMessage({ text: 'Redirecting to Stripe checkout...', type: 'info' });
      const resp = await axios.post('/payment/create-checkout-session', { booking_id: bookingId });
      if (resp.data && resp.data.success && resp.data.url) {
        window.location.href = resp.data.url;
      } else {
        setStatusMessage({ text: resp.data.message || 'Payment initiation failed', type: 'error' });
      }
    } catch (err) {
      setStatusMessage({ text: err.response?.data?.message || 'Error connecting to Stripe', type: 'error' });
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

        {/* Tabs */}
        {!isAdmin && (
          <div className="profile-tabs">
            <button className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
              📅 Bookings
            </button>
            <button className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
              🔔 Notifications {notifications.filter(n => !n.is_read).length > 0 && <span className="notif-count">{notifications.filter(n => !n.is_read).length}</span>}
            </button>
            <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
              ⭐ Reviews {allReviews.length > 0 && <span className="notif-count">{allReviews.length}</span>}
            </button>
            <button className="tab-btn feedback-btn" onClick={() => setShowFeedbackModal(true)}>
              ✍️ Give Feedback
            </button>
          </div>
        )}

        {/* Bookings Tab */}
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
                        {booking.payment_status === 'paid' ? (
                          <span className="payment-badge-pill paid">✓ Paid</span>
                        ) : (
                          <span className="payment-badge-pill unpaid">Unpaid</span>
                        )}
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
                        {booking.status === 'confirmed' && booking.payment_status !== 'paid' && (
                          <button className="pay-now-btn" onClick={() => handlePayment(booking.id)}>💳 Pay Now</button>
                        )}
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <>
                            <button className="edit-btn" onClick={() => startEdit(booking)}>✏️ Request Change</button>
                            <button className="cancel-booking-btn" onClick={() => handleCancelBooking(booking.id)}>❌ Cancel</button>
                          </>
                        )}
                        <button className="del-btn-minimal" onClick={() => handleCancelBooking(booking.id)}>🗑️</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
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

        {/* Reviews Tab */}
        {!isAdmin && activeTab === 'reviews' && (
          <div className="reviews-section">
            <h3 className="section-title">Customer Reviews</h3>
            {reviewsLoading ? (
              <div className="loading-spinner">Loading...</div>
            ) : allReviews.length === 0 ? (
              <div className="empty-state">
                <p>No reviews yet. Be the first to leave one!</p>
                <button className="feedback-btn-inline" onClick={() => setShowFeedbackModal(true)}>✍️ Give Your First Review</button>
              </div>
            ) : (
              <div className="user-reviews-list">
                {allReviews.map((review) => {
                  const reviewerName = review.user?.name || 'Anonymous';
                  const initial = reviewerName.charAt(0).toUpperCase();
                  const isOwn = user && (review.user_id === (user.id || user.userID));
                  return (
                    <div key={review.id} className="user-review-card">
                      <div className="review-card-header">
                        <div className="review-service-info">
                          <div className="review-user-avatar" title={reviewerName}>{initial}</div>
                          <div>
                            <h4 className="review-service-name">
                              {reviewerName}
                              {isOwn && <span className="review-own-badge"> (You)</span>}
                            </h4>
                            <span className="review-service-category">
                              {review.service?.name || 'Service'}
                              {review.service?.category ? ` · ${review.service.category}` : ''}
                            </span>
                          </div>
                        </div>
                        <div className="review-rating-badge">
                          <StarDisplay rating={review.rating} size="sm" />
                          <span className="review-rating-number">{review.rating}/5</span>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="review-comment">"{review.comment}"</p>
                      )}
                      <div className="review-card-footer">
                        <span className="review-date">{new Date(review.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        <span className="review-verified-badge">✓ Verified</span>
                      </div>
                    </div>
                  );
                })}
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
              {bookedServices.length === 0 ? (
                <div className="no-booked-services">
                  <p>You need to book a service first before submitting feedback.</p>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit}>
                  <div className="form-group">
                    <label>Select Service:</label>
                    <select
                      required
                      value={feedbackForm.service_id}
                      onChange={e => setFeedbackForm({ ...feedbackForm, service_id: e.target.value })}
                    >
                      <option value="">-- Choose --</option>
                      {bookedServices.map(s => (
                        <option key={s.id} value={s.id} disabled={hasReviewed(s.id)}>
                          {s.name}{hasReviewed(s.id) ? ' ✓ Feedback Given' : ''}
                        </option>
                      ))}
                    </select>
                    {feedbackForm.service_id && hasReviewed(feedbackForm.service_id) && (
                      <p className="already-reviewed-msg">✓ You have already submitted feedback for this service.</p>
                    )}
                  </div>

                  {feedbackForm.service_id && !hasReviewed(feedbackForm.service_id) && (
                    <>
                      <div className="form-group">
                        <label>Rating:</label>
                        <div className="rating-input">
                          {[1, 2, 3, 4, 5].map(num => (
                            <span
                              key={num}
                              className={`feedback-star ${feedbackForm.rating >= num ? 'filled' : ''}`}
                              onClick={() => setFeedbackForm({ ...feedbackForm, rating: num })}
                            >⭐</span>
                          ))}
                          <span className="rating-label-text">{feedbackForm.rating}/5</span>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Comment:</label>
                        <textarea
                          value={feedbackForm.comment}
                          onChange={e => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                          placeholder="Tell us about your experience..."
                        ></textarea>
                      </div>
                      <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={() => setShowFeedbackModal(false)}>Cancel</button>
                        <button type="submit" className="submit-btn feedback-submit-btn">Submit Review</button>
                      </div>
                    </>
                  )}

                  {feedbackForm.service_id && hasReviewed(feedbackForm.service_id) && (
                    <div className="modal-actions">
                      <button type="button" className="btn-cancel" onClick={() => setShowFeedbackModal(false)}>Close</button>
                    </div>
                  )}
                </form>
              )}
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
