<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$count = \App\Models\Review::count();
echo "Total Reviews: " . $count . "\n";
$avg = \App\Models\Review::avg('rating');
echo "Overall Avg: " . $avg . "\n";
