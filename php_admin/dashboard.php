<?php
/**
 * Admin Dashboard - Overview & Stats
 * لوحة التحكم الرئيسية - الإحصائيات ونظرة عامة
 */
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/FirebaseService.php';

checkAuth();

$fb = new FirebaseService();

// جلب البيانات من Firebase
$students = $fb->get('Students') ?? [];
$codes = $fb->get('Codes') ?? [];
$courses = $fb->get('Lectures') ?? $fb->get('Courses') ?? [];
$exams = $fb->get('Exams') ?? $fb->get('Quizzes') ?? [];

// حساب الإحصائيات
$totalStudents = is_array($students) ? count($students) : 0;
$bannedStudents = 0;
$latestStudents = [];

if (is_array($students)) {
    foreach ($students as $id => $s) {
        if (!empty($s['isBanned'])) {
            $bannedStudents++;
        }
    }
    // أحدث 6 طلاب
    $reversed = array_reverse($students, true);
    $latestStudents = array_slice($reversed, 0, 6, true);
}

$totalCodes = is_array($codes) ? count($codes) : 0;
$usedCodes = 0;
$unusedCodes = 0;
if (is_array($codes)) {
    foreach ($codes as $c) {
        if (!empty($c['isUsed'])) {
            $usedCodes++;
        } else {
            $unusedCodes++;
        }
    }
}

$totalCourses = is_array($courses) ? count($courses) : 0;
$totalExams = is_array($exams) ? count($exams) : 0;

$pageTitle = 'لوحة التحكم الرئيسية';
include __DIR__ . '/includes/header.php';
?>

<!-- شبكة الإحصائيات السريعة -->
<div class="stats-grid">
    <div class="stat-card">
        <div class="stat-icon-wrap stat-icon-blue">
            <i class="fa-solid fa-users"></i>
        </div>
        <div class="stat-details">
            <h3><?= number_format($totalStudents) ?></h3>
            <p>إجمالي الطلاب المسجلين</p>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icon-wrap stat-icon-green">
            <i class="fa-solid fa-ticket"></i>
        </div>
        <div class="stat-details">
            <h3><?= number_format($unusedCodes) ?></h3>
            <p>أكواد شحن متاحة (من <?= number_format($totalCodes) ?>)</p>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icon-wrap stat-icon-purple">
            <i class="fa-solid fa-graduation-cap"></i>
        </div>
        <div class="stat-details">
            <h3><?= number_format($totalCourses) ?></h3>
            <p>الكورسات والمحاضرات</p>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icon-wrap stat-icon-amber">
            <i class="fa-solid fa-file-signature"></i>
        </div>
        <div class="stat-details">
            <h3><?= number_format($totalExams) ?></h3>
            <p>الامتحانات والواجبات</p>
        </div>
    </div>
</div>

<!-- روابط وإجراءات سريعة -->
<div style="display: flex; gap: 12px; margin-bottom: 30px; flex-wrap: wrap;">
    <a href="students.php" class="btn btn-primary">
        <i class="fa-solid fa-user-plus"></i> إدارة الطلاب
    </a>
    <a href="codes.php?action=generate" class="btn btn-success">
        <i class="fa-solid fa-plus-circle"></i> توليد أكواد جديدة
    </a>
    <a href="notifications.php" class="btn btn-secondary">
        <i class="fa-solid fa-paper-plane"></i> إرسال إشعار فوري
    </a>
    <a href="courses.php" class="btn btn-secondary">
        <i class="fa-solid fa-upload"></i> إضافة محاضرة
    </a>
</div>

<div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; align-items: start;">
    <!-- أحدث الطلاب المسجلين -->
    <div class="panel-card" style="margin-bottom: 0;">
        <div class="panel-header">
            <div class="panel-title">
                <i class="fa-solid fa-user-clock" style="color: var(--primary);"></i>
                <span>أحدث الطلاب المسجلين بالمنصة</span>
            </div>
            <a href="students.php" class="btn btn-secondary" style="padding: 6px 14px; font-size: 12px;">
                عرض الكل (<?= $totalStudents ?>)
            </a>
        </div>
        <div class="panel-body" style="padding: 0;">
            <div class="table-responsive">
                <table class="custom-table">
                    <thead>
                        <tr>
                            <th>كود الطالب</th>
                            <th>الاسم الكامل</th>
                            <th>رقم الهاتف</th>
                            <th>الصف الدراسي</th>
                            <th>الحالة</th>
                            <th>إجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($latestStudents)): ?>
                            <tr>
                                <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">
                                    لا يوجد طلاب مسجلون حالياً أو جاري التحميل...
                                </td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($latestStudents as $stKey => $st): 
                                $code = $st['studentCode'] ?? $st['code'] ?? $stKey;
                                $name = $st['fullName'] ?? $st['name'] ?? 'بدون اسم';
                                $phone = $st['phone'] ?? '—';
                                $grade = $st['grade'] ?? $st['stage'] ?? 'غير محدد';
                                $isBanned = !empty($st['isBanned']);
                            ?>
                            <tr>
                                <td><span style="font-weight: 800; color: #4F46E5; background: #EEF2FF; padding: 4px 8px; border-radius: 6px;"><?= htmlspecialchars($code) ?></span></td>
                                <td style="font-weight: 700;"><?= htmlspecialchars($name) ?></td>
                                <td dir="ltr" style="text-align: right;"><?= htmlspecialchars($phone) ?></td>
                                <td><span class="badge badge-info"><?= htmlspecialchars($grade) ?></span></td>
                                <td>
                                    <?php if ($isBanned): ?>
                                        <span class="badge badge-danger">موقوف</span>
                                    <?php else: ?>
                                        <span class="badge badge-success">نشط</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <a href="students.php?search=<?= urlencode($code) ?>" class="btn btn-secondary" style="padding: 6px 10px; font-size: 12px;">
                                        <i class="fa-solid fa-eye"></i>
                                    </a>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- بطاقة حالة النظام والاتصال -->
    <div>
        <div class="panel-card" style="margin-bottom: 24px;">
            <div class="panel-header">
                <div class="panel-title">
                    <i class="fa-solid fa-server" style="color: var(--success);"></i>
                    <span>حالة الخادم و Firebase</span>
                </div>
            </div>
            <div class="panel-body">
                <div style="margin-bottom: 15px;">
                    <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">رابط قاعدة البيانات (RTDB):</div>
                    <div style="font-size: 12px; font-weight: 700; color: var(--text-main); word-break: break-all; background: #F1F5F9; padding: 8px 12px; border-radius: 8px; font-family: monospace;">
                        <?= htmlspecialchars(FIREBASE_DB_URL) ?>
                    </div>
                </div>

                <div style="margin-bottom: 15px;">
                    <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">معرف المشروع (Project ID):</div>
                    <div style="font-size: 13px; font-weight: 700; color: var(--primary);">
                        <?= htmlspecialchars(FIREBASE_PROJECT_ID) ?>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--border); padding-top: 15px;">
                    <span style="font-size: 13px; color: var(--text-muted);">الطلاب الموقوفون:</span>
                    <span style="font-weight: 800; color: var(--danger);"><?= $bannedStudents ?> طالب</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                    <span style="font-size: 13px; color: var(--text-muted);">الأكواد المستخدمة:</span>
                    <span style="font-weight: 800; color: var(--warning);"><?= $usedCodes ?> كود</span>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
