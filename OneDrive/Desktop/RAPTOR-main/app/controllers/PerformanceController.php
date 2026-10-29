<?php
// Raptor CRM Performance Controller

class PerformanceController extends Controller {
    private $performanceModel;

    public function __construct() {
        $this->requireAuth();

        if (($_SESSION['user_role'] ?? '') === 'employer') {
            $this->redirect('index.php?route=dashboard/executive');
        }

        $this->performanceModel = $this->model('Performance');
    }
    public function index() {
        $period = $_GET['period'] ?? 'weekly';
        if (!in_array($period, ['daily', 'weekly', 'monthly'], true)) {
            $period = 'weekly';
        }

        // Auto-recompute all periods so performance scores calculate themselves in real time
        $this->performanceModel->recompute('daily');
        $this->performanceModel->recompute('weekly');
        $this->performanceModel->recompute('monthly');

        [$start, $end] = $this->performanceModel->periodRange($period, $_GET['start'] ?? null, $_GET['end'] ?? null);

        $userRole = $_SESSION['user_role'] ?? '';
        $data = [
            'title' => 'Performance | Raptor CRM',
            'active_tab' => 'performance',
            'period' => $period,
            'start' => $start,
            'end' => $end,
            'scores' => $this->performanceModel->getScores($period, $start, $end, null),
            'weights' => $this->performanceModel->getWeights(),
            'can_manage' => in_array($userRole, ['admin', 'manager', 'team_leader'], true),
            'is_admin' => $userRole === 'admin',
        ];

        $this->viewWithLayout('performance/index', 'main', $data);
    }

    public function profile($userId = 0) {
        $currentUserId = (int) ($_SESSION['user_id'] ?? 0);
        $userId = (int) ($userId ?: $currentUserId);

        $userRole = strtolower($_SESSION['user_role'] ?? '');
        $isManagerOrAdmin = in_array($userRole, ['admin', 'manager', 'team_leader'], true);
        if (!$isManagerOrAdmin && $userId !== $currentUserId) {
            $this->viewWithLayout('errors/403', 'main', [
                'title' => 'Access Denied',
                'message' => 'You are only authorized to view your own performance profile.'
            ]);
            return;
        }

        $period = $_GET['period'] ?? 'weekly';
        if (!in_array($period, ['weekly', 'monthly'], true)) {
            $period = 'weekly';
        }
        $score = $this->performanceModel->getLatestForUser($userId, $period);
        $reviews = $score
            ? $this->performanceModel->getReviews($userId, $score->period, $score->start_date, $score->end_date)
            : [];

        $data = [
            'title' => 'Performance Profile | Raptor CRM',
            'active_tab' => 'performance',
            'score' => $score,
            'reviews' => $reviews,
            'user_id' => $userId,
            'period' => $period,
            'can_review' => in_array($userRole, ['admin', 'manager', 'team_leader'], true) && $userId !== $currentUserId,
        ];

        $this->viewWithLayout('performance/profile', 'main', $data);
    }

    public function recompute() {
        $userRole = $_SESSION['user_role'] ?? '';
        if (!in_array($userRole, ['admin', 'manager', 'team_leader'], true) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->redirect('index.php?route=performance/index');
        }
        $period = in_array($_POST['period'] ?? 'weekly', ['weekly', 'monthly'], true) ? $_POST['period'] : 'weekly';
        $count = $this->performanceModel->recompute($period, $_POST['start'] ?? null, $_POST['end'] ?? null);
        $this->audit('Recomputed ' . $count . ' performance scores', 'performance');
        $this->redirect('index.php?route=performance/index&period=' . $period);
    }

    public function weights() {
        if (($_SESSION['user_role'] ?? '') !== 'admin' || $_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->redirect('index.php?route=performance/index');
        }
        $_POST = filter_input_array(INPUT_POST, FILTER_SANITIZE_SPECIAL_CHARS) ?: [];
        try {
            $this->performanceModel->saveWeights($_POST['weights'] ?? []);
            $this->audit('Updated scoring weights', 'scoring_weights');
            $_SESSION['flash_success'] = 'Scoring weights updated successfully.';
        } catch (Throwable $e) {
            $_SESSION['flash_error'] = 'Failed to update scoring weights: ' . $e->getMessage();
        }
        $this->redirect('index.php?route=performance/index');
    }

    public function review($userId) {
        $userRole = $_SESSION['user_role'] ?? '';
        if (!in_array($userRole, ['admin', 'manager', 'team_leader'], true) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->redirect('index.php?route=performance/index');
        }
        $_POST = filter_input_array(INPUT_POST, FILTER_SANITIZE_SPECIAL_CHARS) ?: [];
        $period = trim((string)($_POST['period'] ?? 'weekly'));
        $start = trim((string)($_POST['start_date'] ?? date('Y-m-d')));
        $end = trim((string)($_POST['end_date'] ?? date('Y-m-d')));
        try {
            $this->performanceModel->addReview([
                'user_id' => (int) $userId,
                'reviewer_user_id' => (int) ($_SESSION['user_id'] ?? 0),
                'period' => $period,
                'start_date' => $start,
                'end_date' => $end,
                'rating' => trim((string)($_POST['rating'] ?? '')),
                'remarks' => trim((string)($_POST['remarks'] ?? '')),
            ]);
            $this->audit('Added manager review for user #' . (int) $userId, 'manager_review', (int) $userId);
            $_SESSION['flash_success'] = 'Performance review saved successfully.';
        } catch (Throwable $e) {
            $_SESSION['flash_error'] = 'Failed to save review: ' . $e->getMessage();
        }
        $this->redirect('index.php?route=performance/profile/' . (int) $userId . '&period=' . urlencode($period));
    }
}
