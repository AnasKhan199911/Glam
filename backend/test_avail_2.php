<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = \Illuminate\Http\Request::create('/api/bookings/get-available-slots', 'POST', [
    'date' => '2026-04-19',
    'serviceId' => 2
]);

$controller = new \App\Http\Controllers\BookingController();
$response = $controller->getAvailableSlots($request);

echo $response->getContent();
