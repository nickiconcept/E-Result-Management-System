<?php
$sqlite = new PDO('sqlite:../backend/school.db');
$mysql = new PDO('mysql:host=127.0.0.1;port=3306;dbname=jere_model_academy', 'root', '');
$mysql->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$tables = [
    'users', 'classes', 'students', 'subjects', 'class_subjects', 
    'grades', 'attendance', 'behavioral_grades', 'fee_invoices', 
    'fee_receipts', 'scheme_of_work', 'academic_sessions', 
    'fee_structures', 'promoted_classes', 'teachers', 'result_pins',
    'affective_skills', 'psychomotor_skills', 'student_affective_eval',
    'student_psychomotor_eval'
];

$mysql->exec('SET FOREIGN_KEY_CHECKS = 0;');

foreach ($tables as $table) {
    echo "Migrating $table...\n";
    
    try {
        $stmt = $sqlite->query("SELECT * FROM `$table`");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($rows)) {
            echo "  No data.\n";
            continue;
        }

        // Just use truncate in case it was half done
        $mysql->exec("TRUNCATE TABLE `$table`");
        
        $columns = array_keys($rows[0]);
        $columnsList = implode(', ', array_map(function($c) { return "`$c`"; }, $columns));
        
        $batchSize = 100;
        $chunks = array_chunk($rows, $batchSize);
        $total = 0;

        foreach ($chunks as $chunk) {
            $placeholders = [];
            $values = [];
            foreach ($chunk as $row) {
                $placeholders[] = '(' . implode(', ', array_fill(0, count($columns), '?')) . ')';
                foreach ($columns as $c) {
                    $values[] = $row[$c];
                }
            }
            
            $placeholdersStr = implode(', ', $placeholders);
            $insertStmt = $mysql->prepare("INSERT IGNORE INTO `$table` ($columnsList) VALUES $placeholdersStr");
            $insertStmt->execute($values);
            $total += count($chunk);
        }
        
        echo "  Inserted $total rows.\n";
    } catch (Exception $e) {
        echo "  Error: " . $e->getMessage() . "\n";
    }
}

$mysql->exec('SET FOREIGN_KEY_CHECKS = 1;');
echo "Done.\n";
