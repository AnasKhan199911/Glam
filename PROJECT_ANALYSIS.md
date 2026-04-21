# GlamConnect - Project Analysis

## 1. Overall Project Purpose

**GlamConnect** is a comprehensive **beauty salon and services booking platform** designed to connect clients with salon services (hair, makeup, nails, etc.) and manage the operational backend of beauty businesses.

The platform enables:
- Clients to browse, search, and book beauty services
- Salons to manage services, staff, availability, and bookings
- Admin to oversee the entire system
- Staff to manage their schedules and attendance
- Real-time notifications for bookings and updates
- Customer reviews and ratings for services and staff

---

## 2. Backend Features (Laravel 9 API)

### Core Controllers & Functionality:

#### **Authentication (AuthController)**
- User signup with OTP verification
- User login/logout
- Admin login
- Forgot password with OTP reset
- User management (create, delete, retrieve users)

#### **Bookings (BookingController)**
- Create, update, delete bookings
- Get all bookings with filtering
- Get available slots for services
- Booking status management (pending, confirmed, completed, cancelled)

#### **Services (ServiceController)**
- Create, update, delete services
- Retrieve all available services
- Service categories (Hair, Makeup, Nails, Bridal, etc.)
- Price and duration management

#### **Availability (AvailabilityController)**
- Set staff/service availability by date and time
- Get available dates for a service
- Get specific time slots for a date
- CRUD operations on availability

#### **Staff Management (StaffController)**
- Staff login and authentication
- Staff dashboard data (appointments, attendance, etc.)
- CRUD operations for staff members
- Status updates and management

#### **Attendance (AttendanceController)**
- Mark staff attendance
- Get attendance records
- Track daily staff status
- Manage attendance sessions

#### **Notifications (NotificationController)**
- Send notifications to users and staff
- Retrieve user/staff notifications
- Mark notifications as read
- Real-time notification system

#### **Reviews (ReviewController)**
- Submit reviews for services
- Get reviews by service
- Get staff reviews
- Average rating calculations

### Database Schema:

**Key Tables:**
- `users` - Client accounts with email, password, contact, verification status
- `services` - Beauty services with name, category, price, duration, icons
- `bookings` - Client bookings with date, time, status, notes
- `staff` - Staff members with roles and contact info
- `reviews` - Service/staff reviews with ratings
- `notifications` - System notifications
- `attendance` - Staff attendance tracking
- `booking_availability` - Service availability slots
- `attendance_session` - Attendance session tracking

**Default Services Included:**
- Basic Haircut (₹1,500)
- Hair Coloring (₹4,500)
- Manicure (₹800)
- Bridal Makeup (₹12,000)

---

## 3. Frontend Features (React 19)

### Main Pages & Components:

#### **Public Pages:**
- **HomePage** - Landing page with service showcase
- **Services** - Browse all available services
- **Gallery** - Visual gallery of salon work
- **AboutUs** - Salon information and details
- **ContactUs** - Contact form and information

#### **User Pages (Protected Routes):**
- **Profile** - User account and booking history
- **Auth** - User login/signup with OTP verification

#### **Admin Pages (Admin Protected):**
- **AdminDashboard** - Overall system management
  - View bookings, services, staff
  - Manage users and staff
  - Service management
  - System statistics

#### **Staff Pages (Staff Protected):**
- **StaffDashboard** - Staff management interface
  - View assigned bookings
  - Mark attendance
  - Check availability
  - View notifications

### Components:
- **Navbar** - Global navigation
- **BannerSlider** - Homepage banner carousel
- **Toast** - Notification system
- **ToastContainer** - Toast management

### Authentication System:
- Three-tier auth: User, Admin, Staff
- Token-based (localStorage)
- Protected routes with redirects
- OTP verification for signup/password reset

---

## 4. Dependencies & Tech Stack

### Backend (composer.json):
```
- Laravel Framework 9.19
- Laravel Sanctum 2.14.1 (API authentication)
- Guzzle HTTP Client 7.2
- CORS Support (fruitcake/laravel-cors)
- Laravel Tinker (REPL)
- Testing: PHPUnit, Mockery, Faker
```

### Frontend (package.json):
```
- React 19.2.0
- React Router DOM 6.20.0
- Axios 1.12.2 (HTTP client)
- Firebase 12.5.0
- React Scripts 5.0.1
- Testing: React Testing Library, Jest DOM
```

---

## 5. Configuration & Environment

### Database Setup (.env):
```
- Database: MySQL (glamconnect_db)
- Host: 127.0.0.1
- Port: 3306
- Connection: Local development setup
```

### Mail Configuration:
```
- SMTP: Gmail (smtp.gmail.com:587)
- Uses app-specific password
- For OTP and notifications
```

### API Configuration:
```
- App Name: GlamConnect
- Environment: local (development)
- Debug: Enabled
- Base URL: http://localhost
```

### Frontend API:
```
- Uses Axios for HTTP requests
- Firebase integration for additional services
- localStorage for token persistence
```

---

## 6. File Structure Summary

```
Glam/
├── backend/                    # Laravel API
│   ├── app/
│   │   ├── Models/            # Database models (User, Booking, Service, etc.)
│   │   ├── Http/
│   │   │   └── Controllers/   # API endpoints (9 controllers)
│   │   └── Providers/         # Service providers
│   ├── routes/
│   │   └── api.php            # API routes definition
│   ├── database/
│   │   ├── schema.sql         # Database structure
│   │   ├── migrations/        # Database migrations
│   │   └── seeders/           # Sample data
│   ├── config/                # Configuration files
│   └── .env                   # Environment variables
│
└── frontend/                   # React application
    ├── src/
    │   ├── pages/             # Page components (8 pages)
    │   ├── components/        # Reusable components (Navbar, Toast, etc.)
    │   ├── screens/           # Auth screens
    │   ├── api/               # API integration
    │   └── App.js             # Main routing component
    └── public/                # Static assets
```

---

## 7. Key Issues & Notes

### Current Status:
- ✅ Backend: Laravel API fully configured with 9 controllers and complete routing
- ✅ Frontend: React app with multiple pages and protected routes
- ✅ Database: Schema defined with all necessary tables
- ✅ Authentication: Multi-tier (User, Admin, Staff)
- ✅ API: RESTful endpoints for all major features

### Configuration Notes:
- Database password is empty (root user without password)
- Gmail credentials are set up for notifications
- CORS enabled for cross-origin requests
- Local development environment configured
- Firebase integration in frontend

### Setup Scripts Available:
- `artisan` - Laravel CLI tool
- `import_db.ps1` - Database import script (PowerShell)
- `run_migrations.php` - Migration runner
- Various check/test PHP scripts for data validation

---

## 8. Quick Start Commands

### Backend:
```bash
cd backend
php artisan serve              # Start Laravel server (port 8000)
php composer install           # Install dependencies
php artisan migrate            # Run migrations
```

### Frontend:
```bash
cd frontend
npm install                    # Install dependencies
npm start                      # Start React dev server (port 3000)
npm build                      # Build for production
```

---

## Summary

**GlamConnect** is a full-featured booking and management platform for beauty salons built with modern web technologies. It provides a complete client-facing portal for browsing and booking services, along with powerful admin and staff management tools. The architecture follows best practices with a RESTful Laravel backend and a responsive React frontend, supporting multi-tier authentication, real-time notifications, and comprehensive business operations management.
