import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const renderNavbar = (initialPath = '/') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navbar />
    </MemoryRouter>
  );

describe('Navbar', () => {
  beforeEach(() => localStorage.clear());

  // ───────────── brand ─────────────
  it('renders the GlamConnect brand name', () => {
    renderNavbar();
    expect(screen.getByText('GlamConnect')).toBeInTheDocument();
  });

  // ───────────── nav links ─────────────
  it('renders all navigation links', () => {
    renderNavbar();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Gallery')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  // ───────────── logged-out state ─────────────
  it('shows Login / Sign Up button when not logged in', () => {
    renderNavbar();
    expect(screen.getByText(/Login \/ Sign Up/i)).toBeInTheDocument();
  });

  it('does not show profile avatar button when not logged in', () => {
    renderNavbar();
    expect(screen.queryByTitle(/null|undefined/i)).not.toBeInTheDocument();
    // profile-btn is rendered only when isLoggedIn is true
    const { container } = renderNavbar();
    expect(container.querySelector('.profile-btn')).not.toBeInTheDocument();
  });

  // ───────────── logged-in state (user token) ─────────────
  it('shows profile avatar with user initial when token is set', () => {
    localStorage.setItem('token', 'tok123');
    localStorage.setItem('user', JSON.stringify({ name: 'Alice', email: 'alice@test.com', role: 'customer' }));
    renderNavbar();
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('shows first initial of user name in profile avatar', () => {
    localStorage.setItem('token', 'tok');
    localStorage.setItem('user', JSON.stringify({ name: 'Bob Smith', email: 'bob@test.com' }));
    renderNavbar();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  // ───────────── dropdown ─────────────
  it('opens dropdown showing email when profile button is clicked', () => {
    localStorage.setItem('token', 'tok');
    localStorage.setItem('user', JSON.stringify({ name: 'Alice', email: 'alice@test.com' }));
    renderNavbar();
    fireEvent.click(screen.getByText('A'));
    expect(screen.getByText('alice@test.com')).toBeInTheDocument();
  });

  it('shows Logout option in dropdown', () => {
    localStorage.setItem('token', 'tok');
    localStorage.setItem('user', JSON.stringify({ name: 'Alice', email: 'alice@test.com' }));
    renderNavbar();
    fireEvent.click(screen.getByText('A'));
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });

  it('shows Dashboard link for admin user', () => {
    localStorage.setItem('adminToken', 'adminTok');
    localStorage.setItem('token', 'tok');
    localStorage.setItem('user', JSON.stringify({ name: 'Admin', email: 'admin@test.com', role: 'admin' }));
    renderNavbar();
    fireEvent.click(screen.getByText('A'));
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  // ───────────── logout ─────────────
  it('clears all auth tokens from localStorage on logout', () => {
    localStorage.setItem('token', 'tok');
    localStorage.setItem('user', JSON.stringify({ name: 'Alice', email: 'alice@test.com' }));
    localStorage.setItem('adminToken', 'adminTok');
    localStorage.setItem('staffToken', 'staffTok');
    localStorage.setItem('staffUser', JSON.stringify({ full_name: 'Staff' }));
    renderNavbar();
    fireEvent.click(screen.getByText('A'));
    fireEvent.click(screen.getByText(/Logout/i));
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('adminToken')).toBeNull();
    expect(localStorage.getItem('staffToken')).toBeNull();
    expect(localStorage.getItem('staffUser')).toBeNull();
  });

  // ───────────── staff token ─────────────
  it('shows profile button when staffToken is present', () => {
    localStorage.setItem('staffToken', 'staffTok');
    localStorage.setItem('staffUser', JSON.stringify({ full_name: 'Sara Staff', email: 'staff@test.com' }));
    const { container } = renderNavbar();
    expect(container.querySelector('.profile-btn')).toBeInTheDocument();
  });
});
