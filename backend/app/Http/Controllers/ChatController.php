<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    public function getHistory(Request $request)
    {
        $sender_id = $request->input('sender_id');
        $sender_type = $request->input('sender_type');
        $receiver_id = $request->input('receiver_id');
        $receiver_type = $request->input('receiver_type');

        $messages = DB::table('chat_messages')
            ->where(function($query) use ($sender_id, $sender_type, $receiver_id, $receiver_type) {
                $query->where('sender_id', $sender_id)
                      ->where('sender_type', $sender_type)
                      ->where('receiver_id', $receiver_id)
                      ->where('receiver_type', $receiver_type);
            })
            ->orWhere(function($query) use ($sender_id, $sender_type, $receiver_id, $receiver_type) {
                $query->where('sender_id', $receiver_id)
                      ->where('sender_type', $receiver_type)
                      ->where('receiver_id', $sender_id)
                      ->where('receiver_type', $sender_type);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'messages' => $messages
        ]);
    }

    public function markRead(Request $request)
    {
        // For admin, we want to mark messages FROM users TO admin as read
        $sender_id = $request->input('sender_id'); // the user who sent it
        $sender_type = $request->input('sender_type'); // 'user'
        $receiver_id = $request->input('receiver_id'); // 5
        $receiver_type = $request->input('receiver_type'); // 'admin'

        DB::table('chat_messages')
            ->where('sender_id', $sender_id)
            ->where('sender_type', $sender_type)
            ->where('receiver_id', $receiver_id)
            ->where('receiver_type', $receiver_type)
            ->update(['is_read' => 1]);

        return response()->json([
            'success' => true
        ]);
    }

    public function getUnreadCounts(Request $request)
    {
        $receiver_id = $request->input('receiver_id');
        $receiver_type = $request->input('receiver_type');

        $counts = DB::table('chat_messages')
            ->select('sender_id', DB::raw('count(*) as count'))
            ->where('receiver_id', $receiver_id)
            ->where('receiver_type', $receiver_type)
            ->where('is_read', 0)
            ->groupBy('sender_id')
            ->get();

        $formatted = [];
        foreach ($counts as $row) {
            $formatted[$row->sender_id] = $row->count;
        }

        return response()->json([
            'success' => true,
            'unread_counts' => $formatted
        ]);
    }
}
