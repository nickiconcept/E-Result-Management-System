<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = new \Illuminate\Http\Request();

echo "Testing Endpoints...\n";
$controllers = [
    \App\Http\Controllers\StudentController::class => 'index',
    \App\Http\Controllers\TeacherController::class => 'index',
    \App\Http\Controllers\ClassController::class => 'index',
    \App\Http\Controllers\SubjectController::class => 'index',
];

foreach ($controllers as $class => $method) {
    try {
        $res = app($class)->$method($request);
        $content = $res->getContent();
        echo "Endpoint $class@$method length: " . strlen($content) . "\n";
        echo "Ends with: " . substr($content, -20) . "\n\n";
    } catch (\Exception $e) {
        echo "ERROR: " . $e->getMessage() . "\n";
    }
}
try { 
    $cs = \Illuminate\Support\Facades\DB::table('class_subjects')->get(); 
    $content = json_encode($cs);
    echo "Endpoint class_subjects length: " . strlen($content) . "\n";
    echo "Ends with: " . substr($content, -20) . "\n\n";
} catch (\Exception $e) { 
    echo "ERROR: " . $e->getMessage() . "\n"; 
}
