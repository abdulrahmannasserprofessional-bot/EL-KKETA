<?php
/**
 * Exams & Quizzes API Handler
 */
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/FirebaseService.php';

header('Content-Type: application/json; charset=utf-8');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    echo json_encode(['success' => false, 'error' => 'غير مصرح بالدخول']);
    exit;
}

$fb = new FirebaseService();
$action = $_POST['action'] ?? $_GET['action'] ?? '';

// حفظ أو إنشاء امتحان مع الأسئلة
if ($action === 'save_exam') {
    $id = trim($_POST['exam_id'] ?? '');
    $title = trim($_POST['title'] ?? '');
    $grade = trim($_POST['grade'] ?? '');
    $duration = intval($_POST['duration'] ?? 30); // بالدقائق
    $totalMarks = intval($_POST['total_marks'] ?? 100);
    $questionsRaw = $_POST['questions_json'] ?? '[]';

    if (empty($title)) {
        echo json_encode(['success' => false, 'error' => 'عنوان الامتحان مطلوب']);
        exit;
    }

    if (empty($id)) {
        $id = 'exam_' . time() . '_' . rand(100, 999);
    }

    $questions = json_decode($questionsRaw, true);
    if (!is_array($questions)) {
        $questions = [];
    }

    $examData = [
        'id' => $id,
        'title' => $title,
        'grade' => $grade,
        'duration' => $duration,
        'totalMarks' => $totalMarks,
        'questionsCount' => count($questions),
        'questions' => $questions,
        'updatedAt' => date('Y-m-d H:i:s')
    ];

    $saved = $fb->update("Exams/{$id}", $examData);
    echo json_encode(['success' => $saved, 'id' => $id]);
    exit;
}

// حذف امتحان
if ($action === 'delete_exam') {
    $id = trim($_POST['exam_id'] ?? '');
    if (empty($id)) {
        echo json_encode(['success' => false, 'error' => 'معرف الامتحان غير محدد']);
        exit;
    }

    $deleted = $fb->delete("Exams/{$id}");
    echo json_encode(['success' => $deleted]);
    exit;
}

echo json_encode(['success' => false, 'error' => 'إجراء غير معروف']);
