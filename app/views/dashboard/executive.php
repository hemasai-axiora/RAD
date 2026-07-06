<!-- Smart Alerts Banner at Top of Screen -->
<div class="row mb-4" id="alerts-row" style="display: none;">
    <div class="col-12">
        <div class="alert alert-danger d-flex align-items-center mb-0 shadow border border-danger border-opacity-25 bg-dark text-white p-3" role="alert" style="border-radius: 12px;">
            <i class="fa-solid fa-triangle-exclamation text-danger me-3" style="font-size: 1.5rem;"></i>
            <div class="flex-grow-1" id="alerts-banner-content">
                <!-- Smart alerts injected here -->
            </div>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    </div>
</div>

<!-- Row 1: KPI Cards -->
<div class="row g-4 mb-4">
    <!-- Health Score -->
    <div class="col-xl-3 col-md-6">
        <div class="pulse-card card-glow">
            <div class="card-title d-flex justify-content-between">
                <span>Marketing Health Score</span>
                <span class="text-success badge bg-success bg-opacity-10 border border-success border-opacity-20" id="hs-status">Healthy</span>
            </div>
            <div class="d-flex align-items-baseline">
                <h2 class="mb-0 text-white font-weight-bold" style="font-size: 2.2rem; font-weight:700;" id="kpi-health-score">--</h2>
            </div>
            <div id="hs-sparkline" style="min-height: 40px; margin-top: 10px;"></div>
        </div>
    </div>

    <!-- ROI -->
    <div class="col-xl-3 col-md-6">
        <div class="pulse-card card-glow">
            <div class="card-title d-flex justify-content-between">
                <span>Marketing ROI</span>
                <span class="text-success badge bg-success bg-opacity-10 border border-success border-opacity-20" id="roi-status">Healthy</span>
            </div>
            <div class="d-flex align-items-baseline">
                <h2 class="mb-0 text-white font-weight-bold" style="font-size: 2.2rem; font-weight:700;" id="kpi-roi">--</h2>
            </div>
            <div id="roi-sparkline" style="min-height: 40px; margin-top: 10px;"></div>
        </div>
    </div>

    <!-- Revenue Influenced -->
    <div class="col-xl-3 col-md-6">
        <div class="pulse-card card-glow">
            <div class="card-title d-flex justify-content-between">
                <span>Revenue Influenced</span>
                <span class="text-info badge bg-info bg-opacity-10 border border-info border-opacity-20">+18% vs last period</span>
            </div>
            <div class="d-flex align-items-baseline">
                <h2 class="mb-0 text-white font-weight-bold" style="font-size: 2.2rem; font-weight:700;" id="kpi-rev">--</h2>
            </div>
            <div id="rev-sparkline" style="min-height: 40px; margin-top: 10px;"></div>
        </div>
    </div>

    <!-- Qualified Leads -->
    <div class="col-xl-3 col-md-6">
        <div class="pulse-card card-glow">
            <div class="card-title d-flex justify-content-between">
                <span>Qualified Leads</span>
                <span class="text-info badge bg-info bg-opacity-10 border border-info border-opacity-20" id="lead-status">Active</span>
            </div>
            <div class="d-flex align-items-baseline">
                <h2 class="mb-0 text-white font-weight-bold" style="font-size: 2.2rem; font-weight:700;" id="kpi-qleads">--</h2>
            </div>
            <div id="qleads-sparkline" style="min-height: 40px; margin-top: 10px;"></div>
        </div>
    </div>
</div>

<!-- Row 2: Secondary KPIs -->
<div class="row g-4 mb-4" style="font-size:0.9rem;">
    <div class="col-md-4">
        <div class="pulse-card p-3 d-flex align-items-center justify-content-between">
            <div>
                <div class="text-secondary" style="font-size: 0.75rem;">Customer Acquisition Cost (CAC)</div>
                <div class="h4 mb-0 text-white font-weight-bold mt-1" id="kpi-cac">--</div>
            </div>
            <i class="fa-solid fa-wallet text-secondary opacity-50" style="font-size: 1.8rem;"></i>
        </div>
    </div>
    <div class="col-md-4">
        <div class="pulse-card p-3 d-flex align-items-center justify-content-between">
            <div>
                <div class="text-secondary" style="font-size: 0.75rem;">Conversion Rate</div>
                <div class="h4 mb-0 text-white font-weight-bold mt-1" id="kpi-conv">--</div>
            </div>
            <i class="fa-solid fa-bullseye text-secondary opacity-50" style="font-size: 1.8rem;"></i>
        </div>
    </div>
    <div class="col-md-4">
        <div class="pulse-card p-3 d-flex align-items-center justify-content-between">
            <div>
                <div class="text-secondary" style="font-size: 0.75rem;">Total Ad Spend</div>
                <div class="h4 mb-0 text-white font-weight-bold mt-1" id="kpi-spend">--</div>
            </div>
            <i class="fa-solid fa-sack-dollar text-secondary opacity-50" style="font-size: 1.8rem;"></i>
        </div>
    </div>
</div>

<!-- Row 3: Spend vs Revenue Combo & Marketing Funnel -->
<div class="row g-4 mb-4">
    <div class="col-xl-8">
        <div class="pulse-card h-100">
            <div class="card-title">Spend vs. Revenue Trend</div>
            <div id="spend-rev-combo-chart" style="min-height: 350px;"></div>
        </div>
    </div>
    
    <div class="col-xl-4">
        <div class="pulse-card h-100">
            <div class="card-title">Conversion Funnel</div>
            <div class="d-flex flex-column gap-3 mt-3" id="funnel-container">
                <!-- Funnel steps generated here -->
            </div>
        </div>
    </div>
</div>

<!-- Row 4: Top Campaigns & AI Insights -->
<div class="row g-4 mb-4">
    <!-- Campaigns Grid -->
    <div class="col-xl-8">
        <div class="pulse-card h-100">
            <div class="card-title mb-4">Top Performing Campaigns</div>
            <div class="table-responsive">
                <table class="table table-dark table-hover align-middle border-secondary mb-0">
                    <thead>
                        <tr class="text-secondary" style="border-bottom: 1px solid var(--border-color);">
                            <th>Campaign</th>
                            <th>Channel</th>
                            <th class="text-end">Budget</th>
                            <th class="text-end">Spend</th>
                            <th class="text-end">Revenue</th>
                            <th class="text-center">ROI</th>
                        </tr>
                    </thead>
                    <tbody id="top-campaigns-tbody">
                        <!-- Loaded dynamically -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- AI Insights -->
    <div class="col-xl-4">
        <div class="pulse-card h-100 card-glow">
            <div class="card-title d-flex align-items-center">
                <i class="fa-solid fa-wand-magic-sparkles text-info me-2"></i>AI Insights Panel
            </div>
            <div class="mt-3">
                <ul class="list-group list-group-flush bg-transparent text-secondary" id="ai-insights-list" style="font-size:0.875rem;">
                    <!-- Injected dynamically -->
                </ul>
            </div>
        </div>
    </div>
</div>

<!-- Inline script to load and initialize dashboards -->
<script>
$(document).ready(function() {
    // Initial load
    loadDashboardData();

    // Reload on filter changes
    $('#client-selector, #date-range').on('change', function() {
        loadDashboardData();
    });

    function loadDashboardData() {
        const client = $('#client-selector').val();
        const dateRange = $('#date-range').val();
        
        let start = '';
        let end = '';
        
        if (dateRange.includes('to')) {
            const dates = dateRange.split(' to ');
            start = dates[0].trim();
            end = dates[1].trim();
        }

        const url = `index.php?route=api/executive&client_id=${client}&start_date=${start}&end_date=${end}`;

        $.getJSON(url, function(data) {
            // 1. KPI Value updates
            $('#kpi-health-score').text(data.kpis.health_score + '/100');
            $('#kpi-roi').text(data.kpis.roi + 'x');
            $('#kpi-rev').text('$' + Number(data.kpis.revenue).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}));
            $('#kpi-qleads').text(data.kpis.q_leads.toLocaleString());
            
            $('#kpi-cac').text('$' + Number(data.kpis.cac).toLocaleString());
            $('#kpi-conv').text(data.kpis.conv_rate + '%');
            $('#kpi-spend').text('$' + Number(data.kpis.spend).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}));

            // KPI status colors
            if (data.kpis.roi < 1.5) {
                $('#roi-status').text('Action').removeClass('bg-success text-success').addClass('bg-danger text-danger');
            } else if (data.kpis.roi < 3.0) {
                $('#roi-status').text('Watch').removeClass('bg-success text-success').addClass('bg-warning text-warning');
            } else {
                $('#roi-status').text('Healthy').removeClass('bg-warning text-warning bg-danger text-danger').addClass('bg-success text-success');
            }

            // 2. Load alerts
            if (data.alerts && data.alerts.length > 0) {
                $('#alerts-row').show();
                let alertHtml = '';
                data.alerts.forEach(function(alert) {
                    alertHtml += `<div class="mb-1"><strong>[ALERT]</strong> ${alert.message}</div>`;
                });
                $('#alerts-banner-content').html(alertHtml);
            } else {
                $('#alerts-row').hide();
            }

            // 3. Sparkline charts loading
            const revDates = data.trends.map(t => t.metric_date);
            const dailyRevs = data.trends.map(t => parseFloat(t.daily_rev));
            const dailySpends = data.trends.map(t => parseFloat(t.daily_spend));

            renderSparkline('#hs-sparkline', dailyRevs.map(v => v > 0 ? 80 + (v % 15) : 75), '#a855f7');
            renderSparkline('#roi-sparkline', dailyRevs.map((v, i) => dailySpends[i] > 0 ? (v / dailySpends[i]) : 0), '#6366f1');
            renderSparkline('#rev-sparkline', dailyRevs, '#10b981');
            renderSparkline('#qleads-sparkline', data.trends.map(t => t.daily_rev > 0 ? Math.round(t.daily_rev / 200) : 0), '#06b6d4');

            // 4. Spend vs Revenue Combo Chart
            renderComboChart(revDates, dailySpends, dailyRevs);

            // 5. Funnel Chart Creation
            renderFunnel(data.kpis.revenue, data.kpis.spend, data.kpis.q_leads);

            // 6. Top Campaigns
            let campaignsHtml = '';
            if (data.campaigns.length === 0) {
                campaignsHtml = '<tr><td colspan="6" class="text-center py-3 text-secondary">No active campaigns in selected range.</td></tr>';
            } else {
                data.campaigns.forEach(function(c) {
                    campaignsHtml += `
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td class="text-white font-weight-bold">${c.name}</td>
                            <td><span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">${c.channel}</span></td>
                            <td class="text-end">$${Number(c.budget).toLocaleString()}</td>
                            <td class="text-end">$${Number(c.spend).toLocaleString()}</td>
                            <td class="text-end text-success font-weight-bold">$${Number(c.revenue_influenced).toLocaleString()}</td>
                            <td class="text-center ${c.roi >= 3 ? 'text-success' : 'text-white'} font-weight-bold">${Number(c.roi).toFixed(2)}x</td>
                        </tr>
                    `;
                });
            }
            $('#top-campaigns-tbody').html(campaignsHtml);

            // 7. AI Insights
            $('#ai-insights-list').html(data.ai_summary);
        });
    }

    // Sparklines helper
    function renderSparkline(selector, data, color) {
        $(selector).empty();
        const options = {
            series: [{ data: data }],
            chart: { type: 'area', height: 40, sparkline: { enabled: true } },
            stroke: { curve: 'smooth', width: 2 },
            fill: { opacity: 0.1 },
            colors: [color],
            tooltip: { fixed: { enabled: false }, x: { show: false }, y: { title: { formatter: () => '' } }, marker: { show: false } }
        };
        const chart = new ApexCharts(document.querySelector(selector), options);
        chart.render();
    }

    // Combo Chart helper
    let comboChart = null;
    function renderComboChart(dates, spends, revs) {
        $('#spend-rev-combo-chart').empty();
        
        // Calculate dynamic ROI line
        const rois = revs.map((r, i) => spends[i] > 0 ? (r / spends[i]).toFixed(2) : 0);

        const options = {
            series: [
                { name: 'Ad Spend', type: 'column', data: spends },
                { name: 'Revenue Influenced', type: 'column', data: revs },
                { name: 'ROI Ratio', type: 'line', data: rois }
            ],
            chart: { height: 350, type: 'line', stacked: false, toolbar: { show: false } },
            stroke: { width: [0, 0, 3], curve: 'smooth' },
            plotOptions: { bar: { columnWidth: '50%' } },
            colors: ['#6366f1', '#10b981', '#a855f7'],
            fill: { opacity: [0.85, 0.85, 1] },
            labels: dates,
            markers: { size: 0 },
            xaxis: { type: 'datetime' },
            yaxis: [
                { title: { text: 'Financials ($)' }, labels: { formatter: (v) => '$' + Number(v).toLocaleString() } },
                { opposite: true, title: { text: 'ROI Ratio (x)' }, labels: { formatter: (v) => v + 'x' } }
            ],
            tooltip: { shared: true, intersect: false, theme: 'dark' },
            legend: { labels: { colors: '#94a3b8' } }
        };

        comboChart = new ApexCharts(document.querySelector('#spend-rev-combo-chart'), options);
        comboChart.render();
    }

    // Funnel generator helper
    function renderFunnel(rev, spend, qleads) {
        const baseReach = 150000;
        const impressions = 85000;
        const visitors = 42000;
        const engaged = 15000;
        const leads = 4800;

        const stages = [
            { name: 'Reach', val: baseReach, isMoney: false },
            { name: 'Impressions', val: impressions, isMoney: false },
            { name: 'Visitors', val: visitors, isMoney: false },
            { name: 'Engaged Users', val: engaged, isMoney: false },
            { name: 'Leads', val: leads, isMoney: false },
            { name: 'Qualified Leads', val: qleads, isMoney: false },
            { name: 'Customers', val: Math.round(qleads * 0.4), isMoney: false },
            { name: 'Revenue', val: rev, isMoney: true }
        ];

        let funnelHtml = '';
        stages.forEach(function(s, idx) {
            // Calculate percentage drop vs first stage (Reach)
            const pct = idx === 0 ? 100 : Math.round((s.val / baseReach) * 100);
            const valStr = s.isMoney ? '$' + Number(s.val).toLocaleString() : Number(s.val).toLocaleString();
            
            // Funnel bar width logic
            const barWidth = Math.max(10, pct);
            
            // Stage color splits
            const colors = ['bg-primary', 'bg-info', 'bg-success', 'bg-warning', 'bg-danger'];
            const barColor = colors[idx % colors.length];

            funnelHtml += `
                <div class="mb-2">
                    <div class="d-flex justify-content-between text-secondary" style="font-size:0.75rem;">
                        <span>${s.name}</span>
                        <span><strong>${valStr}</strong> (${pct}%)</span>
                    </div>
                    <div class="progress mt-1" style="height: 6px; background-color: rgba(255,255,255,0.02);">
                        <div class="progress-bar ${barColor}" role="progressbar" style="width: ${barWidth}%;"></div>
                    </div>
                </div>
            `;
        });
        $('#funnel-container').html(funnelHtml);
    }
});
</script>
