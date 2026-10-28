<?php
/**
 * Migration 0049: Guarantee Admin & Core System Roles, Users & Permissions across all environments.
 */

if (!isset($db)) {
    require_once __DIR__ . '/../app/config/config.php';
    require_once __DIR__ . '/../app/core/Database.php';
    $db = Database::getInstance()->getConnection();
}

echo "Running Migration 0049 (Admin & Core Users Guarantee)...";

// 1. Password hash for 'Raptor@12345'
$hash = '$2y$10$md383xacx3BKgMuezEM08umH9b7oHty1wk5g3FXd/E1e1npN2I0/e';

// 2. Grant all permissions to Admin role (role_id 4 or found by name)
$adminRoleId = (int) $db->query("SELECT role_id FROM roles WHERE role_name = 'admin' LIMIT 1")->fetchColumn();
if (!$adminRoleId) {
    $db->exec("INSERT INTO roles (role_name, description, is_system) VALUES ('admin', 'System Administrator', 1)");
    $adminRoleId = (int) $db->lastInsertId();
}

$stmt = $db->query("SELECT permission_id FROM permissions");
$allPermIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

$grantStmt = $db->prepare("INSERT INTO role_permissions (role_id, permission_id, scope) VALUES (:r, :p, 'all') ON DUPLICATE KEY UPDATE scope = 'all'");
foreach ($allPermIds as $pid) {
    $grantStmt->execute([':r' => $adminRoleId, ':p' => $pid]);
}

// 3. Core Accounts to guarantee
$coreAccounts = [
    [
        'email' => 'admin@raptor.local',
        'name' => 'System Administrator',
        'role' => 'admin',
        'code' => 'EMP002',
        'title' => 'System Administrator',
        'dept' => 'IT Operations'
    ],
    [
        'email' => 'ceo@raptor.local',
        'name' => 'CEO Executive',
        'role' => 'ceo',
        'code' => 'EMP001',
        'title' => 'Chief Executive Officer',
        'dept' => 'Executive Office'
    ],
    [
        'email' => 'hr@raptor.local',
        'name' => 'HR Manager',
        'role' => 'hr',
        'code' => 'EMP004',
        'title' => 'HR Manager',
        'dept' => 'Human Resources'
    ],
    [
        'email' => 'manager@raptor.local',
        'name' => 'Sales Manager',
        'role' => 'manager',
        'code' => 'EMP003',
        'title' => 'Sales Manager',
        'dept' => 'Sales'
    ],
    [
        'email' => 'finance@raptor.local',
        'name' => 'Finance Manager',
        'role' => 'finance',
        'code' => 'EMP005',
        'title' => 'Finance Manager',
        'dept' => 'Finance'
    ],
    [
        'email' => 'analyst@raptor.local',
        'name' => 'Data Analyst',
        'role' => 'analyst',
        'code' => 'EMP006',
        'title' => 'Data Analyst',
        'dept' => 'Analytics'
    ],
    [
        'email' => 'employee@raptor.local',
        'name' => 'Sales Associate',
        'role' => 'employee',
        'code' => 'EMP007',
        'title' => 'Sales Associate',
        'dept' => 'Sales'
    ]
];

foreach ($coreAccounts as $acc) {
    $rId = (int) $db->query("SELECT role_id FROM roles WHERE role_name = '{$acc['role']}' LIMIT 1")->fetchColumn();
    if (!$rId) continue;

    $stmt = $db->prepare("SELECT user_id FROM users WHERE email = :email LIMIT 1");
    $stmt->execute([':email' => $acc['email']]);
    $uid = $stmt->fetchColumn();

    if ($uid) {
        $upd = $db->prepare("UPDATE users SET password = :hash, role_id = :rid, status = 'active', force_password_reset = 0 WHERE user_id = :uid");
        $upd->execute([':hash' => $hash, ':rid' => $rId, ':uid' => $uid]);
    } else {
        $ins = $db->prepare("INSERT INTO users (role_id, name, email, password, status, force_password_reset) VALUES (:rid, :name, :email, :hash, 'active', 0)");
        $ins->execute([':rid' => $rId, ':name' => $acc['name'], ':email' => $acc['email'], ':hash' => $hash]);
        $uid = (int) $db->lastInsertId();
    }

    // Link/Upsert employee record
    $empCheck = $db->prepare("SELECT employee_id FROM employees WHERE user_id = :uid LIMIT 1");
    $empCheck->execute([':uid' => $uid]);
    $empId = $empCheck->fetchColumn();

    if ($empId) {
        $updEmp = $db->prepare("UPDATE employees SET employee_code = :code, job_title = :title, department = :dept, status = 'active' WHERE employee_id = :eid");
        $updEmp->execute([':code' => $acc['code'], ':title' => $acc['title'], ':dept' => $acc['dept'], ':eid' => $empId]);
    } else {
        $insEmp = $db->prepare("INSERT INTO employees (user_id, employee_code, job_title, department, status, hire_date, date_of_joining) VALUES (:uid, :code, :title, :dept, 'active', '2026-01-01', '2026-01-01')");
        $insEmp->execute([':uid' => $uid, ':code' => $acc['code'], ':title' => $acc['title'], ':dept' => $acc['dept']]);
    }
}

echo " Migration 0049 complete.\n";
