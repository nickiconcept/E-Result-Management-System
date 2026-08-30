<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClassSubjectController extends Controller
{
    public function index()
    {
        return response()->json(DB::table('class_subjects')->get());
    }
}
