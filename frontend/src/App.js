import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './screens/Auth';
import Home from './screens/Home';
import AdminAuth from './screens/AdminAuth';
import StaffAuth from './screens/StaffAuth';
import { ToastProvider } from './components/ToastContainer';

// ===== IMPORT ALL PAGE COMPONENTS =====
// These are the new pages for the website
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Services from './pages/Services';
import AboutUs from './pages/AboutUs';
import Gallery from './pages/Gallery';
import ContactUs from './pages/ContactUs';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';

// ===== APP COMPONENT =====
// This is the main app component that handles routing (page navigation)
// Think of it as the "traffic controller" that decides which page to show

function App() {
  // ===== HELPER FUNCTION: Check if user is logged in =====
  // This function checks if there's a token in localStorage
  // If yes = user is logged in, if no = user needs to login
  const isLoggedIn = () => {
    // localStorage.getItem gets data saved in browser storage
    // Returns null if token doesn't exist
    const token = localStorage.getItem('token');
    return token !== null;  // true if token exists, false if not
  };

  // ===== PROTECTED ROUTE COMPONENT =====
  // This component wraps pages that only logged-in users should see
  // If user is not logged in, redirect them to login page
  const ProtectedRoute = ({ children }) => {
    // Check if user is logged in
    if (!isLoggedIn()) {
      // If not logged in, redirect to login page
      return <Navigate to="/auth" replace />;
    }
    // If logged in, show the page
    return children;
  };

  // ===== ADMIN PROTECTED ROUTE =====
  const AdminProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return <Navigate to="/admin-auth" replace />;
    return children;
  };

  const StaffProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('staffToken');
    if (!token) return <Navigate to="/staff-auth" replace />;
    return children;
  };

  // ===== PUBLIC ROUTE LOGIC =====
  // If user is already logged in and visits login page,
  // redirect them to home page
  const PublicRoute = ({ children }) => {
    // Check if user is logged in
    if (isLoggedIn()) {
      // If logged in, redirect to home (dashboard)
      return <Navigate to="/home" replace />;
    }
    // If not logged in, show the login page
    return children;
  };

  // ===== RENDER (What gets shown on screen) =====
  return (
    // BrowserRouter enables routing in the app
    <Router>
      <ToastProvider>
        <div className="App">
          {/* Navbar: always show global navigation (home is public landing) */}
          <Navbar />

        {/* Routes: Set up all the pages and their paths */}
        <Routes>
          {/* 
            Route 1: Login/Signup Page
            Path: "/" (the root/home URL)
            Access: Public (anyone can see)
            Shows: Auth component (login/signup forms)
            Note: Navbar NOT shown on this page
          */}
          {/* Public landing page */}
          <Route path="/" element={<HomePage />} />

          {/* Auth (login/signup) moved to /auth so landing stays public */}
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            }
          />

          {/* 
            Route 2: Main Home/Landing Page (after login)
            Path: "/home"
            Access: Protected (only logged-in users)
            Shows: HomePage component (welcome, featured services, testimonials)
          */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          {/* 
            Route 3: Services Page with Booking
            Path: "/services"
            Access: Protected (only logged-in users)
            Shows: Services component (all services, book via modal)
          */}
          <Route path="/services" element={<Services />} />

          {/* 
            Route 4: About Us Page
            Path: "/about"
            Access: Protected (only logged-in users)
            Shows: AboutUs component (company story, team, mission)
          */}
          <Route path="/about" element={<AboutUs />} />

          {/* 
            Route 5: Gallery Page
            Path: "/gallery"
            Access: Protected (only logged-in users)
            Shows: Gallery component (photos of services, filterable by category)
          */}
          <Route path="/gallery" element={<Gallery />} />

          {/* 
            Route 6: Contact Us Page
            Path: "/contact"
            Access: Protected (only logged-in users)
            Shows: ContactUs component (contact form, business hours, address)
          */}
          <Route path="/contact" element={<ContactUs />} />

          {/* 
            Route 7: User Profile Page
            Path: "/profile"
            Access: Protected (only logged-in users)
            Shows: Home component (user profile, my bookings, edit profile)
          */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route path="/admin-auth" element={<AdminAuth />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />

          {/* Staff Dashboard route */}
          <Route path="/staff-auth" element={<StaffAuth />} />
          <Route
            path="/staff"
            element={
              <StaffProtectedRoute>
                <StaffDashboard />
              </StaffProtectedRoute>
            }
          />

          {/* 
            Route 8: Fallback for unknown URLs
            Path: "*" (any path not matching above)
            Action: Redirect to "/" (login page)
            This prevents blank pages if user goes to wrong URL
          */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
