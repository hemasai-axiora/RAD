<?php
// Raptor CRM Reports Controller - Sprint 12 report suite.

class ReportsController extends Controller {
    private $reportModel;

    public function __construct() {
        $this->requireAuth();
        $this->reportModel = $this->model('ReportSuite');
    }

    public function index() {
        $visibleUserIds = $this->visibleUserIds();
        $data = [
            'title' => 'Reports Center | Raptor CRM',
            'active_tab' => 'operations',
            'reports' => $this->reportModel->definitions(),
            'users' => $this->reportModel->getUsersForScope($visibleUserIds),
            'teams' => $this->reportModel->getTeamsForScope($visibleUserIds),
            'filters' => $this->filtersFromRequest(),
        ];

        $this->viewWithLayout('reports/index', 'main', $data);
    }

    public function run() {
        $visibleUserIds = $this->visibleUserIds();
        $result = $this->reportModel->run(
            $_GET['report_key'] ?? 'daily_summary',
            $this->filtersFromRequest(),
            $visibleUserIds
        );

        $data = [
            'title' => $result['title'] . ' | Reports',
            'active_tab' => 'operations',
            'reports' => $this->reportModel->definitions(),
            'users' => $this->reportModel->getUsersForScope($visibleUserIds),
            'teams' => $this->reportModel->getTeamsForScope($visibleUserIds),
            'filters' => $result['filters'],
            'result' => $result,
        ];

        $this->viewWithLayout('reports/result', 'main', $data);
    }

    public function export() {
        if ($_SESSION['user_role'] === 'employer') {
            $this->redirect('index.php?route=reports/index');
        }

        $visibleUserIds = $this->visibleUserIds();
        $result = $this->reportModel->run(
            $_GET['report_key'] ?? 'daily_summary',
            $this->filtersFromRequest(),
            $visibleUserIds
        );
        $format = strtolower($_GET['format'] ?? 'csv');

        if ($format === 'pdf') {
            $this->exportPdf($result);
            return;
        }

        $this->exportCsv($result);
    }

    private function filtersFromRequest(): array {
        return [
            'from' => $_GET['from'] ?? date('Y-m-d', strtotime('-30 days')),
            'to' => $_GET['to'] ?? date('Y-m-d'),
            'user_id' => $_GET['user_id'] ?? 0,
            'team_id' => $_GET['team_id'] ?? 0,
        ];
    }

    private function exportCsv(array $result): void {
        $filename = $this->downloadName($result, 'csv');
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $filename . '"');

        $output = fopen('php://output', 'w');
        fputcsv($output, array_keys($result['columns']));
        foreach ($result['rows'] as $row) {
            $line = [];
            foreach ($result['columns'] as $field) {
                $line[] = $row[$field] ?? '';
            }
            fputcsv($output, $line);
        }
        fclose($output);
        exit();
    }

    private function exportPdf(array $result): void {
        $html = $this->reportHtml($result, true);

        if (class_exists('\\Dompdf\\Dompdf')) {
            $dompdf = new \Dompdf\Dompdf();
            $dompdf->loadHtml($html);
            $dompdf->setPaper('A4', 'landscape');
            $dompdf->render();
            $dompdf->stream($this->downloadName($result, 'pdf'), ['Attachment' => true]);
            exit();
        }

        header('Content-Type: text/html; charset=utf-8');
        header('Content-Disposition: inline; filename="' . $this->downloadName($result, 'html') . '"');
        echo $html;
        exit();
    }

    private function reportHtml(array $result, bool $printReady = false): string {
        ob_start();
        $title = htmlspecialchars($result['title']);
        ?>
        <!doctype html>
        <html>
        <head>
            <meta charset="utf-8">
            <title><?php echo $title; ?></title>
            <style>
                body { font-family: Arial, sans-serif; color: #111827; margin: 24px; }
                h1 { font-size: 20px; margin-bottom: 4px; }
                .muted { color: #6b7280; font-size: 12px; margin-bottom: 18px; }
                table { border-collapse: collapse; width: 100%; font-size: 12px; }
                th, td { border: 1px solid #d1d5db; padding: 7px; text-align: left; vertical-align: top; }
                th { background: #f3f4f6; }
                @media print { button { display: none; } body { margin: 12px; } }
            </style>
        </head>
        <body>
            <?php if ($printReady): ?><button onclick="window.print()">Print / Save PDF</button><?php endif; ?>
            <h1><?php echo $title; ?></h1>
            <div class="muted">
                <?php echo htmlspecialchars($result['filters']['from']); ?> to
                <?php echo htmlspecialchars($result['filters']['to']); ?> |
                Generated <?php echo date('Y-m-d H:i'); ?>
            </div>
            <table>
                <thead><tr>
                    <?php foreach (array_keys($result['columns']) as $label): ?>
                        <th><?php echo htmlspecialchars($label); ?></th>
                    <?php endforeach; ?>
                </tr></thead>
                <tbody>
                    <?php foreach ($result['rows'] as $row): ?>
                        <tr>
                            <?php foreach ($result['columns'] as $field): ?>
                                <td><?php echo htmlspecialchars((string)($row[$field] ?? '')); ?></td>
                            <?php endforeach; ?>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            <script>if (window.location.search.indexOf('autoprint=1') !== -1) window.print();</script>
        </body>
        </html>
        <?php
        return ob_get_clean();
    }

    private function downloadName(array $result, string $ext): string {
        $slug = preg_replace('/[^a-z0-9]+/', '_', strtolower($result['key']));
        return 'raptor_' . trim($slug, '_') . '_' . date('Ymd_His') . '.' . $ext;
    }
}
