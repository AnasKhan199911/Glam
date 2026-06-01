import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ToastProvider } from '../../components/ToastContainer';
import ContactUs from '../../pages/ContactUs';

const renderContact = () =>
  render(
    <ToastProvider>
      <ContactUs />
    </ToastProvider>
  );

describe('ContactUs page', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ───────────── rendering ─────────────
  it('renders the page heading', () => {
    renderContact();
    expect(screen.getByText(/Get In Touch/i)).toBeInTheDocument();
  });

  it('renders the "Send us a Message" section heading', () => {
    renderContact();
    expect(screen.getByRole('heading', { name: /send us a message/i })).toBeInTheDocument();
  });

  it('renders all five form fields with correct placeholders', () => {
    renderContact();
    expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your phone number')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('What is this about?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your message here...')).toBeInTheDocument();
  });

  it('renders a Send Message button', () => {
    renderContact();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  // ───────────── validation ─────────────
  it('shows warning toast when any field is empty on submit', async () => {
    renderContact();
    fireEvent.change(screen.getByPlaceholderText('Enter your full name'), {
      target: { value: 'Jane' },
    });
    // email, phone, subject, message left empty
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));
    expect(await screen.findByText(/please fill in all fields/i)).toBeInTheDocument();
  });

  it('does not show success message when form is incomplete', () => {
    renderContact();
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));
    expect(screen.queryByText(/thank you/i)).not.toBeInTheDocument();
  });

  // ───────────── successful submission ─────────────
  it('shows success message after all fields are filled and submitted', async () => {
    renderContact();
    fireEvent.change(screen.getByPlaceholderText('Enter your full name'), {
      target: { value: 'Jane' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'jane@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your phone number'), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByPlaceholderText('What is this about?'), {
      target: { value: 'Booking query' },
    });
    fireEvent.change(screen.getByPlaceholderText('Type your message here...'), {
      target: { value: 'Hello, I want to book a service.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));
    expect(
      await screen.findByText(/your message has been sent/i)
    ).toBeInTheDocument();
  });

  it('resets all form fields to empty after 3000 ms', async () => {
    renderContact();
    fireEvent.change(screen.getByPlaceholderText('Enter your full name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'jane@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your phone number'), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByPlaceholderText('What is this about?'), { target: { value: 'Query' } });
    fireEvent.change(screen.getByPlaceholderText('Type your message here...'), { target: { value: 'Hi' } });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));
    act(() => jest.advanceTimersByTime(3000));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter your full name').value).toBe('');
      expect(screen.getByPlaceholderText('Enter your email').value).toBe('');
      expect(screen.getByPlaceholderText('Type your message here...').value).toBe('');
    });
  });

  // ───────────── input binding ─────────────
  it('typing in name field updates its value', () => {
    renderContact();
    const input = screen.getByPlaceholderText('Enter your full name');
    fireEvent.change(input, { target: { value: 'Alice' } });
    expect(input.value).toBe('Alice');
  });

  it('typing in message textarea updates its value', () => {
    renderContact();
    const textarea = screen.getByPlaceholderText('Type your message here...');
    fireEvent.change(textarea, { target: { value: 'Test message content' } });
    expect(textarea.value).toBe('Test message content');
  });

  it('typing in subject field updates its value', () => {
    renderContact();
    const input = screen.getByPlaceholderText('What is this about?');
    fireEvent.change(input, { target: { value: 'Hair appointment' } });
    expect(input.value).toBe('Hair appointment');
  });
});
