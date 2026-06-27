<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function getUserNotifications(Request $request)
    {
        $userId = $request->user_id;
        $notifications = \App\Models\Notification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json(['success' => true, 'notifications' => $notifications]);
    }

    public function getAdminNotifications(Request $request)
    {
        $adminId = $request->admin_id;
        if (!$adminId) {
            return response()->json(['success' => true, 'notifications' => []]);
        }

        $notifications = \App\Models\Notification::where(function($query) use ($adminId) {
                $query->where('admin_id', $adminId)
                      ->orWhere('user_id', $adminId);
            })
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json(['success' => true, 'notifications' => $notifications]);
    }

    public static function createAdminNotification($title, $message, $type = 'info')
    {
        $admin = \App\Models\AdminUser::where('is_active', 1)->first();
        if ($admin) {
            return self::createNotification(
                null,
                $title,
                $message,
                $type,
                null,
                $admin->id
            );
        }

        $adminUser = \App\Models\User::where('role', 'admin')->first();
        if ($adminUser) {
            return self::createNotification(
                $adminUser->id,
                $title,
                $message,
                $type
            );
        }

        \Illuminate\Support\Facades\Log::warning('No admin found to create admin notification.');
        return null;
    }

    public function getStaffNotifications(Request $request)
    {
        $staffId = $request->staff_id;
        $notifications = \App\Models\Notification::where('staff_id', $staffId)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json(['success' => true, 'notifications' => $notifications]);
    }

    public function markAsRead(Request $request)
    {
        $id = $request->id;
        $notification = \App\Models\Notification::find($id);
        if ($notification) {
            $notification->is_read = true;
            $notification->save();
        }
        return response()->json(['success' => true]);
    }

    public static function createNotification($userId, $title, $message, $type = 'info', $staffId = null, $adminId = null)
    {
        try {
            return \App\Models\Notification::create([
                'user_id' => $userId,
                'staff_id' => $staffId,
                'admin_id' => $adminId,
                'title' => $title,
                'message' => $message,
                'type' => $type
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Notification creation failed for user_id: ' . $userId . ' admin_id: ' . $adminId . ' - ' . $e->getMessage());
            return null;
        }
    }
}
