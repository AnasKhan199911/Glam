<?php
$servername = "127.0.0.1";
$username = "root";
$password = "";
$dbname = "glam_app";

echo "Attempting to connect to MySQL...\n";
$start = microtime(true);

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    // set the PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Connected successfully in " . (microtime(true) - $start) . " seconds\n";
} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
}
?>
