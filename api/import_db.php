<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/plain');

$host = 'localhost';
$db   = 'l5v17l38yo4h_economy_picture';
$user = 'l5v17l38yo4h_ep_admin';
$pass = 'Matkhau626!';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "DB connected OK\n";

    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "Existing tables: " . implode(', ', $tables) . "\n";

    // Read and execute schema
    $schema = file_get_contents(__DIR__ . '/../database/schema.sql');
    if ($schema === false) {
        echo "ERROR: schema.sql not found\n";
    } else {
        echo "Schema file loaded (" . strlen($schema) . " bytes)\n";
        $statements = array_filter(array_map('trim', explode(';', $schema)));
        foreach ($statements as $i => $stmt) {
            if (empty($stmt)) continue;
            try {
                $pdo->exec($stmt);
                echo "Schema statement $i OK\n";
            } catch (Exception $e) {
                echo "Schema statement $i ERROR: " . $e->getMessage() . "\n";
            }
        }
    }

    // Read and execute seed
    $seed = file_get_contents(__DIR__ . '/../database/seed.sql');
    if ($seed === false) {
        echo "ERROR: seed.sql not found\n";
    } else {
        echo "Seed file loaded (" . strlen($seed) . " bytes)\n";
        $statements = array_filter(array_map('trim', explode(';', $seed)));
        foreach ($statements as $i => $stmt) {
            if (empty($stmt)) continue;
            try {
                $pdo->exec($stmt);
                echo "Seed statement $i OK\n";
            } catch (Exception $e) {
                echo "Seed statement $i ERROR: " . $e->getMessage() . "\n";
            }
        }
    }

    // Verify
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "\nFinal tables: " . implode(', ', $tables) . "\n";
    echo "Accounts: " . $pdo->query("SELECT COUNT(*) FROM accounts")->fetchColumn() . "\n";
    echo "Ledger: " . $pdo->query("SELECT COUNT(*) FROM ledger_entries")->fetchColumn() . "\n";
    echo "KPIs: " . $pdo->query("SELECT COUNT(*) FROM kpi_metrics")->fetchColumn() . "\n";
    echo "\nDONE!\n";

} catch (Exception $e) {
    echo "FATAL: " . $e->getMessage() . "\n";
}
