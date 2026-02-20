<?php
// ============================================================
// Economy Picture Dashboard - Categories API
// Read-only: GET list ordered by sort_order
// ============================================================

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // -------------------------------------------------------
    // GET - List all categories
    // -------------------------------------------------------
    case 'GET':
        $sql = "
            SELECT
                id,
                name,
                type,
                color,
                sort_order,
                created_at
            FROM categories
            ORDER BY sort_order ASC
        ";

        $stmt = $pdo->query($sql);
        $categories = $stmt->fetchAll();

        jsonResponse($categories);
        break;

    // -------------------------------------------------------
    // Unsupported method
    // -------------------------------------------------------
    default:
        errorResponse('Method not allowed. Categories endpoint supports GET only.', 405);
}
