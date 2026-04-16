import axiosInstance from './axiosConfig';

// ========== SIGNUP FUNCTION ==========
// This function handles user registration
// It takes 4 pieces of information from the user
export const signup = async (name, email, contact, password) => {
  try {
    const response = await axiosInstance.post('/auth/signup', {
      name,
      email,
      contact,
      password,
      role: 'customer',
    });
    return response.data;
  } catch (error) {
    console.error('Signup error:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'Signup failed' };
  }
};

// ========== VERIFY OTP FUNCTION ==========
export const verifyOtp = async (email, otp) => {
  try {
    const response = await axiosInstance.post('/auth/verify-otp', {
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    console.error('Verify OTP error:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'Verification failed' };
  }
};

// ========== LOGIN FUNCTION ==========
// This function handles user login
// It takes email and password from the user
export const login = async (email, password) => {
  try {
    const response = await axiosInstance.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'Login failed' };
  }
};

// ========== PASSWORD RESET FUNCTION ==========
// User provides email, phone number, and new password for verification
export const resetPassword = async (email, contact, newPassword) => {
  try {
    const response = await axiosInstance.post('/auth/reset-password', {
      email,
      contact,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error('Reset password error:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'Password reset failed' };
  }
};

// Export all functions as a default object
export default {
  signup,
  verifyOtp,
  login,
  resetPassword,
};
