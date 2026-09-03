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
        Schema::create('report_card_remarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->string('term');
            $table->string('academic_year');
            $table->text('class_teacher_remark')->nullable();
            $table->text('principal_remark')->nullable();
            $table->boolean('is_ai_generated')->default(false);
            $table->timestamps();

            $table->unique(['student_id', 'term', 'academic_year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_card_remarks');
    }
};
