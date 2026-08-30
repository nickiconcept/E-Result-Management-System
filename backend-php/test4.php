<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = new \Illuminate\Http\Request();

try { 
    $cs = \Illuminate\Support\Facades\DB::table('class_subjects')->get(); 
    $content = json_encode($cs);
    file_put_contents('class_subjects.json', $content);
} catch (\Exception $e) { 
    echo "ERROR: " . $e->getMessage() . "\n"; 
}

try {
    $res = app(\App\Http\Controllers\ClassSubjectController::class)->index();
    file_put_contents('class_subjects_api.json', $res->getContent());
} catch (\Exception $e) { 
    echo "ERROR: " . $e->getMessage() . "\n"; 
}
