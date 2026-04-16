<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$service = \App\Models\Service::where('service_name', 'like', '%Bridal%')->first();
if ($service) {
    echo "ID: " . $service->id . "\n";
    echo "Name: " . $service->service_name . "\n";
    echo "Category: " . $service->category . "\n";
} else {
    echo "Bridal service not found\n";
}
