<?php
$endpoints = [
    'students',
    'teachers',
    'classes',
    'subjects',
    'class_subjects',
    'pins',
    'skills',
    'sessions',
    'fees/structures',
    'fees/report',
    'result/progress',
];

foreach ($endpoints as $ep) {
    $ch = curl_init("http://127.0.0.1:8000/api/$ep");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    // Use an admin token if needed, wait, we don't know it. Just pass a dummy or let it fail 401.
    // If it fails with 500 error, we will see the HTML.
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "Endpoint: /api/$ep\n";
    echo "Status: $httpCode\n";
    echo "Length: " . strlen($response) . "\n";
    
    // Check if valid JSON
    json_decode($response);
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo "JSON ERROR: " . json_last_error_msg() . "\n";
        echo "First 100 bytes: " . substr($response, 0, 100) . "\n";
        echo "Last 100 bytes: " . substr($response, -100) . "\n";
    } else {
        echo "Valid JSON.\n";
    }
    echo "---------------------------\n";
}
