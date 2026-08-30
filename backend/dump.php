<?php
$pdo = new PDO('sqlite:school.db');
$stmt = $pdo->query("SELECT sql FROM sqlite_master WHERE type='table'");
foreach ($stmt as $row) {
    echo $row['sql'] . "\n\n";
}
