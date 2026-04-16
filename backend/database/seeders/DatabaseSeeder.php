<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Disable foreign key checks for seeding
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        // Drop booking_availability table if it exists
        try {
            DB::statement('DROP TABLE IF EXISTS booking_availability');
        } catch (\Exception $e) {
            // Table doesn't exist, ignore
        }

        // Clear existing data
        DB::table('bookings')->truncate();
        DB::table('services')->truncate();
        DB::table('admin_users')->truncate();
        DB::table('users')->truncate();

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // Create test users
        DB::table('users')->insert([
            [
                'id' => 1,
                'name' => 'Sarah Ahmed',
                'email' => 'sarah@example.com',
                'contact' => '03001234567',
                'password' => Hash::make('password123'),
                'role' => 'customer',
                'is_verified' => 1,
                'verify_token' => null,
                'verify_expires' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'name' => 'Fatima Khan',
                'email' => 'fatima@example.com',
                'contact' => '03009876543',
                'password' => Hash::make('password123'),
                'role' => 'customer',
                'is_verified' => 1,
                'verify_token' => null,
                'verify_expires' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'name' => 'Ayesha Khan',
                'email' => 'ayesha@example.com',
                'contact' => '03005555555',
                'password' => Hash::make('password123'),
                'role' => 'customer',
                'is_verified' => 1,
                'verify_token' => null,
                'verify_expires' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Create admin user
        DB::table('admin_users')->insert([
            [
                'id' => 1,
                'name' => 'Admin User',
                'email' => 'admin@glamconnect.com',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Create services
        DB::table('services')->insert([
            [
                'id' => 1,
                'name' => 'Basic Haircut',
                'category' => 'Hair',
                'description' => 'Professional haircut tailored to your style',
                'price' => 1500,
                'duration' => '30 mins',
                'image' => 'https://images.unsplash.com/photo-1562569133-cb32e15dd4df?w=600&h=400&fit=crop',
                'icon' => '💇',
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'name' => 'Hair Coloring',
                'category' => 'Hair',
                'description' => 'Premium hair coloring with natural or vibrant shades',
                'price' => 3500,
                'duration' => '90 mins',
                'image' => 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop',
                'icon' => '🎨',
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'name' => 'Bridal Makeup',
                'category' => 'Makeup',
                'description' => 'Complete bridal makeup with trial session',
                'price' => 5000,
                'duration' => '120 mins',
                'image' => 'https://images.unsplash.com/photo-1591290619208-e9387b8fc195?w=600&h=400&fit=crop',
                'icon' => '💄',
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'name' => 'Nail Art Design',
                'category' => 'Nails',
                'description' => 'Creative nail art with gel or acrylic',
                'price' => 2000,
                'duration' => '45 mins',
                'image' => 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=400&fit=crop',
                'icon' => '💅',
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'name' => 'Facial Treatment',
                'category' => 'Skincare',
                'description' => 'Deep cleansing and hydrating facial',
                'price' => 2500,
                'duration' => '60 mins',
                'image' => 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=400&fit=crop',
                'icon' => '✨',
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 6,
                'name' => 'Full Body Massage',
                'category' => 'Spa',
                'description' => 'Relaxing full body massage therapy',
                'price' => 4000,
                'duration' => '90 mins',
                'image' => 'https://images.unsplash.com/photo-1570172619644-7267e470bacc?w=600&h=400&fit=crop',
                'icon' => '🧘',
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Create sample bookings
        DB::table('bookings')->insert([
            [
                'id' => 1,
                'user_id' => 1,
                'service_id' => 1,
                'customer_name' => 'Sarah Ahmed',
                'customer_email' => 'sarah@example.com',
                'customer_contact' => '03001234567',
                'booking_date' => now()->addDays(5)->toDateString(),
                'booking_time' => '10:00',
                'status' => 'confirmed',
                'notes' => 'Please do a fade on the sides',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'user_id' => 2,
                'service_id' => 3,
                'customer_name' => 'Fatima Khan',
                'customer_email' => 'fatima@example.com',
                'customer_contact' => '03009876543',
                'booking_date' => now()->addDays(10)->toDateString(),
                'booking_time' => '14:00',
                'status' => 'pending',
                'notes' => 'Wedding makeup needed',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'user_id' => 3,
                'service_id' => 2,
                'customer_name' => 'Ayesha Khan',
                'customer_email' => 'ayesha@example.com',
                'customer_contact' => '03005555555',
                'booking_date' => now()->addDays(3)->toDateString(),
                'booking_time' => '11:00',
                'status' => 'completed',
                'notes' => 'Brown color preferred',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
