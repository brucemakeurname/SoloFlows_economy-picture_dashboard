<?php
// ============================================================
// Economy Picture Dashboard - Ledger Entries API
// CRUD: GET (list/filter), POST (create), PUT (update), DELETE
// ============================================================

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // -------------------------------------------------------
    // GET - List ledger entries with account + category info
    // Filters: ?period=, ?account_id=, ?status=, ?category_type=
    // -------------------------------------------------------
    case 'GET':
        $sql = "
            SELECT
                le.id,
                le.account_id,
                a.code  AS account_code,
                a.name  AS account_name,
                a.subcategory,
                c.id    AS category_id,
                c.name  AS category_name,
                c.type  AS category_type,
                c.color AS category_color,
                le.period,
                le.budget,
                le.actual,
                le.variance,
                le.status,
                le.notes,
                le.created_at,
                le.updated_at
            FROM ledger_entries le
            JOIN accounts a   ON le.account_id = a.id
            JOIN categories c ON a.category_id = c.id
            WHERE 1=1
        ";
        $params = [];

        if (!empty($_GET['period'])) {
            $sql .= " AND le.period = :period";
            $params[':period'] = $_GET['period'];
        }

        if (!empty($_GET['account_id'])) {
            $sql .= " AND le.account_id = :account_id";
            $params[':account_id'] = (int) $_GET['account_id'];
        }

        if (!empty($_GET['status'])) {
            $sql .= " AND le.status = :status";
            $params[':status'] = $_GET['status'];
        }

        if (!empty($_GET['category_type'])) {
            $sql .= " AND c.type = :category_type";
            $params[':category_type'] = $_GET['category_type'];
        }

        $sql .= " ORDER BY le.period DESC, c.sort_order, a.code";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $entries = $stmt->fetchAll();

        jsonResponse($entries);
        break;

    // -------------------------------------------------------
    // POST - Create new ledger entry
    // Required: account_id, period
    // -------------------------------------------------------
    case 'POST':
        $data = getJsonBody();
        validateRequired($data, ['account_id', 'period']);

        $sql = "
            INSERT INTO ledger_entries (account_id, period, budget, actual, status, notes)
            VALUES (:account_id, :period, :budget, :actual, :status, :notes)
        ";

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':account_id' => (int) $data['account_id'],
                ':period'     => $data['period'],
                ':budget'     => $data['budget'] ?? 0.00,
                ':actual'     => $data['actual'] ?? 0.00,
                ':status'     => $data['status'] ?? 'forecast',
                ':notes'      => $data['notes'] ?? null,
            ]);

            $id = (int) $pdo->lastInsertId();

            // Return created entry with joins
            $stmt = $pdo->prepare("
                SELECT le.*, a.code AS account_code, a.name AS account_name,
                       c.name AS category_name, c.type AS category_type
                FROM ledger_entries le
                JOIN accounts a   ON le.account_id = a.id
                JOIN categories c ON a.category_id = c.id
                WHERE le.id = :id
            ");
            $stmt->execute([':id' => $id]);
            $entry = $stmt->fetch();

            jsonResponse($entry, 201);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                errorResponse('Ledger entry already exists for this account and period', 409);
            }
            errorResponse('Failed to create ledger entry: ' . $e->getMessage(), 500);
        }
        break;

    // -------------------------------------------------------
    // PUT - Update ledger entry by ?id=
    // Commonly used for inline editing of budget/actual
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
        $allowed = ['account_id', 'period', 'budget', 'actual', 'status', 'notes'];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        if (empty($fields)) {
            errorResponse('No fields to update', 400);
        }

        $sql = "UPDATE ledger_entries SET " . implode(', ', $fields) . " WHERE id = :id";

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            if ($stmt->rowCount() === 0) {
                errorResponse('Ledger entry not found', 404);
            }

            // Return updated entry with joins
            $stmt = $pdo->prepare("
                SELECT le.*, a.code AS account_code, a.name AS account_name,
                       c.name AS category_name, c.type AS category_type
                FROM ledger_entries le
                JOIN accounts a   ON le.account_id = a.id
                JOIN categories c ON a.category_id = c.id
                WHERE le.id = :id
            ");
            $stmt->execute([':id' => $id]);
            $entry = $stmt->fetch();

            jsonResponse($entry);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                errorResponse('Duplicate entry for this account and period', 409);
            }
            errorResponse('Failed to update ledger entry: ' . $e->getMessage(), 500);
        }
        break;

    // -------------------------------------------------------
    // DELETE - Delete ledger entry by ?id=
    // -------------------------------------------------------
    case 'DELETE':
        if (empty($_GET['id'])) {
            errorResponse('Missing required parameter: id', 400);
        }
        $id = (int) $_GET['id'];

        $stmt = $pdo->prepare("DELETE FROM ledger_entries WHERE id = :id");
        $stmt->execute([':id' => $id]);

        if ($stmt->rowCount() === 0) {
            errorResponse('Ledger entry not found', 404);
        }

        jsonResponse(['deleted' => $id]);
        break;

    // -------------------------------------------------------
    // Unsupported method
    // -------------------------------------------------------
    default:
        errorResponse('Method not allowed', 405);
}
