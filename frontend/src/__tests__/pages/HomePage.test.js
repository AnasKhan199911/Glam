import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../../pages/HomePage';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderHome = () =>
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );

describe('HomePage', () => {
  beforeEach(() => {
    jest.useFakeTimers(); // BannerSlider uses setInterval
    jest.clearAllMocks();
    localStorage.clear();
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ───────────── content ─────────────
  it('renders the Our Services section', () => {
    renderHome();
    expect(screen.getByText('Our Services')).toBeInTheDocument();
  });

  it('renders the Why Choose Us section', () => {
    renderHome();
    expect(screen.getByText('Why Choose Us')).toBeInTheDocument();
  });

  it('renders Hair Styling, Nail Care, and Facial service cards', () => {
    renderHome();
    expect(screen.getByText('Hair Styling')).toBeInTheDocument();
    expect(screen.getByText('Nail Care')).toBeInTheDocument();
    expect(screen.getByText('Facial')).toBeInTheDocument();
  });

  it('renders the "Ready to Transform?" CTA section', () => {
    renderHome();
    expect(screen.getByText('Ready to Transform?')).toBeInTheDocument();
  });

  it('renders View All Services and Book Appointment buttons', () => {
    renderHome();
    expect(screen.getByRole('button', { name: /view all services/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /book appointment/i })).toBeInTheDocument();
  });

  it('renders Contact Us link', () => {
    renderHome();
    expect(screen.getByRole('link', { name: /contact us/i })).toBeInTheDocument();
  });

  // ───────────── navigation ─────────────
  it('navigates to /auth when View All Services is clicked and user is not logged in', () => {
    renderHome();
    fireEvent.click(screen.getByRole('button', { name: /view all services/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });

  it('navigates to /services when View All Services is clicked and user is logged in', () => {
    localStorage.setItem('token', 'tok123');
    renderHome();
    fireEvent.click(screen.getByRole('button', { name: /view all services/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/services');
  });

  it('navigates to /auth when Book Appointment is clicked and user is not logged in', () => {
    renderHome();
    fireEvent.click(screen.getByRole('button', { name: /book appointment/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });

  it('navigates to /services when Book Appointment is clicked and user is logged in', () => {
    localStorage.setItem('token', 'tok123');
    renderHome();
    fireEvent.click(screen.getByRole('button', { name: /book appointment/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/services');
  });
});
