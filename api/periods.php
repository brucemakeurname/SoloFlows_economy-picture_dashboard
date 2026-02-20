<?php
// ============================================================
// Economy Picture Dashboard - Periods API
// GET: list all periods | POST: create new period
// ============================================================

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // -------------------------------------------------------
    // GET - List all periods ordered by code
    // -------------------------------------------------------
    case 'GET':
        $sql = "
            SELECT
                id,
                code,
                label,
                start_date,
                end_date,
                is_active,
                created_at
            FROM periods
            ORDER BY code ASC
        ";

        $stmt = $pdo->query($sql);
        $periods = $stmt->fetchAll();

        jsonResponse($periods);
        break;

    // -------------------------------------------------------
    // POST - Create new period
    // Required: code, label, start_date, end_date
    // -------------------------------------------------------
    case 'POST':
        $data = getJsonBody();
        validateRequired($data, ['code', 'label', 'start_date', 'end_date']);

        $sql = "
            INSERT INTO periods (code, label, start_date, end_date, is_active)
            VALUES (:code, :label, :start_date, :end_date, :is_active)
        ";

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':code'       => $data['code'],
                ':label'      => $data['label'],
                ':start_date' => $data['start_date'],
                ':end_date'   => $data['end_date'],
                ':is_active'  => $data['is_active'] ?? false,
            ]);

            $id = (int) $pdo->lastInsertId();

            $stmt = $pdo->prepare("SELECT * FROM periods WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $period = $stmt->fetch();

            jsonResponse($period, 201);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                errorResponse('Period code already exists', 409);
            }
            errorResponse('Failed to create period: ' . $e->getMessage(), 500);
        }
        break;

    // -------------------------------------------------------
    // Unsupported method
    // -------------------------------------------------------
    default:
        errorResponse('Method not allowed', 405);
}
