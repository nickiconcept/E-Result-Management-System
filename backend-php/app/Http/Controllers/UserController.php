<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function registerTeacher(Request $request)
    {
        $full_name = $request->input('full_name');
        $email = $request->input('email');
        $passport_photo = $request->input('passport_photo');
        $surname = $request->input('surname');
        $first_name = $request->input('first_name');
        $other_names = $request->input('other_names');
        $address = $request->input('address');
        $state_of_residence = $request->input('state_of_residence');
        $lga_of_residence = $request->input('lga_of_residence');
        $signature = $request->input('signature');

        if (!$full_name) {
            return response()->json(['error' => 'Full name is required'], 400);
        }

        try {
            DB::beginTransaction();

            $year = date('Y');
            $countRow = DB::table('teachers')->count();
            $nextSeq = str_pad($countRow + 1, 3, '0', STR_PAD_LEFT);
            $staff_id = "JMA/STF/{$year}/{$nextSeq}";

            $username = strtoupper($staff_id);
            // Laravel's password_hash equivalent
            $password_hash = password_hash($staff_id, PASSWORD_DEFAULT);

            $userId = DB::table('users')->insertGetId([
                'username' => $username,
                'password_hash' => $password_hash,
                'email' => $email,
                'full_name' => $full_name,
                'role' => 'teacher',
                'passport_photo' => $passport_photo,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('teachers')->insert([
                'id' => $userId,
                'surname' => $surname,
                'first_name' => $first_name,
                'other_names' => $other_names,
                'address' => $address,
                'state_of_residence' => $state_of_residence,
                'lga_of_residence' => $lga_of_residence,
                'signature' => $signature,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::commit();
            return response()->json(['message' => 'Teacher registered successfully', 'teacherId' => $userId], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            if (str_contains($e->getMessage(), 'Duplicate entry')) {
                return response()->json(['error' => 'Username already exists'], 400);
            }
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateTeacher(Request $request, $id)
    {
        $user = auth('api')->user();
        if ($user->role !== 'admin' && $user->id != $id) {
            return response()->json(['error' => 'Access denied: You can only update your own profile'], 403);
        }

        $full_name = $request->input('full_name');
        $surname = $request->input('surname');
        $first_name = $request->input('first_name');
        $other_names = $request->input('other_names');
        $address = $request->input('address');
        $state_of_residence = $request->input('state_of_residence');
        $lga_of_residence = $request->input('lga_of_residence');
        $passport_photo = $request->input('passport_photo');
        $digital_signature = $request->input('digital_signature');
        $signature = $request->input('signature');

        $sig = $digital_signature !== null ? $digital_signature : $signature;

        try {
            DB::beginTransaction();

            $computedName = $full_name ?: trim("{$surname} {$first_name} {$other_names}");

            $updateData = ['full_name' => $computedName ?: 'Teacher', 'updated_at' => now()];
            if ($passport_photo !== null) {
                $updateData['passport_photo'] = $passport_photo;
            }

            DB::table('users')->where('id', $id)->update($updateData);

            $teacherUpdateData = [
                'updated_at' => now()
            ];
            if ($surname !== null) $teacherUpdateData['surname'] = $surname;
            if ($first_name !== null) $teacherUpdateData['first_name'] = $first_name;
            if ($other_names !== null) $teacherUpdateData['other_names'] = $other_names;
            if ($address !== null) $teacherUpdateData['address'] = $address;
            if ($state_of_residence !== null) $teacherUpdateData['state_of_residence'] = $state_of_residence;
            if ($lga_of_residence !== null) $teacherUpdateData['lga_of_residence'] = $lga_of_residence;
            if ($sig !== null) $teacherUpdateData['signature'] = $sig;

            DB::table('teachers')->where('id', $id)->update($teacherUpdateData);

            DB::commit();
            return response()->json(['message' => 'Teacher updated successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateStatus(Request $request)
    {
        $userId = $request->input('userId');
        $status = $request->input('status');

        if (!$userId || !$status) {
            return response()->json(['error' => 'User ID and status are required'], 400);
        }

        try {
            DB::beginTransaction();
            
            $user = DB::table('users')->where('id', $userId)->first();
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }

            // In old node.js it did: UPDATE USERS SET status = ?
            // However, the new Laravel schema removed 'status' from users table.
            // It relies on students.status and teachers.status
            if ($user->role === 'student') {
                DB::table('students')->where('id', $userId)->update(['status' => $status]);
            } elseif ($user->role === 'teacher') {
                DB::table('teachers')->where('id', $userId)->update(['status' => $status]);
            }

            DB::commit();
            return response()->json(['message' => 'User status updated successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
