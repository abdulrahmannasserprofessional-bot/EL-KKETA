<?php
/**
 * Codes Management API Handler
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

// توليد حزمة أكواد جديدة
if ($action === 'generate_bulk') {
    $count = intval($_POST['count'] ?? 10);
    $prefix = strtoupper(trim($_POST['prefix'] ?? ''));
    $type = trim($_POST['type'] ?? 'wallet'); // wallet, course, month
    $value = floatval($_POST['value'] ?? 0);
    $courseId = trim($_POST['course_id'] ?? '');
    $notes = trim($_POST['notes'] ?? '');

    if ($count < 1 || $count > 500) {
        echo json_encode(['success' => false, 'error' => 'العدد يجب أن يكون بين 1 و 500 كود']);
        exit;
    }

    $generated = [];
    $batch = [];

    for ($i = 0; $i < $count; $i++) {
        $randomPart = strtoupper(bin2hex(random_bytes(4))); // 8 chars
        $codeStr = (!empty($prefix) ? $prefix . '-' : '') . $randomPart;
        
        $codeData = [
            'code' => $codeStr,
            'type' => $type,
            'value' => $value,
            'courseId' => $courseId,
            'notes' => $notes,
            'isUsed' => false,
            'usedBy' => '',
            'usedAt' => '',
            'createdAt' => date('Y-m-d H:i:s')
        ];

        // في Firebase Realtime Database، نخزن الكود بمفتاحه
        $batch[$codeStr] = $codeData;
        $generated[] = $codeStr;
    }

    $saved = $fb->update('Codes', $batch);

    echo json_encode([
        'success' => $saved,
        'count' => count($generated),
        'codes' => $generated
    ]);
    exit;
}

// حذف كود واحد
if ($action === 'delete_code') {
    $code = trim($_POST['code'] ?? '');
    if (empty($code)) {
        echo json_encode(['success' => false, 'error' => 'الكود غير محدد']);
        exit;
    }

    $deleted = $fb->delete("Codes/{$code}");
    echo json_encode(['success' => $deleted]);
    exit;
}

// تنظيف وحذف جميع الأكواد المستخدمة
if ($action === 'clear_used') {
    $allCodes = $fb->get('Codes') ?? [];
    $deletedCount = 0;
    if (is_array($allCodes)) {
        foreach ($allCodes as $key => $c) {
            if (!empty($c['isUsed'])) {
                $fb->delete("Codes/{$key}");
                $deletedCount++;
            }
        }
    }
    echo json_encode(['success' => true, 'deleted_count' => $deletedCount]);
    exit;
}

echo json_encode(['success' => false, 'error' => 'إجراء غير معروف']);
