<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tables = ['staff', 'bookings', 'services', 'users', 'reviews', 'notifications', 'attendance'];
foreach ($tables as $table) {
    try {
        $count = \DB::table($table)->count();
        echo "Table: " . $table . " | Count: " . $count . "\n";
    } catch (\Exception $e) {
        echo "Table: " . $table . " | ERROR: " . $e->getMessage() . "\n";
    }
}
