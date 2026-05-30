<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function submitReview(Request $request)
    {
        try {
            $existing = \App\Models\Review::where('user_id', $request->user_id)
                ->where('service_id', $request->service_id)
                ->first();

            if ($existing) {
                return response()->json([
                    'success' => false,
                    'already_reviewed' => true,
                    'message' => 'You have already submitted feedback for this service.'
                ]);
            }

            $review = \App\Models\Review::create([
                'user_id'    => $request->user_id,
                'service_id' => $request->service_id,
                'rating'     => $request->rating,
                'comment'    => $request->comment,
            ]);

            return response()->json(['success' => true, 'message' => 'Review submitted! Thank you.', 'review' => $review]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to save review: ' . $e->getMessage()], 500);
        }
    }

    public function getUserReviews(Request $request)
    {
        $userId = $request->user_id;
        $reviews = \App\Models\Review::where('user_id', $userId)
            ->with('service')
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json(['success' => true, 'reviews' => $reviews]);
    }

    public function getUserBookedServices(Request $request)
    {
        $userId = $request->user_id;
        $services = \App\Models\Booking::where('user_id', $userId)
            ->where('status', '!=', 'cancelled')
            ->with('service')
            ->get()
            ->pluck('service')
            ->filter()
            ->unique('id')
            ->values();
        return response()->json(['success' => true, 'services' => $services]);
    }

    public function getServiceReviews($service_id)
    {
        $reviews = \App\Models\Review::where('service_id', $service_id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json(['success' => true, 'reviews' => $reviews]);
    }

    public function getAllReviews()
    {
        $reviews = \App\Models\Review::with(['user', 'service'])->orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'reviews' => $reviews]);
    }

    public function getStaffReviews(Request $request)
    {
        $staffId = $request->staff_id;
        $staff = \App\Models\Staff::find($staffId);
        if (!$staff) return response()->json(['success' => false, 'message' => 'Staff not found'], 404);

        // Match service.name = staff.role (exact, case-insensitive)
        // OR service.category = staff.role (fallback for category-level roles)
        $role = $staff->role;
        $reviews = \App\Models\Review::with(['user', 'service'])
            ->whereHas('service', function ($query) use ($role) {
                $query->whereRaw('LOWER(name) = LOWER(?)', [$role])
                      ->orWhereRaw('LOWER(category) = LOWER(?)', [$role]);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'reviews' => $reviews]);
    }

    public function deleteReview(Request $request)
    {
        try {
            $review = \App\Models\Review::find($request->id);
            if (!$review) {
                return response()->json(['success' => false, 'message' => 'Review not found'], 404);
            }
            $review->delete();
            return response()->json(['success' => true, 'message' => 'Review deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to delete review: ' . $e->getMessage()], 500);
        }
    }
}
