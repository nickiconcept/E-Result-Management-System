<?php
$ch = curl_init("http://127.0.0.1:8000/api/students");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
file_put_contents('test_response.txt', $response);
