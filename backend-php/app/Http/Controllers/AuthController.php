<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Hash;


class AuthController extends Controller
{
    /**
     * Get a JWT via given credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'identifier' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        // We check the password manually since the DB column is password_hash
        $user = User::where('username', $credentials['identifier'])
                    ->orWhere('email', $credentials['identifier'])
                    ->first();

        // If not found in users by username/email, check students table by admission_number
        if (!$user) {
            $student = \Illuminate\Support\Facades\DB::table('students')
                            ->where('admission_number', $credentials['identifier'])
                            ->first();
            if ($student) {
                // In the old system, user.id = student.id
                $user = User::find($student->id);
            }
        }

        if (! $user || ! password_verify($credentials['password'], $user->password_hash)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if ($user->role === 'student') {
            $student = \Illuminate\Support\Facades\DB::table('students')->where('id', $user->id)->first();
            if ($student && in_array($student->status, ['inactive', 'suspended', 'graduated'])) {
                return response()->json(['message' => 'Account access restricted. Please contact administrator.'], 403);
            }
        } elseif ($user->role === 'teacher') {
            $teacher = \Illuminate\Support\Facades\DB::table('teachers')->where('id', $user->id)->first();
            if ($teacher && in_array($teacher->status, ['inactive', 'suspended', 'archived'])) {
                return response()->json(['message' => 'Account access restricted. Please contact administrator.'], 403);
            }
        }

        // Generate token
        if (! $token = auth('api')->login($user)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Log successful login
        ActivityLog::log(
            'login',
            'auth',
            "{$user->full_name} ({$user->role}) logged in",
            ['target_type' => 'user', 'target_id' => $user->id, 'target_name' => $user->full_name]
        );

        $userData = $user->toArray();
        if ($user->role === 'student') {
            $studentDetails = \Illuminate\Support\Facades\DB::table('students')
                ->leftJoin('classes', 'students.class_id', '=', 'classes.id')
                ->where('students.id', $user->id)
                ->select('students.admission_number', 'students.class_id', 'classes.name as class_name', 'students.sex', 'students.religion', 'students.date_of_birth')
                ->first();
                
            if ($studentDetails) {
                $userData = array_merge($userData, (array) $studentDetails);
            }
        }

        return response()->json([
            'token' => $token,
            'user'  => $userData
        ]);
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        $user = auth('api')->user();
        if ($user) {
            ActivityLog::log(
                'logout',
                'auth',
                "{$user->full_name} ({$user->role}) logged out",
                ['target_type' => 'user', 'target_id' => $user->id, 'target_name' => $user->full_name]
            );
        }
        auth('api')->logout();
        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Get the authenticated User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function me()
    {
        $user = auth('api')->user();
        $userData = $user->toArray();
        if ($user->role === 'student') {
            $studentDetails = \Illuminate\Support\Facades\DB::table('students')
                ->leftJoin('classes', 'students.class_id', '=', 'classes.id')
                ->where('students.id', $user->id)
                ->select('students.admission_number', 'students.class_id', 'classes.name as class_name', 'students.sex', 'students.religion', 'students.date_of_birth')
                ->first();
                
            if ($studentDetails) {
                $userData = array_merge($userData, (array) $studentDetails);
            }
        }
        return response()->json($userData);
    }

    /**
     * Get the token array structure.
     *
     * @param  string $token
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respondWithToken($token)
    {
        return response()->json([
            'token' => $token
        ]);
    }
}
