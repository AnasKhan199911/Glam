<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\AvailabilityController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReviewController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->group(function () {
    Route::post('/signup', [AuthController::class, 'signup']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/admin-login', [AuthController::class, 'login']); 
    Route::post('/forgot-password-send-otp', [AuthController::class, 'forgotPasswordSendOtp']);
    Route::post('/verify-reset-otp', [AuthController::class, 'verifyResetOtp']);
    Route::post('/reset-password', [AuthController::class, 'resetPasswordWithOtp']);
    Route::post('/get-users', [AuthController::class, 'getUsers']);
    Route::post('/delete-user', [AuthController::class, 'deleteUser']);
});

Route::prefix('staff')->group(function () {
    Route::post('/login', [StaffController::class, 'login']);
    Route::post('/dashboard-data', [StaffController::class, 'getDashboardData']);
    Route::post('/get-all', [StaffController::class, 'index']);
    Route::post('/create', [StaffController::class, 'store']);
    Route::post('/update', [StaffController::class, 'update']);
    Route::post('/update-status', [StaffController::class, 'updateStatus']);
    Route::post('/delete', [StaffController::class, 'destroy']);
});

Route::prefix('bookings')->group(function () {
    Route::post('/get-all', [BookingController::class, 'getBookings']);
    Route::post('/get-available-slots', [BookingController::class, 'getAvailableSlots']);
    Route::post('/create', [BookingController::class, 'createBooking']);
    Route::post('/update', [BookingController::class, 'updateBooking']);
    Route::post('/cancel', [BookingController::class, 'cancelBooking']);
    Route::post('/request-reschedule', [BookingController::class, 'requestReschedule']);
    Route::post('/approve-reschedule', [BookingController::class, 'approveReschedule']);
    Route::post('/reject-reschedule', [BookingController::class, 'rejectReschedule']);
    Route::post('/delete', [BookingController::class, 'deleteBooking']);
});

Route::prefix('services')->group(function () {
    Route::post('/get-all', [ServiceController::class, 'getServices']);
    Route::post('/create', [ServiceController::class, 'createService']);
    Route::post('/update', [ServiceController::class, 'updateService']);
    Route::post('/delete', [ServiceController::class, 'deleteService']);
});

Route::prefix('availability')->group(function () {
    Route::get('/service/{service_id}', [AvailabilityController::class, 'getServiceAvailability']);
    Route::get('/service/{service_id}/available-dates', [AvailabilityController::class, 'getAvailableDates']);
    Route::get('/service/{service_id}/date/{date}', [AvailabilityController::class, 'getDateAvailability']);
    Route::post('/service/{service_id}', [AvailabilityController::class, 'upsertAvailability']);
    Route::delete('/service/{service_id}/date/{date}', [AvailabilityController::class, 'deleteAvailability']);
});

Route::prefix('attendance')->group(function () {
    Route::post('/get-all', [AttendanceController::class, 'getRecords']);
    Route::post('/mark', [AttendanceController::class, 'markAttendance']);
    Route::post('/status', [AttendanceController::class, 'getStaffTodayStatus']);
});

Route::prefix('notifications')->group(function () {
    Route::post('/get-all', [NotificationController::class, 'getUserNotifications']);
    Route::post('/get-staff', [NotificationController::class, 'getStaffNotifications']);
    Route::post('/mark-read', [NotificationController::class, 'markAsRead']);
});

Route::prefix('reviews')->group(function () {
    Route::post('/submit', [ReviewController::class, 'submitReview']);
    Route::get('/service/{service_id}', [ReviewController::class, 'getServiceReviews']);
    Route::post('/get-all', [ReviewController::class, 'getAllReviews']);
    Route::post('/get-staff', [ReviewController::class, 'getStaffReviews']);
});

Route::prefix('chat')->group(function () {
    Route::post('/history', [\App\Http\Controllers\ChatController::class, 'getHistory']);
    Route::post('/mark-read', [\App\Http\Controllers\ChatController::class, 'markRead']);
    Route::post('/get-unread', [\App\Http\Controllers\ChatController::class, 'getUnreadCounts']);
});
