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

// ========== PASSWORD RESET OTP FUNCTION ==========
export const forgotPasswordSendOtp = async (email) => {
  try {
    const response = await axiosInstance.post('/auth/forgot-password-send-otp', {
      email,
    });
    return response.data;
  } catch (error) {
    console.error('Forgot password OTP error:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'Failed to send OTP' };
  }
};

// ========== VERIFY RESET OTP FUNCTION ==========
export const verifyResetOtp = async (email, otp) => {
  try {
    const response = await axiosInstance.post('/auth/verify-reset-otp', {
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    console.error('Verify reset OTP error:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'Verification failed' };
  }
};

// ========== PASSWORD RESET FUNCTION ==========
// User provides email, otp, and new password
export const resetPassword = async (email, otp, newPassword) => {
  try {
    const response = await axiosInstance.post('/auth/reset-password', {
      email,
      otp,
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
