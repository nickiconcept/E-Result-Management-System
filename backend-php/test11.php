<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::where('role', 'admin')->first();
auth('api')->login($user);
$request = new \Illuminate\Http\Request();

$controllers = [
    'Students' => [\App\Http\Controllers\StudentController::class, 'index'],
    'Teachers' => [\App\Http\Controllers\TeacherController::class, 'index'],
    'Classes' => [\App\Http\Controllers\ClassController::class, 'index'],
    'Subjects' => [\App\Http\Controllers\SubjectController::class, 'index'],
    'Pins' => [\App\Http\Controllers\PinController::class, 'getPins'],
    'Skills' => [\App\Http\Controllers\SkillController::class, 'getSkills'],
    'Sessions' => [\App\Http\Controllers\SystemController::class, 'getSessions'],
    'FeeStructs' => [\App\Http\Controllers\FeeController::class, 'getStructures'],
    'FeeReport' => [\App\Http\Controllers\FeeController::class, 'getReport'],
    'ResultProg' => [\App\Http\Controllers\ReportCardController::class, 'adminResultProgress'],
];

foreach ($controllers as $name => [$class, $method]) {
    try {
        $res = app($class)->$method($request);
        $content = json_decode($res->getContent(), true);
        if (is_array($content) && count($content) > 0) {
            echo "--- $name First Element ---\n";
            print_r($content[0]);
        }
    } catch (\Exception $e) { }
}

$cs = json_decode(json_encode(\Illuminate\Support\Facades\DB::table('class_subjects')->get()), true);
if (is_array($cs) && count($cs) > 0) {
    echo "--- ClassSubjects First Element ---\n";
    print_r($cs[0]);
}

