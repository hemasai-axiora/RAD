<?php
// Raptor CRM Clients Controller

class ClientsController extends Controller {
    private $clientModel;

    public function __construct() {
        $this->requireAuth();
        
        // Enforce RBAC matrix: Employer has no access to client lists
        if ($_SESSION['user_role'] === 'employer') {
            $this->redirect('index.php?route=dashboard/executive');
        }
        
        $this->clientModel = $this->model('Client');
    }

    // List clients
    public function index() {
        $clients = $this->clientModel->getClients();

        $data = [
            'title' => 'Client Directory | Raptor CRM',
            'active_tab' => 'operations',
            'clients' => $clients,
            'can_edit' => in_array($_SESSION['user_role'], ['admin', 'manager'])
        ];

        $this->viewWithLayout('clients/index', 'main', $data);
    }

    // Add Client (Admin & Manager only)
    public function add() {
        if (!in_array($_SESSION['user_role'], ['admin', 'manager'])) {
            $this->redirect('index.php?route=clients/index');
        }

        $data = [
            'title' => 'Add Client | Raptor CRM',
            'active_tab' => 'operations',
            'company_name' => '',
            'email' => '',
            'phone' => '',
            'status' => 'active',
            'contract_start' => '',
            'contract_end' => '',
            'package_details' => '',
            'billing_address' => '',
            'company_name_err' => ''
        ];

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $_POST = filter_input_array(INPUT_POST, FILTER_SANITIZE_SPECIAL_CHARS);

            $data['company_name'] = trim($_POST['company_name']);
            $data['email'] = trim($_POST['email']);
            $data['phone'] = trim($_POST['phone']);
            $data['status'] = trim($_POST['status']);
            $data['contract_start'] = trim($_POST['contract_start']);
            $data['contract_end'] = trim($_POST['contract_end']);
            $data['package_details'] = trim($_POST['package_details']);
            $data['billing_address'] = trim($_POST['billing_address']);

            // Validate
            if (empty($data['company_name'])) {
                $data['company_name_err'] = 'Company name is required';
            }

            if (empty($data['company_name_err'])) {
                if ($this->clientModel->addClient($data)) {
                    $this->redirect('index.php?route=clients/index');
                } else {
                    die('Something went wrong.');
                }
            }
        }

        $this->viewWithLayout('clients/add', 'main', $data);
    }

    // Edit Client (Admin & Manager only)
    public function edit($id) {
        if (!in_array($_SESSION['user_role'], ['admin', 'manager'])) {
            $this->redirect('index.php?route=clients/index');
        }

        $client = $this->clientModel->getClientById($id);
        if (!$client) {
            $this->redirect('index.php?route=clients/index');
        }

        $data = [
            'title' => 'Edit Client | Raptor CRM',
            'active_tab' => 'operations',
            'client_id' => $client->client_id,
            'company_name' => $client->company_name,
            'email' => $client->email,
            'phone' => $client->phone,
            'status' => $client->status,
            'contract_start' => $client->contract_start,
            'contract_end' => $client->contract_end,
            'package_details' => $client->package_details,
            'billing_address' => $client->billing_address,
            'company_name_err' => ''
        ];

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $_POST = filter_input_array(INPUT_POST, FILTER_SANITIZE_SPECIAL_CHARS);

            $data['company_name'] = trim($_POST['company_name']);
            $data['email'] = trim($_POST['email']);
            $data['phone'] = trim($_POST['phone']);
            $data['status'] = trim($_POST['status']);
            $data['contract_start'] = trim($_POST['contract_start']);
            $data['contract_end'] = trim($_POST['contract_end']);
            $data['package_details'] = trim($_POST['package_details']);
            $data['billing_address'] = trim($_POST['billing_address']);

            if (empty($data['company_name'])) {
                $data['company_name_err'] = 'Company name is required';
            }

            if (empty($data['company_name_err'])) {
                if ($this->clientModel->updateClient($data)) {
                    $this->redirect('index.php?route=clients/index');
                } else {
                    die('Something went wrong.');
                }
            }
        }

        $this->viewWithLayout('clients/edit', 'main', $data);
    }

    // Delete Client
    public function delete($id) {
        if (!in_array($_SESSION['user_role'], ['admin', 'manager'])) {
            $this->redirect('index.php?route=clients/index');
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if ($this->clientModel->deleteClient($id)) {
                $this->redirect('index.php?route=clients/index');
            } else {
                die('Something went wrong.');
            }
        } else {
            $this->redirect('index.php?route=clients/index');
        }
    }
}
