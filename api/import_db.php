<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/plain; charset=utf-8');

$host = 'localhost';
$db   = 'l5v17l38yo4h_economy_picture';
$user = 'l5v17l38yo4h_ep_admin';
$pass = 'Matkhau626!';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error . "\n");
}
$conn->set_charset("utf8mb4");
echo "DB connected OK\n";

// Import schema
$schema = file_get_contents(__DIR__ . '/../database/schema.sql');
if ($schema === false) {
    echo "ERROR: schema.sql not found\n";
} else {
    echo "Schema file loaded (" . strlen($schema) . " bytes)\n";
    if ($conn->multi_query($schema)) {
        $i = 0;
        do {
            if ($result = $conn->store_result()) {
                $result->free();
            }
            $i++;
        } while ($conn->next_result());
        echo "Schema: $i statements executed\n";
        if ($conn->error) {
            echo "Schema last error: " . $conn->error . "\n";
        }
    } else {
        echo "Schema ERROR: " . $conn->error . "\n";
    }
}

// Need fresh connection after multi_query
$conn->close();
$conn = new mysqli($host, $user, $pass, $db);
$conn->set_charset("utf8mb4");

// Import seed
$seed = file_get_contents(__DIR__ . '/../database/seed.sql');
if ($seed === false) {
    echo "ERROR: seed.sql not found\n";
} else {
    echo "Seed file loaded (" . strlen($seed) . " bytes)\n";
    if ($conn->multi_query($seed)) {
        $i = 0;
        do {
            if ($result = $conn->store_result()) {
                $result->free();
            }
            $i++;
        } while ($conn->next_result());
        echo "Seed: $i statements executed\n";
        if ($conn->error) {
            echo "Seed last error: " . $conn->error . "\n";
        }
    } else {
        echo "Seed ERROR: " . $conn->error . "\n";
    }
}

// Verify with fresh connection
$conn->close();
$conn = new mysqli($host, $user, $pass, $db);
$conn->set_charset("utf8mb4");

$res = $conn->query("SHOW TABLES");
$tables = [];
while ($row = $res->fetch_row()) {
    $tables[] = $row[0];
}
echo "\nFinal tables: " . implode(', ', $tables) . "\n";

echo "Accounts: " . $conn->query("SELECT COUNT(*) as c FROM accounts")->fetch_row()[0] . "\n";
echo "Ledger: " . $conn->query("SELECT COUNT(*) as c FROM ledger_entries")->fetch_row()[0] . "\n";
echo "KPIs: " . $conn->query("SELECT COUNT(*) as c FROM kpi_metrics")->fetch_row()[0] . "\n";

echo "\nDONE!\n";
$conn->close();
