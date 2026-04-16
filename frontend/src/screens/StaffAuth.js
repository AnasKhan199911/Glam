import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import { useToast } from '../components/ToastContainer';
import './StaffAuth.css';

const StaffAuth = () => {
  const [form, setForm] = useState({ email: '', password: '' });
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
        const { staff, token } = response.data;
        
        // Store authentication data
        localStorage.setItem('staffToken', token);
        localStorage.setItem('staffUser', JSON.stringify(staff));

        showSuccess(`Welcome back, ${staff.full_name}!`);
        navigate('/staff');
      } else {
        showError(response.data?.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Staff login error:', err);
      showError(err.response?.data?.message || 'Invalid credentials. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staff-auth-page">
      <div className="staff-auth-card">
        <div className="staff-auth-header">
          <span className="staff-icon">👤</span>
          <h2>Staff Login</h2>
          <p>Please enter your credentials to access your dashboard</p>
        </div>

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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="staff-auth-footer">
          <p>Contact admin if you forgot your credentials</p>
        </div>
      </div>
    </div>
  );
};

export default StaffAuth;
