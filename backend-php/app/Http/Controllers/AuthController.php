<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
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

        // Generate token
        if (! $token = auth('api')->login($user)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return response()->json([
            'token' => $token,
            'user' => $user
        ]);
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
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
        return response()->json(auth('api')->user());
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
