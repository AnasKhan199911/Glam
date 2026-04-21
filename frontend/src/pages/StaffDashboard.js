import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastContainer';
import axios from '../api/axiosConfig';
import './StaffDashboard.css';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { showSuccess, showWarning, showInfo, showError } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shiftDuration, setShiftDuration] = useState('00:00:00');
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ completed: 0, upcoming: 0, earnings: 0, rating: 0 });
  const [staffNotifs, setStaffNotifs] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Get staff data from localStorage
  const staffMember = localStorage.getItem('staffUser') ? JSON.parse(localStorage.getItem('staffUser')) : {
    id: 1,
    employee_id: 'EMP001',
    full_name: 'Staff Member',
    email: 'staff@glamconnect.com',
    role: 'stylist',
    specialization: 'General',
    profile_image: 'https://ui-avatars.com/api/?name=Staff+Member&background=6c2bff&color=fff',
    rating: 4.5,
    total_services: 0
  };

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    showSuccess('Logged out successfully');
    navigate('/staff-auth');
  };

  // Check for staff authentication
  const staffToken = localStorage.getItem('staffToken');
  const staffUser = localStorage.getItem('staffUser') ? JSON.parse(localStorage.getItem('staffUser')) : null;

  useEffect(() => {
    // Current Time Clock
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Shift duration timer
    const shiftTimer = setInterval(() => {
      if (attendanceRecord?.check_in && !attendanceRecord?.check_out) {
        const checkInTime = new Date();
        const [hours, minutes, seconds] = attendanceRecord.check_in.split(':');
        checkInTime.setHours(hours, minutes, seconds);
        
        const now = new Date();
        const diff = Math.floor((now - checkInTime) / 1000);
        
        if (diff > 0) {
          const h = Math.floor(diff / 3600).toString().padStart(2, '0');
          const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
          const s = (diff % 60).toString().padStart(2, '0');
          setShiftDuration(`${h}:${m}:${s}`);
        }
      } else {
        setShiftDuration('00:00:00');
      }
    }, 1000);
    
    // Initial fetch
    fetchDashboardData();
    checkStatus();

    // Poll for updates every 5 seconds for "Real-Time" feel
    const pollTimer = setInterval(() => {
      fetchDashboardData();
      checkStatus();
    }, 5000);
    
    return () => {
      clearInterval(timer);
      clearInterval(shiftTimer);
      clearInterval(pollTimer);
    };
  }, []); // Only run once on mount, setInterval handles the rest

  const fetchDashboardData = async () => {
    try {
      const resp = await axios.post('/staff/dashboard-data', { id: staffMember.id });
      if (resp.data.success) {
        setStats(resp.data.stats);
        setAppointments(resp.data.appointments);
        setStaffNotifs(resp.data.notifications);
      }
      
      const reviewResp = await axios.post('/reviews/get-staff', { staff_id: staffMember.id });
      if (reviewResp.data.success) {
        setReviews(reviewResp.data.reviews);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const checkStatus = async () => {
    try {
      const resp = await axios.post('/attendance/status', { id: staffMember.id });
      if (resp.data && resp.data.success) {
        setAttendanceRecord(resp.data.record);
      }
    } catch (err) {
      console.error('Error checking attendance status:', err);
    }
  };

  // For demo purposes, allow access without token
  // In production, uncomment the authentication check below
  /*
  if (!staffToken) {
    return (
      <div className="staff-dashboard">
        <div className="staff-access-denied">
          <div className="access-icon">🔐</div>
          <h2>Staff Login Required</h2>
          <p>Please login with your staff credentials to access this dashboard.</p>
          <button className="staff-login-btn" onClick={() => navigate('/staff-auth')}>
            Go to Staff Login
          </button>
        </div>
      </div>
    );
  }
  */

  const handleClockIn = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const localDate = now.toISOString().split('T')[0];
      const localTime = now.toTimeString().split(' ')[0]; // HH:MM:SS
      
      const resp = await axios.post('/attendance/mark', { 
        id: staffMember.id, 
        type: 'check_in',
        date: localDate,
        time: localTime
      });
      if (resp.data.success) {
        setAttendanceRecord(resp.data.data);
        showSuccess('Clocked in successfully! Have a great day!');
        fetchDashboardData();
      }
    } catch (err) {
      showWarning('Failed to clock in');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const localDate = now.toISOString().split('T')[0];
      const localTime = now.toTimeString().split(' ')[0]; // HH:MM:SS

      const resp = await axios.post('/attendance/mark', { 
        id: staffMember.id, 
        type: 'check_out',
        date: localDate,
        time: localTime
      });
      if (resp.data.success) {
        setAttendanceRecord(resp.data.data);
        showInfo('Clocked out. See you next time!');
        fetchDashboardData();
      }
    } catch (err) {
      showWarning('Failed to clock out');
    } finally {
      setLoading(false);
    }
  };

  const handleStartService = async (appointment) => {
    try {
      setLoading(true);
      const resp = await axios.post('/bookings/update', { id: appointment.id, status: 'confirmed' });
      if (resp.data.success) {
        showInfo(`Started service: ${appointment.service?.name} for ${appointment.customer_name}`);
        fetchDashboardData();
      }
    } catch (err) {
      showError('Failed to start service');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteService = async (appointment) => {
    try {
      setLoading(true);
      const resp = await axios.post('/bookings/update', { id: appointment.id, status: 'completed' });
      if (resp.data.success) {
        showSuccess(`Completed service for ${appointment.customer_name}. Great job!`);
        fetchDashboardData();
      }
    } catch (err) {
      showError('Failed to complete service');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="staff-dashboard">
      {/* Header Section */}
      <div className="staff-header">
        <div className="staff-welcome">
          <img src={staffMember.profile_image} alt={staffMember.full_name} className="staff-avatar" />
          <div className="welcome-text">
            <h1>Welcome back, {staffMember.full_name.split(' ')[0]}! <span className="staff-role-tag">({staffMember.role})</span></h1>
            <p>{formatDate(currentTime)} • {formatTime(currentTime)}</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="logout-btn-minimal" onClick={handleLogout} title="Logout">Logout</button>
          {!attendanceRecord?.check_in ? (
            <button className="clock-btn clock-in" onClick={handleClockIn} disabled={loading}>
              {loading ? '⌛...' : '⏰ Clock In'}
            </button>
          ) : !attendanceRecord?.check_out ? (
            <>
              <div className="shift-timer-box">
                <span className="timer-label">⏱️ SHIFT DURATION</span>
                <span className="shift-timer">{shiftDuration}</span>
              </div>
              <button className="clock-btn clock-out" onClick={handleClockOut} disabled={loading}>
                {loading ? '⌛...' : '🏠 Clock Out'}
              </button>
            </>
          ) : (
            <span className="clock-status completed">✨ Shift Completed (In: {attendanceRecord.check_in} - Out: {attendanceRecord.check_out})</span>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="quick-stat">
          <span className="stat-icon">✅</span>
          <div className="stat-details">
            <span className="stat-number">{stats.completed}</span>
            <span className="stat-text">Completed</span>
          </div>
        </div>
        <div className="quick-stat">
          <span className="stat-icon">📅</span>
          <div className="stat-details">
            <span className="stat-number">{stats.upcoming}</span>
            <span className="stat-text">Upcoming</span>
          </div>
        </div>
        <div className="quick-stat">
          <span className="stat-icon">⭐</span>
          <div className="stat-details">
            <span className="stat-number">{stats.rating || '0.0'}</span>
            <span className="stat-text">Rating</span>
          </div>
        </div>
        <div className="quick-stat highlight">
          <span className="stat-icon"></span>
          <div className="stat-details">
            <span className="stat-number">Rs {stats.earnings.toLocaleString()}</span>
            <span className="stat-text">Life Time Earnings</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="staff-tabs">
        <button className={`staff-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          📊 Overview
        </button>
        <button className={`staff-tab ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>
          📅 My Appointments
        </button>
        <button className={`staff-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          👤 Profile
        </button>
        <button className={`staff-tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
          ⭐ Reviews
        </button>
      </div>

      {/* Tab Content */}
      <div className="staff-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-grid">
              {/* Today's Schedule Card */}
              <div className="overview-card today-schedule">
                <div className="card-header">
                  <h3>📋 Assigned Appointments</h3>
                  <span className="badge">{appointments.length} total</span>
                </div>
                <div className="appointments-list">
                  {appointments.length === 0 ? (
                    <p className="empty-msg">No appointments assigned yet.</p>
                  ) : (
                    appointments.map((apt) => (
                      <div key={apt.id} className={`appointment-item ${apt.status}`}>
                        <div className="apt-time">{apt.booking_time}</div>
                        <div className="apt-details">
                          <strong>{apt.customer_name}</strong>
                          <span>{apt.service?.name} • {apt.booking_date}</span>
                        </div>
                        <div className={`apt-status ${apt.status}`}>{apt.status}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Notifications Card */}
              <div className="overview-card notifications-card">
                <div className="card-header">
                  <h3>🔔 My Notifications</h3>
                  <span className="badge">{staffNotifs.length} new</span>
                </div>
                <div className="notifications-list">
                  {staffNotifs.length === 0 ? (
                    <p className="empty-msg">No new notifications.</p>
                  ) : (
                    staffNotifs.map((notif) => (
                      <div key={notif.id} className={`notification-item ${notif.type}`}>
                        <div className="notif-icon">
                          {(notif.type === 'booking' || notif.type === 'appointment') && '📅'}
                          {notif.type === 'reminder' && '⏰'}
                          {notif.type === 'warning' && '⚠️'}
                          {notif.type === 'info' && 'ℹ️'}
                        </div>
                        <div className="notif-content">
                          <p>{notif.message}</p>
                          <span className="notif-time">{notif.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Performance Card */}
              <div className="overview-card performance-card">
                <div className="card-header">
                  <h3>📈 Success Rate</h3>
                </div>
                <div className="performance-stats">
                  <div className="perf-stat">
                    <div className="perf-bar" style={{ '--percentage': '100%' }}></div>
                    <span className="perf-label">Satisfaction</span>
                    <span className="perf-value">100%</span>
                  </div>
                  <div className="perf-stat">
                    <div className="perf-bar" style={{ '--percentage': stats.completed > 0 ? '100%' : '0%' }}></div>
                    <span className="perf-label">On-Time</span>
                    <span className="perf-value">{stats.completed > 0 ? '100%' : '0%'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="appointments-tab">
            <div className="tab-header">
              <h3>Assigned Appointments</h3>
              <p className="tab-desc">Showing services matching your specialization: <strong>{staffMember.specialization}</strong></p>
            </div>
            <div className="appointments-full-list">
              {appointments.length === 0 ? (
                <p>No appointments found.</p>
              ) : (
                appointments.map((apt) => (
                  <div key={apt.id} className="appointment-card">
                    <div className="apt-card-header">
                      <span className="apt-card-time">{apt.booking_time}</span>
                      <span className={`apt-card-status ${apt.status}`}>{apt.status}</span>
                    </div>
                    <div className="apt-card-body">
                      <h4>{apt.customer_name}</h4>
                      <p className="apt-service">{apt.service?.name}</p>
                      <p className="apt-duration">📅 Date: {apt.booking_date}</p>
                    </div>
                    <div className="apt-card-actions">
                      {apt.status !== 'completed' && (
                        <>
                          <button className="apt-btn start" onClick={() => handleStartService(apt)}>
                            ▶️ Start
                          </button>
                          <button className="apt-btn complete" onClick={() => handleCompleteService(apt)}>
                            ✅ Complete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="reviews-tab">
            <div className="tab-header">
              <h3>Client Reviews & Feedback</h3>
              <p className="tab-desc">Feedback left by clients for services assigned to you.</p>
            </div>
            <div className="reviews-list">
              {reviews.length === 0 ? (
                <div className="empty-state">No reviews received yet.</div>
              ) : (
                reviews.map(r => (
                  <div key={r.id} className="review-card">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <span className="reviewer-name">{r.user?.name || 'Client'}</span>
                        <span className="review-service">• {r.service?.name}</span>
                      </div>
                      <div className="review-rating">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`star ${i < r.rating ? 'filled' : ''}`}>⭐</span>
                        ))}
                      </div>
                    </div>
                    <p className="review-comment">"{r.comment}"</p>
                    <span className="review-date">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-tab">
            <div className="profile-header">
              <img src={staffMember.profile_image} alt={staffMember.full_name} className="profile-avatar" />
              <div className="profile-info">
                <h2>{staffMember.full_name}</h2>
                <span className="employee-id">{staffMember.employee_id}</span>
                <span className="role-badge">{staffMember.role}</span>
              </div>
            </div>
            <div className="profile-details">
              <div className="detail-section">
                <h4>📧 Contact Information</h4>
                <p><strong>Email:</strong> {staffMember.email}</p>
                <p><strong>Phone:</strong> +92 300 123 4001</p>
              </div>
              <div className="detail-section">
                <h4>💼 Professional Details</h4>
                <p><strong>Specialization:</strong> {staffMember.specialization}</p>
                <p><strong>Total Services:</strong> {staffMember.total_services}</p>
                <p><strong>Rating:</strong> ⭐ {staffMember.rating}/5.0</p>
              </div>
              <div className="detail-section">
                <h4>📊 Statistics</h4>
                <p><strong>This Month:</strong> 72 services completed</p>
                <p><strong>Customer Satisfaction:</strong> 98%</p>
                <p><strong>Attendance:</strong> 95%</p>
              </div>
            </div>
            <div className="profile-actions">
              {/* Profile actions removed as requested */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
