<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
try {
  $data = \Illuminate\Support\Facades\DB::table('fee_invoices as i')
      ->join('students as s', 'i.student_id', '=', 's.id')
      ->leftJoin('classes as c', 's.class_id', '=', 'c.id')
      ->whereNotIn('i.category', ['School Fees', 'Outstanding Debt'])
      ->groupBy('i.title', 'i.category', 'c.id', 'c.name', 'c.tier', 'i.amount_due')
      ->orderBy('c.name')
      ->orderBy('i.title')
      ->select(
          \Illuminate\Support\Facades\DB::raw('MIN(i.id) as id'),
          'i.title',
          'i.category',
          'i.amount_due',
          'c.id as class_id',
          'c.name as class_name',
          'c.tier',
          \Illuminate\Support\Facades\DB::raw('COUNT(i.id) as student_count'),
          \Illuminate\Support\Facades\DB::raw('SUM(i.amount_paid) as total_paid')
      )
      ->get();
  echo json_encode(['data' => $data, 'error' => null]);
} catch (\Exception $e) {
  echo json_encode(['error' => $e->getMessage()]);
}
