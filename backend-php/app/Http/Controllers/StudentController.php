<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    public function index()
    {
        $students = DB::table('students')
            ->join('users', 'students.id', '=', 'users.id')
            ->leftJoin('classes', 'students.class_id', '=', 'classes.id')
            ->select('students.*', 'users.full_name', 'users.username', 'users.passport_photo', 'classes.name as class_name')
            ->orderBy('classes.name')
            ->orderBy('users.full_name')
            ->get();
            
        return response()->json($students);
    }
    
    public function show($id)
    {
        $student = DB::table('students')
            ->join('users', 'students.id', '=', 'users.id')
            ->leftJoin('classes', 'students.class_id', '=', 'classes.id')
            ->select('students.*', 'users.full_name', 'users.username', 'users.passport_photo', 'classes.name as class_name', 'classes.tier')
            ->where('students.id', $id)
            ->first();
            
        if (!$student) {
            return response()->json(['error' => 'Student not found'], 404);
        }
        
        return response()->json($student);
    }

    public function graduated()
    {
        $students = DB::table('students')
            ->join('users', 'students.id', '=', 'users.id')
            ->select('students.*', 'users.full_name', 'users.username')
            ->where('students.status', 'graduated')
            ->orderBy('users.full_name')
            ->get();
            
        return response()->json($students);
    }

    public function transition(Request $request)
    {
        $student_ids = $request->input('student_ids');
        $target_class_id = $request->input('target_class_id');
        
        if (!$student_ids || !is_array($student_ids) || empty($student_ids)) {
            return response()->json(['error' => 'No students selected for transition.'], 400);
        }
        
        if (!$target_class_id) {
            return response()->json(['error' => 'Target class is required.'], 400);
        }

        DB::table('students')
            ->whereIn('id', $student_ids)
            ->update([
                'status' => 'active',
                'class_id' => $target_class_id
            ]);
            
        return response()->json(['message' => 'Successfully transitioned ' . count($student_ids) . ' students.']);
    }

    public function store(Request $request)
    {
        $user = auth('api')->user();
        if ($user->role !== 'admin') {
            $settings = DB::table('system_settings')->latest('id')->first();
            if (!$settings || !$settings->allow_fm_register_student) {
                return response()->json(['error' => 'Permission denied: Only Admins or permitted Form Masters can register students.'], 403);
            }
        }

        $request->validate([
            'full_name' => 'required|string',
        ]);

        try {
            DB::beginTransaction();

            $admission_number = $request->input('custom_admission_number');
            if (!$admission_number) {
                $year = date('Y');
                $count = DB::table('students')->count();
                $nextSeq = str_pad($count + 1, 4, '0', STR_PAD_LEFT);
                $admission_number = "JMA/{$year}/{$nextSeq}";
            }

            $username = strtoupper($admission_number);
            $password_hash = bcrypt($admission_number);

            $userId = DB::table('users')->insertGetId([
                'username' => $username,
                'password_hash' => $password_hash,
                'full_name' => $request->input('full_name'),
                'role' => 'student',
                'passport_photo' => $request->input('passport_photo'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('students')->insert([
                'id' => $userId,
                'class_id' => $request->input('class_id'),
                'admission_number' => $admission_number,
                'date_of_birth' => $request->input('date_of_birth'),
                'class_of_entry' => $request->input('class_of_entry'),
                'term_year_of_entry' => $request->input('term_year_of_entry'),
                'last_school_attended' => $request->input('last_school_attended'),
                'address_residence' => $request->input('address_residence'),
                'sex' => $request->input('sex'),
                'religion' => $request->input('religion'),
                'local_government' => $request->input('local_government'),
                'state_of_origin' => $request->input('state_of_origin'),
                'handicapped' => $request->input('handicapped', 0),
                'handicap_details' => $request->input('handicap_details'),
                'parent_name' => $request->input('parent_name'),
                'parent_address' => $request->input('parent_address'),
                'parent_phone' => $request->input('parent_phone'),
                'undertaking_signed' => 1,
            ]);

            $offline_debt = $request->input('offline_debt_amount');
            if ($offline_debt && is_numeric($offline_debt) && $offline_debt > 0) {
                DB::table('fee_invoices')->insert([
                    'student_id' => $userId,
                    'title' => 'Outstanding Offline Debt',
                    'category' => 'Outstanding Debt',
                    'amount_due' => $offline_debt,
                    'amount_paid' => 0,
                    'status' => 'unpaid',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $class_id = $request->input('class_id');
            if ($class_id) {
                $classData = DB::table('classes')->where('id', $class_id)->first();
                if ($classData && $classData->tier) {
                    $feeStructures = DB::table('fee_structures')->where('tier', $classData->tier)->get();
                    foreach ($feeStructures as $fee) {
                        DB::table('fee_invoices')->insert([
                            'student_id' => $userId,
                            'title' => $fee->title,
                            'category' => $fee->category,
                            'amount_due' => $fee->amount,
                            'amount_paid' => 0,
                            'status' => 'unpaid',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }

            DB::commit();
            return response()->json([
                'message' => 'Student registered successfully',
                'admission_number' => $admission_number,
                'studentId' => $userId
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            if (str_contains($e->getMessage(), 'Duplicate entry')) {
                return response()->json(['error' => 'Username or Admission Number already exists'], 400);
            }
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $user = auth('api')->user();
        if ($user->role !== 'admin') {
            $settings = DB::table('system_settings')->latest('id')->first();
            if (!$settings || !$settings->allow_fm_edit_student) {
                return response()->json(['error' => 'Permission denied: Only Admins or permitted Form Masters can edit students.'], 403);
            }
        }

        try {
            DB::beginTransaction();

            DB::table('users')->where('id', $id)->update([
                'full_name' => $request->input('full_name'),
                'passport_photo' => $request->input('passport_photo') ?: DB::raw('passport_photo'),
                'updated_at' => now(),
            ]);

            $studentData = [
                'class_id' => $request->input('class_id'),
                'date_of_birth' => $request->input('date_of_birth'),
                'class_of_entry' => $request->input('class_of_entry'),
                'term_year_of_entry' => $request->input('term_year_of_entry'),
                'last_school_attended' => $request->input('last_school_attended'),
                'address_residence' => $request->input('address_residence'),
                'sex' => $request->input('sex'),
                'religion' => $request->input('religion'),
                'local_government' => $request->input('local_government'),
                'state_of_origin' => $request->input('state_of_origin'),
                'handicapped' => $request->input('handicapped', 0),
                'handicap_details' => $request->input('handicap_details'),
                'parent_name' => $request->input('parent_name'),
                'parent_address' => $request->input('parent_address'),
                'parent_phone' => $request->input('parent_phone'),
            ];

            if ($request->has('custom_admission_number') && !empty($request->input('custom_admission_number'))) {
                $studentData['admission_number'] = $request->input('custom_admission_number');
            }

            DB::table('students')->where('id', $id)->update($studentData);

            DB::commit();
            return response()->json(['message' => 'Student updated successfully']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function averages(Request $request)
    {
        $year = $request->query('year');
        try {
            $averages = DB::table('grades')
                ->select('student_id', DB::raw('AVG(total_score) as average'))
                ->where('academic_year', $year)
                ->groupBy('student_id')
                ->get();
            return response()->json($averages);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function autoPromote(Request $request)
    {
        $source_class_id = $request->input('source_class_id');
        $mode = $request->input('mode');
        
        try {
            DB::beginTransaction();
            $settings = DB::table('system_settings')->latest('id')->first();
            $activeSession = $settings ? $settings->active_session : '';

            $students = DB::table('students')->where('class_id', $source_class_id)->get();
            
            $promoted = 0;
            $repeated = 0;
            
            foreach ($students as $student) {
                $avg = DB::table('grades')
                    ->where('student_id', $student->id)
                    ->where('academic_year', $activeSession)
                    ->avg('total_score') ?? 0;
                    
                $target_class_id = $source_class_id;
                
                if ($mode === 'split') {
                    if ($avg >= ($settings->science_pass_mark ?? 50)) {
                        $target_class_id = $request->input('science_target_id');
                    } elseif ($avg >= ($settings->commercial_pass_mark ?? 50)) {
                        $target_class_id = $request->input('commercial_target_id');
                    } elseif ($avg >= ($settings->arts_pass_mark ?? 50)) {
                        $target_class_id = $request->input('arts_target_id');
                    }
                } else {
                    if ($avg >= ($settings->global_pass_mark ?? 50)) {
                        $target_class_id = $request->input('global_target_id');
                    }
                }
                
                DB::table('students')->where('id', $student->id)->update([
                    'class_id' => $target_class_id,
                    'updated_at' => now(),
                ]);
                
                if ($target_class_id != $source_class_id) {
                    $promoted++;
                } else {
                    $repeated++;
                }
            }
            
            $exists = DB::table('promoted_classes')
                ->where('class_id', $source_class_id)
                ->where('session', $activeSession)
                ->first();
                
            if (!$exists) {
                DB::table('promoted_classes')->insert([
                    'class_id' => $source_class_id,
                    'session' => $activeSession,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            
            DB::commit();
            return response()->json(['message' => "Auto-promotion completed. Promoted: $promoted, Repeated: $repeated"]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function promoteBulk(Request $request)
    {
        $source_class_id = $request->input('source_class_id');
        $target_class_id = $request->input('target_class_id');
        $selected_student_ids = $request->input('selected_student_ids');

        try {
            DB::beginTransaction();
            $settings = DB::table('system_settings')->latest('id')->first();
            $activeSession = $settings ? $settings->active_session : '';

            $studentIdsToPromote = [];
            if (is_array($selected_student_ids) && count($selected_student_ids) > 0) {
                $studentIdsToPromote = $selected_student_ids;
            } elseif ($source_class_id) {
                $students = DB::table('students')->where('class_id', $source_class_id)->pluck('id')->toArray();
                $studentIdsToPromote = $students;
            }

            if (count($studentIdsToPromote) === 0) {
                return response()->json(['error' => 'No students selected for promotion.'], 400);
            }

            foreach ($studentIdsToPromote as $studId) {
                if ($target_class_id === 'graduate') {
                    DB::table('students')->where('id', $studId)->update([
                        'status' => 'graduated',
                        'class_id' => null
                    ]);
                } else {
                    DB::table('students')->where('id', $studId)->update([
                        'class_id' => $target_class_id
                    ]);
                }
            }

            if ($source_class_id) {
                DB::table('promoted_classes')->updateOrInsert(
                    ['class_id' => $source_class_id, 'session_name' => $activeSession],
                    ['class_id' => $source_class_id, 'session_name' => $activeSession]
                );
            }

            DB::commit();
            return response()->json(['message' => "Successfully updated " . count($studentIdsToPromote) . " students' class status."]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function promoteIndividual(Request $request)
    {
        $student_id = $request->input('student_id');
        $target_class_id = $request->input('target_class_id');
        $status = $request->input('status', 'active');

        try {
            if ($target_class_id === 'graduate') {
                DB::table('students')->where('id', $student_id)->update([
                    'status' => 'graduated',
                    'class_id' => null
                ]);
            } else {
                DB::table('students')->where('id', $student_id)->update([
                    'class_id' => $target_class_id,
                    'status' => $status
                ]);
            }
            return response()->json(['message' => 'Student promotion/status updated successfully.']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function promotedClasses(Request $request)
    {
        $session_name = $request->query('session_name');
        try {
            $settings = DB::table('system_settings')->latest('id')->first();
            $targetSession = $session_name ?: ($settings ? $settings->active_session : '');
            
            $rows = DB::table('promoted_classes')->where('session_name', $targetSession)->pluck('class_id')->toArray();
            return response()->json($rows);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function resetPromotedClasses(Request $request)
    {
        $session_name = $request->input('session_name');
        try {
            $settings = DB::table('system_settings')->latest('id')->first();
            $targetSession = $session_name ?: ($settings ? $settings->active_session : '');
            
            DB::table('promoted_classes')->where('session_name', $targetSession)->delete();
            return response()->json(['message' => 'Promotion tracking reset for session.']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function fastTrackGraduate(Request $request)
    {
        $request->validate([
            'student_id' => 'required|integer',
            'class_id' => 'required|integer',
        ]);

        try {
            $updated = DB::table('students')
                ->where('id', $request->input('student_id'))
                ->update([
                    'class_id' => $request->input('class_id'),
                    'updated_at' => now(),
                ]);
            
            if ($updated) {
                return response()->json(['message' => 'Student successfully moved from graduate list to active class.']);
            }
            return response()->json(['error' => 'Student not found.'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function fastTrackGraduate(Request $request)
    {
        $request->validate([
            'student_id' => 'required|integer',
            'class_id' => 'required|integer',
        ]);

        try {
            $updated = DB::table('students')
                ->where('id', $request->input('student_id'))
                ->update([
                    'class_id' => $request->input('class_id'),
                    'updated_at' => now(),
                ]);
            
            if ($updated) {
                return response()->json(['message' => 'Student successfully moved from graduate list to active class.']);
            }
            return response()->json(['error' => 'Student not found.'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}


