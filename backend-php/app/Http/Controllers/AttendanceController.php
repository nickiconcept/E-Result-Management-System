<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    public function studentAttendance($studentId)
    {
        $user = auth('api')->user();

        if ($user->role === 'student' && $user->id != $studentId) {
            return response()->json(['error' => 'Unauthorized access.'], 403);
        }

        try {
            $attendance = DB::table('attendance')
                ->where('student_id', $studentId)
                ->orderByDesc('date')
                ->limit(90)
                ->select('date', 'status')
                ->get();
            return response()->json($attendance);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function classReport(Request $request, $classId)
    {
        $start_date = $request->query('start_date');
        $end_date = $request->query('end_date');
        $user = auth('api')->user();

        try {
            if ($user->role === 'teacher') {
                $cls = DB::table('classes')->where('id', $classId)->first();
                if (!$cls || $cls->form_master_id != $user->id) {
                    return response()->json(['error' => 'Access denied: You are not the Form Master of this class.'], 403);
                }
            }

            $query = DB::table('students as s')
                ->join('users as u', 's.id', '=', 'u.id')
                ->leftJoin('attendance as a', function ($join) use ($start_date, $end_date) {
                    $join->on('s.id', '=', 'a.student_id');
                    if ($start_date && $end_date) {
                        $join->whereBetween('a.date', [$start_date, $end_date]);
                    }
                })
                ->where('s.class_id', $classId)
                ->groupBy('s.id', 'u.full_name', 's.admission_number')
                ->orderBy('u.full_name')
                ->select(
                    's.id as student_id',
                    'u.full_name',
                    's.admission_number',
                    DB::raw("SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count"),
                    DB::raw("SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count"),
                    DB::raw("SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count"),
                    DB::raw("COUNT(a.status) as total_days")
                );

            $report = $query->get();
            return response()->json($report);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function classRoster(Request $request, $classId, $date)
    {
        $user = auth('api')->user();

        try {
            if ($user->role === 'teacher') {
                $cls = DB::table('classes')->where('id', $classId)->first();
                if (!$cls || $cls->form_master_id != $user->id) {
                    return response()->json(['error' => 'Access denied: You are not the Form Master of this class'], 403);
                }
            }

            $roster = DB::table('students as s')
                ->join('users as u', 's.id', '=', 'u.id')
                ->leftJoin('attendance as a', function ($join) use ($date) {
                    $join->on('s.id', '=', 'a.student_id')
                         ->where('a.date', '=', $date);
                })
                ->where('s.class_id', $classId)
                ->orderBy('u.full_name')
                ->select('s.id as student_id', 'u.full_name', 's.admission_number', 'a.status')
                ->get();

            return response()->json($roster);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function saveAttendance(Request $request)
    {
        $class_id = $request->input('class_id');
        $date = $request->input('date');
        $records = $request->input('records'); // array of {student_id, status}
        $user = auth('api')->user();

        try {
            if ($user->role === 'teacher') {
                $cls = DB::table('classes')->where('id', $class_id)->first();
                if (!$cls || $cls->form_master_id != $user->id) {
                    return response()->json(['error' => 'Access denied: You are not the Form Master of this class'], 403);
                }
            }

            DB::beginTransaction();

            foreach ($records as $rec) {
                $exists = DB::table('attendance')
                    ->where('student_id', $rec['student_id'])
                    ->where('date', $date)
                    ->first();

                if ($exists) {
                    DB::table('attendance')
                        ->where('student_id', $rec['student_id'])
                        ->where('date', $date)
                        ->update([
                            'status' => $rec['status'],
                            'marked_by' => $user->id
                        ]);
                } else {
                    DB::table('attendance')->insert([
                        'student_id' => $rec['student_id'],
                        'date' => $date,
                        'status' => $rec['status'],
                        'marked_by' => $user->id
                    ]);
                }
            }

            DB::commit();
            return response()->json(['message' => 'Attendance records updated successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
