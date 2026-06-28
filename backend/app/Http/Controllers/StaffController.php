<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

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
        
        // Auto-generate Employee ID based on highest existing number, not count
        $maxId = \App\Models\Staff::where('employee_id', 'like', 'EMP%')->max('employee_id');
        $nextNum = $maxId ? ((int) substr($maxId, 3)) + 1 : 1;
        $data['employee_id'] = 'EMP' . str_pad($nextNum, 3, '0', STR_PAD_LEFT);
        
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

        $plainPassword = $request->password ?? 'staff123';
        $staff = \App\Models\Staff::create($data);

        // Send credentials to staff email
        try {
            Mail::raw(
                "Dear {$staff->full_name},\n\nYour GlamConnect staff account has been created.\n\nLogin Credentials:\nEmail: {$staff->email}\nPassword: {$plainPassword}\n\nLogin at: /staff-auth\n\nPlease keep your credentials safe.\n\nRegards,\nGlamConnect Team",
                function ($message) use ($staff) {
                    $message->to($staff->email, $staff->full_name)
                            ->subject('GlamConnect - Your Staff Account Credentials');
                }
            );
        } catch (\Exception $e) {
            \Log::error('Staff credentials email failed: ' . $e->getMessage());
        }

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

        // Generate 6-digit OTP
        $otp = strval(rand(100000, 999999));
        $staff->login_otp = $otp;
        $staff->login_otp_expires = Carbon::now()->addMinutes(10);
        $staff->save();

        try {
            Mail::raw(
                "Dear {$staff->full_name},\n\nYour GlamConnect login OTP is: {$otp}\n\nThis OTP will expire in 10 minutes.\n\nIf you did not attempt to login, please contact admin immediately.\n\nRegards,\nGlamConnect Team",
                function ($message) use ($staff) {
                    $message->to($staff->email, $staff->full_name)
                            ->subject('GlamConnect - Your Login OTP');
                }
            );
        } catch (\Exception $e) {
            \Log::error('Staff OTP email failed: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'requires_otp' => true,
            'message' => 'OTP sent to your email. Please verify to continue.',
            'email' => $staff->email
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $email = $request->email;
        $otp = $request->otp;

        $staff = \App\Models\Staff::where('email', $email)->first();

        if (!$staff) {
            return response()->json(['success' => false, 'message' => 'Staff not found'], 404);
        }

        if ($staff->login_otp !== $otp) {
            return response()->json(['success' => false, 'message' => 'Invalid OTP'], 400);
        }

        if (Carbon::parse($staff->login_otp_expires)->isPast()) {
            return response()->json(['success' => false, 'message' => 'OTP has expired. Please login again.'], 410);
        }

        // Clear OTP after successful verification
        $staff->login_otp = null;
        $staff->login_otp_expires = null;
        $staff->save();

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'staff' => $staff,
            'token' => 'staff_token_' . bin2hex(random_bytes(16))
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

        $passwordChanged = false;
        $plainPassword = null;
        if ($request->has('password') && !empty($request->password)) {
            $plainPassword = $request->password;
            $data['password'] = Hash::make($request->password);
            $passwordChanged = true;
        } else {
            unset($data['password']);
        }

        $staff->update($data);

        if ($passwordChanged) {
            try {
                Mail::raw(
                    "Dear {$staff->full_name},\n\nYour GlamConnect staff account password has been updated.\n\nUpdated Credentials:\nEmail: {$staff->email}\nNew Password: {$plainPassword}\n\nPlease login at: /staff-auth\n\nRegards,\nGlamConnect Team",
                    function ($message) use ($staff) {
                        $message->to($staff->email, $staff->full_name)
                                ->subject('GlamConnect - Your Password Has Been Updated');
                    }
                );
            } catch (\Exception $e) {
                \Log::error('Staff password change email failed: ' . $e->getMessage());
            }
        }

        return response()->json(['success' => true, 'message' => 'Staff member updated', 'staff' => $staff]);
    }

    public function getDashboardData(Request $request)
    {
        $staffId = $request->id;
        $staff = \App\Models\Staff::find($staffId);

        if (!$staff) {
            return response()->json(['success' => false, 'message' => 'Staff not found'], 404);
        }

        $role = $staff->role;

        $bookings = \App\Models\Booking::with(['user', 'service'])
            ->where('assigned_staff_id', $staffId)
            ->where('status', '!=', 'cancelled')
            ->orderBy('booking_date', 'asc')
            ->orderBy('booking_time', 'asc')
            ->get();

        // Calculate average rating from reviews for this staff's role
        $avgRating = \App\Models\Review::whereHas('service', function($query) use ($role) {
            $query->whereRaw('LOWER(name) = LOWER(?)', [$role])
                  ->orWhereRaw('LOWER(category) = LOWER(?)', [$role]);
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
