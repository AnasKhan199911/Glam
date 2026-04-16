<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AdminUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function signup(Request $request)
    {
        $input = $request->all();
        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $contact = trim($input['contact'] ?? '');
        $password = $input['password'] ?? '';
        $role = 'customer';

        if (empty($name) || empty($email) || empty($contact) || empty($password)) {
            return response()->json(['success' => false, 'message' => 'All fields are required'], 400);
        }

        if (User::where('email', $email)->exists()) {
            return response()->json(['success' => false, 'message' => 'Email already registered'], 409);
        }

        $verifyOtp = rand(100000, 999999);
        $tokenExpiry = Carbon::now()->addMinutes(15);

        $user = User::create([
            'name' => $name,
            'email' => $email,
            'contact' => $contact,
            'password' => Hash::make($password),
            'role' => $role,
            'is_verified' => 0,
            'verify_token' => $verifyOtp, // Using verify_token column for OTP
            'verify_expires' => $tokenExpiry,
        ]);

        // Send OTP email
        try {
            Mail::raw("Your OTP for GlamConnect verification is: {$verifyOtp}\n\nThis OTP will expire in 15 minutes.", function ($message) use ($email, $name) {
                $message->to($email, $name)
                        ->subject('GlamConnect - Email Verification OTP');
            });
        } catch (\Exception $e) {
            \Log::error('Mail sending failed: ' . $e->getMessage());
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Signup successful. Please enter the 6-digit OTP sent to your email.',
            'user' => $user
        ], 201);
    }

    public function verifyOtp(Request $request)
    {
        $email = $request->email;
        $otp = $request->otp;

        $user = User::where('email', $email)->where('verify_token', $otp)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Invalid OTP'], 400);
        }

        if (Carbon::parse($user->verify_expires)->isPast()) {
            return response()->json(['success' => false, 'message' => 'OTP expired'], 410);
        }

        $user->update([
            'is_verified' => 1,
            'verify_token' => null,
            'verify_expires' => null,
        ]);

        return response()->json(['success' => true, 'message' => 'Account verified successfully!']);
    }

    public function login(Request $request)
    {
        $email = trim($request->email ?? '');
        $password = $request->password ?? '';

        if (empty($email) || empty($password)) {
            return response()->json(['success' => false, 'message' => 'Email and password are required'], 400);
        }

        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return response()->json(['success' => false, 'message' => 'Invalid email or password'], 401);
        }

        if (!$user->is_verified) {
             return response()->json(['success' => false, 'message' => 'Email not verified'], 403);
        }

        $token = Str::random(64);

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'user' => $user
        ]);
    }

    public function adminLogin(Request $request)
    {
        $email = trim($request->email ?? '');
        $password = $request->password ?? '';

        if (empty($email) || empty($password)) {
            return response()->json(['success' => false, 'message' => 'Email and password are required'], 400);
        }

        $user = AdminUser::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return response()->json(['success' => false, 'message' => 'Invalid credentials'], 401);
        }

        if (!$user->is_active) {
            return response()->json(['success' => false, 'message' => 'Account deactivated'], 403);
        }

        $token = Str::random(64);

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'user' => $user
        ]);
    }

    public function verifyEmail(Request $request)
    {
        $token = $request->token;
        $user = User::where('verify_token', $token)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Invalid token'], 404);
        }

        if (Carbon::parse($user->verify_expires)->isPast()) {
            return response()->json(['success' => false, 'message' => 'Token expired'], 410);
        }

        $user->update([
            'is_verified' => 1,
            'verify_token' => null,
            'verify_expires' => null,
        ]);

        return response()->json(['success' => true, 'message' => 'Email verified.']);
    }

    public function resetPassword(Request $request)
    {
        $email = trim($request->email ?? '');
        $newPassword = $request->newPassword ?? '';

        if (empty($email) || empty($newPassword)) {
            return response()->json(['success' => false, 'message' => 'Missing fields'], 400);
        }

        $user = User::where('email', $email)->first();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        $user->update(['password' => Hash::make($newPassword)]);

        return response()->json(['success' => true, 'message' => 'Password reset successful']);
    }

    public function getUserByEmail(Request $request)
    {
        $email = trim($request->email ?? '');
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        return response()->json(['success' => true, 'user' => $user]);
    }

    public function verifyFirebaseToken(Request $request)
    {
        $idToken = $request->idToken;
        $apiKey = $request->apiKey;

        $response = Http::post("https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=$apiKey", [
            'idToken' => $idToken,
        ]);

        if ($response->failed()) {
            return response()->json(['success' => false, 'message' => 'Firebase validation failed'], 400);
        }

        $data = $response->json();
        $email = $data['users'][0]['email'] ?? null;
        $emailVerified = $data['users'][0]['emailVerified'] ?? false;

        if ($email && $emailVerified) {
            User::where('email', $email)->update(['is_verified' => 1]);
            return response()->json(['success' => true, 'message' => 'User marked verified', 'email' => $email]);
        }

        return response()->json(['success' => false, 'message' => 'Email not verified in Firebase'], 403);
    }

    public function getUsers()
    {
        $users = User::all();
        return response()->json(['success' => true, 'users' => $users]);
    }

    public function deleteUser(Request $request)
    {
        $id = $request->id;
        $user = User::find($id);
        if ($user) {
            $user->delete();
            return response()->json(['success' => true, 'message' => 'User deleted successfully']);
        }
        return response()->json(['success' => false, 'message' => 'User not found'], 404);
    }

    public function getStaff()
    {
        // This is a placeholder since staff management might be in a separate table or just role='staff' in users table.
        // Based on AdminDashboard.js, it seems staff are managed.
        // Let's assume they are in users table with role 'staff' for now or a separate staff table.
        // Actually, previous code handled 'action': 'getStaff' which didn't seem to have a clear table yet.
        // Let's create a placeholder or check common practices.
        // I will return an empty array for now or return users with role staff.
        $staff = User::where('role', 'staff')->get();
        return response()->json(['success' => true, 'staff' => $staff]);
    }
}
