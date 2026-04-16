<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$staff = \App\Models\Staff::all();
echo "Staff Count: " . $staff->count() . "\n";
foreach ($staff as $s) {
    echo "ID: " . $s->id . " | Name: " . $s->full_name . " | Email: " . $s->email . "\n";
}
