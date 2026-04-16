<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$review = \App\Models\Review::with('service')->first();
if ($review) {
    echo "Review ID: " . $review->id . "\n";
    echo "Service ID: " . $review->service_id . "\n";
    echo "Service Name: " . ($review->service ? $review->service->service_name : 'No service') . "\n";
    echo "Rating: " . $review->rating . "\n";
} else {
    echo "No review found\n";
}
