CREATE DATABASE IF NOT EXISTS glamconnect_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE glamconnect_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    contact VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) DEFAULT 'customer',
    is_verified TINYINT(1) DEFAULT 0,
    verify_token VARCHAR(255),
    verify_expires TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    PRIMARY KEY (id),
    UNIQUE KEY users_email_unique (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS services (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    service_name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration VARCHAR(255) DEFAULT '30 mins',
    image_url VARCHAR(255),
    icon VARCHAR(255) DEFAULT '💅',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    userID BIGINT UNSIGNED,
    service_id BIGINT UNSIGNED,
    date DATE NOT NULL,
    time TIME NOT NULL,
    notes TEXT,
    status VARCHAR(255) DEFAULT 'pending',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    PRIMARY KEY (id),
    KEY bookings_userid_foreign (userID),
    KEY bookings_service_id_foreign (service_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    PRIMARY KEY (id),
    UNIQUE KEY admin_users_email_unique (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS booking_availability (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    date DATE NOT NULL,
    time_slot VARCHAR(255) NOT NULL,
    is_available TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS staff (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) DEFAULT 'password',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendances (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    staff_id BIGINT UNSIGNED NOT NULL,
    check_in TIMESTAMP NOT NULL,
    check_out TIMESTAMP NULL,
    notes TEXT,
    session_id BIGINT UNSIGNED,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    PRIMARY KEY (id),
    KEY attendances_staff_id_foreign (staff_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendance_sessions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    session_date DATE NOT NULL,
    is_closed TINYINT(1) DEFAULT 0,
    closed_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    staff_id BIGINT UNSIGNED,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read TINYINT(1) DEFAULT 0,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    service_id BIGINT UNSIGNED NOT NULL,
    rating INT DEFAULT 5,
    comment TEXT,
    is_approved TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    PRIMARY KEY (id),
    KEY reviews_user_id_foreign (user_id),
    KEY reviews_service_id_foreign (service_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS migrations (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    migration VARCHAR(255) NOT NULL,
    batch INT NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT IGNORE INTO migrations (migration, batch) VALUES 
('2024_01_01_000001_create_users_table', 1),
('2024_01_01_000002_create_admin_users_table', 1),
('2024_01_01_000003_create_services_table', 1),
('2024_01_01_000004_create_bookings_table', 1),
('2024_01_01_000005_create_booking_availability_table', 1),
('2026_03_15_113125_create_staff_table', 1),
('2026_03_15_121546_create_attendances_table', 1),
('2026_03_15_121756_create_notifications_table', 1),
('2026_03_15_121813_create_reviews_table', 1),
('2026_03_15_171704_add_password_to_staff_table', 1),
('2026_03_15_175238_modify_notifications_table_for_staff', 1),
('2026_03_19_054013_create_attendance_sessions_table', 1),
('2026_03_19_054044_add_session_summary_to_attendances_table', 1);
