<?php
$pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=jere_model_academy', 'root', '');
$stmt = $pdo->query('SHOW TABLES');
foreach($stmt as $row) {
    echo $row[0] . "\n";
}
