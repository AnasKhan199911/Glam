import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

// ===== NAVBAR COMPONENT =====
// This is the top navigation bar that appears on every page
// It shows the GlamConnect logo, navigation links, and login/profile button

const Navbar = () => {
  // Track if user is logged in by checking localStorage for token
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem('token') || 
    !!localStorage.getItem('adminToken') || 
    !!localStorage.getItem('staffToken')
  );
  
  // Get user data from localStorage (Check for regular user/admin first, then staff)
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem('user');
    if (userData) return JSON.parse(userData);
    const staffData = localStorage.getItem('staffUser');
    if (staffData) {
      const parsed = JSON.parse(staffData);
      return { ...parsed, name: parsed.full_name }; // Normalize name for Navbar
    }
    return null;
  });
  
  // Show/hide profile dropdown menu
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Show/hide mobile navigation menu
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Hook to navigate to different pages
  const navigate = useNavigate();
  
  // Get current page location
  const location = useLocation();

  // Keep navbar state in sync with localStorage (when user logs in/out)
  useEffect(() => {
    const hasToken = !!localStorage.getItem('token') || !!localStorage.getItem('adminToken') || !!localStorage.getItem('staffToken');
    setIsLoggedIn(hasToken);
    
    const userData = localStorage.getItem('user');
    const staffData = localStorage.getItem('staffUser');
    
    if (userData) {
      setUser(JSON.parse(userData));
    } else if (staffData) {
      const parsed = JSON.parse(staffData);
      setUser({ ...parsed, name: parsed.full_name });
    } else {
      setUser(null);
    }

    // close dropdown on route change
    setShowDropdown(false);
    setShowMobileMenu(false);
  }, [location]);

  // ===== HANDLE LOGOUT =====
  // When user clicks logout, clear localStorage and redirect to home
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    setIsLoggedIn(false);
    setUser(null);
    setShowDropdown(false);
    navigate('/auth');
  };

  // ===== HANDLE LOGIN REDIRECT =====
  // When user clicks login button, go to auth page
  const handleLoginClick = () => {
    navigate('/auth');
  };

  // ===== HANDLE PROFILE CLICK =====
  // When user clicks their profile, go to profile page
  const handleProfileClick = () => {
    navigate('/profile');
    setShowDropdown(false);
    setShowMobileMenu(false);
  };

  return (
    <nav className="navbar">
      {/* Left side - Logo and brand name */}
      <div className="navbar-brand">
        <Link to="/" className="brand-link">
          <span className="brand-icon">✨</span>
          <span className="brand-name">GlamConnect</span>
        </Link>
      </div>

      {/* Middle - Navigation links */}
        <div className={`navbar-links ${showMobileMenu ? 'active' : ''}`}>
        <Link 
          to="/" 
          className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          onClick={() => setShowMobileMenu(false)}
        >
          Home
        </Link>
        <Link 
          to="/about" 
          className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
          onClick={() => setShowMobileMenu(false)}
        >
          About Us
        </Link>
        <Link 
          to="/services" 
          className={`nav-link ${location.pathname === '/services' ? 'active' : ''}`}
          onClick={() => setShowMobileMenu(false)}
        >
          Services
        </Link>
        <Link 
          to="/gallery" 
          className={`nav-link ${location.pathname === '/gallery' ? 'active' : ''}`}
          onClick={() => setShowMobileMenu(false)}
        >
          Gallery
        </Link>
        <Link 
          to="/contact" 
          className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
          onClick={() => setShowMobileMenu(false)}
        >
          Contact
        </Link>
      </div>

      {/* Right side - Login/Profile button */}
      <div className="navbar-auth">
        {isLoggedIn ? (
          <div className="profile-section">
            {/* Profile button with user's first initial */}
            <button 
              className="profile-btn"
              onClick={() => setShowDropdown(!showDropdown)}
              title={user?.name}
            >
              <span className="profile-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </button>

            {/* Dropdown menu for logged-in users */}
            {showDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <p className="user-name">{user?.name || user?.full_name}</p>
                  <p className="user-email">{user?.email}</p>
                </div>
                <hr className="dropdown-divider" />
                {/* Show Dashboard link for admin/staff users */}
                {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'staff') && (
                  <button 
                    className="dropdown-item"
                    onClick={() => {
                      if (user.role === 'staff') {
                        navigate('/staff');
                      } else {
                        navigate('/admin');
                      }
                      setShowDropdown(false);
                      setShowMobileMenu(false);
                    }}
                  >
                    📊 Dashboard
                  </button>
                )}
                <button 
                  className="dropdown-item"
                  onClick={handleProfileClick}
                >
                  👤 My Profile
                </button>
                <button 
                  className="dropdown-item"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          // Login button for non-logged-in users
          <button 
            className="login-btn"
            onClick={handleLoginClick}
          >
            🔐 Login / Sign Up
          </button>
        )}
      </div>

      {/* Hamburger menu for mobile */}
      <button 
        className="hamburger"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  );
};

export default Navbar;
