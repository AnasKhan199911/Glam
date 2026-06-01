import axiosInstance from '../../api/axiosConfig';
import {
  signup,
  verifyOtp,
  login,
  forgotPasswordSendOtp,
  verifyResetOtp,
  resetPassword,
} from '../../api/authService';

jest.mock('../../api/axiosConfig', () => ({ post: jest.fn() }));

describe('authService', () => {
  beforeEach(() => jest.clearAllMocks());

  // ───────────── signup ─────────────
  describe('signup', () => {
    it('posts correct payload including role:customer', async () => {
      axiosInstance.post.mockResolvedValue({ data: { success: true, message: 'OTP sent' } });
      const result = await signup('Jane', 'jane@test.com', '9876543210', 'secret');
      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/signup', {
        name: 'Jane',
        email: 'jane@test.com',
        contact: '9876543210',
        password: 'secret',
        role: 'customer',
      });
      expect(result.success).toBe(true);
    });

    it('returns full response data on success', async () => {
      axiosInstance.post.mockResolvedValue({ data: { success: true, message: 'OTP sent' } });
      const result = await signup('Jane', 'jane@test.com', '9876543210', 'secret');
      expect(result.message).toBe('OTP sent');
    });

    it('throws response.data when API returns an error response', async () => {
      const errData = { success: false, message: 'Email already exists' };
      axiosInstance.post.mockRejectedValue({ response: { data: errData } });
      await expect(signup('Jane', 'jane@test.com', '98765', 'pass')).rejects.toEqual(errData);
    });

    it('throws fallback object when there is no response (network error)', async () => {
      axiosInstance.post.mockRejectedValue(new Error('Network Error'));
      await expect(signup('Jane', 'jane@test.com', '98765', 'pass')).rejects.toEqual({
        success: false,
        message: 'Signup failed',
      });
    });
  });

  // ───────────── verifyOtp ─────────────
  describe('verifyOtp', () => {
    it('posts email and otp to /auth/verify-otp', async () => {
      axiosInstance.post.mockResolvedValue({ data: { success: true } });
      const result = await verifyOtp('jane@test.com', '123456');
      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/verify-otp', {
        email: 'jane@test.com',
        otp: '123456',
      });
      expect(result.success).toBe(true);
    });

    it('throws response.data on OTP failure', async () => {
      axiosInstance.post.mockRejectedValue({
        response: { data: { success: false, message: 'Invalid OTP' } },
      });
      await expect(verifyOtp('jane@test.com', '000000')).rejects.toEqual({
        success: false,
        message: 'Invalid OTP',
      });
    });

    it('throws fallback when no response', async () => {
      axiosInstance.post.mockRejectedValue(new Error('timeout'));
      await expect(verifyOtp('jane@test.com', '123456')).rejects.toEqual({
        success: false,
        message: 'Verification failed',
      });
    });
  });

  // ───────────── login ─────────────
  describe('login', () => {
    it('posts email and password to /auth/login', async () => {
      axiosInstance.post.mockResolvedValue({
        data: { success: true, token: 'tok123', user: { name: 'Jane', role: 'customer' } },
      });
      const result = await login('jane@test.com', 'secret');
      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/login', {
        email: 'jane@test.com',
        password: 'secret',
      });
      expect(result.token).toBe('tok123');
    });

    it('returns user object on success', async () => {
      axiosInstance.post.mockResolvedValue({
        data: { success: true, token: 't', user: { name: 'Jane', role: 'customer' } },
      });
      const result = await login('jane@test.com', 'secret');
      expect(result.user.name).toBe('Jane');
    });

    it('throws response.data on invalid credentials', async () => {
      axiosInstance.post.mockRejectedValue({
        response: { data: { success: false, message: 'Invalid credentials' } },
      });
      await expect(login('wrong@test.com', 'wrong')).rejects.toEqual({
        success: false,
        message: 'Invalid credentials',
      });
    });

    it('throws fallback when no response', async () => {
      axiosInstance.post.mockRejectedValue(new Error('err'));
      await expect(login('jane@test.com', 'pass')).rejects.toEqual({
        success: false,
        message: 'Login failed',
      });
    });
  });

  // ───────────── forgotPasswordSendOtp ─────────────
  describe('forgotPasswordSendOtp', () => {
    it('posts email to /auth/forgot-password-send-otp', async () => {
      axiosInstance.post.mockResolvedValue({ data: { success: true } });
      const result = await forgotPasswordSendOtp('jane@test.com');
      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/forgot-password-send-otp', {
        email: 'jane@test.com',
      });
      expect(result.success).toBe(true);
    });

    it('throws fallback when no response', async () => {
      axiosInstance.post.mockRejectedValue(new Error('timeout'));
      await expect(forgotPasswordSendOtp('jane@test.com')).rejects.toEqual({
        success: false,
        message: 'Failed to send OTP',
      });
    });
  });

  // ───────────── verifyResetOtp ─────────────
  describe('verifyResetOtp', () => {
    it('posts email and otp to /auth/verify-reset-otp', async () => {
      axiosInstance.post.mockResolvedValue({ data: { success: true } });
      await verifyResetOtp('jane@test.com', '654321');
      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/verify-reset-otp', {
        email: 'jane@test.com',
        otp: '654321',
      });
    });

    it('throws response.data on failure', async () => {
      axiosInstance.post.mockRejectedValue({
        response: { data: { success: false, message: 'Verification failed' } },
      });
      await expect(verifyResetOtp('jane@test.com', '000000')).rejects.toEqual({
        success: false,
        message: 'Verification failed',
      });
    });
  });

  // ───────────── resetPassword ─────────────
  describe('resetPassword', () => {
    it('posts email, otp, and newPassword to /auth/reset-password', async () => {
      axiosInstance.post.mockResolvedValue({ data: { success: true } });
      await resetPassword('jane@test.com', '123456', 'newPass123');
      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/reset-password', {
        email: 'jane@test.com',
        otp: '123456',
        newPassword: 'newPass123',
      });
    });

    it('throws response.data on failure', async () => {
      axiosInstance.post.mockRejectedValue({
        response: { data: { success: false, message: 'Password reset failed' } },
      });
      await expect(resetPassword('jane@test.com', '000', 'p')).rejects.toEqual({
        success: false,
        message: 'Password reset failed',
      });
    });

    it('throws fallback when no response', async () => {
      axiosInstance.post.mockRejectedValue(new Error('err'));
      await expect(resetPassword('jane@test.com', '123', 'pass')).rejects.toEqual({
        success: false,
        message: 'Password reset failed',
      });
    });
  });
});
