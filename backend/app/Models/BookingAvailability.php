<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingAvailability extends Model
{
    protected $table = 'booking_availability';

    protected $fillable = [
        'service_id',
        'available_date',
        'is_available',
        'available_times',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'available_times' => 'json',
    ];

    protected $dates = [];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Get the available_date as YYYY-MM-DD string
     */
    public function getAvailableDateAttribute($value)
    {
        if ($value) {
            return date('Y-m-d', strtotime($value));
        }
        return $value;
    }
}
