<?php
// Raptor CRM Invoices Controller

class InvoicesController extends Controller {
    private $invoiceModel;
    private $clientModel;

    public function __construct() {
        $this->requireAuth();
        
        // Enforce RBAC: Only Admin and Manager can access Invoicing
        $allowedRoles = ['admin', 'manager'];
        if (!in_array($_SESSION['user_role'], $allowedRoles)) {
            $this->redirect('index.php?route=dashboard/executive');
        }

        $this->invoiceModel = $this->model('Invoice');
        $this->clientModel = $this->model('Client');
    }

    // List all invoices
    public function index() {
        $invoices = $this->invoiceModel->getInvoices();

        $data = [
            'title' => 'Billing Ledger | Raptor CRM',
            'active_tab' => 'finance',
            'invoices' => $invoices
        ];

        $this->viewWithLayout('invoices/index', 'main', $data);
    }

    // Create invoice
    public function add() {
        $clients = $this->clientModel->getClients();

        $data = [
            'title' => 'Generate Invoice | Raptor CRM',
            'active_tab' => 'finance',
            'clients' => $clients,
            'client_id' => '',
            'invoice_number' => 'INV-' . time(),
            'amount' => '',
            'status' => 'unpaid',
            'due_date' => '',
            'amount_err' => '',
            'client_err' => ''
        ];

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $_POST = filter_input_array(INPUT_POST, FILTER_SANITIZE_SPECIAL_CHARS);

            $data['client_id'] = trim($_POST['client_id']);
            $data['invoice_number'] = trim($_POST['invoice_number']);
            $data['amount'] = trim($_POST['amount']);
            $data['status'] = trim($_POST['status']);
            $data['due_date'] = trim($_POST['due_date']);

            // Validate
            if (empty($data['client_id'])) {
                $data['client_err'] = 'Please select a client';
            }
            if (empty($data['amount']) || !is_numeric($data['amount'])) {
                $data['amount_err'] = 'Please enter a valid amount';
            }

            if (empty($data['amount_err']) && empty($data['client_err'])) {
                if ($this->invoiceModel->addInvoice($data)) {
                    $this->redirect('index.php?route=invoices/index');
                } else {
                    die('Something went wrong.');
                }
            }
        }

        $this->viewWithLayout('invoices/add', 'main', $data);
    }

    // View Invoice (Ready to Print)
    public function show($id) {
        $invoice = $this->invoiceModel->getInvoiceById($id);
        if (!$invoice) {
            $this->redirect('index.php?route=invoices/index');
        }

        $data = [
            'title' => 'Invoice ' . $invoice->invoice_number,
            'active_tab' => 'finance',
            'invoice' => $invoice
        ];

        // Render plain view (not inside layout) so it is clean for printing or downloading
        parent::view('invoices/view', $data);
    }

    // Toggle Payment status via AJAX/Post
    public function toggleStatus($id) {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $invoice = $this->invoiceModel->getInvoiceById($id);
            if ($invoice) {
                $newStatus = $invoice->status === 'paid' ? 'unpaid' : 'paid';
                $this->invoiceModel->updateStatus($id, $newStatus);
            }
        }
        $this->redirect('index.php?route=invoices/index');
    }

    // Delete invoice
    public function delete($id) {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $this->invoiceModel->deleteInvoice($id);
        }
        $this->redirect('index.php?route=invoices/index');
    }
}
