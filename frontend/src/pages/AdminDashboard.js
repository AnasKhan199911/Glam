import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';
import axios from '../api/axiosConfig';
import { useToast } from '../components/ToastContainer';

const AdminDashboard = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceMap, setServiceMap] = useState({}); // Service name lookup
  const [staff, setStaff] = useState([]);
  const [users, setUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, past: 0, confirmed: 0, totalStaff: 0, activeStaff: 0, totalUsers: 0 });
  const [activeTab, setActiveTab] = useState('bookings');
  
  // Confirmation Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  // Service Form State
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceForm, setServiceForm] = useState({ 
    service_name: '', 
    category: 'Hair',
    description: '', 
    price: '', 
    duration: '30 mins',
    image_url: '',
    icon: '💇',
    is_active: 1
  });
  const [editingServiceId, setEditingServiceId] = useState(null);

  // Staff Form State
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffForm, setStaffForm] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    phone: '',
    role: 'stylist',
    specialization: '',
    experience_years: 0,
    salary: '',
    bio: '',
    password: '',
    profile_image: null
  });
  const [editingStaffId, setEditingStaffId] = useState(null);

  // Sample staff data (would come from API in production)
  const sampleStaff = [
    { id: 1, employee_id: 'EMP001', full_name: 'Maria Santos', email: 'maria@glamconnect.com', phone: '+923001234001', role: 'stylist', specialization: 'Hair Coloring & Styling', experience_years: 8, salary: 75000, rating: 4.9, total_services: 342, is_active: true, profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop' },
    { id: 2, employee_id: 'EMP002', full_name: 'Ayesha Khan', email: 'ayesha@glamconnect.com', phone: '+923001234002', role: 'beautician', specialization: 'Bridal Makeup', experience_years: 6, salary: 65000, rating: 4.8, total_services: 289, is_active: true, profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop' },
    { id: 3, employee_id: 'EMP003', full_name: 'Fatima Ali', email: 'fatima@glamconnect.com', phone: '+923001234003', role: 'therapist', specialization: 'Spa & Wellness', experience_years: 5, salary: 55000, rating: 4.7, total_services: 198, is_active: true, profile_image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop' },
    { id: 4, employee_id: 'EMP004', full_name: 'Zara Ahmed', email: 'zara@glamconnect.com', phone: '+923001234004', role: 'nail_artist', specialization: 'Nail Art Design', experience_years: 4, salary: 45000, rating: 4.9, total_services: 456, is_active: true, profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop' },
    { id: 5, employee_id: 'EMP005', full_name: 'Hina Malik', email: 'hina@glamconnect.com', phone: '+923001234005', role: 'beautician', specialization: 'Skincare & Facials', experience_years: 7, salary: 60000, rating: 4.6, total_services: 267, is_active: false, profile_image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop' },
  ];

  const categories = ['Hair', 'Nails', 'Makeup', 'Skincare', 'Spa'];
  const roles = [
    { value: 'stylist', label: 'Hair Stylist' },
    { value: 'beautician', label: 'Beautician' },
    { value: 'therapist', label: 'Spa Therapist' },
    { value: 'nail_artist', label: 'Nail Artist' },
    { value: 'receptionist', label: 'Receptionist' },
    { value: 'manager', label: 'Manager' }
  ];

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const resp = await axios.post('/bookings/get-all');
      if (resp.data && resp.data.success) {
        setBookings(resp.data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const resp = await axios.post('/services/get-all');
      if (resp.data && resp.data.success) {
        const servicesList = resp.data.services || [];
        setServices(servicesList);
        // Create lookup map for service names
        const map = {};
        servicesList.forEach(s => {
          map[s.id] = s.service_name || 'Unknown Service';
        });
        setServiceMap(map);
      }
    } catch (err) {
      console.error('Error fetching services', err);
    }
  };

  const fetchStaff = async () => {
    try {
      const resp = await axios.post('/staff/get-all');
      if (resp.data && resp.data.success) {
        setStaff(resp.data.staff || []);
      }
    } catch (err) {
      console.error('Error fetching staff', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const resp = await axios.post('/auth/get-users');
      if (resp.data && resp.data.success) {
        setUsers(resp.data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users', err);
    }
  };

  const fetchAttendance = async () => {
    try {
      const resp = await axios.post('/attendance/get-all');
      if (resp.data && resp.data.success) {
        setAttendance(resp.data.records || []);
      }
    } catch (err) {
      console.error('Error fetching attendance', err);
    }
  };

  const fetchReviews = async () => {
    try {
      const resp = await axios.post('/reviews/get-all');
      if (resp.data && resp.data.success) {
        setReviews(resp.data.reviews || []);
      }
    } catch (err) {
      console.error('Error fetching reviews', err);
    }
  };

  useEffect(() => { 
    fetchBookings();
    fetchServices();
    fetchStaff();
    fetchUsers();
    fetchAttendance();
    fetchReviews();
  }, []);

  // Real-time polling for Attendance Tab
  useEffect(() => {
    let interval;
    if (activeTab === 'attendance' || activeTab === 'reviews') {
      interval = setInterval(() => {
        if (activeTab === 'attendance') fetchAttendance();
        if (activeTab === 'reviews') fetchReviews();
      }, 5000); 
    }
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    const now = new Date();
    const total = bookings.length;
    let upcoming = 0, past = 0, confirmed = 0;
    
    bookings.forEach(b => {
      const dt = new Date(b.date + 'T' + (b.time || '00:00'));
      if (dt >= now) upcoming++; else past++;
      if (b.status === 'confirmed') confirmed++;
    });

    const totalUsers = users.length;
    const totalStaff = staff.length;
    const activeStaff = staff.filter(s => s.is_active).length;
    
    setStats({ total, upcoming, past, confirmed, totalStaff, activeStaff, totalUsers });
  }, [bookings, staff, users]);

  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) {
    return (
      <div className="admin-dashboard">
        <div className="admin-access-denied">
          <div className="access-icon">🔒</div>
          <h2>Access Denied</h2>
          <p>Admin authentication required to access this dashboard.</p>
          <a href="/admin-auth" className="admin-login-link">Go to Admin Login</a>
        </div>
      </div>
    );
  }

  const adminUpdate = async (id, fields) => {
    try {
      const payload = { id, ...fields };
      const resp = await axios.post('/bookings/update', payload);
      if (resp.data && resp.data.success) {
        showSuccess('Booking updated successfully');
        fetchBookings();
      } else {
        showError('Failed to update booking');
      }
    } catch (err) {
      showError('Error updating booking');
    }
  };

  const toggleServiceStatus = async (serviceId, currentStatus) => {
    try {
      const resp = await axios.post('/services/update', { id: serviceId, is_active: !currentStatus });
      if (resp.data && resp.data.success) {
        showSuccess(!currentStatus ? 'Service activated' : 'Service deactivated');
        fetchServices();
      } else {
        showError('Failed to update service');
      }
    } catch (err) {
      showError('Error updating service');
    }
  };

  const adminDelete = (id) => {
    setDeleteTarget({ type: 'booking', id: id });
    setShowDeleteModal(true);
  };

  // Service handlers
  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!serviceForm.service_name || !serviceForm.description || !serviceForm.price) {
      showWarning('Service name, description, and price are required.');
      return;
    }
    
    try {
      const endpoint = editingServiceId ? '/services/update' : '/services/create';
      
      const formData = new FormData();
      Object.keys(serviceForm).forEach(key => {
        if (key === 'image_url' && serviceForm[key] instanceof File) {
          formData.append('image', serviceForm[key]);
        } else if (key === 'image_url' && typeof serviceForm[key] === 'string') {
          formData.append('image_url', serviceForm[key]);
        } else {
          formData.append(key, serviceForm[key] !== null ? serviceForm[key] : '');
        }
      });
      if (editingServiceId) formData.append('id', editingServiceId);

      const resp = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (resp.data && resp.data.success) {
        showSuccess(editingServiceId ? 'Service updated!' : 'Service created!');
        resetServiceForm();
        fetchServices();
      } else {
        showError(resp.data?.message || 'Failed to save service');
      }
    } catch (err) {
      showError('Error saving service: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditService = (service) => {
    setServiceForm({
      service_name: service.service_name,
      category: service.category || 'Hair',
      description: service.description,
      price: service.price,
      duration: service.duration || '30 mins',
      image_url: service.image_url || '',
      icon: service.icon || '💇',
      is_active: service.is_active === 1 || service.is_active === true || service.is_active === '1' ? 1 : 0
    });
    setEditingServiceId(service.id);
    setShowServiceForm(true);
  };

  const handleDeleteService = (serviceId) => {
    setDeleteTarget({ type: 'service', id: serviceId });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      if (deleteTarget.type === 'service') {
        const resp = await axios.post('/services/delete', { id: deleteTarget.id });
        if (resp.data && resp.data.success) {
          showSuccess('Service deleted successfully!');
          fetchServices();
        } else {
          showError(resp.data?.message || 'Failed to delete service');
        }
      } else if (deleteTarget.type === 'booking') {
        const resp = await axios.post('/bookings/delete', { id: deleteTarget.id });
        if (resp.data && resp.data.success) {
          showSuccess('Booking deleted successfully!');
          fetchBookings();
        } else {
          showError(resp.data?.message || 'Failed to delete booking');
        }
      } else if (deleteTarget.type === 'user') {
        const resp = await axios.post('/auth/delete-user', { id: deleteTarget.id });
        if (resp.data && resp.data.success) {
          showSuccess('User deleted successfully!');
          fetchUsers();
        } else {
          showError(resp.data?.message || 'Failed to delete user');
        }
      }
    } catch (err) {
      showError('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const resetServiceForm = () => {
    setServiceForm({ service_name: '', category: 'Hair', description: '', price: '', duration: '30 mins', image_url: '', icon: '💇', is_active: 1 });
    setEditingServiceId(null);
    setShowServiceForm(false);
  };

  // Staff handlers
  const handleSaveStaff = async (e) => {
    e.preventDefault();
    if (!staffForm.full_name || !staffForm.email || !staffForm.phone) {
      showWarning('Name, email, and phone are required.');
      return;
    }

    try {
      const endpoint = editingStaffId ? '/staff/update' : '/staff/create';
      
      const formData = new FormData();
      Object.keys(staffForm).forEach(key => {
        if (key === 'profile_image' && staffForm[key] instanceof File) {
          formData.append('profile_image', staffForm[key]);
        } else if (key === 'profile_image' && typeof staffForm[key] === 'string') {
          formData.append('profile_image', staffForm[key]);
        } else {
          formData.append(key, staffForm[key] !== null ? staffForm[key] : '');
        }
      });
      if (editingStaffId) formData.append('id', editingStaffId);

      const resp = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (resp.data && resp.data.success) {
        showSuccess(editingStaffId ? 'Staff updated!' : 'Staff added!');
        resetStaffForm();
        fetchStaff();
      } else {
        showError(resp.data?.message || 'Failed to save staff');
      }
    } catch (err) {
      console.error('Error saving staff:', err);
      showError('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditStaff = (staffMember) => {
    setStaffForm({
      employee_id: staffMember.employee_id,
      full_name: staffMember.full_name,
      email: staffMember.email,
      phone: staffMember.phone,
      role: staffMember.role,
      specialization: staffMember.specialization || '',
      experience_years: staffMember.experience_years || 0,
      salary: staffMember.salary || '',
      bio: staffMember.bio || '',
      password: '',
      profile_image: staffMember.profile_image || null
    });
    setEditingStaffId(staffMember.id);
    setShowStaffForm(true);
  };

  const handleDeleteStaff = async (staffId) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    try {
      const resp = await axios.post('/staff/delete', { id: staffId });
      if (resp.data && resp.data.success) {
        showSuccess('Staff member removed successfully');
        fetchStaff();
      } else {
        showError(resp.data?.message || 'Failed to remove staff');
      }
    } catch (err) {
      console.error('Error deleting staff:', err);
      showError('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this client? This will remove all their data.')) return;
    try {
      const resp = await axios.post('/auth/delete-user', { id: userId });
      if (resp.data && resp.data.success) {
        showSuccess('Client deleted successfully');
        fetchUsers();
      } else {
        showError(resp.data?.message || 'Failed to delete client');
      }
    } catch (err) {
      showError('Error deleting client');
    }
  };

  const toggleStaffStatus = async (staffMember) => {
    const newStatus = !staffMember.is_active;
    try {
      const resp = await axios.post('/staff/update-status', { id: staffMember.id, is_active: newStatus });
      if (resp.data && resp.data.success) {
        setStaff(staff.map(s => s.id === staffMember.id ? { ...s, is_active: newStatus } : s));
        showSuccess(`Staff member ${newStatus ? 'activated' : 'deactivated'}`);
      } else {
        showError('Failed to update status');
      }
    } catch (err) {
      console.error('Error updating staff status:', err);
      showError('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const resetStaffForm = () => {
    setStaffForm({ 
      employee_id: '', 
      full_name: '', 
      email: '', 
      phone: '', 
      role: 'stylist', 
      specialization: '', 
      experience_years: 0, 
      salary: '', 
      bio: '', 
      password: '',
      profile_image: null 
    });
    setEditingStaffId(null);
    setShowStaffForm(false);
  };

  const getRoleLabel = (role) => {
    const found = roles.find(r => r.value === role);
    return found ? found.label : role;
  };

  const generateEmployeeId = () => {
    const num = staff.length + 1;
    return `EMP${num.toString().padStart(3, '0')}`;
  };

  return (
    <div className="admin-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <p>Welcome back! Manage your salon operations efficiently.</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={() => { fetchBookings(); fetchServices(); fetchStaff(); fetchUsers(); }}>
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card bookings-stat">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Bookings</span>
          </div>
        </div>
        <div className="stat-card upcoming-stat">
          <div className="stat-icon">⏰</div>
          <div className="stat-info">
            <span className="stat-value">{stats.upcoming}</span>
            <span className="stat-label">Upcoming</span>
          </div>
        </div>
        <div className="stat-card confirmed-stat">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">{stats.confirmed}</span>
            <span className="stat-label">Confirmed</span>
          </div>
        </div>
        <div className="stat-card customers-stat">
          <div className="stat-icon">👤</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalUsers || 0}</span>
            <span className="stat-label">Total Clients</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
          <span className="tab-icon">📋</span> Bookings
        </button>
        <button className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
          <span className="tab-icon">💅</span> Services
        </button>
        <button className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`} onClick={() => setActiveTab('staff')}>
          <span className="tab-icon">👥</span> Staff
        </button>
        <button className={`tab-btn ${activeTab === 'clients' ? 'active' : ''}`} onClick={() => setActiveTab('clients')}>
          <span className="tab-icon">👤</span> Clients
        </button>
        <button className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>
          <span className="tab-icon">📅</span> Attendance
        </button>
        <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
          <span className="tab-icon">⭐</span> Reviews
        </button>
      </div>

      {/* Main Content Area */}
      <div className="admin-content">
        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <section className="content-section">
            <div className="section-header">
              <h2>Bookings Management</h2>
            </div>
            {loading ? (
              <div className="loading-state">Loading bookings...</div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📭</span>
                <p>No bookings yet</p>
              </div>
            ) : (
              <div className="bookings-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Customer</th>
                      <th>Service</th>
                      <th>Date & Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b, idx) => {
                      const bookingDateTime = new Date((b.booking_date || b.date) + 'T' + (b.booking_time || b.time || '00:00'));
                      const isPast = bookingDateTime < new Date();
                      return (
                        <tr key={b.id} className={isPast ? 'past-booking' : ''}>
                          <td>{idx + 1}</td>
                          <td>
                            <div className="customer-info">
                              <strong>{b.customer_name || b.name || `User ${b.user_id}`}</strong>
                              <span className="customer-email">{b.customer_email || b.email || '—'}</span>
                            </div>
                          </td>
                          <td>{serviceMap[b.service_id] || `Service ${b.service_id}`}</td>
                          <td>
                            <div className="datetime-cell">
                              <span className="date">📅 {new Date(b.booking_date || b.date).toLocaleDateString()}</span>
                              <span className="time">🕐 {b.booking_time || b.time}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${b.status || 'pending'}`}>
                              {(b.status || 'pending').toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              {b.status !== 'confirmed' && b.status !== 'completed' && (
                                <button className="btn-icon btn-confirm" onClick={() => adminUpdate(b.id, { status: 'confirmed' })} title="Confirm">✓</button>
                              )}
                              {b.status !== 'completed' && (
                                <button className="btn-icon btn-complete" onClick={() => adminUpdate(b.id, { status: 'completed' })} title="Complete">✔</button>
                              )}
                              <button className="btn-icon btn-edit" onClick={() => {
                                const newDate = prompt('New date (YYYY-MM-DD)', b.booking_date || b.date);
                                const newTime = prompt('New time (HH:MM)', b.booking_time || b.time);
                                if (newDate || newTime) adminUpdate(b.id, { booking_date: newDate || (b.booking_date || b.date), booking_time: newTime || (b.booking_time || b.time) });
                              }} title="Edit">✎</button>
                              <button className="btn-icon btn-delete" onClick={() => adminDelete(b.id)} title="Delete">✕</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <section className="content-section">
            <div className="section-header">
              <h2>Services Management</h2>
              <button className="add-btn" onClick={() => { resetServiceForm(); setShowServiceForm(true); }}>
                + Add Service
              </button>
            </div>

            {showServiceForm && (
              <div className="form-card">
                <form onSubmit={handleSaveService}>
                  <h3>{editingServiceId ? 'Edit Service' : 'Add New Service'}</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Service Name *</label>
                      <input type="text" value={serviceForm.service_name} onChange={(e) => setServiceForm({...serviceForm, service_name: e.target.value})} placeholder="e.g., Luxury Manicure" required />
                    </div>
                    <div className="form-group">
                      <label>Category *</label>
                      <select value={serviceForm.category} onChange={(e) => setServiceForm({...serviceForm, category: e.target.value})}>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Price (Rs) *</label>
                      <input type="number" value={serviceForm.price} onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})} placeholder="0" required />
                    </div>
                    <div className="form-group">
                      <label>Duration</label>
                      <select value={serviceForm.duration} onChange={(e) => setServiceForm({...serviceForm, duration: e.target.value})}>
                        <option value="30 mins">30 mins</option>
                        <option value="45 mins">45 mins</option>
                        <option value="1 hour">1 hour</option>
                        <option value="1.5 hours">1.5 hours</option>
                        <option value="2 hours">2 hours</option>
                        <option value="2.5 hours">2.5 hours</option>
                        <option value="3 hours">3 hours</option>
                      </select>
                    </div>
                    <div className="form-group full">
                      <label>Description *</label>
                      <textarea value={serviceForm.description} onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})} placeholder="Describe the service..." rows={3} required />
                    </div>
                    <div className="form-group full">
                      <label>Service Image (JPG/PNG)</label>
                      <input 
                        type="file" 
                        accept="image/jpeg, image/png, image/jpg"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setServiceForm({...serviceForm, image_url: e.target.files[0]});
                          }
                        }} 
                        style={{
                          padding: '10px',
                          border: '2px dashed #dcdde1',
                          borderRadius: '8px',
                          width: '100%',
                          cursor: 'pointer'
                        }}
                      />
                      {serviceForm.image_url instanceof File ? (
                        <div style={{marginTop: '10px', fontSize: '13px', color: '#6c2bff', fontWeight: '500'}}>
                          ✓ Selected: {serviceForm.image_url.name}
                        </div>
                      ) : typeof serviceForm.image_url === 'string' && serviceForm.image_url ? (
                        <div style={{marginTop: '10px'}}>
                          <img src={serviceForm.image_url} alt="Current Service" style={{maxHeight: '80px', borderRadius: '8px', objectFit: 'cover'}} />
                          <p style={{fontSize: '12px', color: '#7f8fa6'}}>Current Image</p>
                        </div>
                      ) : null}
                    </div>
                    <div className="form-group">
                      <label>Icon Emoji</label>
                      <input type="text" value={serviceForm.icon} onChange={(e) => setServiceForm({...serviceForm, icon: e.target.value})} placeholder="💇" maxLength={2} />
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select value={String(serviceForm.is_active)} onChange={(e) => setServiceForm({...serviceForm, is_active: parseInt(e.target.value)})}>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-primary">{editingServiceId ? 'Update' : 'Create'}</button>
                    <button type="button" className="btn-secondary" onClick={resetServiceForm}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="services-grid">
              {services.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">💅</span>
                  <p>No services yet. Add your first service!</p>
                </div>
              ) : (
                services.map((service) => (
                  <div key={service.id} className={`service-card-admin ${service.is_active ? 'active' : 'inactive'}`}>
                    <div className="service-card-overlay">
                      {service.image_url && <img src={service.image_url} alt={service.service_name} className="service-img" />}
                      <div className="status-overlay">
                        <span className={`status-label ${service.is_active ? 'active' : 'inactive'}`}>
                          {service.is_active ? '✓ ACTIVE' : '✕ INACTIVE'}
                        </span>
                      </div>
                    </div>
                    <div className="service-card-content">
                      <div className="service-card-header">
                        <h4>{service.service_name}</h4>
                        <span className="category-badge">{service.category || 'General'}</span>
                      </div>
                      <p className="service-desc">{service.description}</p>
                      <div className="service-meta">
                        <span className="price">Rs {parseFloat(service.price).toLocaleString()}</span>
                        <span className="duration">{service.duration || '—'}</span>
                      </div>
                      <div className="card-actions">
                        <button className="btn-edit" onClick={() => handleEditService(service)}>✏️ Edit</button>
                        <button className="btn-toggle" onClick={() => toggleServiceStatus(service.id, service.is_active)} title={service.is_active ? 'Deactivate' : 'Activate'}>
                          {service.is_active ? '🔴 Deactivate' : '🟢 Activate'}
                        </button>
                        <button className="btn-delete" onClick={() => handleDeleteService(service.id)}>🗑️ Delete</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <section className="content-section">
            <div className="section-header">
              <h2>Staff Management</h2>
              <button className="add-btn" onClick={() => { resetStaffForm(); setShowStaffForm(true); }}>
                + Add Staff
              </button>
            </div>

            {showStaffForm && (
              <div className="form-card">
                <form onSubmit={handleSaveStaff}>
                  <h3>{editingStaffId ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Employee ID {editingStaffId ? '' : '(Auto-generated)'}</label>
                      <input 
                        type="text" 
                        value={staffForm.employee_id} 
                        onChange={(e) => setStaffForm({...staffForm, employee_id: e.target.value})} 
                        placeholder={editingStaffId ? "EMP000" : "Auto-generated after save"} 
                        disabled={true} 
                        style={{ backgroundColor: '#f5f6fa', cursor: 'not-allowed' }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input type="text" value={staffForm.full_name} onChange={(e) => setStaffForm({...staffForm, full_name: e.target.value})} placeholder="Enter full name" required />
                    </div>
                    <div className="form-group">
                      <label>Email *</label>
                      <input type="email" value={staffForm.email} onChange={(e) => setStaffForm({...staffForm, email: e.target.value})} placeholder="email@example.com" required />
                    </div>
                    <div className="form-group">
                      <label>Phone *</label>
                      <input type="tel" value={staffForm.phone} onChange={(e) => setStaffForm({...staffForm, phone: e.target.value})} placeholder="+923001234567" required />
                    </div>
                    <div className="form-group">
                      <label>Password {editingStaffId ? '(Leave blank to stay same)' : '*'}</label>
                      <input 
                        type="password" 
                        value={staffForm.password} 
                        onChange={(e) => setStaffForm({...staffForm, password: e.target.value})} 
                        placeholder={editingStaffId ? "••••••••" : "Enter password"} 
                        required={!editingStaffId} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Password {editingStaffId ? '(Leave blank to stay same)' : '*'}</label>
                      <input 
                        type="password" 
                        value={staffForm.password} 
                        onChange={(e) => setStaffForm({...staffForm, password: e.target.value})} 
                        placeholder={editingStaffId ? "••••••••" : "Enter password"} 
                        required={!editingStaffId} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Role *</label>
                      <select value={staffForm.role} onChange={(e) => setStaffForm({...staffForm, role: e.target.value})}>
                        {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Specialization</label>
                      <input type="text" value={staffForm.specialization} onChange={(e) => setStaffForm({...staffForm, specialization: e.target.value})} placeholder="e.g., Hair Coloring" />
                    </div>
                    <div className="form-group">
                      <label>Experience (Years)</label>
                      <input type="number" value={staffForm.experience_years} onChange={(e) => setStaffForm({...staffForm, experience_years: parseInt(e.target.value) || 0})} min="0" />
                    </div>
                    <div className="form-group">
                      <label>Salary (Rs)</label>
                      <input type="number" value={staffForm.salary} onChange={(e) => setStaffForm({...staffForm, salary: e.target.value})} placeholder="0" />
                    </div>
                    <div className="form-group full">
                      <label>Bio</label>
                      <textarea value={staffForm.bio} onChange={(e) => setStaffForm({...staffForm, bio: e.target.value})} placeholder="Brief description about the staff member..." rows={3} />
                    </div>
                    <div className="form-group full">
                      <label>Profile Picture (JPG/PNG)</label>
                      <input 
                        type="file" 
                        accept="image/jpeg, image/png, image/jpg"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setStaffForm({...staffForm, profile_image: e.target.files[0]});
                          }
                        }} 
                        style={{
                          padding: '10px',
                          border: '2px dashed #dcdde1',
                          borderRadius: '8px',
                          width: '100%',
                          cursor: 'pointer'
                        }}
                      />
                      {staffForm.profile_image instanceof File ? (
                        <div style={{marginTop: '10px', fontSize: '13px', color: '#6c2bff', fontWeight: '500'}}>
                          ✓ Selected: {staffForm.profile_image.name}
                        </div>
                      ) : typeof staffForm.profile_image === 'string' && staffForm.profile_image ? (
                        <div style={{marginTop: '10px'}}>
                          <img src={staffForm.profile_image} alt="Current Profile" style={{maxHeight: '80px', borderRadius: '8px', objectFit: 'cover'}} />
                          <p style={{fontSize: '12px', color: '#7f8fa6'}}>Current Image</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-primary">{editingStaffId ? 'Update' : 'Add Staff'}</button>
                    <button type="button" className="btn-secondary" onClick={resetStaffForm}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="staff-table-wrapper">
              {staff.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">👥</span>
                  <p>No staff members yet. Add your first team member!</p>
                </div>
              ) : (
                <table className="stafftable">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Employee Info</th>
                      <th>Role & Specialization</th>
                      <th>Contact</th>
                      <th>Experience</th>
                      <th>Rating</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((member, idx) => (
                      <tr key={member.id} className={!member.is_active ? 'inactive' : ''}>
                        <td>{idx + 1}</td>
                        <td>
                          <div className="staff-cell">
                            <img src={member.profile_image || `https://ui-avatars.com/api/?name=${member.full_name}&background=6c2bff&color=fff`} alt={member.full_name} className="staff-avatar-sm" />
                            <div>
                              <div className="staff-name">{member.full_name}</div>
                              <div className="staff-id-small">{member.employee_id}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`role-badge role-${member.role}`}>{getRoleLabel(member.role)}</span>
                          <div className="specialization-text">{member.specialization || 'General'}</div>
                        </td>
                        <td>
                          <div className="contact-info">
                            <span>📧 {member.email}</span>
                            <span>📱 {member.phone}</span>
                          </div>
                        </td>
                        <td className="experience">{member.experience_years || 0} years</td>
                        <td className="rating">⭐ {member.rating || '4.5'}</td>
                        <td>
                          <span className={`status-indicator ${member.is_active ? 'active' : 'inactive'}`}>
                            {member.is_active ? '🟢 Active' : '🔴 Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons-compact">
                            <button className="btn-icon btn-edit" onClick={() => handleEditStaff(member)} title="Edit">✏️</button>
                            <button className="btn-icon btn-toggle" onClick={() => toggleStaffStatus(member)} title={member.is_active ? 'Deactivate' : 'Activate'}>
                              {member.is_active ? '🔴' : '🟢'}
                            </button>
                            <button className="btn-icon btn-delete" onClick={() => handleDeleteStaff(member.id)} title="Delete">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <section className="content-section">
            <div className="section-header">
              <h2>Client Management</h2>
              <div className="section-actions">
                <span className="info-badge">{users.length} Total Clients</span>
              </div>
            </div>
            
            <div className="bookings-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Verified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-row">No clients found</td>
                    </tr>
                  ) : (
                    users.map((u, idx) => (
                      <tr key={u.id || u.userID}>
                        <td>{idx + 1}</td>
                        <td className="user-cell">
                           <div className="user-info">
                             <div className="user-name">{u.name}</div>
                           </div>
                        </td>
                        <td>{u.email}</td>
                        <td>{u.contact}</td>
                        <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                        <td>{u.is_verified ? '✅' : '❌'}</td>
                        <td>
                          <button className="delete-btn" onClick={() => handleDeleteUser(u.id || u.userID)}>🗑️ Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <section className="content-section">
            <div className="section-header">
              <h2>Staff Attendance Monitoring</h2>
              <button className="refresh-btn" onClick={fetchAttendance}>🔄 Refresh</button>
            </div>
            
            <div className="bookings-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Staff Name</th>
                    <th>Status</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-row">No attendance records found</td>
                    </tr>
                  ) : (
                    attendance.map((record) => (
                      <tr key={record.id}>
                        <td>{record.date}</td>
                        <td className="user-cell">
                          <div className="user-info">
                            <div className="user-name">{record.staff?.full_name || 'Removed Staff'}</div>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge status-${record.status.toLowerCase()}`}>
                            {record.status}
                          </span>
                        </td>
                        <td>{record.check_in || '--:--'}</td>
                        <td>{record.check_out || '--:--'}</td>
                        <td>{record.notes || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <section className="content-section">
            <div className="section-header">
              <h2>Customer feedback & Reviews</h2>
              <button className="refresh-btn" onClick={fetchReviews}>🔄 Refresh</button>
            </div>
            
            <div className="bookings-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Client</th>
                    <th>Service</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-row">No reviews yet</td>
                    </tr>
                  ) : (
                    reviews.map((r, idx) => (
                      <tr key={r.id}>
                        <td>{idx + 1}</td>
                        <td className="user-cell">
                          <div className="user-info">
                            <div className="user-name">{r.user?.name || 'Client'}</div>
                          </div>
                        </td>
                        <td>{r.service?.name || serviceMap[r.service_id] || '—'}</td>
                        <td style={{color: '#f1c40f', fontWeight: 'bold'}}>
                           {r.rating} / 5 ⭐
                        </td>
                        <td style={{fontStyle: 'italic', maxWidth: '300px'}}>"{r.comment}"</td>
                        <td>{new Date(r.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-card delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Confirm Delete</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this {deleteTarget?.type}?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
