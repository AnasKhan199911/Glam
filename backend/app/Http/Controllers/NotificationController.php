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
        $notifications = \App\Models\Notification::where('admin_id', $adminId)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json(['success' => true, 'notifications' => $notifications]);
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

    public static function createNotification($userId, $title, $message, $type = 'info', $staffId = null)
    {
        try {
            return \App\Models\Notification::create([
                'user_id' => $userId,
                'staff_id' => $staffId,
                'title' => $title,
                'message' => $message,
                'type' => $type
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Notification creation failed for user_id: ' . $userId . ' - ' . $e->getMessage());
            return null;
        }
    }
}
