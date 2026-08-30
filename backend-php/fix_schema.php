<?php
$mysql = new PDO('mysql:host=127.0.0.1;port=3306;dbname=jere_model_academy', 'root', '');
$mysql->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$queries = [
    // Add status to users
    "ALTER TABLE users ADD COLUMN status VARCHAR(50) DEFAULT 'active';",
    
    // Drop unique index on name in subjects, add composite unique index
    "ALTER TABLE subjects DROP INDEX subjects_name_unique;",
    "ALTER TABLE subjects ADD UNIQUE INDEX subjects_name_tier_unique (name, tier);"
];

foreach ($queries as $q) {
    try {
        $mysql->exec($q);
        echo "Executed: $q\n";
    } catch (Exception $e) {
        echo "Skipped/Error on $q: " . $e->getMessage() . "\n";
    }
}
