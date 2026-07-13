<div class="pulse-card">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="text-white mb-0">Billing & Invoices Ledger</h4>
        <a href="index.php?route=invoices/add" class="btn btn-primary btn-sm px-3 py-2" style="background: var(--primary); border: none; border-radius: 8px;">
            <i class="fa-solid fa-file-invoice me-2"></i>Generate Invoice
        </a>
    </div>

    <div class="table-responsive">
        <table class="table table-dark table-hover align-middle border-secondary" id="invoices-table">
            <thead>
                <tr class="text-secondary" style="border-bottom: 1px solid var(--border-color);">
                    <th>Invoice Number</th>
                    <th>Client Company</th>
                    <th class="text-end">Amount</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th class="text-end">Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($invoices)): ?>
                    <tr>
                        <td colspan="6" class="text-center py-4 text-secondary">No invoices generated.</td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($invoices as $invoice): ?>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td class="font-weight-bold text-white"><?php echo htmlspecialchars($invoice->invoice_number); ?></td>
                            <td><?php echo htmlspecialchars($invoice->company_name); ?></td>
                            <td class="text-end font-weight-bold text-white">$<?php echo number_format($invoice->amount, 2); ?></td>
                            <td><?php echo htmlspecialchars($invoice->due_date); ?></td>
                            <td>
                                <span class="badge bg-<?php echo $invoice->status === 'paid' ? 'success' : 'danger'; ?>-subtle text-<?php echo $invoice->status === 'paid' ? 'success' : 'danger'; ?> border border-<?php echo $invoice->status === 'paid' ? 'success' : 'danger'; ?>-subtle">
                                    <?php echo strtoupper($invoice->status); ?>
                                </span>
                            </td>
                            <td class="text-end">
                                <div class="d-inline-flex gap-2">
                                    <a href="index.php?route=invoices/show/<?php echo $invoice->invoice_id; ?>" target="_blank" class="btn btn-outline-light btn-sm" title="View / Print PDF">
                                        <i class="fa-solid fa-print"></i>
                                    </a>
                                    <form action="index.php?route=invoices/toggleStatus/<?php echo $invoice->invoice_id; ?>" method="POST">
                                        <button type="submit" class="btn btn-outline-info btn-sm" title="Toggle Payment Status">
                                            <i class="fa-solid fa-rotate"></i>Mark <?php echo $invoice->status === 'paid' ? 'Unpaid' : 'Paid'; ?>
                                        </button>
                                    </form>
                                    <span class="badge bg-secondary-subtle text-secondary" title="Deletion is disabled by governance policy">No delete</span>
                                </div>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<script>
    $(document).ready(function() {
        if ($('#invoices-table tbody tr').length > 1 || !$('#invoices-table tbody tr td').hasClass('text-center')) {
            $('#invoices-table').DataTable({
                "pageLength": 10,
                "lengthChange": false,
                "info": false,
                "searching": true,
                "language": {
                    "search": "Filter Invoices:"
                }
            });
        }
    });
</script>
