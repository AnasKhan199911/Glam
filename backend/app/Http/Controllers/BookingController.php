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

        $bookings = $query->orderBy('created_at', 'desc')->get();

        return response()->json(['success' => true, 'bookings' => $bookings]);
    }

    public function getAvailableSlots(Request $request)
    {
        $bookingDate = $request->booking_date ?? $request->date;
        $serviceId = $request->service_id ?? $request->serviceId;

        if (!$bookingDate) return response()->json(['success' => false, 'message' => 'Date is required'], 400);
        if (!$serviceId) return response()->json(['success' => false, 'message' => 'Service ID is required'], 400);

        // Business Hours: 9:00 AM to 10:00 PM (1 hour intervals)
        $businessSlots = [
            '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
            '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', 
            '21:00', '22:00'
        ];

        // Fetch slots already booked for THIS SPECIFIC service on this date
        // Normalize times to H:i for comparison
        $bookedSlots = Booking::where('service_id', $serviceId)
            ->where('booking_date', $bookingDate)
            ->where('status', '!=', 'cancelled')
            ->get(['booking_time'])
            ->map(function($b) {
                return date('H:i', strtotime($b->booking_time));
            })
            ->toArray();
        
        $allSlots = [];
        foreach ($businessSlots as $time) {
            $allSlots[] = [
                'time' => $time,
                'available' => !in_array($time, $bookedSlots)
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

        // Check availability for this specific service with time normalization
        $normalizedTime = date('H:i', strtotime($bookingTime));
        $exists = Booking::where('service_id', $serviceId)
            ->where('booking_date', $bookingDate)
            ->get(['booking_time'])
            ->filter(function($b) use ($normalizedTime) {
                return date('H:i', strtotime($b->booking_time)) === $normalizedTime;
            })
            ->isNotEmpty();

        if ($exists) {
            return response()->json(['success' => false, 'message' => 'This service is already booked for this time. Please choose another slot.'], 409);
        }

        // Prepare data for database
        $service = \App\Models\Service::find($serviceId);
        
        $data = [
            'user_id' => $userId,
            'service_id' => $serviceId,
            'customer_name' => $request->customer_name ?? 'Customer',
            'customer_email' => $request->customer_email ?? '',
            'customer_contact' => $request->customer_contact ?? '',
            'booking_date' => $bookingDate,
            'booking_time' => $bookingTime,
            'notes' => $request->notes ?? '',
            'status' => 'pending',
            'amount' => $service ? $service->price : 0,
            'payment_status' => 'pending',
            'payment_method' => 'cash'
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
            // Broaden keywords for better staff matching
            $broadenedKeywords = $keywords;
            foreach ($keywords as $k) {
                if ($k === 'hair' || $k === 'dressing' || $k === 'styling') {
                    $broadenedKeywords[] = 'hair';
                    $broadenedKeywords[] = 'stylist';
                    $broadenedKeywords[] = 'styling';
                }
                if ($k === 'makeup' || $k === 'beautician' || $k === 'bridal') {
                    $broadenedKeywords[] = 'makeup';
                    $broadenedKeywords[] = 'beautician';
                }
                if ($k === 'nails' || $k === 'manicure' || $k === 'pedicure') {
                    $broadenedKeywords[] = 'nails';
                    $broadenedKeywords[] = 'nails'; // just in case
                }
            }
            $broadenedKeywords = array_unique($broadenedKeywords);

            $relevantStaff = \App\Models\Staff::where(function($q) use ($broadenedKeywords) {
                    foreach ($broadenedKeywords as $keyword) {
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

    public function cancelBooking(Request $request)
    {
        $id = $request->id;
        $booking = Booking::with('service')->find($id);

        if (!$booking) {
            return response()->json(['success' => false, 'message' => 'Booking not found'], 404);
        }

        $booking->status = 'cancelled';
        $booking->save();

        // Notify Staff
        if ($booking->service) {
            $service = $booking->service;
            $relevantStaff = $this->getRelevantStaff($service);
            foreach ($relevantStaff as $staff) {
                \App\Http\Controllers\NotificationController::createNotification(
                    null,
                    'Booking Cancelled',
                    "Booking for " . $service->name . " on " . $booking->booking_date . " has been cancelled.",
                    'warning',
                    $staff->id
                );
            }
        }

        return response()->json(['success' => true, 'message' => 'Booking cancelled successfully']);
    }

    public function requestReschedule(Request $request)
    {
        $id = $request->id;
        $newDate = $request->date;
        $newTime = $request->time;

        $booking = Booking::find($id);
        if (!$booking) return response()->json(['success' => false, 'message' => 'Booking not found'], 404);

        $booking->reschedule_status = 'pending';
        $booking->requested_date = $newDate;
        $booking->requested_time = $newTime;
        $booking->save();

        // Notify Admin (General Info)
        \App\Http\Controllers\NotificationController::createNotification(
            null,
            'Reschedule Request',
            "User " . $booking->customer_name . " requested to change their booking to " . $newDate,
            'info'
        );

        return response()->json(['success' => true, 'message' => 'Reschedule request sent to admin for approval']);
    }

    public function approveReschedule(Request $request)
    {
        $id = $request->id;
        $booking = Booking::with('service')->find($id);

        if (!$booking || $booking->reschedule_status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Invalid request'], 400);
        }

        // Apply changes
        $booking->booking_date = $booking->requested_date;
        $booking->booking_time = $booking->requested_time;
        $booking->reschedule_status = 'approved';
        $booking->status = 'confirmed'; // Auto-confirm on approval
        $booking->save();

        // Notify User
        \App\Http\Controllers\NotificationController::createNotification(
            $booking->user_id,
            'Reschedule Approved!',
            "Your request to change your " . $booking->service->name . " booking to " . $booking->booking_date . " at " . $booking->booking_time . " has been approved.",
            'success'
        );

        // Notify Staff
        $relevantStaff = $this->getRelevantStaff($booking->service);
        foreach ($relevantStaff as $staff) {
            \App\Http\Controllers\NotificationController::createNotification(
                null,
                'Assignment Rescheduled',
                "Booking for " . $booking->service->name . " has been rescheduled to " . $booking->booking_date . " at " . $booking->booking_time,
                'info',
                $staff->id
            );
        }

        return response()->json(['success' => true, 'message' => 'Reschedule approved']);
    }

    public function rejectReschedule(Request $request)
    {
        $id = $request->id;
        $booking = Booking::find($id);
        if (!$booking) return response()->json(['success' => false, 'message' => 'Booking not found'], 404);

        $booking->reschedule_status = 'rejected';
        $booking->save();

        // Notify User
        \App\Http\Controllers\NotificationController::createNotification(
            $booking->user_id,
            'Reschedule Rejected',
            "Sorry, your request to reschedule your booking has been rejected.",
            'warning'
        );

        return response()->json(['success' => true, 'message' => 'Reschedule rejected']);
    }

    // Helper to avoid code duplication
    private function getRelevantStaff($service) {
        $keywords = array_filter(array_unique(explode(' ', strtolower($service->name . ' ' . $service->category))), function($k) { return strlen($k) > 2; });
        
        $broadenedKeywords = $keywords;
        foreach ($keywords as $k) {
            if ($k === 'hair' || $k === 'dressing' || $k === 'styling') {
                $broadenedKeywords[] = 'hair';
                $broadenedKeywords[] = 'stylist';
                $broadenedKeywords[] = 'styling';
            }
            if ($k === 'makeup' || $k === 'beautician' || $k === 'bridal') {
                $broadenedKeywords[] = 'makeup';
                $broadenedKeywords[] = 'beautician';
            }
            if ($k === 'nails' || $k === 'manicure' || $k === 'pedicure') {
                $broadenedKeywords[] = 'nails';
            }
        }
        $broadenedKeywords = array_unique($broadenedKeywords);

        return \App\Models\Staff::where(function($q) use ($broadenedKeywords) {
                foreach ($broadenedKeywords as $keyword) {
                    $q->orWhere('role', 'LIKE', '%' . $keyword . '%')
                      ->orWhere('specialization', 'LIKE', '%' . $keyword . '%');
                }
            })->get();
    }
}
