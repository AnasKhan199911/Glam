import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Toast from '../../components/Toast';

describe('Toast component', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ───────────── rendering ─────────────
  it('renders the message text', () => {
    render(<Toast message="Hello World" type="info" onClose={jest.fn()} />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders ✓ icon for success type', () => {
    render(<Toast message="msg" type="success" onClose={jest.fn()} />);
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('renders ✕ icon for error type', () => {
    render(<Toast message="msg" type="error" onClose={jest.fn()} />);
    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  it('renders ⚠ icon for warning type', () => {
    render(<Toast message="msg" type="warning" onClose={jest.fn()} />);
    expect(screen.getByText('⚠')).toBeInTheDocument();
  });

  it('renders ℹ icon for info type', () => {
    render(<Toast message="msg" type="info" onClose={jest.fn()} />);
    expect(screen.getByText('ℹ')).toBeInTheDocument();
  });

  it('defaults to info icon when no type prop given', () => {
    render(<Toast message="msg" onClose={jest.fn()} />);
    expect(screen.getByText('ℹ')).toBeInTheDocument();
  });

  // ───────────── CSS classes ─────────────
  it('applies toast-success class for success type', () => {
    const { container } = render(<Toast message="msg" type="success" onClose={jest.fn()} />);
    expect(container.querySelector('.toast-success')).toBeInTheDocument();
  });

  it('applies toast-error class for error type', () => {
    const { container } = render(<Toast message="msg" type="error" onClose={jest.fn()} />);
    expect(container.querySelector('.toast-error')).toBeInTheDocument();
  });

  it('applies toast-warning class for warning type', () => {
    const { container } = render(<Toast message="msg" type="warning" onClose={jest.fn()} />);
    expect(container.querySelector('.toast-warning')).toBeInTheDocument();
  });

  // ───────────── close button ─────────────
  it('calls onClose when × button is clicked', () => {
    const onClose = jest.fn();
    render(<Toast message="msg" type="info" onClose={onClose} />);
    fireEvent.click(screen.getByText('×'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ───────────── auto-dismiss ─────────────
  it('calls onClose after the default duration (4000 ms)', () => {
    const onClose = jest.fn();
    render(<Toast message="msg" type="info" onClose={onClose} />);
    expect(onClose).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(4000));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose after a custom duration', () => {
    const onClose = jest.fn();
    render(<Toast message="msg" type="info" onClose={onClose} duration={2000} />);
    act(() => jest.advanceTimersByTime(1999));
    expect(onClose).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(1));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose before duration elapses', () => {
    const onClose = jest.fn();
    render(<Toast message="msg" type="info" onClose={onClose} duration={5000} />);
    act(() => jest.advanceTimersByTime(4999));
    expect(onClose).not.toHaveBeenCalled();
  });
});
