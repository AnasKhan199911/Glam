import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../components/ToastContainer';
import StaffAuth from '../../screens/StaffAuth';
import axiosInstance from '../../api/axiosConfig';

jest.mock('../../api/axiosConfig', () => ({ post: jest.fn() }));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderStaffAuth = () =>
  render(
    <MemoryRouter>
      <ToastProvider>
        <StaffAuth />
      </ToastProvider>
    </MemoryRouter>
  );

describe('StaffAuth screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  // ───────────── form rendering ─────────────
  it('renders Staff Login heading', () => {
    renderStaffAuth();
    expect(screen.getByText('Staff Login')).toBeInTheDocument();
  });

  it('renders email and password inputs', () => {
    renderStaffAuth();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  it('renders Sign In button', () => {
    renderStaffAuth();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  // ───────────── validation ─────────────
  it('shows warning when fields are empty on submit', async () => {
    renderStaffAuth();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(
      await screen.findByText(/please enter your email and password/i)
    ).toBeInTheDocument();
  });

  // ───────────── successful login ─────────────
  it('stores staffToken and staffUser in localStorage on success', async () => {
    const staff = { id: 1, full_name: 'Sara Staff', email: 'staff@test.com' };
    axiosInstance.post.mockResolvedValue({
      data: { success: true, token: 'staffTok123', staff },
    });
    renderStaffAuth();
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'staff@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'staff123' },
    });
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form'));
    await waitFor(() => {
      expect(localStorage.getItem('staffToken')).toBe('staffTok123');
      expect(JSON.parse(localStorage.getItem('staffUser')).full_name).toBe('Sara Staff');
    });
  });

  it('navigates to /staff on successful login', async () => {
    const staff = { id: 1, full_name: 'Sara', email: 'staff@test.com' };
    axiosInstance.post.mockResolvedValue({
      data: { success: true, token: 'tok', staff },
    });
    renderStaffAuth();
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'staff@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'staff123' },
    });
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/staff'));
  });

  // ───────────── error handling ─────────────
  it('shows error toast on invalid credentials', async () => {
    axiosInstance.post.mockRejectedValue({
      response: { data: { message: 'Invalid credentials. Please check your email and password.' } },
    });
    renderStaffAuth();
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'wrong@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'wrongpass' },
    });
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form'));
    expect(
      await screen.findByText(/invalid credentials/i)
    ).toBeInTheDocument();
  });
});
