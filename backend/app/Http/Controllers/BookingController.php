<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function getBookings(Request $request)
    {
        $userId = $request->user_id;
        $query = Booking::with(['user', 'service']);

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $bookings = $query->orderBy('booking_date', 'desc')->orderBy('booking_time', 'desc')->get();

        return response()->json(['success' => true, 'bookings' => $bookings]);
    }

    public function getAvailableSlots(Request $request)
    {
        $bookingDate = $request->booking_date ?? $request->date;
        $serviceId = $request->service_id ?? $request->serviceId;

        if (!$bookingDate) return response()->json(['success' => false, 'message' => 'Date is required'], 400);
        if (!$serviceId) return response()->json(['success' => false, 'message' => 'Service ID is required'], 400);

        // Fetch availability set by admin
        $availability = \App\Models\BookingAvailability::where('service_id', $serviceId)
            ->where('available_date', $bookingDate)
            ->first();

        // If not available, return empty
        if (!$availability || !$availability->is_available) {
            return response()->json(['success' => true, 'slots' => []]);
        }

        $adminSlots = [];
        if (!empty($availability->available_times)) {
            $adminSlots = is_string($availability->available_times) ? json_decode($availability->available_times, true) : $availability->available_times;
        }

        // Remove the default 9 AM - 8:30 PM fallback to only show admin-defined slots.
        if (empty($adminSlots) || !is_array($adminSlots)) {
            $adminSlots = [];
        }

        // Fetch slots already booked for this service on this date
        $bookedSlots = Booking::where('service_id', $serviceId)->where('booking_date', $bookingDate)->pluck('booking_time')->toArray();
        
        $allSlots = [];
        foreach ($adminSlots as $adminSlot) {
            $allSlots[] = [
                'time' => $adminSlot,
                'available' => !in_array($adminSlot, $bookedSlots)
            ];
        }

        return response()->json(['success' => true, 'slots' => $allSlots]);
    }

    public function createBooking(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'sometimes|integer',
            'service_id' => 'sometimes|integer',
            'customer_name' => 'sometimes|string',
            'customer_email' => 'sometimes|email',
            'customer_contact' => 'sometimes|string',
            'booking_date' => 'required|string',
            'booking_time' => 'required|string',
            'notes' => 'nullable|string',
            // Also accept frontend naming conventions
            'userID' => 'sometimes|integer',
            'serviceId' => 'sometimes|integer',
            'date' => 'sometimes|string',
            'time' => 'sometimes|string',
        ]);

        $bookingDate = $request->booking_date ?? $request->date;
        $bookingTime = $request->booking_time ?? $request->time;
        $serviceId = $request->service_id ?? $request->serviceId;
        $userId = $request->user_id ?? $request->userID;

        // Check availability
        $exists = Booking::where('booking_date', $bookingDate)->where('booking_time', $bookingTime)->exists();
        if ($exists) {
            return response()->json(['success' => false, 'message' => 'This slot is already booked. Please choose another one.'], 409);
        }

        // Prepare data for database
        $data = [
            'user_id' => $userId,
            'service_id' => $serviceId,
            'customer_name' => $request->customer_name ?? 'Customer',
            'customer_email' => $request->customer_email ?? '',
            'customer_contact' => $request->customer_contact ?? '',
            'booking_date' => $bookingDate,
            'booking_time' => $bookingTime,
            'notes' => $request->notes ?? '',
            'status' => 'pending'
        ];

        $booking = Booking::create($data);

        // Create notification for user
        if ($userId) {
            \App\Http\Controllers\NotificationController::createNotification(
                $userId,
                'Appointment Booked!',
                "Your appointment for " . $bookingDate . " at " . $bookingTime . " has been successfully submitted.",
                'appointment'
            );
        }

        // Notify relevant staff
        $service = \App\Models\Service::find($serviceId);
        if ($service) {
            $keywords = array_filter(array_unique(explode(' ', strtolower($service->name . ' ' . $service->category))), function($k) { return strlen($k) > 2; });
            
            // Map beautician to makeup if necessary
            if (in_array('makeup', $keywords)) $keywords[] = 'beautician';
            if (in_array('beautician', $keywords)) $keywords[] = 'makeup';

            $relevantStaff = \App\Models\Staff::where(function($q) use ($keywords) {
                    foreach ($keywords as $keyword) {
                        $q->orWhere('role', 'LIKE', '%' . $keyword . '%')
                          ->orWhere('specialization', 'LIKE', '%' . $keyword . '%');
                    }
                })->get();
            
            foreach ($relevantStaff as $staff) {
                \App\Http\Controllers\NotificationController::createNotification(
                    null,
                    'New Assignment!',
                    "New " . $service->name . " booking for " . ($request->customer_name ?? 'Customer') . " on " . $bookingDate . " at " . $bookingTime,
                    'appointment',
                    $staff->id
                );
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Booking created',
            'bookingID' => $booking->id
        ], 201);
    }

    public function updateBooking(Request $request)
    {
        $id = $request->id;
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json(['success' => false, 'message' => 'Booking not found'], 404);
        }

        $booking->update($request->all());

        // Create notification for status update
        if ($booking->user_id && $request->has('status')) {
            \App\Http\Controllers\NotificationController::createNotification(
                $booking->user_id,
                'Appointment Update',
                "Your appointment status has been updated to: " . strtoupper($request->status),
                'appointment'
            );
        }

        // Notify relevant staff on update
        $booking = Booking::with('service')->find($id); // Refetch with service
        if ($booking && $booking->service) {
            $service = $booking->service;
            $relevantStaff = \App\Models\Staff::where(function($q) use ($service) {
                $roleSearch = $service->category ?: $service->name;
                $q->where('role', 'LIKE', '%' . $roleSearch . '%')
                  ->orWhere('specialization', 'LIKE', '%' . $roleSearch . '%');
            })->get();

            foreach ($relevantStaff as $staff) {
                 \App\Http\Controllers\NotificationController::createNotification(
                    null,
                    'Booking Updated',
                    "Booking for " . $service->name . " on " . $booking->booking_date . " has been updated to " . strtoupper($booking->status),
                    'info',
                    $staff->id
                );
            }
        }

        return response()->json(['success' => true, 'message' => 'Booking updated']);
    }

    public function deleteBooking(Request $request)
    {
        $id = $request->id;
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json(['success' => false, 'message' => 'Booking not found'], 404);
        }

        // Notify staff before deletion
        $bookingWithService = Booking::with('service')->find($id);
        if ($bookingWithService && $bookingWithService->service) {
             $service = $bookingWithService->service;
             $relevantStaff = \App\Models\Staff::where(function($q) use ($service) {
                $roleSearch = $service->category ?: $service->name;
                $q->where('role', 'LIKE', '%' . $roleSearch . '%')
                  ->orWhere('specialization', 'LIKE', '%' . $roleSearch . '%');
            })->get();

            foreach ($relevantStaff as $staff) {
                 \App\Http\Controllers\NotificationController::createNotification(
                    null,
                    'Booking Cancelled',
                    "Booking for " . $service->name . " on " . $bookingWithService->booking_date . " has been cancelled/removed.",
                    'warning',
                    $staff->id
                );
            }
        }

        $booking->delete();

        return response()->json(['success' => true, 'message' => 'Booking deleted']);
    }
}
