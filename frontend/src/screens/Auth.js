import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { signup, verifyOtp } from '../api/authService';
import { auth, sendVerificationToUser, sendPasswordReset, firebaseConfig } from '../firebase';
import { createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import axios from '../api/axiosConfig';
import { useToast } from '../components/ToastContainer';

// ========== AUTH COMPONENT ==========
// This component handles all authentication: Login, Signup, and Forgot Password
// Think of it as three pages that users can switch between

const Auth = () => {
  // ===== STATE VARIABLES (Data that can change) =====
  
  // Toast notifications
  const { showSuccess, showError, showInfo } = useToast();
  
  // Which form tab is currently showing (login, signup, or forgot)
  const [activeTab, setActiveTab] = useState('login');
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  
  // Stores all form input values from the user
  const [formData, setFormData] = useState({
    phone: '',              // Used for login (but actually stores email)
    password: '',           // User's password
    newPassword: '',        // New password for reset
    name: '',               // User's full name (for signup)
    email: '',              // User's email (for signup and forgot)
    contact: '',            // User's phone number
    confirmPassword: '',    // For confirming password matches (signup)
  });
  
  // Stores error messages to show to the user
  const [errors, setErrors] = useState({});
  
  // Tracks if a request is being sent to the server
  const [loading, setLoading] = useState(false);
  // When a user is signed in but not verified, keep the firebase user here so we can resend verification
  const [unverifiedUser, setUnverifiedUser] = useState(null);
  
  // Hook to navigate to different pages
  const navigate = useNavigate();

  // ===== HELPER FUNCTION: Handle input changes =====
  // When user types in a form field, this function updates the formData
  const handleChange = (e) => {
    // Get the input field's name and value
    const { name, value } = e.target;
    
    // Update formData with the new value
    // ...formData means "keep all existing data, but update this one field"
    setFormData({
      ...formData,
      [name]: value,  // Update the field that was typed in
    });
  };

  // ===== VALIDATION FUNCTIONS =====
  // These functions check if data is valid before sending to server
  
  // Check if email format is correct (example@domain.com)
  const validateEmail = (email) => {
    // Regex pattern: must have @ and . in right places
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  // Check if phone number is valid (at least 10 digits)
  const validatePhone = (phone) => {
    // Regex pattern: numbers, spaces, dashes, plus sign allowed
    return /^[\d\s\-\+\(\)]{10,}$/.test(phone);
  };

  // ===== LOGIN HANDLER =====
  // This function runs when user submits the login form
  const handleLogin = async (e) => {
    // Prevent page refresh on form submit
    e.preventDefault();
    
    // Create an object to store error messages
    let newErrors = {};
    
    // Check 1: Is email field filled?
    if (!formData.phone) {
      newErrors.phone = 'Email is required';
    }
    
    // Check 2: Is password field filled?
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    // Check 3: Is email format valid?
    if (formData.phone && !validateEmail(formData.phone)) {
      newErrors.phone = 'Invalid email';
    }

    // If there are any errors, show them and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // ===== SEND LOGIN REQUEST TO BACKEND =====
    setLoading(true);
    setErrors({});
    try {
      const resp = await axios.post('/auth/login', {
        email: formData.phone,
        password: formData.password
      });
      
      if (resp.data && resp.data.success) {
        const user = resp.data.user;
        
        if (!user.is_verified) {
          showInfo('Please verify your account first');
          setShowOtpStep(true);
          setFormData({ ...formData, email: formData.phone });
          setLoading(false);
          return;
        }

        // Store user data and token
        if (resp.data.token) {
          localStorage.setItem('token', resp.data.token);
        }
        localStorage.setItem('user', JSON.stringify(user));
        showSuccess('Login successful!');
        navigate('/home');
      } else {
        showError(resp.data?.message || 'Login failed');
        setErrors({ api: resp.data?.message || 'Login failed' });
      }
    } catch (err) {
      showError(err?.response?.data?.message || err.message || 'Login failed');
      setErrors({ api: err?.response?.data?.message || err.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  // If user lands on the app after clicking the Firebase verification link,
  // Firebase will include an oobCode in the URL. Automatically apply that
  // code via the backend so the DB is updated without requiring "I verified".
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oobCode = params.get('oobCode') || params.get('oobcode');
    if (oobCode) {
      (async () => {
        setLoading(true);
        try {
          const resp = await axios.post('/auth/verify-firebase-token', { oobCode, apiKey: firebaseConfig.apiKey });
          if (resp.data && resp.data.success) {
            showSuccess('Email verified successfully. You may now log in.');
            const clean = window.location.pathname + (window.location.hash || '');
            window.history.replaceState({}, document.title, clean);
            setActiveTab('login');
          } else {
            setErrors({ api: resp.data?.message || 'Failed to apply verification code' });
          }
        } catch (err) {
          setErrors({ api: err?.response?.data?.message || 'Verification failed' });
        } finally {
          setLoading(false);
        }
      })();
    }
  }, []);

  // ===== SIGNUP HANDLER =====
  // This function runs when user submits the signup form
  const handleSignup = async (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (formData.email && !validateEmail(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.contact) newErrors.contact = 'Contact is required';
    if (formData.contact && !validatePhone(formData.contact)) newErrors.contact = 'Invalid contact number';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Call backend API directly (no Firebase)
      const resp = await signup(formData.name, formData.email, formData.contact, formData.password);
      if (resp && resp.success) {
        showSuccess('OTP sent to your email! Please check your inbox.');
        setShowOtpStep(true);
      } else {
        showError(resp?.message || 'Signup failed');
        setErrors({ api: resp?.message || 'Signup failed' });
      }
    } catch (err) {
      showError(err.message || 'Signup failed');
      setErrors({ api: err.message || 'Signup failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpValue) {
        showError('Please enter the OTP');
        return;
    }
    setLoading(true);
    try {
        const resp = await verifyOtp(formData.email, otpValue);
        if (resp && resp.success) {
            showSuccess('Verification successful! You can now login.');
            setShowOtpStep(false);
            setActiveTab('login');
        } else {
            showError(resp.message || 'Verification failed');
        }
    } catch (err) {
        showError(err.message || 'Verification error');
    } finally {
        setLoading(false);
    }
  };

  // unneeded pendingSignup/finalize flow: we now persist backend user at signup time.

  // Resend verification email for an unverified firebase user
  const resendVerification = async () => {
    if (!unverifiedUser) return;
    setLoading(true);
    try {
      const r = await sendVerificationToUser(unverifiedUser);
      if (r.success) {
        showSuccess('Verification email resent. Please check your inbox.');
      } else {
        showError('Could not resend verification email automatically. Please check your email provider.');
      }
    } catch (err) {
      console.error('Resend verification error', err);
      setErrors({ api: err.message || 'Failed to resend verification email' });
    } finally {
      setLoading(false);
    }
  };

  // ===== FORGOT PASSWORD HANDLER =====
  // This function runs when user submits the forgot password form
  const handleForgotPassword = async (e) => {
    // Prevent page refresh
    e.preventDefault();
    
    // Create object to store errors
    let newErrors = {};
    
    // Validation checks
    if (!formData.email) newErrors.email = 'Email is required';
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Invalid email';
    }
    if (!formData.contact) newErrors.contact = 'Contact is required';
    if (formData.contact && !validatePhone(formData.contact)) {
      newErrors.contact = 'Invalid contact number';
    }
    if (!formData.newPassword) newErrors.newPassword = 'New password is required';

    // If errors found, show them and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Use Firebase to send password reset email
    setLoading(true);
    setErrors({});
    try {
      const r = await sendPasswordReset(formData.email);
      if (r.success) {
        showSuccess('Password reset email sent. Please check your inbox.');
        setActiveTab('login');
      } else {
        setErrors({ api: r.message || 'Failed to send reset email' });
      }
    } catch (err) {
      console.error('Password reset error', err);
      setErrors({ api: err.message || 'Password reset failed' });
    } finally {
      setLoading(false);
    }
  };

  // ===== RENDER (What user sees on screen) =====
  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header with GlamConnect title */}
        <div className="auth-header">
          <h1 className="glamconnect-logo">GlamConnect</h1>
          <p className="tagline">Your Premium Salon Experience</p>
        </div>

        {/* Tab buttons to switch between login and signup (hidden on forgot page) */}
        {!showOtpStep && (
          <div className={`auth-tabs ${activeTab === 'forgot' ? 'hidden' : ''}`}>
            <button
              className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('login');
                setErrors({});
              }}
            >
              Login
            </button>
            <button
              className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('signup');
                setErrors({});
              }}
            >
              Sign Up
            </button>
          </div>
        )}

        {showOtpStep ? (
          <form onSubmit={handleVerifyOtp} className="auth-form tab-panel">
            <h2>Verify Your Account</h2>
            <p className="forgot-text">Please enter the 6-digit OTP sent to {formData.email}</p>
            
            <div className="form-group">
              <label>OTP Code</label>
              <input
                type="text"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                disabled={loading}
              />
            </div>
            
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="form-meta center">
              <button
                type="button"
                className="link-btn"
                onClick={() => setShowOtpStep(false)}
                disabled={loading}
              >
                Back
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* ===== LOGIN FORM ===== */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="auth-form tab-panel">
                {errors.api && <div className="error-banner">{errors.api}</div>}
                
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                  {errors.phone && <span className="error">{errors.phone}</span>}
                  
                  <label style={{ marginTop: '10px', display: 'block' }}>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  {errors.password && <span className="error">{errors.password}</span>}
                </div>
                
                <div className="form-meta">
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => {
                      setActiveTab('forgot');
                      setErrors({});
                    }}
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                </div>
                
                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>

                {unverifiedUser && (
                  <div className="form-meta">
                    <p className="info">Your email is not verified yet.</p>
                    <button type="button" className="auth-btn" onClick={resendVerification} disabled={loading}>Resend verification email</button>
                  </div>
                )}
              </form>
            )}

            {/* ===== SIGNUP FORM ===== */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignup} className="auth-form tab-panel">
                {errors.api && <div className="error-banner">{errors.api}</div>}
                
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    disabled={loading}
                  />
                  {errors.name && <span className="error">{errors.name}</span>}
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                  {errors.email && <span className="error">{errors.email}</span>}
                </div>
                
                <div className="form-group">
                  <label>Contact</label>
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    placeholder="Enter your contact number"
                    disabled={loading}
                  />
                  {errors.contact && <span className="error">{errors.contact}</span>}
                </div>
                
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    disabled={loading}
                  />
                  {errors.password && <span className="error">{errors.password}</span>}
                </div>
                
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    disabled={loading}
                  />
                  {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
                </div>
                
                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? 'Signing up...' : 'Sign Up'}
                </button>
              </form>
            )}

            {/* ===== FORGOT PASSWORD FORM ===== */}
            {activeTab === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="auth-form tab-panel">
                {errors.api && <div className="error-banner">{errors.api}</div>}
                
                <p className="forgot-text">Reset your password with your email and contact</p>
                
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                  {errors.email && <span className="error">{errors.email}</span>}
                </div>
                
                <div className="form-group">
                  <label>Contact</label>
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    placeholder="Enter your contact number"
                    disabled={loading}
                  />
                  {errors.contact && <span className="error">{errors.contact}</span>}
                </div>
                
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter your new password"
                    disabled={loading}
                  />
                  {errors.newPassword && <span className="error">{errors.newPassword}</span>}
                </div>
                
                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
                
                <div className="form-meta center">
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => {
                      setActiveTab('login');
                      setErrors({});
                    }}
                    disabled={loading}
                  >
                    Back to login
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;