import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../components/ToastContainer';
import Auth from '../../screens/Auth';
import * as authService from '../../api/authService';
import axiosInstance from '../../api/axiosConfig';

jest.mock('../../api/authService');
jest.mock('../../api/axiosConfig', () => ({ post: jest.fn() }));
jest.mock('../../firebase', () => ({
  auth: {},
  sendVerificationToUser: jest.fn(),
  firebaseConfig: { apiKey: 'test-key' },
}));
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderAuth = () =>
  render(
    <MemoryRouter>
      <ToastProvider>
        <Auth />
      </ToastProvider>
    </MemoryRouter>
  );

describe('Auth screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    axiosInstance.post.mockResolvedValue({ data: {} });
  });

  // ───────────── login form ─────────────
  describe('Login form', () => {
    it('renders email and password inputs by default', () => {
      renderAuth();
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    });

    it('shows "Email is required" when submitting empty form', async () => {
      const { container } = renderAuth();
      fireEvent.submit(container.querySelector('form'));
      expect(await screen.findByText('Email is required')).toBeInTheDocument();
    });

    it('shows "Password is required" when only email is filled', async () => {
      const { container } = renderAuth();
      fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
        target: { value: 'a@b.com' },
      });
      fireEvent.submit(container.querySelector('form'));
      expect(await screen.findByText('Password is required')).toBeInTheDocument();
    });

    it('shows "Invalid email" for a badly formatted email', async () => {
      const { container } = renderAuth();
      fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
        target: { value: 'notanemail' },
      });
      fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
        target: { value: 'pass123' },
      });
      fireEvent.submit(container.querySelector('form'));
      expect(await screen.findByText('Invalid email')).toBeInTheDocument();
    });

    it('stores token in localStorage and navigates to /home on success', async () => {
      axiosInstance.post.mockResolvedValue({
        data: {
          success: true,
          token: 'tok123',
          user: { name: 'Alice', role: 'customer', is_verified: true },
        },
      });
      const { container } = renderAuth();
      fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
        target: { value: 'alice@test.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
        target: { value: 'pass123' },
      });
      fireEvent.submit(container.querySelector('form'));
      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('tok123');
        expect(mockNavigate).toHaveBeenCalledWith('/home');
      });
    });

    it('stores user data in localStorage on success', async () => {
      const user = { name: 'Alice', role: 'customer', is_verified: true };
      axiosInstance.post.mockResolvedValue({
        data: { success: true, token: 'tok', user },
      });
      const { container } = renderAuth();
      fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
        target: { value: 'alice@test.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
        target: { value: 'pass123' },
      });
      fireEvent.submit(container.querySelector('form'));
      await waitFor(() => {
        expect(JSON.parse(localStorage.getItem('user')).name).toBe('Alice');
      });
    });

    it('shows OTP step when the backend returns is_verified: false', async () => {
      axiosInstance.post.mockResolvedValue({
        data: { success: true, token: 'tok', user: { is_verified: false, email: 'alice@test.com' } },
      });
      const { container } = renderAuth();
      fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
        target: { value: 'alice@test.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
        target: { value: 'pass' },
      });
      fireEvent.submit(container.querySelector('form'));
      expect(await screen.findByText('Verify Your Account')).toBeInTheDocument();
    });
  });

  // ───────────── signup form ─────────────
  describe('Signup form', () => {
    const switchToSignup = () =>
      fireEvent.click(screen.getAllByRole('button', { name: /sign up/i })[0]);

    it('shows signup form when Sign Up tab is clicked', () => {
      renderAuth();
      switchToSignup();
      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    });

    it('shows "Name is required" on empty submit', async () => {
      const { container } = renderAuth();
      switchToSignup();
      fireEvent.submit(container.querySelector('form'));
      expect(await screen.findByText('Name is required')).toBeInTheDocument();
    });

    it('shows "Passwords do not match" error', async () => {
      const { container } = renderAuth();
      switchToSignup();
      fireEvent.change(screen.getByPlaceholderText('Enter your name'), { target: { value: 'Jane' } });
      fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'jane@test.com' } });
      fireEvent.change(screen.getByPlaceholderText('Enter your contact number'), { target: { value: '1234567890' } });
      fireEvent.change(screen.getByPlaceholderText('Create a password'), { target: { value: 'pass1' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'pass2' } });
      fireEvent.submit(container.querySelector('form'));
      expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    });

    it('shows OTP verification step on successful signup', async () => {
      authService.signup.mockResolvedValue({ success: true });
      const { container } = renderAuth();
      switchToSignup();
      fireEvent.change(screen.getByPlaceholderText('Enter your name'), { target: { value: 'Jane' } });
      fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'jane@test.com' } });
      fireEvent.change(screen.getByPlaceholderText('Enter your contact number'), { target: { value: '1234567890' } });
      fireEvent.change(screen.getByPlaceholderText('Create a password'), { target: { value: 'pass123' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'pass123' } });
      fireEvent.submit(container.querySelector('form'));
      expect(await screen.findByText('Verify Your Account')).toBeInTheDocument();
    });
  });

  // ───────────── forgot password ─────────────
  describe('Forgot password flow', () => {
    it('shows Forgot Password heading when link is clicked', () => {
      renderAuth();
      fireEvent.click(screen.getByText(/Forgot password\?/i));
      expect(screen.getByText('Forgot Password')).toBeInTheDocument();
    });

    it('shows "Send OTP" button in forgot password view', () => {
      renderAuth();
      fireEvent.click(screen.getByText(/Forgot password\?/i));
      expect(screen.getByRole('button', { name: /send otp/i })).toBeInTheDocument();
    });

    it('shows email validation error on empty submit in forgot form', async () => {
      const { container } = renderAuth();
      fireEvent.click(screen.getByText(/Forgot password\?/i));
      fireEvent.submit(container.querySelector('form'));
      expect(await screen.findByText('Valid email is required')).toBeInTheDocument();
    });

    it('"Back to login" link navigates back to login tab', () => {
      renderAuth();
      fireEvent.click(screen.getByText(/Forgot password\?/i));
      fireEvent.click(screen.getByText(/Back to login/i));
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    });
  });
});
