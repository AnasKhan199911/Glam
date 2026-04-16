<?php

namespace App\Http\Controllers;

use App\Models\BookingAvailability;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AvailabilityController extends Controller
{
    /**
     * Get availability for a service calendar view
     * GET /api/availability/service/{id}?month=03&year=2026
     */
    public function getServiceAvailability($serviceId, Request $request)
    {
        $month = $request->query('month', date('m'));
        $year = $request->query('year', date('Y'));

        $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        $availability = BookingAvailability::where('service_id', $serviceId)
            ->whereBetween('available_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $availability,
            'month' => $startDate->format('Y-m'),
        ]);
    }

    /**
     * Get availability for a specific date
     * GET /api/availability/service/{id}/date/{date}
     */
    public function getDateAvailability($serviceId, $date)
    {
        $availability = BookingAvailability::where('service_id', $serviceId)
            ->where('available_date', $date)
            ->first();

        return response()->json([
            'success' => true,
            'data' => $availability,
        ]);
    }

    /**
     * Create or update availability for a date
     * POST /api/availability/service/{id}
     */
    public function upsertAvailability(Request $request, $serviceId)
    {
        try {
            $validated = $request->validate([
                'available_date' => 'required|date_format:Y-m-d',
                'is_available' => 'required',
                'available_times' => 'nullable|array',
            ]);

            // Convert string booleans to actual booleans
            $isAvailable = $validated['is_available'] === true || $validated['is_available'] === 'true' || $validated['is_available'] === 1 || $validated['is_available'] === '1';

            $availability = BookingAvailability::updateOrCreate(
                [
                    'service_id' => $serviceId,
                    'available_date' => $validated['available_date'],
                ],
                [
                    'is_available' => $isAvailable,
                    'available_times' => $validated['available_times'] && count($validated['available_times']) > 0 ? $validated['available_times'] : null,
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Availability updated',
                'data' => $availability,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error: ' . json_encode($e->errors()),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating availability: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete availability for a date
     * DELETE /api/availability/service/{id}/date/{date}
     */
    public function deleteAvailability($serviceId, $date)
    {
        BookingAvailability::where('service_id', $serviceId)
            ->where('available_date', $date)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Availability deleted',
        ]);
    }

    /**
     * Get only available dates for a service in a month
     * GET /api/availability/service/{id}/available-dates?month=03&year=2026
     */
    public function getAvailableDates($serviceId, Request $request)
    {
        $month = $request->query('month');
        $year = $request->query('year');

        $query = BookingAvailability::where('service_id', $serviceId)
            ->where('is_available', true);

        if ($month && $year) {
            $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
            $endDate = $startDate->copy()->endOfMonth();
            $query->whereBetween('available_date', [$startDate->toDateString(), $endDate->toDateString()]);
        } else {
            // Get all future dates starting from today
            $query->where('available_date', '>=', Carbon::today()->toDateString());
        }

        $availability = $query->orderBy('available_date', 'asc')
            ->pluck('available_date')
            ->toArray();

        return response()->json([
            'success' => true,
            'data' => $availability,
        ]);
    }
}
