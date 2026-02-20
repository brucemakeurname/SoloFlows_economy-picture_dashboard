<?php
header('Content-Type: text/plain');

$config = <<<'PHP'
<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'l5v17l38yo4h_economy_picture');
define('DB_USER', 'l5v17l38yo4h_ep_admin');
define('DB_PASS', 'Matkhau626!');
define('DB_PORT', '3306');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
        DB_HOST, DB_PORT, DB_NAME
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

function jsonResponse($data, int $code = 200): void
{
    http_response_code($code);
    echo json_encode([
        'success' => $code >= 200 && $code < 300,
        'data'    => $data,
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function errorResponse(string $message, int $code = 400): void
{
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'error'   => $message,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

function getJsonBody(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        errorResponse('Invalid JSON body', 400);
    }
    return $data;
}

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
PHP;

$path = __DIR__ . '/config.php';
$bytes = file_put_contents($path, $config);

if ($bytes !== false) {
    echo "config.php written ($bytes bytes)\n";
    echo "Testing PDO connection...\n";

    try {
        $pdo = new PDO(
            'mysql:host=localhost;port=3306;dbname=l5v17l38yo4h_economy_picture;charset=utf8mb4',
            'l5v17l38yo4h_ep_admin',
            'Matkhau626!',
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        echo "PDO connection OK!\n";
        $count = $pdo->query("SELECT COUNT(*) FROM accounts")->fetchColumn();
        echo "Accounts in DB: $count\n";
    } catch (Exception $e) {
        echo "PDO ERROR: " . $e->getMessage() . "\n";
    }
} else {
    echo "ERROR: could not write config.php\n";
}

// Self-delete
unlink(__FILE__);
