import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BannerSlider from '../../components/BannerSlider';

const renderSlider = () =>
  render(
    <MemoryRouter>
      <BannerSlider />
    </MemoryRouter>
  );

describe('BannerSlider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ───────────── content ─────────────
  it('renders all three slide titles', () => {
    renderSlider();
    expect(screen.getByText('Transform Your Look')).toBeInTheDocument();
    expect(screen.getByText('Pamper Yourself')).toBeInTheDocument();
    expect(screen.getByText('Professional Care')).toBeInTheDocument();
  });

  it('renders all three CTA buttons', () => {
    renderSlider();
    expect(screen.getByText('Book Now')).toBeInTheDocument();
    expect(screen.getByText('View Services')).toBeInTheDocument();
    expect(screen.getByText('Learn More')).toBeInTheDocument();
  });

  // ───────────── dots / navigation ─────────────
  it('renders exactly 3 navigation dots', () => {
    const { container } = renderSlider();
    expect(container.querySelectorAll('.dot')).toHaveLength(3);
  });

  it('first dot is active on initial render', () => {
    const { container } = renderSlider();
    const dots = container.querySelectorAll('.dot');
    expect(dots[0]).toHaveClass('active');
    expect(dots[1]).not.toHaveClass('active');
    expect(dots[2]).not.toHaveClass('active');
  });

  it('first slide is active on initial render', () => {
    const { container } = renderSlider();
    const slides = container.querySelectorAll('.slide');
    expect(slides[0]).toHaveClass('active');
  });

  it('clicking second dot activates the second slide', () => {
    const { container } = renderSlider();
    const dots = container.querySelectorAll('.dot');
    fireEvent.click(dots[1]);
    expect(dots[1]).toHaveClass('active');
    expect(dots[0]).not.toHaveClass('active');
  });

  it('clicking third dot activates the third slide', () => {
    const { container } = renderSlider();
    const dots = container.querySelectorAll('.dot');
    fireEvent.click(dots[2]);
    expect(dots[2]).toHaveClass('active');
  });

  // ───────────── auto-advance ─────────────
  it('advances to the second slide after 5000 ms', () => {
    const { container } = renderSlider();
    act(() => jest.advanceTimersByTime(5000));
    const dots = container.querySelectorAll('.dot');
    expect(dots[1]).toHaveClass('active');
  });

  it('wraps back to the first slide after all three slides', () => {
    const { container } = renderSlider();
    act(() => jest.advanceTimersByTime(15000)); // 3 × 5000 ms
    const dots = container.querySelectorAll('.dot');
    expect(dots[0]).toHaveClass('active');
  });

  it('does not advance before 5000 ms', () => {
    const { container } = renderSlider();
    act(() => jest.advanceTimersByTime(4999));
    const dots = container.querySelectorAll('.dot');
    expect(dots[0]).toHaveClass('active');
  });

  // ───────────── auth-aware navigation ─────────────
  it('Book Now button exists and is clickable when logged out', () => {
    renderSlider();
    const btn = screen.getByText('Book Now');
    expect(btn).toBeInTheDocument();
    expect(() => fireEvent.click(btn)).not.toThrow();
  });

  it('Book Now button exists and is clickable when logged in', () => {
    localStorage.setItem('token', 'test-token');
    renderSlider();
    const btn = screen.getByText('Book Now');
    expect(btn).toBeInTheDocument();
    expect(() => fireEvent.click(btn)).not.toThrow();
  });
});
