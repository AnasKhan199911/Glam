<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::where('email', 'admin@glamconnect.com')->first();
if ($user) {
    echo "Admin User ID: " . $user->id . "\n";
} else {
    // Create it so the hardcoded ID fallback doesn't break integrity
    $user = \App\Models\User::create([
        'name' => 'System Administrator',
        'email' => 'admin@glamconnect.com',
        'password' => \Hash::make('admin123'),
        'role' => 'admin',
        'is_verified' => 1
    ]);
    echo "Created Admin User with ID: " . $user->id . "\n";
}
