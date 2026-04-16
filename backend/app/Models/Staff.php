<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    use HasFactory;

    protected $table = 'staff';

    protected $fillable = [
        'employee_id',
        'full_name',
        'email',
        'phone',
        'role',
        'specialization',
        'experience_years',
        'salary',
        'bio',
        'profile_image',
        'rating',
        'total_services',
        'is_active',
        'password'
    ];

    protected $hidden = [
        'password'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'experience_years' => 'integer',
        'salary' => 'decimal:2',
        'rating' => 'decimal:1',
        'total_services' => 'integer',
    ];
}
