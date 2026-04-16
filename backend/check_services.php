<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$services = \App\Models\Service::all();
foreach ($services as $s) {
    echo $s->id . ": " . $s->name . " [" . $s->category . "]\n";
}
