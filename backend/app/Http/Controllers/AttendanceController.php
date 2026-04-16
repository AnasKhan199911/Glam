<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function getRecords(Request $request)
    {
        $records = \App\Models\Attendance::with('staff')
            ->orderBy('date', 'desc')
            ->get();
        return response()->json(['success' => true, 'records' => $records]);
    }

    public function markAttendance(Request $request)
    {
        $id = $request->id; // Staff ID
        $date = date('Y-m-d');
        $time = date('H:i:s');
        $type = $request->type; // 'check_in' or 'check_out'

        $attendance = \App\Models\Attendance::firstOrCreate(
            ['staff_id' => $id, 'date' => $date],
            ['status' => 'Present']
        );

        if ($type === 'check_in') {
            $attendance->check_in = $time;
        } else {
            $attendance->check_out = $time;
        }

        $attendance->save();

        return response()->json(['success' => true, 'message' => 'Attendance marked', 'data' => $attendance]);
    }

    public function getStaffTodayStatus(Request $request)
    {
        $id = $request->id;
        $date = date('Y-m-d');
        $record = \App\Models\Attendance::where('staff_id', $id)->where('date', $date)->first();
        
        return response()->json(['success' => true, 'record' => $record]);
    }
}
