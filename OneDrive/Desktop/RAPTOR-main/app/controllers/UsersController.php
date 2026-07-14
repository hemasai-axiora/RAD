<?php
// Raptor CRM Employee Management Controller (Admin and HR)

class UsersController extends Controller {
    private $userModel;

    public function __construct() {
        $this->requireAuth();
        
        // Employee account management is reserved for Admin and HR.
        if (!Policy::canManageEmployees()) {
            $this->redirect('index.php?route=dashboard/executive');
        }

        $this->userModel = $this->model('User');
    }

    // List all team users
    public function index() {
        $users = $this->userModel->getUsers();
        $roles = $this->userModel->getRoles();
        if (Policy::isHr()) {
            $roles = array_values(array_filter($roles, function ($role) {
                return !in_array($role->role_name, ['admin'], true);
            }));
        }

        $data = [
            'title' => 'Employee Management | Raptor CRM',
            'active_tab' => 'system',
            'users' => $users,
            'roles' => $roles
        ];

        $this->viewWithLayout('users/index', 'main', $data);
    }

    // Add user action
    public function add() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $_POST = filter_input_array(INPUT_POST, FILTER_SANITIZE_SPECIAL_CHARS) ?: [];

            $data = [
                'role_id' => (int)trim($_POST['role_id']),
                'name' => trim($_POST['name']),
                'email' => trim($_POST['email']),
                'password' => trim($_POST['password']),
                'status' => trim($_POST['status']),
                
                // New employee fields
                'employee_code' => trim($_POST['employee_code']),
                'phone_number' => trim($_POST['phone_number']),
                'salary' => trim($_POST['salary']),
                'date_of_joining' => trim($_POST['date_of_joining']),
                'date_of_birth' => trim($_POST['date_of_birth']),
                'job_title' => trim($_POST['job_title']),
                'employment_type' => trim($_POST['employment_type']),
                'work_location' => trim($_POST['work_location']),
                'bio' => trim($_POST['bio']),
                'emergency_contact' => trim($_POST['emergency_contact']),
                'pan_number' => trim($_POST['pan_number']),
                'aadhaar_number' => trim($_POST['aadhaar_number']),
                'uan' => trim($_POST['uan']),
                'pf_applicable' => isset($_POST['pf_applicable']) ? 1 : 0,
                'esic_number' => trim($_POST['esic_number']),
                'pay_grade' => trim($_POST['pay_grade']),
                'force_password_reset' => isset($_POST['force_password_reset']) ? 1 : 0,

                // Bank details
                'account_holder_name' => trim($_POST['account_holder_name']),
                'bank_name' => trim($_POST['bank_name']),
                'account_number' => trim($_POST['account_number']),
                'ifsc_code' => trim($_POST['ifsc_code']),
                'branch_name' => trim($_POST['branch_name']),
                'account_type' => trim($_POST['account_type'])
            ];

            if ($this->userModel->isEmployeeCodeExists($data['employee_code'])) {
                $_SESSION['user_error'] = 'Employee ID already exists.';
                $this->redirect('index.php?route=users/index');
                return;
            }

            // Handle Profile Photo Upload
            $photo = null;
            if (!empty($_FILES['profile_photo']['name'])) {
                try {
                    $photo = Storage::put($_FILES['profile_photo'], 'profile-photo');
                    $data['profile_photo'] = $photo;
                } catch (Exception $e) {
                    $_SESSION['user_error'] = 'Photo upload failed: ' . $e->getMessage();
                    $this->redirect('index.php?route=users/index');
                    return;
                }
            }

            if (!empty($data['name']) && !empty($data['email']) && !empty($data['password']) && $data['role_id'] > 0) {
                if (Policy::isHr() && $this->userModel->getRoleNameById($data['role_id']) === 'admin') {
                    $this->redirect('index.php?route=users/index');
                    return;
                }
                if ($this->userModel->addUser($data)) {
                    $_SESSION['user_success'] = 'Employee added successfully.';
                    $this->redirect('index.php?route=users/index');
                    return;
                } else {
                    die('Something went wrong.');
                }
            }
        }
        $this->redirect('index.php?route=users/index');
    }

    // Edit user action
    public function edit() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $_POST = filter_input_array(INPUT_POST, FILTER_SANITIZE_SPECIAL_CHARS) ?: [];

            $data = [
                'user_id' => (int)trim($_POST['user_id']),
                'role_id' => (int)trim($_POST['role_id']),
                'name' => trim($_POST['name']),
                'email' => trim($_POST['email']),
                'password' => trim($_POST['password']), // optional password override
                'status' => trim($_POST['status']),

                // New employee fields
                'employee_code' => trim($_POST['employee_code']),
                'phone_number' => trim($_POST['phone_number']),
                'salary' => trim($_POST['salary']),
                'date_of_joining' => trim($_POST['date_of_joining']),
                'date_of_birth' => trim($_POST['date_of_birth']),
                'job_title' => trim($_POST['job_title']),
                'employment_type' => trim($_POST['employment_type']),
                'work_location' => trim($_POST['work_location']),
                'bio' => trim($_POST['bio']),
                'emergency_contact' => trim($_POST['emergency_contact']),
                'pan_number' => trim($_POST['pan_number']),
                'aadhaar_number' => trim($_POST['aadhaar_number']),
                'uan' => trim($_POST['uan']),
                'pf_applicable' => isset($_POST['pf_applicable']) ? 1 : 0,
                'esic_number' => trim($_POST['esic_number']),
                'pay_grade' => trim($_POST['pay_grade']),
                'force_password_reset' => isset($_POST['force_password_reset']) ? 1 : 0,

                // Bank details
                'account_holder_name' => trim($_POST['account_holder_name']),
                'bank_name' => trim($_POST['bank_name']),
                'account_number' => trim($_POST['account_number']),
                'ifsc_code' => trim($_POST['ifsc_code']),
                'branch_name' => trim($_POST['branch_name']),
                'account_type' => trim($_POST['account_type'])
            ];

            if ($this->userModel->isEmployeeCodeExists($data['employee_code'], $data['user_id'])) {
                $_SESSION['user_error'] = 'Employee ID already exists.';
                $this->redirect('index.php?route=users/index');
                return;
            }

            // Handle Profile Photo Upload
            if (!empty($_FILES['profile_photo']['name'])) {
                try {
                    $photo = Storage::put($_FILES['profile_photo'], 'profile-photo');
                    $data['profile_photo'] = $photo;
                } catch (Exception $e) {
                    $_SESSION['user_error'] = 'Photo upload failed: ' . $e->getMessage();
                    $this->redirect('index.php?route=users/index');
                    return;
                }
            } else {
                $data['profile_photo'] = null;
            }

            if ($data['user_id'] > 0 && !empty($data['name']) && !empty($data['email']) && $data['role_id'] > 0) {
                if (Policy::isHr() && $this->userModel->getRoleNameById($data['role_id']) === 'admin') {
                    $this->redirect('index.php?route=users/index');
                    return;
                }
                if ($this->userModel->updateUser($data)) {
                    $_SESSION['user_success'] = 'Employee details updated successfully.';
                    $this->redirect('index.php?route=users/index');
                    return;
                } else {
                    die('Something went wrong.');
                }
            }
        }
        $this->redirect('index.php?route=users/index');
    }

    // Deactivate user action; physical deletion is disabled by policy.
    public function deactivate($id) {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $this->userModel->deactivateUser((int) $id);
            $this->audit('Deactivated employee account', 'users', (int) $id);
        }
        $this->redirect('index.php?route=users/index');
    }
}
