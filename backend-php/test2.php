<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = new \Illuminate\Http\Request();

echo "Testing Endpoints...\n";

try { app(\App\Http\Controllers\StudentController::class)->index(); echo "getStudents: OK\n"; } catch (\Exception $e) { echo "getStudents ERROR: " . $e->getMessage() . "\n"; }
try { app(\App\Http\Controllers\TeacherController::class)->index(); echo "getTeachers: OK\n"; } catch (\Exception $e) { echo "getTeachers ERROR: " . $e->getMessage() . "\n"; }
try { app(\App\Http\Controllers\ClassController::class)->index(); echo "getClasses: OK\n"; } catch (\Exception $e) { echo "getClasses ERROR: " . $e->getMessage() . "\n"; }
try { app(\App\Http\Controllers\SubjectController::class)->index(); echo "getSubjects: OK\n"; } catch (\Exception $e) { echo "getSubjects ERROR: " . $e->getMessage() . "\n"; }
try { 
    $cs = \Illuminate\Support\Facades\DB::table('class_subjects')->get(); 
    echo "getClassSubjects: OK\n"; 
} catch (\Exception $e) { 
    echo "getClassSubjects ERROR: " . $e->getMessage() . "\n"; 
}
try { app(\App\Http\Controllers\PinController::class)->getPins($request); echo "getPins: OK\n"; } catch (\Exception $e) { echo "getPins ERROR: " . $e->getMessage() . "\n"; }
try { app(\App\Http\Controllers\SkillController::class)->getSkills($request); echo "getSkills: OK\n"; } catch (\Exception $e) { echo "getSkills ERROR: " . $e->getMessage() . "\n"; }

echo "Done.\n";
