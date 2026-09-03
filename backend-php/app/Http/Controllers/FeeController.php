<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FeeController extends Controller
{
    public function generateTermly(Request $request)
    {
        $user = auth('api')->user();
        if (!$user || $user->role !== 'admin') return response()->json(['error' => 'Unauthorized'], 403);

        try {
            $settings = DB::table('system_settings')->orderByDesc('id')->first();
            if (!$settings || !$settings->active_term || !$settings->active_session) {
                return response()->json(['error' => 'School Term or Session is not properly configured in settings'], 400);
            }

            $termLabel = "{$settings->active_term} {$settings->active_session}";

            $students = DB::table('students as s')
                ->join('classes as c', 's.class_id', '=', 'c.id')
                ->join('users as u', 's.id', '=', 'u.id')
                ->where('u.status', 'active')
                ->select('s.id', 'c.tier')
                ->get();

            $generatedCount = 0;

            foreach ($students as $student) {
                if (!$student->tier) continue;

                $structures = DB::table('fee_structures')->where('tier', $student->tier)->get();

                foreach ($structures as $structure) {
                    $title = "{$structure->title} - {$termLabel}";
                    
                    $exists = DB::table('fee_invoices')
                        ->where('student_id', $student->id)
                        ->where('title', $title)
                        ->exists();

                    if (!$exists) {
                        DB::table('fee_invoices')->insertOrIgnore([
                            'student_id' => $student->id,
                            'title' => $title,
                            'category' => $structure->category,
                            'amount_due' => $structure->amount,
                            'amount_paid' => 0,
                            'status' => 'unpaid'
                        ]);
                        $generatedCount++;
                    }
                }
            }

            return response()->json([
                'message' => 'Termly fees generated successfully',
                'count' => $generatedCount
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function addCustomInvoice(Request $request)
    {
        $user = auth('api')->user();
        if (!$user || $user->role !== 'admin') return response()->json(['error' => 'Unauthorized'], 403);

        $title = $request->input('title');
        $category = $request->input('category', 'School Fees');
        $amount = (float)$request->input('amount');
        $class_id = $request->input('class_id');
        $tier = $request->input('tier');
        $all_classes = filter_var($request->input('all_classes', false), FILTER_VALIDATE_BOOLEAN);

        try {
            $studentIds = [];
            if ($all_classes) {
                $studentIds = DB::table('students')->pluck('id')->toArray();
            } elseif ($class_id) {
                $studentIds = DB::table('students')->where('class_id', $class_id)->pluck('id')->toArray();
            } elseif ($tier) {
                $studentIds = DB::table('students as s')
                    ->join('classes as c', 's.class_id', '=', 'c.id')
                    ->where('c.tier', $tier)
                    ->pluck('s.id')->toArray();
            }

            if (empty($studentIds)) {
                return response()->json(['error' => 'No students found in the specified target Class/Tier.'], 400);
            }

            foreach ($studentIds as $sId) {
                $exists = DB::table('fee_invoices')
                    ->where('student_id', $sId)
                    ->where('title', $title)
                    ->where('category', $category)
                    ->exists();

                if (!$exists) {
                    DB::table('fee_invoices')->insertOrIgnore([
                        'student_id' => $sId,
                        'title' => $title,
                        'category' => $category,
                        'amount_due' => $amount,
                        'amount_paid' => 0,
                        'status' => 'unpaid'
                    ]);
                }
            }

            return response()->json(['message' => 'Custom fee added successfully.']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function payFee(Request $request)
    {
        $user = auth('api')->user();
        if (!$user || $user->role !== 'admin') return response()->json(['error' => 'Unauthorized'], 403);

        $invoice_id = $request->input('invoice_id');
        $amount_paid = (float)$request->input('amount_paid');
        $payment_method = $request->input('payment_method');

        try {
            $invoice = DB::table('fee_invoices')->where('id', $invoice_id)->first();
            if (!$invoice) return response()->json(['error' => 'Invoice not found.'], 404);

            $totalPaid = $invoice->amount_paid + $amount_paid;
            $status = 'unpaid';
            if ($totalPaid >= $invoice->amount_due) $status = 'paid';
            elseif ($totalPaid > 0) $status = 'partial';

            DB::table('fee_invoices')->where('id', $invoice_id)->update([
                'amount_paid' => $totalPaid,
                'status' => $status
            ]);

            $receiptNum = 'REC-' . date('Y') . '-' . mt_rand(1000, 9999);
            DB::table('fee_receipts')->insert([
                'invoice_id' => $invoice_id,
                'receipt_number' => $receiptNum,
                'amount_paid' => $amount_paid,
                'payment_date' => date('Y-m-d'),
                'payment_method' => $payment_method,
                'logged_by' => $user->id
            ]);

            return response()->json([
                'message' => 'Payment logged successfully',
                'receipt_number' => $receiptNum
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getStudentFees(Request $request, $studentId)
    {
        $user = auth('api')->user();
        if (!$user || ($user->role === 'student' && $user->id != $studentId)) {
            return response()->json(['error' => 'Unauthorized access.'], 403);
        }

        try {
            $invoices = DB::table('fee_invoices')->where('student_id', $studentId)->get();
            
            $receipts = DB::table('fee_receipts as r')
                ->join('fee_invoices as i', 'r.invoice_id', '=', 'i.id')
                ->leftJoin('users as u', 'r.logged_by', '=', 'u.id')
                ->where('i.student_id', $studentId)
                ->select('r.*', 'i.title', 'i.amount_due', 'u.full_name as logged_by_name')
                ->get();

            return response()->json([
                'invoices' => $invoices,
                'receipts' => $receipts
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getStructures()
    {
        try {
            $structures = DB::table('fee_structures')->orderBy('tier')->get();
            return response()->json($structures);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function createStructure(Request $request)
    {
        $user = auth('api')->user();
        if (!$user || $user->role !== 'admin') return response()->json(['error' => 'Unauthorized'], 403);

        $title = $request->input('title');
        $category = $request->input('category', 'School Fees');
        $amount = (float)$request->input('amount');
        $tier = $request->input('tier');

        if (!$title || !$amount || !$tier) {
            return response()->json(['error' => 'Title, amount, and tier are required'], 400);
        }

        try {
            DB::table('fee_structures')->insert([
                'title' => $title,
                'category' => $category,
                'amount' => $amount,
                'tier' => $tier
            ]);
            return response()->json(['message' => 'Fee structure created successfully'], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateStructure(Request $request, $id)
    {
        $user = auth('api')->user();
        if (!$user || $user->role !== 'admin') return response()->json(['error' => 'Unauthorized'], 403);

        $title = $request->input('title');
        $category = $request->input('category', 'School Fees');
        $amount = (float)$request->input('amount');
        $tier = $request->input('tier');

        if (!$title || !$amount || !$tier) {
            return response()->json(['error' => 'Title, amount, and tier are required'], 400);
        }

        try {
            $structure = DB::table('fee_structures')->where('id', $id)->first();
            if (!$structure) return response()->json(['error' => 'Fee structure not found'], 404);

            DB::table('fee_structures')->where('id', $id)->update([
                'title' => $title,
                'category' => $category,
                'amount' => $amount,
                'tier' => $tier
            ]);
            return response()->json(['message' => 'Fee structure updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function deleteStructure($id)
    {
        $user = auth('api')->user();
        if (!$user || $user->role !== 'admin') return response()->json(['error' => 'Unauthorized'], 403);

        try {
            DB::table('fee_structures')->where('id', $id)->delete();
            return response()->json(['message' => 'Fee structure deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getReport()
    {
        $user = auth('api')->user();
        if (!$user || $user->role !== 'admin') return response()->json(['error' => 'Unauthorized'], 403);

        try {
            $data = DB::table('students as s')
                ->leftJoin('users as u', 's.id', '=', 'u.id')
                ->leftJoin('fee_invoices as i', 's.id', '=', 'i.student_id')
                ->leftJoin('classes as c', 's.class_id', '=', 'c.id')
                ->groupBy('s.id', 'u.full_name', 'c.name')
                ->select(
                    's.id as student_id',
                    'u.full_name',
                    'c.name as class_name',
                    DB::raw('SUM(i.amount_due) as amount_due'),
                    DB::raw('SUM(i.amount_paid) as amount_paid'),
                    DB::raw('SUM(i.amount_due) - SUM(i.amount_paid) as balance')
                )
                ->get();
            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getCustomInvoices()
    {
        $user = auth('api')->user();
        if (!$user || $user->role !== 'admin') return response()->json(['error' => 'Unauthorized'], 403);

        try {
            $data = DB::table('fee_invoices as i')
                ->join('students as s', 'i.student_id', '=', 's.id')
                ->leftJoin('classes as c', 's.class_id', '=', 'c.id')
                ->whereNotIn('i.category', ['School Fees', 'Outstanding Debt'])
                ->groupBy('i.title', 'i.category', 'c.id', 'c.name', 'c.tier', 'i.amount_due')
                ->orderBy('c.name')
                ->orderBy('i.title')
                ->select(
                    DB::raw('MIN(i.id) as id'),
                    'i.title',
                    'i.category',
                    'i.amount_due',
                    'c.id as class_id',
                    'c.name as class_name',
                    'c.tier',
                    DB::raw('COUNT(i.id) as student_count'),
                    DB::raw('SUM(i.amount_paid) as total_paid')
                )
                ->get();
            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function deleteCustomInvoiceGroup(Request $request)
    {
        $user = auth('api')->user();
        if (!$user || $user->role !== 'admin') return response()->json(['error' => 'Unauthorized'], 403);

        $title = $request->input('title');
        $category = $request->input('category');
        $class_id = $request->input('class_id');
        $amount_due = (float)$request->input('amount_due');
        $tier = $request->input('tier');

        try {
            $query = DB::table('fee_invoices')
                ->where('title', $title)
                ->where('category', $category)
                ->where('amount_due', $amount_due);

            if ($class_id) {
                $studentIds = DB::table('students')->where('class_id', $class_id)->pluck('id');
                $query->whereIn('student_id', $studentIds);
            } else {
                $studentIds = DB::table('students as s')
                    ->join('classes as c', 's.class_id', '=', 'c.id')
                    ->where('c.tier', $tier)
                    ->pluck('s.id');
                $query->whereIn('student_id', $studentIds);
            }

            $query->delete();

            return response()->json(['message' => 'Custom invoice group deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateCustomInvoiceGroup(Request $request)
    {
        $user = auth('api')->user();
        if (!$user || $user->role !== 'admin') return response()->json(['error' => 'Unauthorized'], 403);

        $old_title = $request->input('old_title');
        $old_category = $request->input('old_category');
        $old_amount_due = (float)$request->input('old_amount_due');
        $class_id = $request->input('class_id');
        $tier = $request->input('tier');

        $new_title = $request->input('title');
        $new_category = $request->input('category');
        $new_amount = (float)$request->input('amount');

        try {
            $query = DB::table('fee_invoices')
                ->where('title', $old_title)
                ->where('category', $old_category)
                ->where('amount_due', $old_amount_due);

            if ($class_id) {
                $studentIds = DB::table('students')->where('class_id', $class_id)->pluck('id');
                $query->whereIn('student_id', $studentIds);
            } else {
                $studentIds = DB::table('students as s')
                    ->join('classes as c', 's.class_id', '=', 'c.id')
                    ->where('c.tier', $tier)
                    ->pluck('s.id');
                $query->whereIn('student_id', $studentIds);
            }

            $query->update([
                'title' => $new_title,
                'category' => $new_category,
                'amount_due' => $new_amount,
                'status' => DB::raw("CASE 
                    WHEN amount_paid >= {$new_amount} THEN 'paid' 
                    WHEN amount_paid > 0 THEN 'partial' 
                    ELSE 'unpaid' 
                END")
            ]);

            return response()->json(['message' => 'Custom invoice group updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}


