<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Mock an admin user
$user = \App\Models\User::where('role', 'admin')->first();
auth('api')->login($user);
$request = new \Illuminate\Http\Request();

$controllers = [
    \App\Http\Controllers\StudentController::class => 'index',
    \App\Http\Controllers\TeacherController::class => 'index',
    \App\Http\Controllers\ClassController::class => 'index',
    \App\Http\Controllers\SubjectController::class => 'index',
    \App\Http\Controllers\PinController::class => 'getPins',
    \App\Http\Controllers\SkillController::class => 'getSkills',
    \App\Http\Controllers\SystemController::class => 'getSessions',
    \App\Http\Controllers\FeeController::class => 'getStructures',
    \App\Http\Controllers\FeeController::class => 'getReport',
    \App\Http\Controllers\ReportCardController::class => 'adminResultProgress',
];

echo "Testing Endpoints as Admin...\n";
foreach ($controllers as $class => $method) {
    try {
        $res = app($class)->$method($request);
        $content = $res->getContent();
        echo "Endpoint $class@$method length: " . strlen($content) . "\n";
        
        // Check for any non-JSON string
        json_decode($content);
        if (json_last_error() !== JSON_ERROR_NONE) {
            echo "  -> INVALID JSON: " . json_last_error_msg() . "\n";
        }
    } catch (\Exception $e) {
        echo "ERROR on $class@$method: " . $e->getMessage() . "\n";
    }
}
try { 
    $cs = \Illuminate\Support\Facades\DB::table('class_subjects')->get(); 
    $content = json_encode($cs);
    echo "Endpoint class_subjects length: " . strlen($content) . "\n";
} catch (\Exception $e) { 
    echo "ERROR: " . $e->getMessage() . "\n"; 
}
