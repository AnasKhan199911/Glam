<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::where('name', 'like', '%Anas%')->first();
if ($user) {
    echo "Anas ID: " . $user->id . "\n";
} else {
    echo "Anas not found\n";
}
