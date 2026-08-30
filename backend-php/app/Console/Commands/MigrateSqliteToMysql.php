<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:migrate-sqlite-to-mysql')]
#[Description('Command description')]
class MigrateSqliteToMysql extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting Data Migration from SQLite to MySQL...');
        
        $sqlite = \Illuminate\Support\Facades\DB::connection('sqlite_legacy');
        $mysql = \Illuminate\Support\Facades\DB::connection('mysql');
        
        // 1. Migrate Users
        $this->info('Migrating Users...');
        $users = $sqlite->table('USERS')->get();
        foreach ($users as $user) {
            $mysql->table('users')->insertOrIgnore([
                'id' => $user->id,
                'username' => $user->username,
                'password_hash' => $user->password_hash,
                'email' => $user->email,
                'full_name' => $user->full_name,
                'role' => $user->role,
                'passport_photo' => $user->passport_photo,
                'created_at' => $user->created_at,
                'updated_at' => $user->created_at,
            ]);
        }
        $this->info(count($users) . ' users migrated.');

        // 2. Migrate Classes
        $this->info('Migrating Classes...');
        $classes = $sqlite->table('CLASSES')->get();
        foreach ($classes as $class) {
            $mysql->table('classes')->insertOrIgnore([
                'id' => $class->id,
                'name' => $class->name,
                'tier' => $class->tier,
                'form_master_id' => $class->form_master_id,
            ]);
        }
        $this->info(count($classes) . ' classes migrated.');

        // 3. Migrate Students
        $this->info('Migrating Students...');
        $students = $sqlite->table('STUDENTS')->get();
        foreach ($students as $student) {
            $mysql->table('students')->insertOrIgnore([
                'id' => $student->id,
                'class_id' => $student->class_id,
                'admission_number' => $student->admission_number,
                'date_of_birth' => $student->date_of_birth,
                'class_of_entry' => $student->class_of_entry,
                'term_year_of_entry' => $student->term_year_of_entry,
                'last_school_attended' => $student->last_school_attended,
                'address_residence' => $student->address_residence,
                'sex' => $student->sex,
                'religion' => $student->religion,
                'local_government' => $student->local_government,
                'state_of_origin' => $student->state_of_origin,
                'handicapped' => $student->handicapped,
                'handicap_details' => $student->handicap_details,
                'parent_name' => $student->parent_name,
                'parent_address' => $student->parent_address,
                'parent_phone' => $student->parent_phone,
                'undertaking_signed' => $student->undertaking_signed,
                'status' => $student->status,
            ]);
        }
        $this->info(count($students) . ' students migrated.');

        // Migrate Subjects
        $this->info('Migrating Subjects...');
        $subjects = $sqlite->table('SUBJECTS')->get();
        foreach ($subjects as $subject) {
            $mysql->table('subjects')->insertOrIgnore([
                'id' => $subject->id,
                'name' => $subject->name,
                'tier' => $subject->tier,
            ]);
        }
        $this->info(count($subjects) . ' subjects migrated.');

        // Migrate Grades
        $this->info('Migrating Grades...');
        $grades = $sqlite->table('GRADES')->get();
        foreach ($grades as $grade) {
            $mysql->table('grades')->insertOrIgnore([
                'id' => $grade->id,
                'student_id' => $grade->student_id,
                'subject_id' => $grade->subject_id,
                'term' => $grade->term,
                'academic_year' => $grade->academic_year,
                'ca1' => $grade->ca1,
                'ca2' => $grade->ca2,
                'ca3' => $grade->ca3,
                'ca4' => $grade->ca4,
                'exam_score' => $grade->exam_score,
                'total_score' => $grade->total_score,
                'grade_letter' => $grade->grade_letter,
                'remark' => $grade->remark,
            ]);
        }
        $this->info(count($grades) . ' grades migrated.');

        // Migrate System Settings
        $this->info('Migrating System Settings...');
        $settings = $sqlite->table('SYSTEM_SETTINGS')->get();
        foreach ($settings as $setting) {
            $mysql->table('system_settings')->insertOrIgnore([
                'id' => $setting->id,
                'active_session' => $setting->active_session,
                'active_term' => $setting->active_term,
                'result_entry_open' => $setting->result_entry_open,
                'landing_school_name' => $setting->landing_school_name ?? null,
                'landing_tagline' => $setting->landing_tagline ?? null,
                'landing_hero_title' => $setting->landing_hero_title ?? null,
                'landing_hero_desc' => $setting->landing_hero_desc ?? null,
                'landing_address' => $setting->landing_address ?? null,
                'result_show_position' => $setting->result_show_position ?? 1,
                'result_show_average' => $setting->result_show_average ?? 1,
                'contact_phone' => $setting->contact_phone ?? null,
                'contact_email' => $setting->contact_email ?? null,
                'ca1_name' => $setting->ca1_name ?? null,
                'ca2_name' => $setting->ca2_name ?? null,
                'ca3_name' => $setting->ca3_name ?? null,
                'ca4_name' => $setting->ca4_name ?? null,
                'exam_name' => $setting->exam_name ?? null,
                'games_master_name' => $setting->games_master_name ?? null,
                'games_master_remark' => $setting->games_master_remark ?? null,
                'house_master_name' => $setting->house_master_name ?? null,
                'house_master_remark' => $setting->house_master_remark ?? null,
                'principal_name' => $setting->principal_name ?? null,
                'principal_signature' => $setting->principal_signature ?? null,
                'next_term_fee' => $setting->next_term_fee ?? null,
                'next_term_fee_nursery' => $setting->next_term_fee_nursery ?? null,
                'next_term_fee_primary' => $setting->next_term_fee_primary ?? null,
                'next_term_fee_jss' => $setting->next_term_fee_jss ?? null,
                'next_term_fee_sss' => $setting->next_term_fee_sss ?? null,
                'next_term_begins' => $setting->next_term_begins ?? null,
                'next_term_ends' => $setting->next_term_ends ?? null,
                'last_term_debit' => $setting->last_term_debit ?? null,
                'allow_past_attendance' => $setting->allow_past_attendance ?? 0,
                'allow_fm_register_student' => $setting->allow_fm_register_student ?? 0,
                'allow_fm_edit_student' => $setting->allow_fm_edit_student ?? 0,
                'max_ca_count' => $setting->max_ca_count ?? 4,
                'global_pass_mark' => $setting->global_pass_mark ?? 40,
                'science_pass_mark' => $setting->science_pass_mark ?? 60,
                'arts_pass_mark' => $setting->arts_pass_mark ?? 40,
                'commercial_pass_mark' => $setting->commercial_pass_mark ?? 50,
                'feature1_icon' => $setting->feature1_icon ?? null,
                'feature1_title' => $setting->feature1_title ?? null,
                'feature1_desc' => $setting->feature1_desc ?? null,
                'feature2_icon' => $setting->feature2_icon ?? null,
                'feature2_title' => $setting->feature2_title ?? null,
                'feature2_desc' => $setting->feature2_desc ?? null,
                'feature3_icon' => $setting->feature3_icon ?? null,
                'feature3_title' => $setting->feature3_title ?? null,
                'feature3_desc' => $setting->feature3_desc ?? null,
                'feature4_icon' => $setting->feature4_icon ?? null,
                'feature4_title' => $setting->feature4_title ?? null,
                'feature4_desc' => $setting->feature4_desc ?? null,
            ]);
        }
        $this->info(count($settings) . ' settings migrated.');

        // Migrate Teachers
        $this->info('Migrating Teachers...');
        $teachers = $sqlite->table('TEACHERS')->get();
        foreach ($teachers as $teacher) {
            $mysql->table('teachers')->insertOrIgnore([
                'id' => $teacher->id,
                'surname' => $teacher->surname,
                'first_name' => $teacher->first_name,
                'other_names' => $teacher->other_names,
                'address' => $teacher->address,
                'state_of_residence' => $teacher->state_of_residence,
                'lga_of_residence' => $teacher->lga_of_residence,
                'signature' => $teacher->signature,
                'status' => $teacher->status,
            ]);
        }
        $this->info(count($teachers) . ' teachers migrated.');

        // Migrate Class Subjects
        $this->info('Migrating Class Subjects...');
        $class_subjects = $sqlite->table('CLASS_SUBJECTS')->get();
        foreach ($class_subjects as $cs) {
            $mysql->table('class_subjects')->insertOrIgnore([
                'id' => $cs->id,
                'class_id' => $cs->class_id,
                'subject_id' => $cs->subject_id,
                'teacher_id' => $cs->teacher_id,
            ]);
        }
        $this->info(count($class_subjects) . ' class subjects migrated.');

        // Migrate Fee Structures
        $this->info('Migrating Fee Structures...');
        $fee_structures = $sqlite->table('FEE_STRUCTURES')->get();
        foreach ($fee_structures as $fs) {
            $mysql->table('fee_structures')->insertOrIgnore([
                'id' => $fs->id,
                'title' => $fs->title,
                'category' => $fs->category,
                'amount' => $fs->amount,
                'tier' => $fs->tier,
            ]);
        }
        $this->info(count($fee_structures) . ' fee structures migrated.');

        // Migrate Fee Invoices
        $this->info('Migrating Fee Invoices...');
        $fee_invoices = $sqlite->table('FEE_INVOICES')->get();
        foreach ($fee_invoices as $fi) {
            $mysql->table('fee_invoices')->insertOrIgnore([
                'id' => $fi->id,
                'student_id' => $fi->student_id,
                'title' => $fi->title,
                'category' => $fi->category,
                'amount_due' => $fi->amount_due,
                'amount_paid' => $fi->amount_paid,
                'status' => $fi->status,
            ]);
        }
        $this->info(count($fee_invoices) . ' fee invoices migrated.');

        $this->info('Data migration complete!');
    }
}
