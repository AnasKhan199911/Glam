import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import { useToast } from '../components/ToastContainer';
import './StaffAuth.css';

const StaffAuth = () => {
  const [step, setStep] = useState('login'); // 'login' | 'otp'
  const [form, setForm] = useState({ email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      showWarning('Please enter your email and password');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('/staff/login', {
        email: form.email,
        password: form.password
      });
      if (response.data && response.data.success) {
        if (response.data.requires_otp) {
          setStaffEmail(response.data.email);
          setStep('otp');
          showSuccess('OTP sent to your email. Please check your inbox.');
        } else {
          // Fallback if OTP not required
          localStorage.setItem('staffToken', response.data.token);
          localStorage.setItem('staffUser', JSON.stringify(response.data.staff));
          showSuccess(`Welcome back, ${response.data.staff.full_name}!`);
          navigate('/staff');
        }
      } else {
        showError(response.data?.message || 'Invalid credentials');
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Invalid credentials. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      showWarning('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('/staff/verify-otp', {
        email: staffEmail,
        otp: otp
      });
      if (response.data && response.data.success) {
        localStorage.setItem('staffToken', response.data.token);
        localStorage.setItem('staffUser', JSON.stringify(response.data.staff));
        showSuccess(`Welcome back, ${response.data.staff.full_name}!`);
        navigate('/staff');
      } else {
        showError(response.data?.message || 'Invalid OTP');
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staff-auth-page">
      <div className="staff-auth-card">
        <div className="staff-auth-header">
          <span className="staff-icon">👤</span>
          <h2>{step === 'otp' ? 'Verify OTP' : 'Staff Login'}</h2>
          <p>{step === 'otp' ? `Enter the 6-digit OTP sent to ${staffEmail}` : 'Please enter your credentials to access your dashboard'}</p>
        </div>

        {step === 'login' ? (
          <form onSubmit={handleSubmit} className="staff-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={loading}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={loading}
                required
              />
            </div>
            <button className="staff-login-btn" type="submit" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="staff-form">
            <div className="form-group">
              <label>One-Time Password (OTP)</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                disabled={loading}
                required
                style={{ letterSpacing: '0.3em', fontSize: '1.3rem', textAlign: 'center' }}
              />
            </div>
            <button className="staff-login-btn" type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              className="staff-login-btn"
              style={{ background: 'transparent', color: '#1E3A5F', border: '1px solid #1E3A5F', marginTop: 8 }}
              onClick={() => { setStep('login'); setOtp(''); }}
            >
              Back to Login
            </button>
          </form>
        )}

        <div className="staff-auth-footer">
          <p>{step === 'otp' ? 'OTP expires in 10 minutes' : 'Contact admin if you forgot your credentials'}</p>
        </div>
      </div>
    </div>
  );
};

export default StaffAuth;
