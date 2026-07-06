<div class="row g-4">
    <div class="col-12">
        <div class="pulse-card">
            <div class="d-flex flex-column flex-lg-row justify-content-between gap-3">
                <div>
                    <h4 class="text-white mb-1"><i class="fa-solid fa-table-columns text-primary me-2"></i>Dashboard Module</h4>
                    <div class="text-secondary">Five detailed dashboards with per-user widget layout, visibility, accent, and date-range preferences.</div>
                </div>
                <a href="index.php?route=reports/index" class="btn btn-outline-light align-self-start">
                    <i class="fa-solid fa-chart-pie me-2"></i>Reports Module
                </a>
            </div>
        </div>
    </div>

    <?php foreach ($dashboards as $key => $dashboard): ?>
        <div class="col-md-6 col-xl-4">
            <a href="index.php?route=dashboard/show/<?php echo urlencode($key); ?>" class="text-decoration-none">
                <div class="pulse-card h-100">
                    <div class="d-flex align-items-start justify-content-between gap-3">
                        <div>
                            <h5 class="text-white mb-2"><?php echo htmlspecialchars($dashboard['label']); ?></h5>
                            <p class="text-secondary mb-3"><?php echo htmlspecialchars($dashboard['description']); ?></p>
                            <div class="d-flex flex-wrap gap-2">
                                <?php foreach (array_slice($dashboard['widgets'], 0, 4) as $widget): ?>
                                    <span class="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25"><?php echo htmlspecialchars(str_replace('_', ' ', $widget)); ?></span>
                                <?php endforeach; ?>
                            </div>
                        </div>
                        <i class="fa-solid fa-arrow-up-right-from-square text-primary"></i>
                    </div>
                </div>
            </a>
        </div>
    <?php endforeach; ?>
</div>
