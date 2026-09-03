<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SystemSetting;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = SystemSetting::latest('id')->first();
        return response()->json($settings);
    }

    public function store(Request $request)
    {
        $settings = SystemSetting::latest('id')->first();
        if (!$settings) {
            $settings = new SystemSetting();
        }
        
        $validColumns = \Illuminate\Support\Facades\Schema::getColumnListing($settings->getTable());
        $data = $request->only($validColumns);
        unset($data['id'], $data['created_at'], $data['updated_at']);
        
        // Handle defaults based on Node backend
        $data['ca1_name'] = $request->input('ca1_name', 'CA 1');
        $data['ca2_name'] = $request->input('ca2_name', 'CA 2');
        $data['ca3_name'] = $request->input('ca3_name', 'CA 3');
        $data['ca4_name'] = $request->input('ca4_name', 'CA 4');
        $data['exam_name'] = $request->input('exam_name', 'Exam');
        
        $settings->fill($data);
        $settings->save();

        return response()->json(['message' => 'Settings updated successfully']);
    }
}
