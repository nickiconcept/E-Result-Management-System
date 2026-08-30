<?php
$ch = curl_init("http://127.0.0.1:8000/api/class-subjects");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
echo "Status: $httpCode\n";
echo "Length: " . strlen($response) . "\n";
file_put_contents('test_class_subjects_http.txt', $response);

$ch = curl_init("http://127.0.0.1:8000/api/settings");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
echo "Settings Status: $httpCode\n";
echo "Settings Length: " . strlen($response) . "\n";
file_put_contents('test_settings_http.txt', $response);
