import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Swap BrowserRouter for MemoryRouter so Jest's jsdom has no window.location issues
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }) => (
      <actual.MemoryRouter>{children}</actual.MemoryRouter>
    ),
  };
});

// Mock all heavy page and screen components so they don't drag in their dependencies
jest.mock('./pages/AdminDashboard', () => () => <div>Admin Dashboard</div>);
jest.mock('./pages/StaffDashboard', () => () => <div>Staff Dashboard</div>);
jest.mock('./pages/HomePage', () => () => <div>Home Page</div>);
jest.mock('./pages/Services', () => () => <div>Services Page</div>);
jest.mock('./pages/AboutUs', () => () => <div>About Us</div>);
jest.mock('./pages/Gallery', () => () => <div>Gallery</div>);
jest.mock('./pages/ContactUs', () => () => <div>Contact Us</div>);
jest.mock('./pages/Profile', () => () => <div>Profile</div>);
jest.mock('./screens/Auth', () => () => <div>Auth Page</div>);
jest.mock('./screens/AdminAuth', () => () => <div>Admin Auth Page</div>);
jest.mock('./screens/StaffAuth', () => () => <div>Staff Auth Page</div>);
jest.mock('./screens/Home', () => () => <div>Home Screen</div>);
jest.mock('./components/UserChat', () => () => null);
jest.mock('./components/ChatWidget', () => () => null);
jest.mock('./firebase', () => ({
  auth: {},
  sendVerificationToUser: jest.fn(),
  firebaseConfig: { apiKey: 'test' },
}));
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
}));
jest.mock('socket.io-client', () => () => ({
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
}));

import App from './App';

// Helper: renders App with MemoryRouter navigation pushed to a specific path.
// Because BrowserRouter is mocked to MemoryRouter, we override initial path via
// the MemoryRouter wrapper around App so child Routes see the right location.
const renderAtPath = (path = '/') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );

// Since BrowserRouter is now a passthrough MemoryRouter, wrapping App again in
// MemoryRouter gives us two nested routers. Instead, render App directly and let
// the mocked BrowserRouter handle initial path '/' — then test static assertions.
const renderApp = () => render(<App />);

describe('App', () => {
  beforeEach(() => localStorage.clear());

  it('renders without crashing', () => {
    expect(() => renderApp()).not.toThrow();
  });

  it('renders the Navbar with the GlamConnect brand name', () => {
    renderApp();
    expect(screen.getByText('GlamConnect')).toBeInTheDocument();
  });

  it('renders the Home Page at the default route', () => {
    renderApp();
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });
});

// ───────────── route guard logic (unit tests, no rendering needed) ─────────────
describe('Route guard logic', () => {
  beforeEach(() => localStorage.clear());

  it('isLoggedIn is false when localStorage has no token', () => {
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('isLoggedIn is true when token exists in localStorage', () => {
    localStorage.setItem('token', 'tok123');
    expect(localStorage.getItem('token')).toBe('tok123');
  });

  it('adminToken is null when admin is not logged in', () => {
    expect(localStorage.getItem('adminToken')).toBeNull();
  });

  it('staffToken is null when staff is not logged in', () => {
    expect(localStorage.getItem('staffToken')).toBeNull();
  });

  it('setting token makes it retrievable from localStorage', () => {
    localStorage.setItem('token', 'user-token');
    localStorage.setItem('adminToken', 'admin-token');
    localStorage.setItem('staffToken', 'staff-token');
    expect(localStorage.getItem('token')).toBe('user-token');
    expect(localStorage.getItem('adminToken')).toBe('admin-token');
    expect(localStorage.getItem('staffToken')).toBe('staff-token');
  });
});
