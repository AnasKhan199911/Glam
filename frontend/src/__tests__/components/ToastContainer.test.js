import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../../components/ToastContainer';

const TriggerToast = ({ method, message }) => {
  const toast = useToast();
  return <button onClick={() => toast[method](message)}>{method}</button>;
};

const renderWithProvider = (method, message) =>
  render(
    <ToastProvider>
      <TriggerToast method={method} message={message} />
    </ToastProvider>
  );

describe('ToastProvider / useToast', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ───────────── show methods ─────────────
  it('showSuccess renders a toast with the given message', () => {
    renderWithProvider('showSuccess', 'Saved!');
    fireEvent.click(screen.getByText('showSuccess'));
    expect(screen.getByText('Saved!')).toBeInTheDocument();
  });

  it('showError renders a toast with the given message', () => {
    renderWithProvider('showError', 'Something broke');
    fireEvent.click(screen.getByText('showError'));
    expect(screen.getByText('Something broke')).toBeInTheDocument();
  });

  it('showWarning renders a toast with the given message', () => {
    renderWithProvider('showWarning', 'Watch out!');
    fireEvent.click(screen.getByText('showWarning'));
    expect(screen.getByText('Watch out!')).toBeInTheDocument();
  });

  it('showInfo renders a toast with the given message', () => {
    renderWithProvider('showInfo', 'Just so you know');
    fireEvent.click(screen.getByText('showInfo'));
    expect(screen.getByText('Just so you know')).toBeInTheDocument();
  });

  // ───────────── auto-remove ─────────────
  it('toast disappears after 4000 ms', () => {
    renderWithProvider('showSuccess', 'Temporary');
    fireEvent.click(screen.getByText('showSuccess'));
    expect(screen.getByText('Temporary')).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(4000));
    expect(screen.queryByText('Temporary')).not.toBeInTheDocument();
  });

  it('toast persists before duration elapses', () => {
    renderWithProvider('showSuccess', 'Still here');
    fireEvent.click(screen.getByText('showSuccess'));
    act(() => jest.advanceTimersByTime(3999));
    expect(screen.getByText('Still here')).toBeInTheDocument();
  });

  // ───────────── multiple toasts ─────────────
  it('multiple toasts can be shown at the same time', () => {
    render(
      <ToastProvider>
        <TriggerToast method="showSuccess" message="First" />
        <TriggerToast method="showError" message="Second" />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText('showSuccess'));
    fireEvent.click(screen.getByText('showError'));
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  // ───────────── manual close ─────────────
  it('clicking × removes the toast immediately', () => {
    renderWithProvider('showInfo', 'Close me');
    fireEvent.click(screen.getByText('showInfo'));
    expect(screen.getByText('Close me')).toBeInTheDocument();
    fireEvent.click(screen.getByText('×'));
    expect(screen.queryByText('Close me')).not.toBeInTheDocument();
  });

  // ───────────── context guard ─────────────
  it('throws if useToast is called outside ToastProvider', () => {
    const Broken = () => { useToast(); return null; };
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Broken />)).toThrow('useToast must be used within ToastProvider');
    spy.mockRestore();
  });
});
