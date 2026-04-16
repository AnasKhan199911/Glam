<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function submitReview(Request $request)
    {
        try {
            $review = \App\Models\Review::create([
                'user_id' => $request->user_id,
                'service_id' => $request->service_id,
                'rating' => $request->rating,
                'comment' => $request->comment
            ]);

            return response()->json(['success' => true, 'message' => 'Review submitted!', 'review' => $review]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to save review: ' . $e->getMessage()], 500);
        }
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

        $spec = strtolower($staff->specialization);
        $role = strtolower($staff->role);
        $keywords = array_filter(array_unique(array_merge(explode(' ', $spec), explode(' ', $role))), function($k) { return strlen($k) > 2; });

        $reviews = \App\Models\Review::with(['user', 'service'])
            ->whereHas('service', function($query) use ($keywords) {
                $query->where(function($q) use ($keywords) {
                    foreach ($keywords as $keyword) {
                        if ($keyword != 'stylist' && $keyword != 'staff' && $keyword != 'specialist') {
                            $q->orWhere('name', 'like', "%$keyword%")
                              ->orWhere('category', 'like', "%$keyword%");
                        }
                    }
                });
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'reviews' => $reviews]);
    }
}
