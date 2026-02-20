<?php
// ============================================================
// Economy Picture Dashboard - Accounts API
// CRUD: GET (list/filter), POST (create), PUT (update), DELETE
// ============================================================

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // -------------------------------------------------------
    // GET - List accounts with category info
    // Filters: ?category_id=, ?status=
    // -------------------------------------------------------
    case 'GET':
        $sql = "
            SELECT
                a.id,
                a.code,
                a.name,
                a.category_id,
                c.name  AS category_name,
                c.type  AS category_type,
                a.subcategory,
                a.status,
                a.notes,
                a.created_at
            FROM accounts a
            JOIN categories c ON a.category_id = c.id
            WHERE 1=1
        ";
        $params = [];

        if (!empty($_GET['category_id'])) {
            $sql .= " AND a.category_id = :category_id";
            $params[':category_id'] = (int) $_GET['category_id'];
        }

        if (!empty($_GET['status'])) {
            $sql .= " AND a.status = :status";
            $params[':status'] = $_GET['status'];
        }

        $sql .= " ORDER BY c.sort_order, a.code";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $accounts = $stmt->fetchAll();

        jsonResponse($accounts);
        break;

    // -------------------------------------------------------
    // POST - Create new account
    // Required: code, name, category_id
    // -------------------------------------------------------
    case 'POST':
        $data = getJsonBody();
        validateRequired($data, ['code', 'name', 'category_id']);

        $sql = "
            INSERT INTO accounts (code, name, category_id, subcategory, status, notes)
            VALUES (:code, :name, :category_id, :subcategory, :status, :notes)
        ";

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':code'        => $data['code'],
                ':name'        => $data['name'],
                ':category_id' => (int) $data['category_id'],
                ':subcategory' => $data['subcategory'] ?? null,
                ':status'      => $data['status'] ?? 'active',
                ':notes'       => $data['notes'] ?? null,
            ]);

            $id = (int) $pdo->lastInsertId();

            // Return the created account
            $stmt = $pdo->prepare("
                SELECT a.*, c.name AS category_name, c.type AS category_type
                FROM accounts a
                JOIN categories c ON a.category_id = c.id
                WHERE a.id = :id
            ");
            $stmt->execute([':id' => $id]);
            $account = $stmt->fetch();

            jsonResponse($account, 201);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                errorResponse('Account code already exists', 409);
            }
            errorResponse('Failed to create account: ' . $e->getMessage(), 500);
        }
        break;

    // -------------------------------------------------------
    // PUT - Update account by ?id=
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
        $allowed = ['code', 'name', 'category_id', 'subcategory', 'status', 'notes'];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        if (empty($fields)) {
            errorResponse('No fields to update', 400);
        }

        $sql = "UPDATE accounts SET " . implode(', ', $fields) . " WHERE id = :id";

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            if ($stmt->rowCount() === 0) {
                errorResponse('Account not found', 404);
            }

            // Return updated account
            $stmt = $pdo->prepare("
                SELECT a.*, c.name AS category_name, c.type AS category_type
                FROM accounts a
                JOIN categories c ON a.category_id = c.id
                WHERE a.id = :id
            ");
            $stmt->execute([':id' => $id]);
            $account = $stmt->fetch();

            jsonResponse($account);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                errorResponse('Account code already exists', 409);
            }
            errorResponse('Failed to update account: ' . $e->getMessage(), 500);
        }
        break;

    // -------------------------------------------------------
    // DELETE - Delete account by ?id=
    // -------------------------------------------------------
    case 'DELETE':
        if (empty($_GET['id'])) {
            errorResponse('Missing required parameter: id', 400);
        }
        $id = (int) $_GET['id'];

        $stmt = $pdo->prepare("DELETE FROM accounts WHERE id = :id");
        $stmt->execute([':id' => $id]);

        if ($stmt->rowCount() === 0) {
            errorResponse('Account not found', 404);
        }

        jsonResponse(['deleted' => $id]);
        break;

    // -------------------------------------------------------
    // Unsupported method
    // -------------------------------------------------------
    default:
        errorResponse('Method not allowed', 405);
}
