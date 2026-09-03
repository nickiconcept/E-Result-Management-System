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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable()->index(); // Who performed the action
            $table->string('user_role')->nullable();                     // admin, teacher, form_master, student
            $table->string('user_name')->nullable();                     // Snapshot of name at time of action
            $table->string('action');                                    // e.g. login, logout, create_student
            $table->string('module')->nullable();                        // e.g. students, teachers, finance, results
            $table->string('target_type')->nullable();                   // e.g. student, teacher, invoice
            $table->unsignedBigInteger('target_id')->nullable();        // ID of affected record
            $table->string('target_name')->nullable();                   // Snapshot name of affected record
            $table->text('description')->nullable();                     // Human-readable log message
            $table->json('meta')->nullable();                            // Extra structured data (old/new values etc.)
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
            
            // Indices for filtering
            $table->index(['user_role', 'created_at']);
            $table->index(['module', 'created_at']);
            $table->index(['action', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
