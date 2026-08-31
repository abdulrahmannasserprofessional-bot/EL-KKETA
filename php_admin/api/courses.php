<?php
/**
 * Courses & Lectures API Handler
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

// حفظ أو تعديل محاضرة / درس
if ($action === 'save_lecture') {
    $id = trim($_POST['lecture_id'] ?? '');
    $title = trim($_POST['title'] ?? '');
    $grade = trim($_POST['grade'] ?? '');
    $videoUrl = trim($_POST['video_url'] ?? '');
    $pdfUrl = trim($_POST['pdf_url'] ?? '');
    $examId = trim($_POST['exam_id'] ?? '');
    $price = floatval($_POST['price'] ?? 0);
    $isFree = !empty($_POST['is_free']);
    $description = trim($_POST['description'] ?? '');

    if (empty($title)) {
        echo json_encode(['success' => false, 'error' => 'عنوان المحاضرة مطلوب']);
        exit;
    }

    if (empty($id)) {
        $id = 'lec_' . time() . '_' . rand(100, 999);
    }

    $lectureData = [
        'id' => $id,
        'title' => $title,
        'grade' => $grade,
        'videoUrl' => $videoUrl,
        'pdfUrl' => $pdfUrl,
        'examId' => $examId,
        'price' => $price,
        'isFree' => $isFree,
        'description' => $description,
        'updatedAt' => date('Y-m-d H:i:s')
    ];

    $saved = $fb->update("Lectures/{$id}", $lectureData);
    echo json_encode(['success' => $saved, 'id' => $id]);
    exit;
}

// حذف محاضرة
if ($action === 'delete_lecture') {
    $id = trim($_POST['lecture_id'] ?? '');
    if (empty($id)) {
        echo json_encode(['success' => false, 'error' => 'معرف المحاضرة غير محدد']);
        exit;
    }

    $deleted = $fb->delete("Lectures/{$id}");
    echo json_encode(['success' => $deleted]);
    exit;
}

echo json_encode(['success' => false, 'error' => 'إجراء غير معروف']);
