<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->cascadeOnDelete();
            $table->string('term');
            $table->string('academic_year');
            $table->double('ca1')->default(0);
            $table->double('ca2')->default(0);
            $table->double('ca3')->default(0);
            $table->double('ca4')->default(0);
            $table->double('exam_score')->default(0);
            $table->double('total_score')->default(0);
            $table->string('grade_letter')->nullable();
            $table->string('remark')->nullable();
            $table->timestamps();
            
            $table->unique(['student_id', 'subject_id', 'term', 'academic_year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
