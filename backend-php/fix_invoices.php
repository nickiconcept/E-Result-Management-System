<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
try {
  $updated = \Illuminate\Support\Facades\DB::table('fee_invoices')
            ->where('category', 'School Fees')
            ->where('title', 'NOT LIKE', '% - %')
            ->update(['category' => 'Other Fees']);
  echo json_encode(['updated' => $updated]);
} catch (\Exception $e) {
  echo json_encode(['error' => $e->getMessage()]);
}
