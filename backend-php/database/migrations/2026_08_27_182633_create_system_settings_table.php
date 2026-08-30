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
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('active_session');
            $table->string('active_term');
            $table->boolean('result_entry_open')->default(true);
            $table->string('landing_school_name')->nullable();
            $table->string('landing_tagline')->nullable();
            $table->string('landing_hero_title')->nullable();
            $table->text('landing_hero_desc')->nullable();
            $table->text('landing_address')->nullable();
            $table->boolean('result_show_position')->default(true);
            $table->boolean('result_show_average')->default(true);
            $table->string('contact_phone')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('ca1_name')->nullable();
            $table->string('ca2_name')->nullable();
            $table->string('ca3_name')->nullable();
            $table->string('ca4_name')->nullable();
            $table->string('exam_name')->nullable();
            $table->string('games_master_name')->nullable();
            $table->text('games_master_remark')->nullable();
            $table->string('house_master_name')->nullable();
            $table->text('house_master_remark')->nullable();
            $table->string('principal_name')->nullable();
            $table->text('principal_signature')->nullable();
            $table->string('next_term_fee')->nullable();
            $table->string('next_term_fee_nursery')->nullable();
            $table->string('next_term_fee_primary')->nullable();
            $table->string('next_term_fee_jss')->nullable();
            $table->string('next_term_fee_sss')->nullable();
            $table->string('next_term_begins')->nullable();
            $table->string('next_term_ends')->nullable();
            $table->string('last_term_debit')->nullable();
            $table->boolean('allow_past_attendance')->default(false);
            $table->boolean('allow_fm_register_student')->default(false);
            $table->boolean('allow_fm_edit_student')->default(false);
            $table->integer('max_ca_count')->default(4);
            $table->integer('global_pass_mark')->default(40);
            $table->integer('science_pass_mark')->default(60);
            $table->integer('arts_pass_mark')->default(40);
            $table->integer('commercial_pass_mark')->default(50);
            $table->string('feature1_icon')->nullable();
            $table->string('feature1_title')->nullable();
            $table->text('feature1_desc')->nullable();
            $table->string('feature2_icon')->nullable();
            $table->string('feature2_title')->nullable();
            $table->text('feature2_desc')->nullable();
            $table->string('feature3_icon')->nullable();
            $table->string('feature3_title')->nullable();
            $table->text('feature3_desc')->nullable();
            $table->string('feature4_icon')->nullable();
            $table->string('feature4_title')->nullable();
            $table->text('feature4_desc')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
