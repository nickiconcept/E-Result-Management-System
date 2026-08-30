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
        Schema::create('academic_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('session_name')->unique();
            $table->boolean('is_current')->default(0);
        });

        Schema::create('promoted_classes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('class_id');
            $table->string('session_name');
            $table->timestamp('promoted_at')->useCurrent();
            
            $table->unique(['class_id', 'session_name']);
        });

        Schema::create('result_pins', function (Blueprint $table) {
            $table->id();
            $table->string('pin')->unique();
            $table->unsignedBigInteger('student_id')->nullable();
            $table->string('term')->nullable();
            $table->string('academic_year')->nullable();
            $table->integer('usage_count')->default(0);
            $table->string('status')->default('active');
            $table->timestamp('generated_at')->useCurrent();
            
            $table->foreign('student_id')->references('id')->on('students')->onDelete('set null');
        });

        Schema::create('affective_skills', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('target_section')->default('secondary');
            
            $table->unique(['name', 'target_section']);
        });

        Schema::create('psychomotor_skills', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('target_section')->default('secondary');
            
            $table->unique(['name', 'target_section']);
        });

        Schema::create('student_affective_eval', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('skill_id');
            $table->string('term');
            $table->string('academic_year');
            $table->integer('rating')->nullable();
            
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('skill_id')->references('id')->on('affective_skills')->onDelete('cascade');
            $table->unique(['student_id', 'skill_id', 'term', 'academic_year'], 'affective_eval_unique');
        });

        Schema::create('student_psychomotor_eval', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('skill_id');
            $table->string('term');
            $table->string('academic_year');
            $table->integer('rating')->nullable();
            
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('skill_id')->references('id')->on('psychomotor_skills')->onDelete('cascade');
            $table->unique(['student_id', 'skill_id', 'term', 'academic_year'], 'psycho_eval_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_psychomotor_eval');
        Schema::dropIfExists('student_affective_eval');
        Schema::dropIfExists('psychomotor_skills');
        Schema::dropIfExists('affective_skills');
        Schema::dropIfExists('result_pins');
        Schema::dropIfExists('promoted_classes');
        Schema::dropIfExists('academic_sessions');
    }
};
