<?php
/**
 * Notifications API Handler
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

if ($action === 'send_notification') {
    $title = trim($_POST['title'] ?? '');
    $body = trim($_POST['body'] ?? '');
    $target = trim($_POST['target'] ?? 'all'); // 'all', 'grade_1', etc.
    $link = trim($_POST['link'] ?? '');

    if (empty($title) || empty($body)) {
        echo json_encode(['success' => false, 'error' => 'عنوان ونص الإشعار مطلوبان']);
        exit;
    }

    $notifId = 'notif_' . time() . '_' . rand(100, 999);
    $notifData = [
        'id' => $notifId,
        'title' => $title,
        'body' => $body,
        'target' => $target,
        'link' => $link,
        'sender' => $_SESSION['admin_username'] ?? 'الإدارة',
        'createdAt' => date('Y-m-d H:i:s'),
        'timestamp' => time()
    ];

    // 1. حفظ الإشعار في قاعدة بيانات Firebase
    $saved = $fb->update("Notifications/{$notifId}", $notifData);

    // 2. إرسال FCM Push Notification إذا كانت مفاتيح FCM متوفرة
    $fcmTopic = ($target === 'all') ? 'all' : preg_replace('/[^a-zA-Z0-9-_.~%]/', '_', $target);
    $pushRes = $fb->sendPushNotification($title, $body, $fcmTopic, [
        'notifId' => $notifId,
        'link' => $link
    ]);

    echo json_encode([
        'success' => $saved,
        'push_result' => $pushRes
    ]);
    exit;
}

if ($action === 'delete_notification') {
    $id = trim($_POST['id'] ?? '');
    if (empty($id)) {
        echo json_encode(['success' => false, 'error' => 'معرف الإشعار مطلوب']);
        exit;
    }

    $deleted = $fb->delete("Notifications/{$id}");
    echo json_encode(['success' => $deleted]);
    exit;
}

echo json_encode(['success' => false, 'error' => 'إجراء غير معروف']);
