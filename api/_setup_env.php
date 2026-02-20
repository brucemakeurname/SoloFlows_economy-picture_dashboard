<?php
/**
 * One-time setup: creates config.env.php with production credentials
 * and resets config.php to match the repo version.
 * Self-deletes after successful execution.
 */
header('Content-Type: text/plain');

$envPath = __DIR__ . '/config.env.php';

// 1. Create config.env.php with production credentials
$envContent = <<<'PHP'
<?php
// Production database credentials (gitignored)
define('DB_HOST', 'localhost');
define('DB_NAME', 'l5v17l38yo4h_economy_picture');
define('DB_USER', 'l5v17l38yo4h_ep_admin');
define('DB_PASS', 'Matkhau626!');
define('DB_PORT', '3306');
PHP;

$bytes = file_put_contents($envPath, $envContent);
if ($bytes === false) {
    echo "ERROR: Could not write config.env.php\n";
    exit(1);
}
echo "config.env.php created ($bytes bytes)\n";

// 2. Reset config.php to match repo version (remove local modifications)
$repoRoot = dirname(__DIR__);
$cmd = "cd " . escapeshellarg($repoRoot) . " && git checkout -- api/config.php 2>&1";
$output = shell_exec($cmd);
echo "git checkout -- api/config.php: " . ($output ?: "OK") . "\n";

// 3. Test the DB connection using the new config
try {
    require_once __DIR__ . '/config.php';
    $count = $pdo->query("SELECT COUNT(*) FROM accounts")->fetchColumn();
    echo "DB connection OK! Accounts: $count\n";
} catch (Exception $e) {
    echo "DB test failed: " . $e->getMessage() . "\n";
}

// 4. Check git status
$statusCmd = "cd " . escapeshellarg($repoRoot) . " && git status --short 2>&1";
$statusOutput = shell_exec($statusCmd);
echo "git status:\n" . ($statusOutput ?: "(clean)") . "\n";

// 5. Self-delete
unlink(__FILE__);
echo "Setup complete. This script has been deleted.\n";
