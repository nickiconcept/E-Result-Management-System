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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->nullable()->constrained('classes')->nullOnDelete();
            $table->string('admission_number')->unique();
            $table->date('date_of_birth')->nullable();
            $table->string('class_of_entry')->nullable();
            $table->string('term_year_of_entry')->nullable();
            $table->string('last_school_attended')->nullable();
            $table->text('address_residence')->nullable();
            $table->string('sex')->nullable();
            $table->string('religion')->nullable();
            $table->string('local_government')->nullable();
            $table->string('state_of_origin')->nullable();
            $table->boolean('handicapped')->default(false);
            $table->text('handicap_details')->nullable();
            $table->string('parent_name')->nullable();
            $table->text('parent_address')->nullable();
            $table->string('parent_phone')->nullable();
            $table->boolean('undertaking_signed')->default(false);
            $table->string('status')->default('active');
            
            // Setting the foreign key to users table with cascading delete
            $table->foreign('id')->references('id')->on('users')->onDelete('cascade');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
