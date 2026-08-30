<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GradesController extends Controller
{
    /**
     * Get all students in a class with their grades for a specific subject/term/session.
     * Used by the marks entry screen in Admin and Teacher dashboards.
     */
    public function getGradesForEntry(Request $request, $classId, $subjectId)
    {
        $term       = $request->query('term');
        $session    = $request->query('session');

        // Get all active students in the class, joined with their user record for full_name
        $students = DB::table('students')
            ->join('users', 'students.id', '=', 'users.id')
            ->where('students.class_id', $classId)
            ->where('students.status', 'active')
            ->select(
                'students.id as student_id',
                'students.admission_number',
                'users.full_name'
            )
            ->orderBy('users.full_name')
            ->get();

        // Fetch existing grades for this class/subject/term/session
        $existingGrades = DB::table('grades')
            ->join('students', 'grades.student_id', '=', 'students.id')
            ->where('students.class_id', $classId)
            ->where('grades.subject_id', $subjectId)
            ->when($term,    fn($q) => $q->where('grades.term', $term))
            ->when($session, fn($q) => $q->where('grades.academic_year', $session))
            ->select('grades.*')
            ->get()
            ->keyBy('student_id');

        // Merge: every student gets a row, with grades if they exist or zeroes if not
        $result = $students->map(function ($student) use ($existingGrades, $subjectId, $term, $session) {
            $grade = $existingGrades->get($student->student_id);
            return [
                'student_id'       => $student->student_id,
                'full_name'        => $student->full_name,
                'admission_number' => $student->admission_number,
                'subject_id'       => (int) $subjectId,
                'term'             => $term,
                'academic_year'    => $session,
                'ca1'              => $grade ? $grade->ca1        : null,
                'ca2'              => $grade ? $grade->ca2        : null,
                'ca3'              => $grade ? $grade->ca3        : null,
                'ca4'              => $grade ? $grade->ca4        : null,
                'exam_score'       => $grade ? $grade->exam_score : null,
                'total_score'      => $grade ? $grade->total_score : 0,
                'grade_letter'     => $grade ? $grade->grade_letter : null,
                'remark'           => $grade ? $grade->remark : null,
            ];
        })->values();

        return response()->json($result);
    }

    public function getStudentGrades(Request $request)
    {
        $student_id = $request->query('student_id');
        $term = $request->query('term');
        $academic_year = $request->query('academic_year');

        $query = DB::table('grades')
            ->join('subjects', 'grades.subject_id', '=', 'subjects.id')
            ->select('grades.*', 'subjects.name as subject_name');

        if ($student_id) {
            $query->where('student_id', $student_id);
        }
        if ($term) {
            $query->where('term', $term);
        }
        if ($academic_year) {
            $query->where('academic_year', $academic_year);
        }

        return response()->json($query->get());
    }

    public function saveGrades(Request $request)
    {
        // Batch update or insert grades
        $grades = $request->input('grades');
        if (!is_array($grades)) {
            return response()->json(['error' => 'Invalid grades format'], 400);
        }

        foreach ($grades as $gradeData) {
            DB::table('grades')->updateOrInsert(
                [
                    'student_id' => $gradeData['student_id'],
                    'subject_id' => $gradeData['subject_id'],
                    'term' => $gradeData['term'],
                    'academic_year' => $gradeData['academic_year']
                ],
                [
                    'ca1' => $gradeData['ca1'] ?? 0,
                    'ca2' => $gradeData['ca2'] ?? 0,
                    'ca3' => $gradeData['ca3'] ?? 0,
                    'ca4' => $gradeData['ca4'] ?? 0,
                    'exam_score' => $gradeData['exam_score'] ?? 0,
                    'total_score' => $gradeData['total_score'] ?? 0,
                    'grade_letter' => $gradeData['grade_letter'] ?? null,
                    'remark' => $gradeData['remark'] ?? null,
                    'updated_at' => now(),
                ]
            );
        }

        return response()->json(['message' => 'Grades saved successfully']);
    }
}
