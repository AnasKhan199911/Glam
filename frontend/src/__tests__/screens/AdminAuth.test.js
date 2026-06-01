import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../components/ToastContainer';
import AdminAuth from '../../screens/AdminAuth';
import axiosInstance from '../../api/axiosConfig';

jest.mock('../../api/axiosConfig', () => ({ post: jest.fn() }));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderAdminAuth = () =>
  render(
    <MemoryRouter>
      <ToastProvider>
        <AdminAuth />
      </ToastProvider>
    </MemoryRouter>
  );

describe('AdminAuth screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  // ───────────── form rendering ─────────────
  it('renders the Admin Portal heading', () => {
    renderAdminAuth();
    expect(screen.getByText('Admin Portal')).toBeInTheDocument();
  });

  it('renders email and password inputs', () => {
    renderAdminAuth();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  it('renders Sign In button', () => {
    renderAdminAuth();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  // ───────────── validation ─────────────
  it('shows warning when email is empty on submit', async () => {
    renderAdminAuth();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/please enter both email and password/i)).toBeInTheDocument();
  });

  // ───────────── successful login ─────────────
  it('stores adminToken and token in localStorage on success', async () => {
    axiosInstance.post.mockResolvedValue({
      data: { success: true, token: 'adminTok123', user: { name: 'Admin', role: 'admin' } },
    });
    renderAdminAuth();
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'admin@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'admin123' },
    });
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form'));
    await waitFor(() => {
      expect(localStorage.getItem('adminToken')).toBe('adminTok123');
      expect(localStorage.getItem('token')).toBe('adminTok123');
    });
  });

  it('navigates to /admin for users with role "admin"', async () => {
    axiosInstance.post.mockResolvedValue({
      data: { success: true, token: 'tok', user: { name: 'Admin', role: 'admin' } },
    });
    renderAdminAuth();
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'pass' } });
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin'));
  });

  it('navigates to /staff for users with role "staff"', async () => {
    axiosInstance.post.mockResolvedValue({
      data: { success: true, token: 'tok', user: { name: 'Staff', role: 'staff' } },
    });
    renderAdminAuth();
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'pass' } });
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/staff'));
  });

  // ───────────── fallback (demo) credentials ─────────────
  it('accepts demo credentials admin@glamconnect.com / admin123 when API fails', async () => {
    axiosInstance.post.mockRejectedValue(new Error('API down'));
    renderAdminAuth();
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'admin@glamconnect.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'admin123' },
    });
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form'));
    await waitFor(() => {
      expect(localStorage.getItem('adminToken')).toBe('admin-demo-token');
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });

  it('shows error for wrong credentials when API fails', async () => {
    axiosInstance.post.mockRejectedValue(new Error('API down'));
    renderAdminAuth();
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'wrong@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'wrongpass' },
    });
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form'));
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
