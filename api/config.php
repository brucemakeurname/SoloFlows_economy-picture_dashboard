<?php
// ============================================================
// Economy Picture Dashboard - API Configuration
// Solo Flows / aitemplate.co
// Created: 2026-02-20
// ============================================================

// -----------------------------------------------------------
// Database credentials
// Load from config.env.php (gitignored, production) if it exists,
// otherwise fall back to environment variables / dev defaults.
// -----------------------------------------------------------
$envConfig = __DIR__ . '/config.env.php';
if (file_exists($envConfig)) {
    require_once $envConfig;
}

if (!defined('DB_HOST')) define('DB_HOST', getenv('EP_DB_HOST') ?: 'localhost');
if (!defined('DB_NAME')) define('DB_NAME', getenv('EP_DB_NAME') ?: 'economy_picture');
if (!defined('DB_USER')) define('DB_USER', getenv('EP_DB_USER') ?: 'root');
if (!defined('DB_PASS')) define('DB_PASS', getenv('EP_DB_PASS') ?: '');
if (!defined('DB_PORT')) define('DB_PORT', getenv('EP_DB_PORT') ?: '3306');

// -----------------------------------------------------------
// CORS Headers
// -----------------------------------------------------------
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// -----------------------------------------------------------
// PDO Database Connection
// -----------------------------------------------------------
try {
    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
        DB_HOST,
        DB_PORT,
        DB_NAME
    );

    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Database connection failed: ' . $e->getMessage(),
    ]);
    exit;
}

// -----------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------

/**
 * Send a JSON response and exit.
 *
 * @param mixed $data    Response payload
 * @param int   $code    HTTP status code
 */
function jsonResponse($data, int $code = 200): void
{
    http_response_code($code);
    echo json_encode([
        'success' => $code >= 200 && $code < 300,
        'data'    => $data,
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

/**
 * Send a JSON error response and exit.
 *
 * @param string $message Error message
 * @param int    $code    HTTP status code
 */
function errorResponse(string $message, int $code = 400): void
{
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'error'   => $message,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Get JSON body from request.
 *
 * @return array Decoded JSON body
 */
function getJsonBody(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        errorResponse('Invalid JSON body', 400);
    }
    return $data;
}

/**
 * Validate that required fields exist in data array.
 *
 * @param array  $data     Input data
 * @param array  $required List of required field names
 */
function validateRequired(array $data, array $required): void
{
    $missing = [];
    foreach ($required as $field) {
        if (!isset($data[$field]) || $data[$field] === '') {
            $missing[] = $field;
        }
    }
    if (!empty($missing)) {
        errorResponse('Missing required fields: ' . implode(', ', $missing), 422);
    }
}
