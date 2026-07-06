<?php
// Raptor CRM Client Model

class Client extends Model {
    // Get all clients
    public function getClients() {
        $this->query('SELECT * FROM clients ORDER BY company_name ASC');
        return $this->resultSet();
    }

    // Get client by ID
    public function getClientById($id) {
        $this->query('SELECT * FROM clients WHERE client_id = :id');
        $this->bind(':id', $id);
        return $this->single();
    }

    // Add client
    public function addClient($data) {
        $this->query('INSERT INTO clients (company_name, email, phone, status, contract_start, contract_end, package_details, billing_address) 
                      VALUES (:company_name, :email, :phone, :status, :contract_start, :contract_end, :package_details, :billing_address)');
        
        $this->bind(':company_name', $data['company_name']);
        $this->bind(':email', $data['email']);
        $this->bind(':phone', $data['phone']);
        $this->bind(':status', $data['status']);
        $this->bind(':contract_start', $data['contract_start']);
        $this->bind(':contract_end', $data['contract_end']);
        $this->bind(':package_details', $data['package_details']);
        $this->bind(':billing_address', $data['billing_address']);

        return $this->execute();
    }

    // Update client
    public function updateClient($data) {
        $this->query('UPDATE clients 
                      SET company_name = :company_name, email = :email, phone = :phone, status = :status, 
                          contract_start = :contract_start, contract_end = :contract_end, 
                          package_details = :package_details, billing_address = :billing_address 
                      WHERE client_id = :id');
        
        $this->bind(':id', $data['client_id']);
        $this->bind(':company_name', $data['company_name']);
        $this->bind(':email', $data['email']);
        $this->bind(':phone', $data['phone']);
        $this->bind(':status', $data['status']);
        $this->bind(':contract_start', $data['contract_start']);
        $this->bind(':contract_end', $data['contract_end']);
        $this->bind(':package_details', $data['package_details']);
        $this->bind(':billing_address', $data['billing_address']);

        return $this->execute();
    }

    // Physical deletion is disabled by governance policy.
    public function deleteClient($id) {
        return false;
    }
}
