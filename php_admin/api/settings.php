<?php
/**
 * Settings API Handler
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

// اختبار الاتصال بـ Firebase
if ($action === 'test_connection') {
    $test = $fb->get('Settings');
    echo json_encode([
        'success' => true,
        'message' => 'تم الاتصال بقاعدة بيانات Firebase بنجاح!',
        'data' => $test
    ]);
    exit;
}

// حفظ إعدادات المنصة
if ($action === 'save_settings') {
    $maintenance = !empty($_POST['maintenance_mode']);
    $maintenanceMsg = trim($_POST['maintenance_message'] ?? 'المنصة تحت الصيانة والتحديث حالياً');
    $supportWhatsapp = trim($_POST['support_whatsapp'] ?? '');
    $appMinVersion = trim($_POST['app_min_version'] ?? '1.0.0');
    $noticeBar = trim($_POST['notice_bar'] ?? '');

    $settingsData = [
        'isMaintenance' => $maintenance,
        'maintenanceMessage' => $maintenanceMsg,
        'supportWhatsapp' => $supportWhatsapp,
        'appMinVersion' => $appMinVersion,
        'noticeBar' => $noticeBar,
        'updatedAt' => date('Y-m-d H:i:s')
    ];

    $saved = $fb->update('Settings', $settingsData);
    echo json_encode(['success' => $saved]);
    exit;
}

// إضافة مشرف جديد
if ($action === 'add_admin') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');
    $role = trim($_POST['role'] ?? 'supervisor');

    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'error' => 'اسم المستخدم وكلمة المرور مطلوبان']);
        exit;
    }

    $adminId = 'adm_' . time();
    $adminData = [
        'id' => $adminId,
        'username' => $username,
        'password' => password_hash($password, PASSWORD_DEFAULT),
        'role' => $role,
        'createdAt' => date('Y-m-d H:i:s')
    ];

    $saved = $fb->update("Supervisors/{$adminId}", $adminData);
    echo json_encode(['success' => $saved]);
    exit;
}

// حذف مشرف
if ($action === 'delete_admin') {
    $id = trim($_POST['id'] ?? '');
    if (empty($id)) {
        echo json_encode(['success' => false, 'error' => 'معرف المشرف مطلوب']);
        exit;
    }

    $deleted = $fb->delete("Supervisors/{$id}");
    echo json_encode(['success' => $deleted]);
    exit;
}

echo json_encode(['success' => false, 'error' => 'إجراء غير معروف']);
