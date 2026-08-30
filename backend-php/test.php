<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = new \Illuminate\Http\Request();

echo "Testing Endpoints...\n";

try {
    $res = app(\App\Http\Controllers\SystemController::class)->getSessions();
    echo "getSessions: OK\n";
} catch (\Exception $e) {
    echo "getSessions ERROR: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n\n";
}

try {
    $res = app(\App\Http\Controllers\SystemController::class)->getSettings();
    echo "getSettings: OK\n";
} catch (\Exception $e) {
    echo "getSettings ERROR: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n\n";
}

try {
    $res = app(\App\Http\Controllers\FeeController::class)->getStructures();
    echo "getStructures: OK\n";
} catch (\Exception $e) {
    echo "getStructures ERROR: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n\n";
}

try {
    $res = app(\App\Http\Controllers\FeeController::class)->getReport();
    echo "getReport: OK\n";
} catch (\Exception $e) {
    echo "getReport ERROR: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n\n";
}

try {
    $res = app(\App\Http\Controllers\ReportCardController::class)->adminResultProgress($request);
    echo "adminResultProgress: OK\n";
} catch (\Exception $e) {
    echo "adminResultProgress ERROR: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n\n";
}

echo "Done.\n";
