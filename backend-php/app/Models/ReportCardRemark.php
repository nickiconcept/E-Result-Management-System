<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportCardRemark extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'term',
        'academic_year',
        'class_teacher_remark',
        'principal_remark',
        'is_ai_generated',
    ];
}
