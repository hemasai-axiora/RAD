<?php
// Raptor CRM Auth Controller

class AuthController extends Controller {
    private $userModel;

    public function __construct() {
        $this->userModel = $this->model('User');
    }

    // Login Action
    public function login() {
        // Redirect if already logged in
        if ($this->isLoggedIn()) {
            $this->redirectByRole($_SESSION['user_role']);
        }

        $data = [
            'title' => 'Login | Raptor CRM',
            'email' => '',
            'password' => '',
            'email_err' => '',
            'password_err' => '',
            'csrf_token' => $this->generateCsrfToken()
        ];

        // Process form submission
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            // Sanitize POST data
            $_POST = filter_input_array(INPUT_POST, FILTER_SANITIZE_SPECIAL_CHARS);

            $data['email'] = trim($_POST['email']);
            $data['password'] = trim($_POST['password']);
            $csrf = isset($_POST['csrf_token']) ? $_POST['csrf_token'] : '';
            $loginLimit = (int) Security::setting('rate.login_limit', 20);
            $loginWindow = (int) Security::setting('rate.login_window_seconds', 300);

            // Validate CSRF
            if (!$this->validateCsrfToken($csrf)) {
                $data['password_err'] = 'Security validation failed (CSRF token mismatch).';
                Security::logEvent('login_csrf_failed', 'warning', null, ['email' => $data['email']]);
            } elseif (!Security::rateLimit('login:' . Security::clientIp(), $loginLimit, $loginWindow)) {
                $data['password_err'] = 'Too many login attempts. Please wait a few minutes and try again.';
            } elseif (!empty($data['email']) && Security::loginLocked($data['email'])) {
                $data['password_err'] = 'This login is temporarily locked. Please try again later.';
                Security::logEvent('login_locked', 'warning', null, ['email' => $data['email']]);
            } else {
                // Validate Email
                if (empty($data['email'])) {
                    $data['email_err'] = 'Please enter email.';
                }

                // Validate Password
                if (empty($data['password'])) {
                    $data['password_err'] = 'Please enter password.';
                }

                // If no validation errors, proceed to login
                if (empty($data['email_err']) && empty($data['password_err'])) {
                    // Authenticate User
                    $loggedInUser = $this->userModel->login($data['email'], $data['password']);

                    if ($loggedInUser) {
                        Security::recordLoginAttempt($data['email'], true);
                        session_regenerate_id(true);
                        // Create Session variables
                        $this->createUserSession($loggedInUser);
                        
                        // Log user activity in audit log (optional for now)
                        $this->logActivity($loggedInUser->user_id, 'User logged in');

                        // Redirect to role specific dashboard
                        $this->redirectByRole($loggedInUser->role_name);
                    } else {
                        Security::recordLoginAttempt($data['email'], false);
                        Security::logEvent('login_failed', 'warning', null, ['email' => $data['email']]);
                        $data['password_err'] = 'Invalid email or password.';
                    }
                }
            }
        }

        // Render login view without layout
        $this->view('auth/login', $data);
    }

    // Logout Action
    public function logout() {
        if ($this->isLoggedIn()) {
            $this->logActivity($_SESSION['user_id'], 'User logged out');
        }
        
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $_SESSION = array();
        session_destroy();
        
        $this->redirect('index.php?route=auth/login');
    }

    // Helper to log in session
    private function createUserSession($user) {
        $_SESSION['user_id'] = $user->user_id;
        $_SESSION['user_email'] = $user->email;
        $_SESSION['user_name'] = $user->name;
        $_SESSION['user_role'] = $user->role_name;
        
        // Fetch and cache role permissions
        $_SESSION['permissions'] = $this->userModel->getRolePermissions($user->role_id);
        $_SESSION['last_activity'] = time();
    }

    // Helper to redirect based on user role
    private function redirectByRole($role) {
        switch ($role) {
            case 'analyst':
                $this->redirect('index.php?route=dashboard/show/executive');
                break;
            case 'employee':
            case 'sales_person':
                // Employees start their day at Attendance (check-in gateway).
                $this->redirect('index.php?route=attendance/index');
                break;
            case 'hr':
                $this->redirect('index.php?route=users/index');
                break;
            case 'team_leader':
                $this->redirect('index.php?route=dashboard/show/sales_command');
                break;
            case 'admin':
            case 'manager':
                $this->redirect('index.php?route=dashboard/index');
                break;
            case 'employer':
            default:
                $this->redirect('index.php?route=dashboard/show/executive');
                break;
        }
    }

    // Helper to write activity logs
    private function logActivity($userId, $action) {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '';
        $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
        
        try {
            $db = Database::getInstance()->getConnection();
            $stmt = $db->prepare('INSERT INTO activity_logs (user_id, action, ip_address, user_agent) VALUES (:uid, :act, :ip, :ua)');
            $stmt->execute([
                ':uid' => $userId,
                ':act' => $action,
                ':ip' => $ip,
                ':ua' => $ua
            ]);
        } catch (Exception $e) {
            // Fail silently if table doesn't exist yet
        }
    }
}
