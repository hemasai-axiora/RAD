<div class="row justify-content-center">
    <div class="col-lg-8">
        <div class="pulse-card">
            <h4 class="text-white mb-4">Generate Invoice</h4>
            
            <form action="index.php?route=invoices/add" method="POST">
                <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token'] ?? ''; ?>">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label for="client_id" class="form-label text-secondary">Client Company *</label>
                        <select name="client_id" id="client_id" class="form-select <?php echo (!empty($client_err)) ? 'is-invalid' : ''; ?>" style="background-color: rgba(0,0,0,0.2); border-color: var(--border-color); color: white;" required>
                            <option value="">-- Select Client --</option>
                            <?php foreach ($clients as $client): ?>
                                <option value="<?php echo $client->client_id; ?>" <?php echo $client_id == $client->client_id ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($client->company_name); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                        <div class="invalid-feedback"><?php echo $client_err; ?></div>
                    </div>

                    <div class="col-md-6">
                        <label for="invoice_number" class="form-label text-secondary">Invoice Number *</label>
                        <input type="text" name="invoice_number" id="invoice_number" class="form-control" value="<?php echo htmlspecialchars($invoice_number); ?>" required>
                    </div>

                    <div class="col-md-6">
                        <label for="amount" class="form-label text-secondary">Amount ($) *</label>
                        <input type="number" step="0.01" name="amount" id="amount" 
                               class="form-control <?php echo (!empty($amount_err)) ? 'is-invalid' : ''; ?>" 
                               value="<?php echo htmlspecialchars($amount); ?>" placeholder="0.00" required>
                        <div class="invalid-feedback"><?php echo $amount_err; ?></div>
                    </div>

                    <div class="col-md-6">
                        <label for="due_date" class="form-label text-secondary">Due Date *</label>
                        <input type="date" name="due_date" id="due_date" class="form-control" value="<?php echo htmlspecialchars($due_date); ?>" required>
                    </div>

                    <div class="col-md-6">
                        <label for="status" class="form-label text-secondary">Initial Status</label>
                        <select name="status" id="status" class="form-select" style="background-color: rgba(0,0,0,0.2); border-color: var(--border-color); color: white;">
                            <option value="unpaid" <?php echo $status === 'unpaid' ? 'selected' : ''; ?>>Unpaid</option>
                            <option value="paid" <?php echo $status === 'paid' ? 'selected' : ''; ?>>Paid</option>
                        </select>
                    </div>

                    <div class="col-12 d-flex justify-content-end gap-3 mt-4">
                        <a href="index.php?route=invoices/index" class="btn btn-outline-light px-4">Cancel</a>
                        <button type="submit" class="btn btn-primary px-4" style="background: var(--primary); border: none;">Generate</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
