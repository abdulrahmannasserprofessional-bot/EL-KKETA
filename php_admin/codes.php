<?php
/**
 * Codes Management Page
 * إدارة وتوليد وتصدير أكواد الشحن والتفعيل
 */
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/FirebaseService.php';

checkAuth();

$fb = new FirebaseService();
$codes = $fb->get('Codes') ?? [];

$search = trim($_GET['search'] ?? '');
$statusFilter = trim($_GET['status'] ?? ''); // 'used', 'unused', ''

$codeList = [];
$totalUsed = 0;
$totalUnused = 0;

if (is_array($codes)) {
    foreach ($codes as $key => $c) {
        $codeStr = (string)($c['code'] ?? $key);
        $isUsed = !empty($c['isUsed']);
        $usedBy = (string)($c['usedBy'] ?? '');
        $usedAt = (string)($c['usedAt'] ?? '');
        $type = (string)($c['type'] ?? 'wallet');
        $value = $c['value'] ?? 0;
        $notes = (string)($c['notes'] ?? '');
        $createdAt = (string)($c['createdAt'] ?? '');

        if ($isUsed) {
            $totalUsed++;
        } else {
            $totalUnused++;
        }

        // تطبيق الفلاتر
        if ($statusFilter === 'used' && !$isUsed) continue;
        if ($statusFilter === 'unused' && $isUsed) continue;

        if (!empty($search)) {
            $match = (
                stripos($codeStr, $search) !== false ||
                stripos($usedBy, $search) !== false ||
                stripos($notes, $search) !== false
            );
            if (!$match) continue;
        }

        $codeList[] = [
            'key' => $key,
            'code' => $codeStr,
            'isUsed' => $isUsed,
            'usedBy' => $usedBy,
            'usedAt' => $usedAt,
            'type' => $type,
            'value' => $value,
            'notes' => $notes,
            'createdAt' => $createdAt
        ];
    }
}

// تصدير كـ CSV إذا تم طلب ذلك
if (isset($_GET['export']) && $_GET['export'] === 'csv') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="elkheta_codes_' . date('Ymd_His') . '.csv"');
    $output = fopen('php://output', 'w');
    // إضافة BOM للغة العربية في Excel
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
    fputcsv($output, ['الكود', 'القيمة / النوع', 'الحالة', 'المستخدم', 'تاريخ الاستخدام', 'ملاحظات', 'تاريخ الإنشاء']);
    foreach ($codeList as $row) {
        fputcsv($output, [
            $row['code'],
            $row['value'] . ' (' . $row['type'] . ')',
            $row['isUsed'] ? 'مستخدم' : 'متاح',
            $row['usedBy'] ?: '—',
            $row['usedAt'] ?: '—',
            $row['notes'] ?: '—',
            $row['createdAt'] ?: '—'
        ]);
    }
    fclose($output);
    exit;
}

$pageTitle = 'أكواد الشحن والتفعيل';
include __DIR__ . '/includes/header.php';
?>

<!-- بطاقات الإحصائيات السريعة للأكواد -->
<div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
    <div class="stat-card">
        <div class="stat-icon-wrap stat-icon-blue">
            <i class="fa-solid fa-ticket"></i>
        </div>
        <div class="stat-details">
            <h3><?= number_format(count($codes)) ?></h3>
            <p>إجمالي الأكواد</p>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon-wrap stat-icon-green">
            <i class="fa-solid fa-circle-check"></i>
        </div>
        <div class="stat-details">
            <h3><?= number_format($totalUnused) ?></h3>
            <p>أكواد متاحة للاستخدام</p>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon-wrap stat-icon-amber">
            <i class="fa-solid fa-user-check"></i>
        </div>
        <div class="stat-details">
            <h3><?= number_format($totalUsed) ?></h3>
            <p>أكواد تم استخدامها</p>
        </div>
    </div>
</div>

<!-- شريط الفلاتر والتحكم -->
<div class="panel-card" style="margin-bottom: 24px;">
    <div class="panel-body">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
            <form method="GET" action="codes.php" style="display: flex; gap: 12px; flex-wrap: wrap; flex: 1;">
                <input type="text" name="search" class="form-control" style="max-width: 280px;" placeholder="بحث برمز الكود أو كود الطالب..." value="<?= htmlspecialchars($search) ?>">
                <select name="status" class="form-control" style="max-width: 180px;">
                    <option value="">جميع الحالات</option>
                    <option value="unused" <?= $statusFilter === 'unused' ? 'selected' : '' ?>>متاحة فقط (غير مستخدمة)</option>
                    <option value="used" <?= $statusFilter === 'used' ? 'selected' : '' ?>>مستخدمة فقط</option>
                </select>
                <button type="submit" class="btn btn-primary"><i class="fa-solid fa-filter"></i> تصفية</button>
                <?php if (!empty($search) || !empty($statusFilter)): ?>
                    <a href="codes.php" class="btn btn-secondary">إلغاء</a>
                <?php endif; ?>
            </form>

            <div style="display: flex; gap: 10px;">
                <button class="btn btn-success" onclick="openGenerateModal()">
                    <i class="fa-solid fa-plus-circle"></i> توليد حزمة أكواد
                </button>
                <a href="codes.php?export=csv<?= !empty($statusFilter) ? '&status='.$statusFilter : '' ?><?= !empty($search) ? '&search='.urlencode($search) : '' ?>" class="btn btn-secondary" title="تصدير لملف إكسل">
                    <i class="fa-solid fa-file-excel"></i> تصدير CSV
                </a>
                <button class="btn btn-danger" onclick="clearUsedCodes()" title="حذف جميع الأكواد المستخدمة لتنظيف القاعدة">
                    <i class="fa-solid fa-broom"></i> تنظيف المستخدم
                </button>
            </div>
        </div>
    </div>
</div>

<!-- جدول الأكواد -->
<div class="panel-card">
    <div class="panel-header">
        <div class="panel-title">
            <i class="fa-solid fa-ticket" style="color: var(--primary);"></i>
            <span>قائمة الأكواد (<?= count($codeList) ?> كود)</span>
        </div>
    </div>

    <div class="panel-body" style="padding: 0;">
        <div class="table-responsive">
            <table class="custom-table">
                <thead>
                    <tr>
                        <th>الكود</th>
                        <th>النوع / القيمة</th>
                        <th>الحالة</th>
                        <th>المستخدم بواسطة</th>
                        <th>تاريخ الاستخدام</th>
                        <th>الملاحظات</th>
                        <th style="text-align: center;">إجراء</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($codeList)): ?>
                        <tr>
                            <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px;">
                                لا توجد أكواد مطابقة. يمكنك توليد أكواد جديدة بالضغط على الزر بالأعلى.
                            </td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($codeList as $c): ?>
                            <tr>
                                <td>
                                    <span style="font-family: monospace; font-size: 15px; font-weight: 800; color: #1E293B; background: #F1F5F9; padding: 4px 10px; border-radius: 6px; letter-spacing: 1px; border: 1px dashed #CBD5E1;">
                                        <?= htmlspecialchars($c['code']) ?>
                                    </span>
                                </td>
                                <td>
                                    <span style="font-weight: 700; color: var(--primary);">
                                        <?= $c['value'] ? htmlspecialchars($c['value']) . ' ج.م' : 'تفعيل' ?>
                                    </span>
                                    <span style="font-size: 11px; color: var(--text-muted); display: block;">
                                        <?= htmlspecialchars($c['type']) ?>
                                    </span>
                                </td>
                                <td>
                                    <?php if ($c['isUsed']): ?>
                                        <span class="badge badge-warning"><i class="fa-solid fa-check"></i> مستخدم</span>
                                    <?php else: ?>
                                        <span class="badge badge-success"><i class="fa-solid fa-circle-dot"></i> متاح</span>
                                    <?php endif; ?>
                                </td>
                                <td style="font-weight: 700;"><?= htmlspecialchars($c['usedBy']) ?: '—' ?></td>
                                <td style="font-size: 12px; color: var(--text-muted);"><?= htmlspecialchars($c['usedAt']) ?: '—' ?></td>
                                <td style="font-size: 12px; color: var(--text-muted);"><?= htmlspecialchars($c['notes']) ?: '—' ?></td>
                                <td style="text-align: center;">
                                    <button class="btn btn-danger" style="padding: 6px 10px; font-size: 12px;" onclick="deleteCode('<?= htmlspecialchars($c['key']) ?>', '<?= htmlspecialchars($c['code']) ?>')">
                                        <i class="fa-solid fa-trash-can"></i>
                                    </button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<script>
// فتح نافذة توليد حزمة أكواد
function openGenerateModal() {
    Swal.fire({
        title: 'توليد حزمة أكواد جديدة',
        html: `
            <div style="text-align: right;">
                <label style="font-size: 12px; font-weight: bold;">عدد الأكواد المطلوب توليدها:</label>
                <input id="gen_count" type="number" class="swal2-input" style="width: 100%; margin: 6px 0 14px;" value="10" min="1" max="500">

                <label style="font-size: 12px; font-weight: bold;">بادئة الكود (Prefix اختياري):</label>
                <input id="gen_prefix" class="swal2-input" style="width: 100%; margin: 6px 0 14px;" placeholder="مثال: MATH أو TERM2">

                <label style="font-size: 12px; font-weight: bold;">نوع الكود:</label>
                <select id="gen_type" class="swal2-input" style="width: 100%; margin: 6px 0 14px;">
                    <option value="wallet">رصيد محفظة (جنيه)</option>
                    <option value="course">تفعيل كورس / شهر</option>
                    <option value="term">تفعيل ترم كامل</option>
                </select>

                <label style="font-size: 12px; font-weight: bold;">القيمة (الرصيد أو السعر):</label>
                <input id="gen_value" type="number" class="swal2-input" style="width: 100%; margin: 6px 0 14px;" value="100">

                <label style="font-size: 12px; font-weight: bold;">ملاحظات / وصف الحزمة:</label>
                <input id="gen_notes" class="swal2-input" style="width: 100%; margin: 6px 0 14px;" placeholder="مثال: حزمة سنتر الأوائل">
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'توليد وحفظ في Firebase',
        cancelButtonText: 'إلغاء',
        confirmButtonColor: '#10B981',
        preConfirm: () => {
            return {
                count: document.getElementById('gen_count').value,
                prefix: document.getElementById('gen_prefix').value,
                type: document.getElementById('gen_type').value,
                value: document.getElementById('gen_value').value,
                notes: document.getElementById('gen_notes').value
            };
        }
    }).then((res) => {
        if (res.isConfirmed) {
            const fd = new FormData();
            fd.append('action', 'generate_bulk');
            for (const k in res.value) {
                fd.append(k, res.value[k]);
            }

            fetch('api/codes.php', { method: 'POST', body: fd })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('تم بنجاح', `تم إنشاء وتوليد ${data.count} كود بنجاح في Firebase`, 'success')
                            .then(() => location.reload());
                    } else {
                        Swal.fire('خطأ', data.error || 'فشلت عملية التوليد', 'error');
                    }
                });
        }
    });
}

// حذف كود
function deleteCode(key, code) {
    Swal.fire({
        title: 'حذف الكود',
        text: `هل تريد حذف الكود ${code} نهائياً؟`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'نعم، احذف',
        cancelButtonText: 'إلغاء'
    }).then((res) => {
        if (res.isConfirmed) {
            const fd = new FormData();
            fd.append('action', 'delete_code');
            fd.append('code', key);

            fetch('api/codes.php', { method: 'POST', body: fd })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('تم الحذف', 'تم مسح الكود بنجاح', 'success')
                            .then(() => location.reload());
                    } else {
                        Swal.fire('خطأ', 'فشل الحذف', 'error');
                    }
                });
        }
    });
}

// تنظيف الأكواد المستخدمة
function clearUsedCodes() {
    Swal.fire({
        title: 'تنظيف الأكواد المستهلكة',
        text: 'سيتم حذف جميع الأكواد التي تم تفعيلها واستخدامها من قبل الطلاب لتوفير المساحة وتسهيل الإدارة.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'نعم، ابدأ التنظيف',
        cancelButtonText: 'إلغاء'
    }).then((res) => {
        if (res.isConfirmed) {
            const fd = new FormData();
            fd.append('action', 'clear_used');

            fetch('api/codes.php', { method: 'POST', body: fd })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('تمت العملية', `تم تنظيف وحذف ${data.deleted_count} كود مستخدم بنجاح`, 'success')
                            .then(() => location.reload());
                    } else {
                        Swal.fire('خطأ', 'فشلت عملية التنظيف', 'error');
                    }
                });
        }
    });
}
</script>

<?php include __DIR__ . '/includes/footer.php'; ?>
