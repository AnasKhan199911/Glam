import React from 'react';
import { render } from '@testing-library/react';
import UserChat from '../../components/UserChat';

// Mock ChatWidget so socket.io is never initialised in tests
jest.mock('../../components/ChatWidget', () => (props) => (
  <div data-testid="chat-widget" data-user={props.currentUser?.email} />
));

describe('UserChat', () => {
  beforeEach(() => localStorage.clear());

  it('renders nothing when adminToken is present (admin logged in)', () => {
    localStorage.setItem('adminToken', 'adminTok');
    const { container } = render(<UserChat />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when user is the system admin email', () => {
    localStorage.setItem(
      'user',
      JSON.stringify({ id: 1, name: 'Admin', email: 'admin@glamconnect.com' })
    );
    const { container } = render(<UserChat />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when no user is logged in', () => {
    const { container } = render(<UserChat />);
    expect(container.firstChild).toBeNull();
  });

  it('renders ChatWidget for a regular logged-in user', () => {
    const user = { id: 5, name: 'Jane', email: 'jane@test.com', role: 'customer' };
    localStorage.setItem('user', JSON.stringify(user));
    const { getByTestId } = render(<UserChat />);
    expect(getByTestId('chat-widget')).toBeInTheDocument();
  });

  it('passes the correct user data to ChatWidget', () => {
    const user = { id: 5, name: 'Jane', email: 'jane@test.com' };
    localStorage.setItem('user', JSON.stringify(user));
    const { getByTestId } = render(<UserChat />);
    expect(getByTestId('chat-widget')).toHaveAttribute('data-user', 'jane@test.com');
  });

  it('renders nothing when user JSON in localStorage is malformed', () => {
    localStorage.setItem('user', 'not-valid-json{{{');
    const { container } = render(<UserChat />);
    expect(container.firstChild).toBeNull();
  });
});
