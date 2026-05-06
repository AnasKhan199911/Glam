import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './screens/Auth';
import Home from './screens/Home';
import AdminAuth from './screens/AdminAuth';
import StaffAuth from './screens/StaffAuth';
import { ToastProvider } from './components/ToastContainer';

// ===== IMPORT ALL PAGE COMPONENTS =====
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Services from './pages/Services';
import AboutUs from './pages/AboutUs';
import Gallery from './pages/Gallery';
import ContactUs from './pages/ContactUs';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import UserChat from './components/UserChat';

function App() {
  const isLoggedIn = () => {
    const token = localStorage.getItem('token');
    return token !== null;
  };

  const ProtectedRoute = ({ children }) => {
    if (!isLoggedIn()) return <Navigate to="/auth" replace />;
    return children;
  };

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

  const PublicRoute = ({ children }) => {
    if (isLoggedIn()) return <Navigate to="/home" replace />;
    return children;
  };

  return (
    <Router>
      <ToastProvider>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
            <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin-auth" element={<AdminAuth />} />
            <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
            <Route path="/staff-auth" element={<StaffAuth />} />
            <Route path="/staff" element={<StaffProtectedRoute><StaffDashboard /></StaffProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <UserChat />
        </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
