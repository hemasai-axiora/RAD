<?php if (!empty($_SESSION['user_error'])): ?>
    <div class="alert alert-danger alert-dismissible fade show mb-3" role="alert">
        <i class="fa-solid fa-triangle-exclamation me-2"></i><?php echo htmlspecialchars($_SESSION['user_error']); unset($_SESSION['user_error']); ?>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
<?php endif; ?>
<?php if (!empty($_SESSION['user_success'])): ?>
    <div class="alert alert-success alert-dismissible fade show mb-3" role="alert">
        <i class="fa-solid fa-circle-check me-2"></i><?php echo htmlspecialchars($_SESSION['user_success']); unset($_SESSION['user_success']); ?>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
<?php endif; ?>

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
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Email Address</th>
                    <th>Job Title</th>
                    <th>Location</th>
                    <th>Joining Date</th>
                    <th>Status</th>
                    <th class="text-end">Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($users as $user): ?>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td class="text-white font-monospace"><?php echo htmlspecialchars($user->employee_code ?? 'SYS-ADMIN'); ?></td>
                        <td>
                            <?php if (!empty($user->profile_photo)): ?>
                                <img src="index.php?route=file/show&key=<?php echo urlencode($user->profile_photo); ?>" alt="Profile" class="rounded-circle" style="width: 36px; height: 36px; object-fit: cover; border: 1px solid var(--border-color);">
                            <?php else: ?>
                                <div class="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white" style="width: 36px; height: 36px; font-weight: bold; font-size: 0.85rem;">
                                    <?php echo strtoupper(substr($user->name, 0, 2)); ?>
                                </div>
                            <?php endif; ?>
                        </td>
                        <td class="font-weight-bold text-white"><?php echo htmlspecialchars($user->name); ?></td>
                        <td><?php echo htmlspecialchars($user->email); ?></td>
                        <td>
                            <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                                <?php echo htmlspecialchars($user->job_title ?? strtoupper($user->role_name)); ?>
                            </span>
                        </td>
                        <td><?php echo htmlspecialchars($user->work_location ?? 'Office'); ?></td>
                        <td><?php echo !empty($user->date_of_joining) ? date('Y-m-d', strtotime($user->date_of_joining)) : date('Y-m-d', strtotime($user->created_at)); ?></td>
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
                                        data-employee-code="<?php echo htmlspecialchars($user->employee_code ?? ''); ?>"
                                        data-phone-number="<?php echo htmlspecialchars($user->phone_number ?? ''); ?>"
                                        data-salary="<?php echo (in_array($_SESSION['user_role'], ['admin', 'hr', 'finance'], true)) ? htmlspecialchars($user->salary ?? '') : ''; ?>"
                                        data-date-of-joining="<?php echo htmlspecialchars($user->date_of_joining ?? $user->hire_date ?? ''); ?>"
                                        data-date-of-birth="<?php echo htmlspecialchars($user->date_of_birth ?? ''); ?>"
                                        data-job-title="<?php echo htmlspecialchars($user->job_title ?? ''); ?>"
                                        data-department="<?php echo htmlspecialchars($user->department ?? 'Sales'); ?>"
                                        data-employment-type="<?php echo htmlspecialchars($user->employment_type ?? 'Full-time'); ?>"
                                        data-work-location="<?php echo htmlspecialchars($user->work_location ?? 'Office'); ?>"
                                        data-bio="<?php echo htmlspecialchars($user->bio ?? ''); ?>"
                                        data-emergency-contact="<?php echo htmlspecialchars($user->emergency_contact ?? ''); ?>"
                                        data-pan-number="<?php echo (in_array($_SESSION['user_role'], ['admin', 'hr', 'finance'], true)) ? htmlspecialchars($user->pan_number ?? '') : ''; ?>"
                                        data-aadhaar-number="<?php echo (in_array($_SESSION['user_role'], ['admin', 'hr', 'finance'], true)) ? htmlspecialchars($user->aadhaar_number ?? '') : ''; ?>"
                                        data-uan="<?php echo htmlspecialchars($user->uan ?? ''); ?>"
                                        data-pf-applicable="<?php echo htmlspecialchars($user->pf_applicable ?? 0); ?>"
                                        data-esic-number="<?php echo htmlspecialchars($user->esic_number ?? ''); ?>"
                                        data-pay-grade="<?php echo htmlspecialchars($user->pay_grade ?? ''); ?>"
                                        data-force-password-reset="<?php echo htmlspecialchars($user->force_password_reset ?? 0); ?>"
                                        data-account-holder-name="<?php echo htmlspecialchars($user->account_holder_name ?? ''); ?>"
                                        data-bank-name="<?php echo htmlspecialchars($user->bank_name ?? ''); ?>"
                                        data-account-number="<?php echo htmlspecialchars($user->account_number ?? ''); ?>"
                                        data-ifsc-code="<?php echo htmlspecialchars($user->ifsc_code ?? ''); ?>"
                                        data-branch-name="<?php echo htmlspecialchars($user->branch_name ?? ''); ?>"
                                        data-account-type="<?php echo htmlspecialchars($user->account_type ?? 'Savings'); ?>"
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
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content bg-dark text-white border-secondary">
            <div class="modal-header border-secondary">
                <h5 class="modal-title" id="addUserModalLabel">Add Employee</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form action="index.php?route=users/add" method="POST" enctype="multipart/form-data" class="needs-validation-account">
                <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                <div class="modal-body">
                    <!-- Nav tabs -->
                    <ul class="nav nav-tabs border-secondary mb-3" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active text-white border-secondary bg-dark" id="add-personal-tab" data-bs-toggle="tab" data-bs-target="#add-personal" type="button" role="tab" aria-controls="add-personal" aria-selected="true">Personal & Job</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link text-white border-secondary bg-dark" id="add-bank-tab" data-bs-toggle="tab" data-bs-target="#add-bank" type="button" role="tab" aria-controls="add-bank" aria-selected="false">Bank Details</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link text-white border-secondary bg-dark" id="add-payroll-tab" data-bs-toggle="tab" data-bs-target="#add-payroll" type="button" role="tab" aria-controls="add-payroll" aria-selected="false">Payroll & Compliance</button>
                        </li>
                    </ul>

                    <!-- Tab panes -->
                    <div class="tab-content">
                        <!-- Personal & Job Tab -->
                        <div class="tab-pane fade show active" id="add-personal" role="tabpanel" aria-labelledby="add-personal-tab">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Full Name *</label>
                                    <input type="text" name="name" class="form-control bg-dark border-secondary text-white" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Email Address *</label>
                                    <input type="email" name="email" class="form-control bg-dark border-secondary text-white" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Employee ID (Manual Entry) *</label>
                                    <input type="text" name="employee_code" class="form-control bg-dark border-secondary text-white" placeholder="e.g. EMP1001" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Phone Number</label>
                                    <input type="text" name="phone_number" class="form-control bg-dark border-secondary text-white">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Job Title</label>
                                    <input type="text" name="job_title" class="form-control bg-dark border-secondary text-white" placeholder="e.g. Sales Executive">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Department</label>
                                    <input type="text" name="department" class="form-control bg-dark border-secondary text-white" placeholder="e.g. Sales" value="Sales">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Date of Joining</label>
                                    <input type="date" name="date_of_joining" class="form-control bg-dark border-secondary text-white">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Date of Birth</label>
                                    <input type="date" name="date_of_birth" class="form-control bg-dark border-secondary text-white">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">System Role *</label>
                                    <select name="role_id" class="form-select bg-dark border-secondary text-white" required>
                                        <option value="">-- Select Role --</option>
                                        <?php foreach ($roles as $role): ?>
                                            <option value="<?php echo $role->role_id; ?>"><?php echo strtoupper($role->role_name); ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Employment Type</label>
                                    <select name="employment_type" class="form-select bg-dark border-secondary text-white">
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Intern">Intern</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Work Location</label>
                                    <select name="work_location" class="form-select bg-dark border-secondary text-white">
                                        <option value="Office">Office</option>
                                        <option value="Remote">Remote</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Profile Photo</label>
                                    <input type="file" name="profile_photo" class="form-control bg-dark border-secondary text-white" accept="image/*">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Emergency Contact</label>
                                    <input type="text" name="emergency_contact" class="form-control bg-dark border-secondary text-white" placeholder="Name - Phone">
                                </div>
                                <div class="col-md-12">
                                    <label class="form-label text-secondary">Employee Bio / Notes</label>
                                    <textarea name="bio" class="form-control bg-dark border-secondary text-white" rows="2"></textarea>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Initial Password *</label>
                                    <input type="password" name="password" class="form-control bg-dark border-secondary text-white" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Status</label>
                                    <select name="status" class="form-select bg-dark border-secondary text-white">
                                        <option value="active" selected>Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div class="col-md-12 mt-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="force_password_reset" id="add_force_pwd" value="1">
                                        <label class="form-check-label text-secondary" for="add_force_pwd">
                                            Force Password Reset on First Login
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Bank Details Tab -->
                        <div class="tab-pane fade" id="add-bank" role="tabpanel" aria-labelledby="add-bank-tab">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Account Holder Name</label>
                                    <input type="text" name="account_holder_name" class="form-control bg-dark border-secondary text-white">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Bank Name</label>
                                    <input type="text" name="bank_name" class="form-control bg-dark border-secondary text-white">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Account Number</label>
                                    <input type="password" name="account_number" class="form-control bg-dark border-secondary text-white main-account-num">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Confirm Account Number</label>
                                    <input type="text" class="form-control bg-dark border-secondary text-white confirm-account-num">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">IFSC Code</label>
                                    <input type="text" name="ifsc_code" class="form-control bg-dark border-secondary text-white">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Branch Name / Address</label>
                                    <input type="text" name="branch_name" class="form-control bg-dark border-secondary text-white">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Account Type</label>
                                    <select name="account_type" class="form-select bg-dark border-secondary text-white">
                                        <option value="Savings">Savings</option>
                                        <option value="Current">Current</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Payroll & Compliance Tab -->
                        <div class="tab-pane fade" id="add-payroll" role="tabpanel" aria-labelledby="add-payroll-tab">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">PAN Number</label>
                                    <input type="text" name="pan_number" class="form-control bg-dark border-secondary text-white">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Aadhaar Number</label>
                                    <input type="text" name="aadhaar_number" class="form-control bg-dark border-secondary text-white">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">UAN (PF)</label>
                                    <input type="text" name="uan" class="form-control bg-dark border-secondary text-white">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">ESIC Number</label>
                                    <input type="text" name="esic_number" class="form-control bg-dark border-secondary text-white">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Salary / CTC (Monthly)</label>
                                    <input type="number" step="0.01" name="salary" class="form-control bg-dark border-secondary text-white" placeholder="0.00">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Pay Grade / Salary Band</label>
                                    <input type="text" name="pay_grade" class="form-control bg-dark border-secondary text-white" placeholder="e.g. Band A">
                                </div>
                                <div class="col-md-6 mt-4">
                                    <div class="form-check form-switch mt-2">
                                        <input class="form-check-input" type="checkbox" name="pf_applicable" id="add_pf_applicable" value="1">
                                        <label class="form-check-label text-secondary" for="add_pf_applicable">PF Applicable</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-secondary">
                    <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary" style="background: var(--primary); border: none;">Save Employee</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Edit User Modal -->
<div class="modal fade" id="editUserModal" tabindex="-1" aria-labelledby="editUserModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content bg-dark text-white border-secondary">
            <div class="modal-header border-secondary">
                <h5 class="modal-title" id="editUserModalLabel">Edit Employee</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form action="index.php?route=users/edit" method="POST" enctype="multipart/form-data" class="needs-validation-account">
                <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                <input type="hidden" name="user_id" id="edit_id">
                
                <div class="modal-body">
                    <!-- Nav tabs -->
                    <ul class="nav nav-tabs border-secondary mb-3" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active text-white border-secondary bg-dark" id="edit-personal-tab" data-bs-toggle="tab" data-bs-target="#edit-personal" type="button" role="tab" aria-controls="edit-personal" aria-selected="true">Personal & Job</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link text-white border-secondary bg-dark" id="edit-bank-tab" data-bs-toggle="tab" data-bs-target="#edit-bank" type="button" role="tab" aria-controls="edit-bank" aria-selected="false">Bank Details</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link text-white border-secondary bg-dark" id="edit-payroll-tab" data-bs-toggle="tab" data-bs-target="#edit-payroll" type="button" role="tab" aria-controls="edit-payroll" aria-selected="false">Payroll & Compliance</button>
                        </li>
                    </ul>

                    <!-- Tab panes -->
                    <div class="tab-content">
                        <!-- Personal & Job Tab -->
                        <div class="tab-pane fade show active" id="edit-personal" role="tabpanel" aria-labelledby="edit-personal-tab">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Full Name *</label>
                                    <input type="text" name="name" id="edit_name" class="form-control bg-dark border-secondary text-white" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Email Address *</label>
                                    <input type="email" name="email" id="edit_email" class="form-control bg-dark border-secondary text-white" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Employee ID (Manual Entry) *</label>
                                    <input type="text" name="employee_code" id="edit_employee_code" class="form-control bg-dark border-secondary text-white" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Phone Number</label>
                                    <input type="text" name="phone_number" id="edit_phone_number" class="form-control bg-dark border-secondary text-white">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Job Title</label>
                                    <input type="text" name="job_title" id="edit_job_title" class="form-control bg-dark border-secondary text-white">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Department</label>
                                    <input type="text" name="department" id="edit_department" class="form-control bg-dark border-secondary text-white">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Date of Joining</label>
                                    <input type="date" name="date_of_joining" id="edit_date_of_joining" class="form-control bg-dark border-secondary text-white">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Date of Birth</label>
                                    <input type="date" name="date_of_birth" id="edit_date_of_birth" class="form-control bg-dark border-secondary text-white">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">System Role *</label>
                                    <select name="role_id" id="edit_role" class="form-select bg-dark border-secondary text-white" required>
                                        <?php foreach ($roles as $role): ?>
                                            <option value="<?php echo $role->role_id; ?>"><?php echo strtoupper($role->role_name); ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Employment Type</label>
                                    <select name="employment_type" id="edit_employment_type" class="form-select bg-dark border-secondary text-white">
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Intern">Intern</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Work Location</label>
                                    <select name="work_location" id="edit_work_location" class="form-select bg-dark border-secondary text-white">
                                        <option value="Office">Office</option>
                                        <option value="Remote">Remote</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Profile Photo (Leave blank to keep current)</label>
                                    <input type="file" name="profile_photo" class="form-control bg-dark border-secondary text-white" accept="image/*">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Emergency Contact</label>
                                    <input type="text" name="emergency_contact" id="edit_emergency_contact" class="form-control bg-dark border-secondary text-white">
                                </div>
                                <div class="col-md-12">
                                    <label class="form-label text-secondary">Employee Bio / Notes</label>
                                    <textarea name="bio" id="edit_bio" class="form-control bg-dark border-secondary text-white" rows="2"></textarea>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">New Password (Leave blank to keep current)</label>
                                    <input type="password" name="password" id="edit_password" class="form-control bg-dark border-secondary text-white">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Status</label>
                                    <select name="status" id="edit_status" class="form-select bg-dark border-secondary text-white">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div class="col-md-12 mt-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="force_password_reset" id="edit_force_password_reset" value="1">
                                        <label class="form-check-label text-secondary" for="edit_force_password_reset">
                                            Force Password Reset on First Login
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Bank Details Tab -->
                        <div class="tab-pane fade" id="edit-bank" role="tabpanel" aria-labelledby="edit-bank-tab">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Account Holder Name</label>
                                    <input type="text" name="account_holder_name" id="edit_account_holder_name" class="form-control bg-dark border-secondary text-white">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Bank Name</label>
                                    <input type="text" name="bank_name" id="edit_bank_name" class="form-control bg-dark border-secondary text-white">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Account Number</label>
                                    <input type="password" name="account_number" id="edit_account_number" class="form-control bg-dark border-secondary text-white main-account-num">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Confirm Account Number</label>
                                    <input type="text" id="edit_confirm_account_number" class="form-control bg-dark border-secondary text-white confirm-account-num">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">IFSC Code</label>
                                    <input type="text" name="ifsc_code" id="edit_ifsc_code" class="form-control bg-dark border-secondary text-white">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Branch Name / Address</label>
                                    <input type="text" name="branch_name" id="edit_branch_name" class="form-control bg-dark border-secondary text-white">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Account Type</label>
                                    <select name="account_type" id="edit_account_type" class="form-select bg-dark border-secondary text-white">
                                        <option value="Savings">Savings</option>
                                        <option value="Current">Current</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Payroll & Compliance Tab -->
                        <div class="tab-pane fade" id="edit-payroll" role="tabpanel" aria-labelledby="edit-payroll-tab">
                            <div class="row g-3">
                                <?php if (in_array($_SESSION['user_role'], ['admin', 'hr', 'finance'], true)): ?>
                                    <div class="col-md-6">
                                        <label class="form-label text-secondary">PAN Number</label>
                                        <input type="text" name="pan_number" id="edit_pan_number" class="form-control bg-dark border-secondary text-white">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-secondary">Aadhaar Number</label>
                                        <input type="text" name="aadhaar_number" id="edit_aadhaar_number" class="form-control bg-dark border-secondary text-white">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-secondary">Salary / CTC (Monthly)</label>
                                        <input type="number" step="0.01" name="salary" id="edit_salary" class="form-control bg-dark border-secondary text-white" placeholder="0.00">
                                    </div>
                                <?php else: ?>
                                    <!-- Keep fields hidden but submit current values so they don't get cleared -->
                                    <input type="hidden" name="pan_number" id="edit_pan_number">
                                    <input type="hidden" name="aadhaar_number" id="edit_aadhaar_number">
                                    <input type="hidden" name="salary" id="edit_salary">
                                    <div class="col-12 text-warning small mb-3">
                                        <i class="fa-solid fa-lock me-1"></i> Highly sensitive compliance fields (PAN, Aadhaar, Salary) are hidden from your role.
                                    </div>
                                <?php endif; ?>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">UAN (PF)</label>
                                    <input type="text" name="uan" id="edit_uan" class="form-control bg-dark border-secondary text-white">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">ESIC Number</label>
                                    <input type="text" name="esic_number" id="edit_esic_number" class="form-control bg-dark border-secondary text-white">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-secondary">Pay Grade / Salary Band</label>
                                    <input type="text" name="pay_grade" id="edit_pay_grade" class="form-control bg-dark border-secondary text-white">
                                </div>
                                <div class="col-md-6 mt-4">
                                    <div class="form-check form-switch mt-2">
                                        <input class="form-check-input" type="checkbox" name="pf_applicable" id="edit_pf_applicable" value="1">
                                        <label class="form-check-label text-secondary" for="edit_pf_applicable">PF Applicable</label>
                                    </div>
                                </div>
                            </div>
                        </div>
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
        
        // Populate new fields
        $('#edit_employee_code').val($(this).data('employee-code'));
        $('#edit_phone_number').val($(this).data('phone-number'));
        $('#edit_salary').val($(this).data('salary'));
        $('#edit_date_of_joining').val($(this).data('date-of-joining'));
        $('#edit_date_of_birth').val($(this).data('date-of-birth'));
        $('#edit_job_title').val($(this).data('job-title'));
        $('#edit_department').val($(this).data('department'));
        $('#edit_employment_type').val($(this).data('employment-type'));
        $('#edit_work_location').val($(this).data('work-location'));
        $('#edit_bio').val($(this).data('bio'));
        $('#edit_emergency_contact').val($(this).data('emergency-contact'));
        $('#edit_pan_number').val($(this).data('pan-number'));
        $('#edit_aadhaar_number').val($(this).data('aadhaar-number'));
        $('#edit_uan').val($(this).data('uan'));
        $('#edit_pf_applicable').prop('checked', $(this).data('pf-applicable') == 1);
        $('#edit_esic_number').val($(this).data('esic-number'));
        $('#edit_pay_grade').val($(this).data('pay-grade'));
        $('#edit_force_password_reset').prop('checked', $(this).data('force-password-reset') == 1);
        
        // Bank details
        $('#edit_account_holder_name').val($(this).data('account-holder-name'));
        $('#edit_bank_name').val($(this).data('bank-name'));
        $('#edit_account_number').val($(this).data('account-number'));
        $('#edit_confirm_account_number').val($(this).data('account-number'));
        $('#edit_ifsc_code').val($(this).data('ifsc-code'));
        $('#edit_branch_name').val($(this).data('branch-name'));
        $('#edit_account_type').val($(this).data('account-type'));
    });

    // Client-side validation for account number matching
    $('.needs-validation-account').on('submit', function(e) {
        const acc = $(this).find('.main-account-num').val();
        const conf = $(this).find('.confirm-account-num').val();
        if (acc && conf && acc !== conf) {
            e.preventDefault();
            alert('Bank Account Numbers do not match!');
            return false;
        }
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
