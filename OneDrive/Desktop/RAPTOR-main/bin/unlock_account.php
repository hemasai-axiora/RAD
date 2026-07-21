<?php
/**
 * Utility script to unlock locked user accounts by clearing failed login attempts and rate limits.
 * Usage: php bin/unlock_account.php [email]
 */

require_once dirname(dirname(__FILE__)) . '/app/config/config.php';
require_once dirname(dirname(__FILE__)) . '/app/core/Database.php';

$email = $argv[1] ?? 'finance@raptor.local';

echo "Unlocking account: {$email}...\n";

try {
    $db = Database::getInstance()->getConnection();
    
    // Clear failed login attempts
    $stmt1 = $db->prepare("DELETE FROM login_attempts WHERE LOWER(email) = LOWER(:email)");
    $stmt1->execute([':email' => $email]);
    $deletedAttempts = $stmt1->rowCount();
    
    // Clear all rate limit entries
    $stmt2 = $db->prepare("TRUNCATE TABLE rate_limits");
    $stmt2->execute();
    
    echo "Successfully unlocked account {$email}.\n";
    echo "- Deleted failed login attempts: {$deletedAttempts}\n";
    echo "- Reset rate limits.\n";
} catch (Exception $e) {
    echo "Error unlocking account: " . $e->getMessage() . "\n";
}
