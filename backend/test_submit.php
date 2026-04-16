<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $review = \App\Models\Review::create([
        'user_id' => 1,
        'service_id' => 1,
        'rating' => 5,
        'comment' => 'Test comment'
    ]);
    echo "Review created: " . $review->id . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
