-- GlamConnect Database Schema
-- Run this if migration via artisan is not possible

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- CREATE DATABASE IF NOT EXISTS `glam_app`;
-- USE `glam_app`;

-- Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'client',
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `verify_token` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verify_expires` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Services Table
CREATE TABLE IF NOT EXISTS `services` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `service_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL,
  `duration` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '30 mins',
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '💅',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bookings Table
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `userID` bigint(20) UNSIGNED DEFAULT NULL,
  `service_id` bigint(20) UNSIGNED DEFAULT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bookings_userid_foreign` (`userID`),
  KEY `bookings_service_id_foreign` (`service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default Services Seed Data
INSERT INTO `services` (`service_name`, `category`, `description`, `price`, `duration`, `icon`, `is_active`, `created_at`, `updated_at`) VALUES
('Basic Haircut', 'Hair', 'Professional hair trim and style.', 1500.00, '30 mins', '💇', 1, NOW(), NOW()),
('Hair Coloring', 'Hair', 'Full head color with consultation.', 4500.00, '90 mins', '🎨', 1, NOW(), NOW()),
('Manicure', 'Nails', 'Basic nail care and polish.', 800.00, '30 mins', '💅', 1, NOW(), NOW()),
('Bridal Makeup', 'Makeup', 'Complete bridal makeover package.', 12000.00, '180 mins', '💄', 1, NOW(), NOW());

COMMIT;
