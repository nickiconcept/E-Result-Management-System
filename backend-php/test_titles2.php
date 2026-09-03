<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
try {
  $data = \Illuminate\Support\Facades\DB::table('fee_invoices')
            ->whereIn('title', ['Nursery School Fee', 'SSS School Fee'])
            ->select('id', 'title', 'category')
            ->get();
  echo json_encode($data);
} catch (\Exception $e) {
  echo json_encode(['error' => $e->getMessage()]);
}
