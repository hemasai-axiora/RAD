<?php
// Raptor CRM Front Controller

// Start output buffering immediately so notices, warnings, and accidental output do not corrupt HTTP headers or break redirects
if (ob_get_level() === 0) {
    ob_start();
}

register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        http_response_code(500);
        echo "<!DOCTYPE html><html><head><meta charset='utf-8'><title>System Error - RAPTOR</title>";
        echo "<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0d0e12;color:#f8fafc;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}";
        echo ".error-card{background:#1a1c24;border:1px solid #dc3545;border-radius:12px;padding:32px;max-width:650px;width:90%;box-shadow:0 10px 30px rgba(0,0,0,0.5);}";
        echo "h2{color:#ef4444;margin-top:0;font-size:1.4rem;} p{color:#94a3b8;font-size:0.95rem;line-height:1.5;}";
        echo ".code-box{background:#111217;border:1px solid #334155;border-radius:8px;padding:12px 16px;font-family:monospace;font-size:0.85rem;color:#fca5a5;overflow-x:auto;margin:16px 0;}";
        echo ".btn{display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-weight:500;font-size:0.9rem;}";
        echo "</style></head><body>";
        echo "<div class='error-card'>";
        echo "<h2>System Error Encountered</h2>";
        echo "<p>A critical PHP error occurred while processing the request.</p>";
        echo "<div class='code-box'><strong>Error:</strong> " . htmlspecialchars($error['message']) . "<br><strong>Location:</strong> " . htmlspecialchars($error['file']) . ":" . $error['line'] . "</div>";
        echo "<a href='javascript:history.back()' class='btn'>Go Back</a>";
        echo "</div></body></html>";
    }
});

try {
    // Require config before session setup so environment constants are available.
    require_once dirname(dirname(__FILE__)) . '/app/config/config.php';

    // Prevent raw non-fatal warnings/notices from printing to output and breaking redirects, while ensuring they are logged
    ini_set('display_errors', '0');
    error_reporting(E_ALL);
    ini_set('log_errors', '1');

    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => $https,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    header('X-Frame-Options: SAMEORIGIN');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: camera=(self), geolocation=(self), microphone=()');

    // Simple autoloader for core classes
    spl_autoload_register(function ($className) {
        $corePath = APPROOT . '/core/' . $className . '.php';
        $modelPath = APPROOT . '/models/' . $className . '.php';
        $servicePath = APPROOT . '/services/' . $className . '.php';
        
        if (file_exists($corePath)) {
            require_once $corePath;
        } elseif (file_exists($modelPath)) {
            require_once $modelPath;
        } elseif (file_exists($servicePath)) {
            require_once $servicePath;
        }
    });

    // Initialize Routing Engine
    $app = new App();
} catch (Throwable $e) {
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    http_response_code(500);
    echo "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Exception - RAPTOR</title>";
    echo "<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0d0e12;color:#f8fafc;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}";
    echo ".error-card{background:#1a1c24;border:1px solid #dc3545;border-radius:12px;padding:32px;max-width:750px;width:90%;box-shadow:0 10px 30px rgba(0,0,0,0.5);}";
    echo "h2{color:#ef4444;margin-top:0;font-size:1.4rem;} p{color:#94a3b8;font-size:0.95rem;line-height:1.5;}";
    echo ".code-box{background:#111217;border:1px solid #334155;border-radius:8px;padding:12px 16px;font-family:monospace;font-size:0.85rem;color:#fca5a5;overflow-x:auto;margin:16px 0;}";
    echo ".trace{background:#111217;border:1px solid #334155;border-radius:8px;padding:12px 16px;font-family:monospace;font-size:0.75rem;color:#cbd5e1;max-height:220px;overflow-y:auto;}";
    echo ".btn{display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-weight:500;font-size:0.9rem;margin-top:16px;}";
    echo "</style></head><body>";
    echo "<div class='error-card'>";
    echo "<h2>Application Exception Encountered</h2>";
    echo "<p>An uncaught error occurred while processing your request.</p>";
    echo "<div class='code-box'><strong>Message:</strong> " . htmlspecialchars($e->getMessage()) . "<br><strong>Location:</strong> " . htmlspecialchars($e->getFile()) . ":" . $e->getLine() . "</div>";
    echo "<div class='trace'>" . nl2br(htmlspecialchars($e->getTraceAsString())) . "</div>";
    echo "<a href='javascript:history.back()' class='btn'>Go Back</a>";
    echo "</div></body></html>";
    exit();
}
