<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceSession extends Model
{
    protected $fillable = [
        'staff_id',
        'date',
        'check_in',
        'check_out',
        'duration_minutes',
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}
