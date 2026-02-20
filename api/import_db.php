<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Content-Type: application/json');

$host = 'localhost';
$db   = 'l5v17l38yo4h_economy_picture';
$user = 'l5v17l38yo4h_ep_admin';
$pass = 'Matkhau626!';
$results = [];

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::MYSQL_ATTR_MULTI_STATEMENTS => true,
    ]);
    $results['connection'] = 'OK';

    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    $results['existing_tables'] = $tables;

    // Import schema
    $schema = file_get_contents(__DIR__ . '/../database/schema.sql');
    if ($schema !== false) {
        // Close and reconnect to clear multi-statement state
        $pdo->exec($schema);
        // Need to clear result sets after multi-statement
        while ($pdo->nextRowset()) {}
        $results['schema'] = 'imported';
    } else {
        $results['schema'] = 'file not found';
    }

    // Import seed
    $seed = file_get_contents(__DIR__ . '/../database/seed.sql');
    if ($seed !== false) {
        $pdo->exec($seed);
        while ($pdo->nextRowset()) {}
        $results['seed'] = 'imported';
    } else {
        $results['seed'] = 'file not found';
    }

    // Verify
    $pdo2 = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
    $tables = $pdo2->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    $results['final_tables'] = $tables;

    $results['accounts_count'] = $pdo2->query("SELECT COUNT(*) FROM accounts")->fetchColumn();
    $results['ledger_count'] = $pdo2->query("SELECT COUNT(*) FROM ledger_entries")->fetchColumn();
    $results['kpi_count'] = $pdo2->query("SELECT COUNT(*) FROM kpi_metrics")->fetchColumn();

} catch (Exception $e) {
    $results['error'] = $e->getMessage();
    $results['line'] = $e->getLine();
}

echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
unlink(__FILE__);
