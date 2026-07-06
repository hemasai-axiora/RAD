<?php
// Raptor CRM User Model

class User extends Model {
    // Find user by email
    public function findUserByEmail($email) {
        $this->query('SELECT u.*, r.role_name 
                      FROM users u 
                      JOIN roles r ON u.role_id = r.role_id 
                      WHERE u.email = :email AND u.status = "active"');
        $this->bind(':email', $email);
        return $this->single();
    }

    // Login user
    public function login($email, $password) {
        $row = $this->findUserByEmail($email);

        if ($row) {
            $hashed_password = $row->password;
            if (password_verify($password, $hashed_password)) {
                return $row;
            }
        }
        return false;
    }

    // Get user permissions by role ID
    public function getRolePermissions($roleId) {
        $this->query('SELECT p.permission_name 
                      FROM role_permissions rp
                      JOIN permissions p ON rp.permission_id = p.permission_id
                      WHERE rp.role_id = :role_id');
        $this->bind(':role_id', $roleId);
        
        $results = $this->resultSet();
        $permissions = [];
        foreach ($results as $row) {
            $permissions[] = $row->permission_name;
        }
        return $permissions;
    }

    // Get all users with role and employee information
    public function getUsers() {
        $this->query('SELECT u.*, r.role_name, e.employee_code, e.department, e.job_title, e.hire_date, e.reporting_manager_id, m.name as manager_name
                      FROM users u 
                      JOIN roles r ON u.role_id = r.role_id 
                      LEFT JOIN employees e ON u.user_id = e.user_id
                      LEFT JOIN users m ON e.reporting_manager_id = m.user_id
                      ORDER BY u.created_at DESC');
        return $this->resultSet();
    }

    // Get all roles
    public function getRoles() {
        $this->query('SELECT * FROM roles ORDER BY role_name ASC');
        return $this->resultSet();
    }

    public function getRoleNameById(int $roleId): ?string {
        $this->query('SELECT role_name FROM roles WHERE role_id = :id');
        $this->bind(':id', $roleId);
        $row = $this->single();
        return $row ? $row->role_name : null;
    }

    // Add user
    public function addUser($data) {
        $this->query('INSERT INTO users (role_id, name, email, password, status) 
                      VALUES (:rid, :name, :email, :pass, :status)');
        
        $hashed = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 10]);

        $this->bind(':rid', $data['role_id']);
        $this->bind(':name', $data['name']);
        $this->bind(':email', $data['email']);
        $this->bind(':pass', $hashed);
        $this->bind(':status', $data['status']);

        return $this->execute();
    }

    // Update user
    public function updateUser($data) {
        if (!empty($data['password'])) {
            $this->query('UPDATE users SET role_id = :rid, name = :name, email = :email, password = :pass, status = :status WHERE user_id = :id');
            $hashed = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 10]);
            $this->bind(':pass', $hashed);
        } else {
            $this->query('UPDATE users SET role_id = :rid, name = :name, email = :email, status = :status WHERE user_id = :id');
        }

        $this->bind(':rid', $data['role_id']);
        $this->bind(':name', $data['name']);
        $this->bind(':email', $data['email']);
        $this->bind(':status', $data['status']);
        $this->bind(':id', $data['user_id']);

        return $this->execute();
    }

    // Deactivate user; no physical deletion is allowed.
    public function deactivateUser($id) {
        $this->query('UPDATE users SET status = "inactive" WHERE user_id = :id');
        $this->bind(':id', $id);
        return $this->execute();
    }
}
