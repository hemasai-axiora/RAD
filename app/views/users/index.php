<div class="pulse-card">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="text-white mb-0">Employee Management</h4>
        <button class="btn btn-primary btn-sm px-3 py-2" data-bs-toggle="modal" data-bs-target="#addUserModal" style="background: var(--primary); border: none; border-radius: 8px;">
            <i class="fa-solid fa-user-plus me-2"></i>Add Employee
        </button>
    </div>

    <div class="table-responsive">
        <table class="table table-dark table-hover align-middle border-secondary" id="users-table">
            <thead>
                <tr class="text-secondary" style="border-bottom: 1px solid var(--border-color);">
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Email Address</th>
                    <th>Department</th>
                    <th>Job Title</th>
                    <th>Reporting Manager</th>
                    <th>Joining Date</th>
                    <th>Status</th>
                    <th class="text-end">Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($users as $user): ?>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td class="text-white font-monospace"><?php echo htmlspecialchars($user->employee_code ?? 'SYS-ADMIN'); ?></td>
                        <td class="font-weight-bold text-white"><?php echo htmlspecialchars($user->name); ?></td>
                        <td><?php echo htmlspecialchars($user->email); ?></td>
                        <td><?php echo htmlspecialchars($user->department ?? 'Administration'); ?></td>
                        <td>
                            <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                                <?php echo htmlspecialchars($user->job_title ?? strtoupper($user->role_name)); ?>
                            </span>
                        </td>
                        <td><?php echo htmlspecialchars($user->manager_name ?? 'None'); ?></td>
                        <td><?php echo !empty($user->hire_date) ? date('Y-m-d', strtotime($user->hire_date)) : date('Y-m-d', strtotime($user->created_at)); ?></td>
                        <td>
                            <span class="badge bg-<?php echo $user->status === 'active' ? 'success' : 'danger'; ?>-subtle text-<?php echo $user->status === 'active' ? 'success' : 'danger'; ?> border border-<?php echo $user->status === 'active' ? 'success' : 'danger'; ?>-subtle">
                                <?php echo strtoupper($user->status); ?>
                            </span>
                        </td>
                        <td class="text-end">
                            <div class="d-inline-flex gap-2">
                                <button class="btn btn-outline-info btn-sm btn-edit-user" 
                                        data-id="<?php echo $user->user_id; ?>"
                                        data-name="<?php echo htmlspecialchars($user->name); ?>"
                                        data-email="<?php echo htmlspecialchars($user->email); ?>"
                                        data-role="<?php echo $user->role_id; ?>"
                                        data-status="<?php echo $user->status; ?>"
                                        data-bs-toggle="modal" data-bs-target="#editUserModal">
                                    <i class="fa-solid fa-user-pen"></i> Edit
                                </button>
                                <?php if ($user->user_id !== $_SESSION['user_id']): ?>
                                    <form action="index.php?route=users/deactivate/<?php echo $user->user_id; ?>" method="POST" onsubmit="return confirm('Deactivate this employee account? No data will be deleted.');">
                                        <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                                        <button type="submit" class="btn btn-outline-danger btn-sm">
                                            <i class="fa-solid fa-user-slash"></i> Deactivate
                                        </button>
                                    </form>
                                <?php endif; ?>
                            </div>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Add User Modal -->
<div class="modal fade" id="addUserModal" tabindex="-1" aria-labelledby="addUserModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark text-white border-secondary">
            <div class="modal-header border-secondary">
                <h5 class="modal-title" id="addUserModalLabel">Add Employee</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form action="index.php?route=users/add" method="POST">
                <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="add_name" class="form-label text-secondary">Full Name *</label>
                        <input type="text" name="name" id="add_name" class="form-control bg-dark border-secondary text-white" required>
                    </div>

                    <div class="mb-3">
                        <label for="add_email" class="form-label text-secondary">Email Address *</label>
                        <input type="email" name="email" id="add_email" class="form-control bg-dark border-secondary text-white" required>
                    </div>

                    <div class="mb-3">
                        <label for="add_role" class="form-label text-secondary">System Role *</label>
                        <select name="role_id" id="add_role" class="form-select bg-dark border-secondary text-white" required>
                            <option value="">-- Select Role --</option>
                            <?php foreach ($roles as $role): ?>
                                <option value="<?php echo $role->role_id; ?>"><?php echo strtoupper($role->role_name); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label for="add_password" class="form-label text-secondary">Initial Password *</label>
                        <input type="password" name="password" id="add_password" class="form-control bg-dark border-secondary text-white" required>
                    </div>

                    <div class="mb-3">
                        <label for="add_status" class="form-label text-secondary">Status</label>
                        <select name="status" id="add_status" class="form-select bg-dark border-secondary text-white">
                            <option value="active" selected>Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer border-secondary">
                    <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary" style="background: var(--primary); border: none;">Save User</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Edit User Modal -->
<div class="modal fade" id="editUserModal" tabindex="-1" aria-labelledby="editUserModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark text-white border-secondary">
            <div class="modal-header border-secondary">
                <h5 class="modal-title" id="editUserModalLabel">Edit Employee</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form action="index.php?route=users/edit" method="POST">
                <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                <input type="hidden" name="user_id" id="edit_id">
                
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="edit_name" class="form-label text-secondary">Full Name *</label>
                        <input type="text" name="name" id="edit_name" class="form-control bg-dark border-secondary text-white" required>
                    </div>

                    <div class="mb-3">
                        <label for="edit_email" class="form-label text-secondary">Email Address *</label>
                        <input type="email" name="email" id="edit_email" class="form-control bg-dark border-secondary text-white" required>
                    </div>

                    <div class="mb-3">
                        <label for="edit_role" class="form-label text-secondary">System Role *</label>
                        <select name="role_id" id="edit_role" class="form-select bg-dark border-secondary text-white" required>
                            <?php foreach ($roles as $role): ?>
                                <option value="<?php echo $role->role_id; ?>"><?php echo strtoupper($role->role_name); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label for="edit_password" class="form-label text-secondary">New Password (Leave blank to keep current)</label>
                        <input type="password" name="password" id="edit_password" class="form-control bg-dark border-secondary text-white">
                    </div>

                    <div class="mb-3">
                        <label for="edit_status" class="form-label text-secondary">Status</label>
                        <select name="status" id="edit_status" class="form-select bg-dark border-secondary text-white">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer border-secondary">
                    <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary" style="background: var(--primary); border: none;">Save Changes</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
$(document).ready(function() {
    // Populate Edit Modal
    $('.btn-edit-user').on('click', function() {
        const id = $(this).data('id');
        const name = $(this).data('name');
        const email = $(this).data('email');
        const role = $(this).data('role');
        const status = $(this).data('status');

        $('#edit_id').val(id);
        $('#edit_name').val(name);
        $('#edit_email').val(email);
        $('#edit_role').val(role);
        $('#edit_status').val(status);
        $('#edit_password').val('');
    });

    $('#users-table').DataTable({
        "pageLength": 10,
        "lengthChange": false,
        "info": false,
        "searching": true,
        "language": {
            "search": "Filter Employees:"
        }
    });
});
</script>
