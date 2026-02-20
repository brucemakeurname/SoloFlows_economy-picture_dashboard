<?php
// ============================================================
// Economy Picture Dashboard - KPI Metrics API
// CRUD: GET (list/filter), POST (create), PUT (update), DELETE
// ============================================================

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // -------------------------------------------------------
    // GET - List KPI metrics
    // Filters: ?period=, ?group_name=, ?status=
    // -------------------------------------------------------
    case 'GET':
        $sql = "
            SELECT
                id,
                name,
                group_name,
                unit,
                target_value,
                current_value,
                period,
                status,
                notes,
                created_at,
                updated_at
            FROM kpi_metrics
            WHERE 1=1
        ";
        $params = [];

        if (!empty($_GET['period'])) {
            $sql .= " AND period = :period";
            $params[':period'] = $_GET['period'];
        }

        if (!empty($_GET['group_name'])) {
            $sql .= " AND group_name = :group_name";
            $params[':group_name'] = $_GET['group_name'];
        }

        if (!empty($_GET['status'])) {
            $sql .= " AND status = :status";
            $params[':status'] = $_GET['status'];
        }

        $sql .= " ORDER BY group_name, name";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $metrics = $stmt->fetchAll();

        // Cast DECIMAL string values to proper types
        $metrics = array_map(function ($row) {
            $row['id']            = (int) $row['id'];
            $row['target_value']  = $row['target_value'] !== null ? (float) $row['target_value'] : null;
            $row['current_value'] = (float) $row['current_value'];
            return $row;
        }, $metrics);

        jsonResponse($metrics);
        break;

    // -------------------------------------------------------
    // POST - Create new KPI metric
    // Required: name, group_name
    // -------------------------------------------------------
    case 'POST':
        $data = getJsonBody();
        validateRequired($data, ['name', 'group_name']);

        $sql = "
            INSERT INTO kpi_metrics (name, group_name, unit, target_value, current_value, period, status, notes)
            VALUES (:name, :group_name, :unit, :target_value, :current_value, :period, :status, :notes)
        ";

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':name'          => $data['name'],
                ':group_name'    => $data['group_name'],
                ':unit'          => $data['unit'] ?? null,
                ':target_value'  => $data['target_value'] ?? null,
                ':current_value' => $data['current_value'] ?? null,
                ':period'        => $data['period'] ?? null,
                ':status'        => $data['status'] ?? 'on_track',
                ':notes'         => $data['notes'] ?? null,
            ]);

            $id = (int) $pdo->lastInsertId();

            $stmt = $pdo->prepare("SELECT * FROM kpi_metrics WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $metric = $stmt->fetch();

            jsonResponse($metric, 201);
        } catch (PDOException $e) {
            errorResponse('Failed to create KPI metric: ' . $e->getMessage(), 500);
        }
        break;

    // -------------------------------------------------------
    // PUT - Update KPI metric by ?id=
    // -------------------------------------------------------
    case 'PUT':
        if (empty($_GET['id'])) {
            errorResponse('Missing required parameter: id', 400);
        }
        $id = (int) $_GET['id'];
        $data = getJsonBody();

        // Build dynamic SET clause
        $fields = [];
        $params = [':id' => $id];
        $allowed = ['name', 'group_name', 'unit', 'target_value', 'current_value', 'period', 'status', 'notes'];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        if (empty($fields)) {
            errorResponse('No fields to update', 400);
        }

        $sql = "UPDATE kpi_metrics SET " . implode(', ', $fields) . " WHERE id = :id";

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            if ($stmt->rowCount() === 0) {
                errorResponse('KPI metric not found', 404);
            }

            $stmt = $pdo->prepare("SELECT * FROM kpi_metrics WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $metric = $stmt->fetch();

            jsonResponse($metric);
        } catch (PDOException $e) {
            errorResponse('Failed to update KPI metric: ' . $e->getMessage(), 500);
        }
        break;

    // -------------------------------------------------------
    // DELETE - Delete KPI metric by ?id=
    // -------------------------------------------------------
    case 'DELETE':
        if (empty($_GET['id'])) {
            errorResponse('Missing required parameter: id', 400);
        }
        $id = (int) $_GET['id'];

        $stmt = $pdo->prepare("DELETE FROM kpi_metrics WHERE id = :id");
        $stmt->execute([':id' => $id]);

        if ($stmt->rowCount() === 0) {
            errorResponse('KPI metric not found', 404);
        }

        jsonResponse(['deleted' => $id]);
        break;

    // -------------------------------------------------------
    // Unsupported method
    // -------------------------------------------------------
    default:
        errorResponse('Method not allowed', 405);
}
