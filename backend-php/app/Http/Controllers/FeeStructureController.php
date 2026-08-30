<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FeeStructureController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('fee_structures');
        if ($request->has('tier')) {
            $query->where('tier', $request->tier);
        }
        $fee_structures = $query->orderBy('tier')->orderBy('category')->get();
        return response()->json($fee_structures);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'category' => 'required|string',
            'amount' => 'required|numeric',
            'tier' => 'required|string',
        ]);

        $id = DB::table('fee_structures')->insertGetId([
            'title' => $request->title,
            'category' => $request->category,
            'amount' => $request->amount,
            'tier' => $request->tier,
        ]);

        return response()->json(['message' => 'Fee structure created successfully', 'id' => $id], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string',
            'category' => 'required|string',
            'amount' => 'required|numeric',
            'tier' => 'required|string',
        ]);

        $updated = DB::table('fee_structures')->where('id', $id)->update([
            'title' => $request->title,
            'category' => $request->category,
            'amount' => $request->amount,
            'tier' => $request->tier,
        ]);

        if (!$updated) {
            return response()->json(['error' => 'Fee structure not found or no changes made'], 404);
        }

        return response()->json(['message' => 'Fee structure updated successfully']);
    }

    public function destroy($id)
    {
        $deleted = DB::table('fee_structures')->where('id', $id)->delete();
        if (!$deleted) {
            return response()->json(['error' => 'Fee structure not found'], 404);
        }
        return response()->json(['message' => 'Fee structure deleted successfully']);
    }
}
