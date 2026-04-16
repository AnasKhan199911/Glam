<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$staff = \App\Models\Staff::where('full_name', 'like', '%Tahir%')->first();
if ($staff) {
    echo "ID: " . $staff->id . "\n";
    echo "Role: " . $staff->role . "\n";
    echo "Specialization: " . $staff->specialization . "\n";
} else {
    echo "Tahir not found\n";
}
