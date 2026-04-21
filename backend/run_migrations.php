<?php
/**
 * Direct Database Migration Script
 * This runs all migration logic without Laravel framework
 */

// Database configuration
$host = '127.0.0.1';
$user = 'root';
$password = '';
$database = 'glamconnect_db';

try {
    // Create connection
    $conn = new mysqli($host, $user, $password);
    
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    
    echo "✓ Connected to MySQL\n";
    
    // Create database
    $sql = "CREATE DATABASE IF NOT EXISTS `{$database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;";
    if ($conn->query($sql)) {
        echo "✓ Database '{$database}' created or exists\n";
    } else {
        die("Error creating database: " . $conn->error);
    }
    
    // Select database
    $conn->select_db($database);
    
    // Create migrations table
    $migrations_table = "CREATE TABLE IF NOT EXISTS `migrations` (
        `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
        `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
        `batch` int(11) NOT NULL,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    
    if ($conn->query($migrations_table)) {
        echo "✓ Migrations table created\n";
    } else {
        die("Error: " . $conn->error);
    }
    
    // Users Table
    $users_table = "CREATE TABLE IF NOT EXISTS `users` (
        `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
        `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
        `contact` varchar(255) COLLATE utf8mb4_unicode_ci,
        `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
        `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'customer',
        `is_verified` tinyint(1) NOT NULL DEFAULT 0,
        `verify_token` varchar(255) COLLATE utf8mb4_unicode_ci,
        `verify_expires` timestamp NULL,
        `created_at` timestamp NULL,
        `updated_at` timestamp NULL,
        PRIMARY KEY (`id`),
        UNIQUE KEY `users_email_unique` (`email`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    
    if ($conn->query($users_table)) {
        echo "✓ Users table created\n";
    } else {
        die("Error: " . $conn->error);
    }
    
    // Services Table
    $services_table = "CREATE TABLE IF NOT EXISTS `services` (
        `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        `service_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
        `category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
        `description` text COLLATE utf8mb4_unicode_ci,
        `price` decimal(10,2) NOT NULL,
        `duration` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '30 mins',
        `image_url` varchar(255) COLLATE utf8mb4_unicode_ci,
        `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '💅',
        `is_active` tinyint(1) NOT NULL DEFAULT 1,
        `created_at` timestamp NULL,
        `updated_at` timestamp NULL,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    
    if ($conn->query($services_table)) {
        echo "✓ Services table created\n";
    } else {
        die("Error: " . $conn->error);
    }
    
    // Bookings Table
    $bookings_table = "CREATE TABLE IF NOT EXISTS `bookings` (
        `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        `userID` bigint(20) UNSIGNED,
        `service_id` bigint(20) UNSIGNED,
        `date` date NOT NULL,
        `time` time NOT NULL,
        `notes` text COLLATE utf8mb4_unicode_ci,
        `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
        `created_at` timestamp NULL,
        `updated_at` timestamp NULL,
        PRIMARY KEY (`id`),
        KEY `bookings_userid_foreign` (`userID`),
        KEY `bookings_service_id_foreign` (`service_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    
    if ($conn->query($bookings_table)) {
        echo "✓ Bookings table created\n";
    } else {
        die("Error: " . $conn->error);
    }
    
    // Admin Users Table
    $admin_users_table = "CREATE TABLE IF NOT EXISTS `admin_users` (
        `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
        `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
        `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
        `created_at` timestamp NULL,
        `updated_at` timestamp NULL,
        PRIMARY KEY (`id`),
        UNIQUE KEY `admin_users_email_unique` (`email`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    
    if ($conn->query($admin_users_table)) {
        echo "✓ Admin Users table created\n";
    } else {
        die("Error: " . $conn->error);
    }
    
    // Booking Availability Table
    $booking_availability_table = "CREATE TABLE IF NOT EXISTS `booking_availability` (
        `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        `date` date NOT NULL,
        `time_slot` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
        `is_available` tinyint(1) NOT NULL DEFAULT 1,
        `created_at` timestamp NULL,
        `updated_at` timestamp NULL,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    
    if ($conn->query($booking_availability_table)) {
        echo "✓ Booking Availability table created\n";
    } else {
        die("Error: " . $conn->error);
    }
    
    // Staff Table
    $staff_table = "CREATE TABLE IF NOT EXISTS `staff` (
        `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
        `email` varchar(255) COLLATE utf8mb4_unicode_ci UNIQUE,
        `phone` varchar(20) COLLATE utf8mb4_unicode_ci,
        `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'password',
        `created_at` timestamp NULL,
        `updated_at` timestamp NULL,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    
    if ($conn->query($staff_table)) {
        echo "✓ Staff table created\n";
    } else {
        die("Error: " . $conn->error);
    }
    
    // Attendances Table
    $attendances_table = "CREATE TABLE IF NOT EXISTS `attendances` (
        `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        `staff_id` bigint(20) UNSIGNED NOT NULL,
        `check_in` timestamp NOT NULL,
        `check_out` timestamp NULL,
        `notes` text COLLATE utf8mb4_unicode_ci,
        `created_at` timestamp NULL,
        `updated_at` timestamp NULL,
        PRIMARY KEY (`id`),
        KEY `attendances_staff_id_foreign` (`staff_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    
    if ($conn->query($attendances_table)) {
        echo "✓ Attendances table created\n";
    } else {
        die("Error: " . $conn->error);
    }
    
    // Attendance Sessions Table
    $attendance_sessions_table = "CREATE TABLE IF NOT EXISTS `attendance_sessions` (
        `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        `session_date` date NOT NULL,
        `is_closed` tinyint(1) NOT NULL DEFAULT 0,
        `closed_at` timestamp NULL,
        `created_at` timestamp NULL,
        `updated_at` timestamp NULL,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    
    if ($conn->query($attendance_sessions_table)) {
        echo "✓ Attendance Sessions table created\n";
    } else {
        die("Error: " . $conn->error);
    }
    
    // Notifications Table
    $notifications_table = "CREATE TABLE IF NOT EXISTS `notifications` (
        `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        `staff_id` bigint(20) UNSIGNED,
        `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
        `message` text COLLATE utf8mb4_unicode_ci,
        `is_read` tinyint(1) NOT NULL DEFAULT 0,
        `read_at` timestamp NULL,
        `created_at` timestamp NULL,
        `updated_at` timestamp NULL,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_unicode_ci;";
    
    if ($conn->query($notifications_table)) {
        echo "✓ Notifications table created\n";
    } else {
        die("Error: " . $conn->error);
    }
    
    // Reviews Table
    $reviews_table = "CREATE TABLE IF NOT EXISTS `reviews` (
        `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        `user_id` bigint(20) UNSIGNED NOT NULL,
        `service_id` bigint(20) UNSIGNED NOT NULL,
        `rating` int(11) NOT NULL DEFAULT 5,
        `comment` text COLLATE utf8mb4_unicode_ci,
        `is_approved` tinyint(1) NOT NULL DEFAULT 1,
        `created_at` timestamp NULL,
        `updated_at` timestamp NULL,
        PRIMARY KEY (`id`),
        KEY `reviews_user_id_foreign` (`user_id`),
        KEY `reviews_service_id_foreign` (`service_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    
    if ($conn->query($reviews_table)) {
        echo "✓ Reviews table created\n";
    } else {
        die("Error: " . $conn->error);
    }
    
    // Record migrations
    $migrations = [
        '2024_01_01_000001_create_users_table',
        '2024_01_01_000002_create_admin_users_table',
        '2024_01_01_000003_create_services_table',
        '2024_01_01_000004_create_bookings_table',
        '2024_01_01_000005_create_booking_availability_table',
        '2026_03_15_113125_create_staff_table',
        '2026_03_15_121546_create_attendances_table',
        '2026_03_15_121756_create_notifications_table',
        '2026_03_15_121813_create_reviews_table',
        '2026_03_15_171704_add_password_to_staff_table',
        '2026_03_15_175238_modify_notifications_table_for_staff',
        '2026_03_19_054013_create_attendance_sessions_table',
        '2026_03_19_054044_add_session_summary_to_attendances_table'
    ];
    
    foreach ($migrations as $migration) {
        $check = $conn->query("SELECT * FROM migrations WHERE migration = '$migration'");
        if ($check->num_rows == 0) {
            $conn->query("INSERT INTO migrations (migration, batch) VALUES ('$migration', 1)");
            echo "✓ Recorded migration: $migration\n";
        }
    }
    
    echo "\n✅ DATABASE MIGRATION COMPLETE!\n";
    echo "All tables have been created successfully.\n";
    
    // Show tables
    echo "\n📊 Tables in database:\n";
    $result = $conn->query("SHOW TABLES;");
    while ($row = $result->fetch_array()) {
        echo "  - " . $row[0] . "\n";
    }
    
    $conn->close();
    
} catch (Exception $e) {
    die("Error: " . $e->getMessage());
}
?>
