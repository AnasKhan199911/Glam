import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { useToast } from '../components/ToastContainer';

// ========== HOME COMPONENT ==========
// This component is like the welcome page after user logs in
// It shows user's profile information and a logout button
// Think of it like a personalized dashboard showing "Hi [UserName]!"

const Home = () => {
  // ===== STATE VARIABLES (Data storage) =====
  // These variables store information that can change
  
  const { showSuccess, showInfo } = useToast();
  
  // Stores the logged-in user's information
  const [user, setUser] = useState(null);
  
  // Stores whether data is still loading
  const [isLoading, setIsLoading] = useState(true);
  
  // Stores any error messages
  const [error, setError] = useState('');
  
  // Stores all user's bookings from localStorage
  const [bookings, setBookings] = useState([]);
  
  // useNavigate is a hook to navigate to different pages
  const navigate = useNavigate();

  // ===== useEffect HOOK (Runs when component loads) =====
  // This function runs automatically when this page loads
  // It checks if user is logged in by looking in localStorage
  useEffect(() => {
    // Get the stored user data from browser's localStorage
    // localStorage is like a small storage box in the browser
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    // If no user or token found, user is not logged in
    if (!storedUser || !storedToken) {
      // Set error message
      setError('Please login first');
      
      // Stop loading animation
      setIsLoading(false);
      
      // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate('/auth');
        }, 2000);
      
      return; // Stop execution here
    }

    try {
      // Convert stored user data from JSON string to JavaScript object
      const userData = JSON.parse(storedUser);
      
      // Update the user state with retrieved data
      setUser(userData);
      
      // ===== LOAD BOOKINGS FROM LOCALSTORAGE =====
      // Get bookings array from localStorage (booking system stores bookings here)
      const storedBookings = localStorage.getItem('bookings');
      if (storedBookings) {
        // Convert JSON string to array and sort by date (newest first)
        const bookingsArray = JSON.parse(storedBookings);
        setBookings(bookingsArray);
      } else {
        // No bookings yet, set empty array
        setBookings([]);
      }
      
      // Stop loading animation
      setIsLoading(false);
      
    } catch (err) {
      // If something goes wrong parsing the data
      setError('Error loading user data');
      setIsLoading(false);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/auth');
      }, 2000);
    }
  }, []); // Empty array means run only once when component mounts

  // ===== LOGOUT HANDLER =====
  // This function is called when user clicks logout button
  const handleLogout = () => {
    // Clear all stored data from localStorage
    // This is like erasing your temporary storage box
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Show a success message in console
    console.log('User logged out successfully');
    
    // Redirect to login page
    navigate('/auth');
  };

  // ===== CANCEL BOOKING HANDLER =====
  // This function removes a booking from localStorage and updates the display
  const handleCancelBooking = (bookingId) => {
    // Ask user to confirm they want to cancel
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      // Filter out the booking with matching ID
      const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
      
      // Update bookings state
      setBookings(updatedBookings);
      
      // Save updated bookings back to localStorage
      localStorage.setItem('bookings', JSON.stringify(updatedBookings));
      
      // Show success message
      showSuccess('Booking cancelled successfully');
    }
  };

  // ===== EDIT PROFILE HANDLER =====
  // This function will be used for editing profile later
  const handleEditProfile = () => {
    showInfo('Edit profile feature coming soon!');
  };

  // ===== RENDER: What user sees on screen =====
  
  // While data is loading, show loading message
  if (isLoading) {
    return (
      <div className="home-container">
        <div className="loading-message">
          <h2>Loading your profile...</h2>
        </div>
      </div>
    );
  }

  // If there's an error, show error message
  if (error) {
    return (
      <div className="home-container">
        <div className="error-box">
          <h2>⚠️ {error}</h2>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // If user is not found, show this
  if (!user) {
    return (
      <div className="home-container">
        <div className="error-box">
          <h2>User data not found</h2>
          <p>Please login again</p>
        </div>
      </div>
    );
  }

  // ===== MAIN UI: User's dashboard =====
  return (
    <div className="home-container">
      {/* Header with welcome message */}
      <div className="home-header">
        <h1>Welcome to GlamConnect! 💄</h1>
        <p>Your personalized beauty shopping dashboard</p>
      </div>

      {/* Main content card */}
      <div className="home-content">
        {/* Profile section */}
        <div className="profile-card">
          {/* Profile header with avatar */}
          <div className="profile-header">
            <div className="avatar">
              {/* Show first letter of user's name as avatar */}
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="profile-title">
              <h2>Hello, {user.name || 'User'}! 👋</h2>
              <p>Your personal profile</p>
            </div>
          </div>

          {/* User's information displayed in a nice format */}
          <div className="profile-info">
            <div className="info-item">
              <label>Full Name:</label>
              <span>{user.name || 'Not provided'}</span>
            </div>

            <div className="info-item">
              <label>Email Address:</label>
              <span>{user.email || 'Not provided'}</span>
            </div>

            <div className="info-item">
              <label>Phone Number:</label>
              <span>{user.contact || 'Not provided'}</span>
            </div>

            <div className="info-item">
              <label>Account Type:</label>
              <span className="role-badge">{user.role || 'customer'}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="profile-actions">
            <button className="btn-edit" onClick={handleEditProfile}>
              ✏️ Edit Profile
            </button>
            <button className="btn-logout" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>

        {/* MY BOOKINGS SECTION =====*/}
        <div className="bookings-section">
          <h3>📅 My Service Bookings</h3>
          
          {/* Show message if no bookings yet */}
          {bookings.length === 0 ? (
            <div className="no-bookings">
              <p>You haven't booked any services yet.</p>
              <button 
                className="btn-book-service" 
                onClick={() => navigate('/services')}
              >
                Browse Services →
              </button>
            </div>
          ) : (
            <div className="bookings-list">
              {/* Loop through all bookings and display each one */}
              {bookings.map((booking) => (
                <div key={booking.id} className="booking-card">
                  {/* Booking header with service name */}
                  <div className="booking-header">
                    <h4>{booking.serviceName}</h4>
                    <span className="booking-status">Confirmed</span>
                  </div>
                  
                  {/* Booking details grid */}
                  <div className="booking-details">
                    <div className="detail-item">
                      <label>Date:</label>
                      <span>{booking.date}</span>
                    </div>
                    <div className="detail-item">
                      <label>Time:</label>
                      <span>{booking.time}</span>
                    </div>
                    <div className="detail-item">
                      <label>Duration:</label>
                      <span>{booking.duration}</span>
                    </div>
                    <div className="detail-item">
                      <label>Price:</label>
                      <span className="price">${booking.price}</span>
                    </div>
                  </div>
                  
                  {/* Cancel button for each booking */}
                  <button 
                    className="btn-cancel"
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    ✕ Cancel Booking
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick stats section */}
        <div className="quick-stats">
          <h3>Your Activity</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Orders</h4>
              <p className="stat-number">0</p>
              <small>Coming soon</small>
            </div>
            <div className="stat-card">
              <h4>Favorites</h4>
              <p className="stat-number">0</p>
              <small>Coming soon</small>
            </div>
            <div className="stat-card">
              <h4>Wishlist</h4>
              <p className="stat-number">0</p>
              <small>Coming soon</small>
            </div>
          </div>
        </div>

        {/* Features section */}
        <div className="features-section">
          <h3>Explore More</h3>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">🛍️</span>
              <h4>Shop Beauty Products</h4>
              <p>Browse our curated collection</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💅</span>
              <h4>Makeup Tips</h4>
              <p>Learn from beauty experts</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">⭐</span>
              <h4>Exclusive Deals</h4>
              <p>Get special member offers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="home-footer">
        <p>&copy; 2024 GlamConnect. All rights reserved.</p>
        <p>Your trusted beauty e-commerce platform</p>
      </div>
    </div>
  );
};

export default Home;
