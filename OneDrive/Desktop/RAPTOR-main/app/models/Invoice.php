<?php
// Raptor CRM Invoice Model

class Invoice extends Model {
    // Get all invoices with client name
    public function getInvoices() {
        $this->query('SELECT i.*, c.company_name 
                      FROM invoices i 
                      JOIN clients c ON i.client_id = c.client_id 
                      ORDER BY i.created_at DESC');
        return $this->resultSet();
    }

    // Get invoice by ID
    public function getInvoiceById($id) {
        $this->query('SELECT i.*, c.company_name, c.email as client_email 
                      FROM invoices i 
                      JOIN clients c ON i.client_id = c.client_id 
                      WHERE i.invoice_id = :id');
        $this->bind(':id', $id);
        return $this->single();
    }

    // Add invoice
    public function addInvoice($data) {
        $this->query('INSERT INTO invoices (client_id, invoice_number, amount, status, due_date, billing_address, currency, conversion_rate) 
                      VALUES (:client_id, :invoice_number, :amount, :status, :due_date, :billing_address, :currency, :conversion_rate)');
        
        $this->bind(':client_id', $data['client_id']);
        $this->bind(':invoice_number', $data['invoice_number']);
        $this->bind(':amount', $data['amount']);
        $this->bind(':status', $data['status']);
        $this->bind(':due_date', $data['due_date']);
        $this->bind(':billing_address', $data['billing_address'] ?? '');
        $this->bind(':currency', $data['currency'] ?? 'USD');
        $this->bind(':conversion_rate', $data['conversion_rate'] ?? 1.0000);

        return $this->execute();
    }

    // Update invoice status
    public function updateStatus($id, $status) {
        $this->query('UPDATE invoices SET status = :status WHERE invoice_id = :id');
        $this->bind(':status', $status);
        $this->bind(':id', $id);
        return $this->execute();
    }

    // Physical deletion is disabled by governance policy.
    public function deleteInvoice($id) {
        return false;
    }
}
