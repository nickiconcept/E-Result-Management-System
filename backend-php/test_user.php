<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
try {
  $user = \Illuminate\Support\Facades\DB::table('users')->first();
  echo json_encode($user);
} catch (\Exception $e) {
  echo json_encode(['error' => $e->getMessage()]);
}
