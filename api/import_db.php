<?php
header('Content-Type: application/json');
$host = 'localhost';
$db   = 'l5v17l38yo4h_economy_picture';
$user = 'l5v17l38yo4h_ep_admin';
$pass = 'Matkhau626!';
$results = [];

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    $results['connection'] = 'OK';

    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    $results['existing_tables'] = $tables;

    $schema = file_get_contents(__DIR__ . '/../database/schema.sql');
    if ($schema) {
        $pdo->exec($schema);
        $results['schema'] = 'imported';
    } else {
        $results['schema'] = 'file not found';
    }

    $seed = file_get_contents(__DIR__ . '/../database/seed.sql');
    if ($seed) {
        $pdo->exec($seed);
        $results['seed'] = 'imported';
    } else {
        $results['seed'] = 'file not found';
    }

    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    $results['final_tables'] = $tables;

    $count = $pdo->query("SELECT COUNT(*) FROM accounts")->fetchColumn();
    $results['accounts_count'] = $count;

    $count = $pdo->query("SELECT COUNT(*) FROM ledger_entries")->fetchColumn();
    $results['ledger_count'] = $count;

    $count = $pdo->query("SELECT COUNT(*) FROM kpi_metrics")->fetchColumn();
    $results['kpi_count'] = $count;

} catch (Exception $e) {
    $results['error'] = $e->getMessage();
}

echo json_encode($results, JSON_PRETTY_PRINT);
unlink(__FILE__);
