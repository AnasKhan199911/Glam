<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StaffController extends Controller
{
    public function index()
    {
        $staff = \App\Models\Staff::all();
        return response()->json(['success' => true, 'staff' => $staff]);
    }

    public function store(Request $request)
    {
        $data = $request->all();
        
        // Auto-generate Employee ID
        $count = \App\Models\Staff::count();
        $data['employee_id'] = 'EMP' . str_pad($count + 1, 3, '0', STR_PAD_LEFT);
        
        // Ensure email is unique
        if (\App\Models\Staff::where('email', $data['email'])->exists()) {
            return response()->json(['success' => false, 'message' => 'Email already registered'], 409);
        }

        if ($request->hasFile('profile_image')) {
            $file = $request->file('profile_image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('images/staff'), $filename);
            $data['profile_image'] = url('images/staff/' . $filename);
        }

        if ($request->has('password')) {
            $data['password'] = Hash::make($request->password);
        } else {
            // Default password if not provided
            $data['password'] = Hash::make('staff123');
        }

        $staff = \App\Models\Staff::create($data);
        return response()->json(['success' => true, 'message' => 'Staff created successfully', 'staff' => $staff], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $staff = \App\Models\Staff::where('email', $request->email)->first();

        if (!$staff || !Hash::check($request->password, $staff->password)) {
            return response()->json(['success' => false, 'message' => 'Invalid email or password'], 401);
        }

        if (!$staff->is_active) {
            return response()->json(['success' => false, 'message' => 'Your account is deactivated. Please contact admin.'], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'staff' => $staff,
            'token' => 'staff_token_' . bin2hex(random_bytes(16)) // Simple token for demo
        ]);
    }

    public function update(Request $request)
    {
        $id = $request->id;
        $staff = \App\Models\Staff::find($id);

        if (!$staff) {
            return response()->json(['success' => false, 'message' => 'Staff member not found'], 404);
        }

        $data = $request->all();
        // Don't allow updating employee_id via update if it's auto-generated
        unset($data['employee_id']);

        if ($request->hasFile('profile_image')) {
            $file = $request->file('profile_image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('images/staff'), $filename);
            $data['profile_image'] = url('images/staff/' . $filename);
        }

        if ($request->has('password') && !empty($request->password)) {
            $data['password'] = Hash::make($request->password);
        } else {
            unset($data['password']);
        }

        $staff->update($data);
        return response()->json(['success' => true, 'message' => 'Staff member updated', 'staff' => $staff]);
    }

    public function getDashboardData(Request $request)
    {
        $staffId = $request->id;
        $staff = \App\Models\Staff::find($staffId);

        if (!$staff) {
            return response()->json(['success' => false, 'message' => 'Staff not found'], 404);
        }

        // We'll filter based on service name or category matching specialization or role
        $spec = strtolower($staff->specialization);
        $role = strtolower($staff->role);
        
        // Broaden keywords: "Hair coloring"
        $keywords = array_filter(array_unique(array_merge(
            explode(' ', $spec),
            explode(' ', $role)
        )), function($k) { return strlen($k) > 2; });

        // Broaden beautician matching to include 'Makeup'
        if (in_array('beautician', $keywords)) {
            $keywords[] = 'makeup';
        } elseif (in_array('makeup', $keywords)) {
            $keywords[] = 'beautician';
        }

        $bookings = \App\Models\Booking::with(['user', 'service'])
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
            ->orderBy('booking_date', 'asc')
            ->orderBy('booking_time', 'asc')
            ->get();

        // Calculate average rating from matching reviews
        $avgRating = \App\Models\Review::whereHas('service', function($query) use ($keywords) {
            $query->where(function($q) use ($keywords) {
                foreach ($keywords as $keyword) {
                    if ($keyword != 'stylist' && $keyword != 'staff' && $keyword != 'specialist') {
                        $q->orWhere('name', 'like', "%$keyword%")
                          ->orWhere('category', 'like', "%$keyword%");
                    }
                }
            });
        })->avg('rating') ?: 0;

        // Calculate stats
        $stats = [
            'completed' => $bookings->where('status', 'completed')->count(),
            'upcoming' => $bookings->whereIn('status', ['pending', 'confirmed'])->count(),
            'earnings' => $bookings->where('status', 'completed')->sum(function($b) {
                return $b->service ? (float)$b->service->price : 0;
            }),
            'rating' => round((float)$avgRating, 1)
        ];

        // Get real notifications for this staff
        $notifications = \App\Models\Notification::where('staff_id', $staffId)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($n) {
                return [
                    'id' => $n->id,
                    'type' => $n->type,
                    'message' => $n->message,
                    'time' => $n->created_at->diffForHumans(),
                    'is_read' => $n->is_read
                ];
            });

        return response()->json([
            'success' => true,
            'stats' => $stats,
            'appointments' => $bookings,
            'notifications' => $notifications
        ]);
    }

    public function destroy(Request $request)
    {
        $id = $request->id;
        $staff = \App\Models\Staff::find($id);

        if (!$staff) {
            return response()->json(['success' => false, 'message' => 'Staff member not found'], 404);
        }

        $staff->delete();
        return response()->json(['success' => true, 'message' => 'Staff member deleted']);
    }

    public function updateStatus(Request $request)
    {
        $id = $request->id;
        $staff = \App\Models\Staff::find($id);

        if (!$staff) {
            return response()->json(['success' => false, 'message' => 'Staff member not found'], 404);
        }

        $staff->update(['is_active' => $request->is_active]);
        return response()->json(['success' => true, 'message' => 'Status updated']);
    }
}
