<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

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

foreach ($controllers as $class => $method) {
    try {
        $res = app($class)->$method($request);
        $content = $res->getContent();
        
        $trimmed = trim($content);
        if (strlen($content) > 0) {
            $lastChar = substr($trimmed, -1);
            if ($lastChar !== '}' && $lastChar !== ']') {
                echo "$class@$method has trailing non-JSON chars!\n";
                echo "Last 20 chars: " . substr($content, -20) . "\n";
            }
        }
    } catch (\Exception $e) { }
}
try { 
    $cs = \Illuminate\Support\Facades\DB::table('class_subjects')->get(); 
    $content = json_encode($cs);
    $trimmed = trim($content);
    $lastChar = substr($trimmed, -1);
    if ($lastChar !== '}' && $lastChar !== ']') {
        echo "class_subjects has trailing non-JSON chars!\n";
    }
} catch (\Exception $e) { }

echo "Done trailing check.\n";
