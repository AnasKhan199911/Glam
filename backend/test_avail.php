<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$bookingDate = "2026-04-19";
$serviceId = 2;

$availability = \App\Models\BookingAvailability::where('service_id', $serviceId)
    ->where('available_date', $bookingDate)
    ->first();

var_dump($availability ? $availability->toArray() : "No availability found");

if (!$availability || !$availability->is_available) {
    echo "Not available\n";
    exit;
}

$adminSlots = [];
if (!empty($availability->available_times)) {
    $adminSlots = is_string($availability->available_times) ? json_decode($availability->available_times, true) : $availability->available_times;
}

var_dump($adminSlots);
