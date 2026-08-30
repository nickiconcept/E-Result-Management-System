<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FeeInvoiceController extends Controller
{
    public function index(Request $request)
    {
        $student_id = $request->query('student_id');
        $query = DB::table('fee_invoices')
            ->join('users', 'fee_invoices.student_id', '=', 'users.id')
            ->select('fee_invoices.*', 'users.full_name');
            
        if ($student_id) {
            $query->where('student_id', $student_id);
        }

        $invoices = $query->orderBy('status', 'desc')->orderBy('created_at', 'desc')->get();
        return response()->json($invoices);
    }

    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
            'title' => 'required|string',
            'category' => 'required|string',
            'amount_due' => 'required|numeric',
        ]);

        try {
            $id = DB::table('fee_invoices')->insertGetId([
                'student_id' => $request->student_id,
                'title' => $request->title,
                'category' => $request->category,
                'amount_due' => $request->amount_due,
                'amount_paid' => $request->amount_paid ?? 0,
                'status' => $request->status ?? 'unpaid',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
    
            return response()->json(['message' => 'Invoice created successfully', 'id' => $id], 201);
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->errorInfo[1] == 1062) {
                return response()->json(['error' => 'An invoice with this title already exists for the student.'], 400);
            }
            return response()->json(['error' => 'Database error occurred while creating the invoice.'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $updated = DB::table('fee_invoices')->where('id', $id)->update([
            'title' => $request->title,
            'category' => $request->category,
            'amount_due' => $request->amount_due,
            'amount_paid' => $request->amount_paid,
            'status' => $request->status,
            'updated_at' => now(),
        ]);

        if (!$updated) {
            return response()->json(['error' => 'Invoice not found or no changes made'], 404);
        }

        return response()->json(['message' => 'Invoice updated successfully']);
    }

    public function recordPayment(Request $request, $id)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
        ]);

        $invoice = DB::table('fee_invoices')->where('id', $id)->first();
        if (!$invoice) {
            return response()->json(['error' => 'Invoice not found'], 404);
        }

        $newPaid = $invoice->amount_paid + $request->amount;
        $status = $newPaid >= $invoice->amount_due ? 'paid' : 'partial';

        DB::table('fee_invoices')->where('id', $id)->update([
            'amount_paid' => $newPaid,
            'status' => $status,
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Payment recorded successfully', 'status' => $status]);
    }

    public function destroy($id)
    {
        $deleted = DB::table('fee_invoices')->where('id', $id)->delete();
        if (!$deleted) {
            return response()->json(['error' => 'Invoice not found'], 404);
        }
        return response()->json(['message' => 'Invoice deleted successfully']);
    }
}
