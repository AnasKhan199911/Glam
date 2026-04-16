<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::first();
if ($user) {
    echo "First user ID: " . $user->id . "\n";
    echo "First user Name: " . $user->name . "\n";
} else {
    echo "No user found in table\n";
}
