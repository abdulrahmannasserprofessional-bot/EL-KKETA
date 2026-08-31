<?php
/**
 * Students API Handler for AJAX requests
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

if ($action === 'toggle_ban') {
    $code = trim($_POST['student_code'] ?? '');
    $status = !empty($_POST['is_banned']); // true = ban, false = unban

    if (empty($code)) {
        echo json_encode(['success' => false, 'error' => 'كود الطالب غير صحيح']);
        exit;
    }

    $updated = $fb->update("Students/{$code}", ['isBanned' => $status]);
    echo json_encode(['success' => $updated]);
    exit;
}

if ($action === 'reset_device') {
    $code = trim($_POST['student_code'] ?? '');
    if (empty($code)) {
        echo json_encode(['success' => false, 'error' => 'كود الطالب مطلوب']);
        exit;
    }

    $updated = $fb->update("Students/{$code}", ['deviceId' => '']);
    echo json_encode(['success' => $updated]);
    exit;
}

if ($action === 'delete_student') {
    $code = trim($_POST['student_code'] ?? '');
    if (empty($code)) {
        echo json_encode(['success' => false, 'error' => 'كود الطالب مطلوب']);
        exit;
    }

    $deleted = $fb->delete("Students/{$code}");
    echo json_encode(['success' => $deleted]);
    exit;
}

if ($action === 'save_student') {
    $code = trim($_POST['student_code'] ?? '');
    $name = trim($_POST['full_name'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $parentPhone = trim($_POST['parent_phone'] ?? '');
    $grade = trim($_POST['grade'] ?? '');

    if (empty($code) || empty($name)) {
        echo json_encode(['success' => false, 'error' => 'الاسم وكود الطالب مطلوبان']);
        exit;
    }

    $data = [
        'studentCode' => $code,
        'fullName' => $name,
        'phone' => $phone,
        'parentPhone' => $parentPhone,
        'grade' => $grade,
        'updatedAt' => date('Y-m-d H:i:s')
    ];

    $saved = $fb->update("Students/{$code}", $data);
    echo json_encode(['success' => $saved]);
    exit;
}

echo json_encode(['success' => false, 'error' => 'إجراء غير معروف']);
