<?php
/**
 * Students Management Page
 * إدارة الطلاب والاشتراكات
 */
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/FirebaseService.php';

checkAuth();

$fb = new FirebaseService();
$students = $fb->get('Students') ?? [];

$search = trim($_GET['search'] ?? '');
$filterGrade = trim($_GET['grade'] ?? '');

$studentList = [];
$gradesList = [];

if (is_array($students)) {
    foreach ($students as $id => $s) {
        $stCode = (string)($s['studentCode'] ?? $s['code'] ?? $id);
        $stName = (string)($s['fullName'] ?? $s['name'] ?? 'طالب');
        $stPhone = (string)($s['phone'] ?? '');
        $stParent = (string)($s['parentPhone'] ?? '');
        $stGrade = (string)($s['grade'] ?? $s['stage'] ?? 'غير محدد');
        $isBanned = !empty($s['isBanned']);
        $deviceId = (string)($s['deviceId'] ?? '');
        $avgScore = $s['stats']['averageScore'] ?? null;

        if (!empty($stGrade) && !in_array($stGrade, $gradesList)) {
            $gradesList[] = $stGrade;
        }

        // تطبيق الفلتر والبحث
        if (!empty($search)) {
            $matchesSearch = (
                stripos($stCode, $search) !== false ||
                stripos($stName, $search) !== false ||
                stripos($stPhone, $search) !== false ||
                stripos($stParent, $search) !== false
            );
            if (!$matchesSearch) continue;
        }

        if (!empty($filterGrade) && $stGrade !== $filterGrade) {
            continue;
        }

        $studentList[] = [
            'id' => $id,
            'code' => $stCode,
            'name' => $stName,
            'phone' => $stPhone,
            'parentPhone' => $stParent,
            'grade' => $stGrade,
            'isBanned' => $isBanned,
            'deviceId' => $deviceId,
            'avgScore' => $avgScore,
            'raw' => $s
        ];
    }
}

$pageTitle = 'إدارة الطلاب';
include __DIR__ . '/includes/header.php';
?>

<!-- شريط الفلاتر والبحث -->
<div class="panel-card" style="margin-bottom: 24px;">
    <div class="panel-body">
        <form method="GET" action="students.php" style="display: flex; gap: 15px; flex-wrap: wrap; align-items: flex-end;">
            <div style="flex: 2; min-width: 240px;">
                <label class="form-label"><i class="fa-solid fa-magnifying-glass"></i> البحث عن طالب</label>
                <input type="text" name="search" class="form-control" placeholder="ابحث بالاسم، كود الطالب، أو رقم الهاتف..." value="<?= htmlspecialchars($search) ?>">
            </div>

            <div style="flex: 1; min-width: 180px;">
                <label class="form-label"><i class="fa-solid fa-layer-group"></i> تصفية حسب الصف</label>
                <select name="grade" class="form-control">
                    <option value="">جميع الصفوف الدراسية</option>
                    <?php foreach ($gradesList as $gr): ?>
                        <option value="<?= htmlspecialchars($gr) ?>" <?= $filterGrade === $gr ? 'selected' : '' ?>>
                            <?= htmlspecialchars($gr) ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div>
                <button type="submit" class="btn btn-primary" style="height: 46px;">
                    <i class="fa-solid fa-filter"></i> تطبيق الفلتر
                </button>
                <?php if (!empty($search) || !empty($filterGrade)): ?>
                    <a href="students.php" class="btn btn-secondary" style="height: 46px;">إلغاء</a>
                <?php endif; ?>
            </div>
        </form>
    </div>
</div>

<!-- جدول الطلاب -->
<div class="panel-card">
    <div class="panel-header">
        <div class="panel-title">
            <i class="fa-solid fa-users" style="color: var(--primary);"></i>
            <span>قائمة الطلاب (<?= count($studentList) ?> طالب)</span>
        </div>
        <button class="btn btn-primary" onclick="openAddStudentModal()" style="font-size: 13px; padding: 8px 16px;">
            <i class="fa-solid fa-user-plus"></i> إضافة طالب جديد
        </button>
    </div>

    <div class="panel-body" style="padding: 0;">
        <div class="table-responsive">
            <table class="custom-table">
                <thead>
                    <tr>
                        <th>كود الطالب</th>
                        <th>الاسم الكامل</th>
                        <th>رقم الهاتف</th>
                        <th>هاتف ولي الأمر</th>
                        <th>الصف الدراسي</th>
                        <th>متوسط الدرجات</th>
                        <th>الجهاز المرتبط</th>
                        <th>الحالة</th>
                        <th style="text-align: center;">الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($studentList)): ?>
                        <tr>
                            <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 40px;">
                                <i class="fa-solid fa-user-slash" style="font-size: 32px; margin-bottom: 10px; display: block;"></i>
                                لا توجد نتائج مطابقة لبحثك.
                            </td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($studentList as $st): ?>
                            <tr>
                                <td>
                                    <span style="font-weight: 800; color: #4F46E5; background: #EEF2FF; padding: 4px 10px; border-radius: 8px; font-family: monospace;">
                                        <?= htmlspecialchars($st['code']) ?>
                                    </span>
                                </td>
                                <td style="font-weight: 700;"><?= htmlspecialchars($st['name']) ?></td>
                                <td dir="ltr" style="text-align: right;"><?= htmlspecialchars($st['phone']) ?: '—' ?></td>
                                <td dir="ltr" style="text-align: right;"><?= htmlspecialchars($st['parentPhone']) ?: '—' ?></td>
                                <td><span class="badge badge-info"><?= htmlspecialchars($st['grade']) ?></span></td>
                                <td>
                                    <?php if ($st['avgScore'] !== null): ?>
                                        <span class="badge badge-success"><?= htmlspecialchars($st['avgScore']) ?>%</span>
                                    <?php else: ?>
                                        <span style="color: var(--text-muted);">—</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?php if (!empty($st['deviceId'])): ?>
                                        <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 11px;" title="إعادة تعيين قفل الجهاز" onclick="resetDevice('<?= htmlspecialchars($st['code']) ?>')">
                                            <i class="fa-solid fa-mobile-screen"></i> مقترن (فك)
                                        </button>
                                    <?php else: ?>
                                        <span style="color: var(--text-muted); font-size: 12px;">غير مقترن</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?php if ($st['isBanned']): ?>
                                        <span class="badge badge-danger">موقوف</span>
                                    <?php else: ?>
                                        <span class="badge badge-success">نشط</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <div style="display: flex; gap: 6px; justify-content: center;">
                                        <!-- زر إيقاف / تفعيل -->
                                        <button class="btn <?= $st['isBanned'] ? 'btn-success' : 'btn-secondary' ?>" style="padding: 6px 10px; font-size: 12px;" title="<?= $st['isBanned'] ? 'فك الحظر' : 'حظر الطالب' ?>" onclick="toggleBan('<?= htmlspecialchars($st['code']) ?>', <?= $st['isBanned'] ? '0' : '1' ?>)">
                                            <i class="fa-solid <?= $st['isBanned'] ? 'fa-unlock' : 'fa-ban' ?>"></i>
                                        </button>

                                        <!-- زر تعديل -->
                                        <button class="btn btn-secondary" style="padding: 6px 10px; font-size: 12px;" title="تعديل البيانات" onclick='editStudent(<?= json_encode($st, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE) ?>)'>
                                            <i class="fa-solid fa-pen-to-square"></i>
                                        </button>

                                        <!-- زر حذف -->
                                        <button class="btn btn-danger" style="padding: 6px 10px; font-size: 12px;" title="حذف نهائي" onclick="deleteStudent('<?= htmlspecialchars($st['code']) ?>', '<?= htmlspecialchars($st['name']) ?>')">
                                            <i class="fa-solid fa-trash-can"></i>
                                        </button>
                                    </div>
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
// تبديل حالة الحظر
function toggleBan(code, newBanStatus) {
    const actionText = newBanStatus ? 'حظر هذا الطالب ومنعه من الدخول' : 'فك الحظر وتفعيل حساب الطالب';
    Swal.fire({
        title: 'هل أنت متأكد؟',
        text: `سيتم ${actionText}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: newBanStatus ? '#EF4444' : '#10B981',
        cancelButtonColor: '#64748B',
        confirmButtonText: 'نعم، تابع',
        cancelButtonText: 'إلغاء'
    }).then((res) => {
        if (res.isConfirmed) {
            const formData = new FormData();
            formData.append('action', 'toggle_ban');
            formData.append('student_code', code);
            formData.append('is_banned', newBanStatus);

            fetch('api/students.php', { method: 'POST', body: formData })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('تمت العملية', 'تم تحديث حالة الطالب بنجاح', 'success')
                            .then(() => location.reload());
                    } else {
                        Swal.fire('خطأ', data.error || 'فشل تحديث الحالة', 'error');
                    }
                });
        }
    });
}

// إعادة تعيين قفل الجهاز
function resetDevice(code) {
    Swal.fire({
        title: 'إلغاء قفل الجهاز',
        text: 'هل تريد السماح للطالب بتسجيل الدخول من جهاز جديد؟',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'نعم، فك القفل',
        cancelButtonText: 'إلغاء'
    }).then((res) => {
        if (res.isConfirmed) {
            const fd = new FormData();
            fd.append('action', 'reset_device');
            fd.append('student_code', code);

            fetch('api/students.php', { method: 'POST', body: fd })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('تم الفك', 'تم إلغاء ربط الجهاز بنجاح ويمكن للطالب الدخول من أي هاتف', 'success')
                            .then(() => location.reload());
                    } else {
                        Swal.fire('خطأ', 'فشلت العملية', 'error');
                    }
                });
        }
    });
}

// حذف طالب
function deleteStudent(code, name) {
    Swal.fire({
        title: 'حذف الطالب نهائياً؟',
        html: `أنت على وشك حذف الطالب <b>${name}</b> (${code}) من قاعدة بيانات Firebase. لن يمكنك استرجاع بياناته!`,
        icon: 'error',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'نعم، احذف نهائياً',
        cancelButtonText: 'إلغاء'
    }).then((res) => {
        if (res.isConfirmed) {
            const fd = new FormData();
            fd.append('action', 'delete_student');
            fd.append('student_code', code);

            fetch('api/students.php', { method: 'POST', body: fd })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('تم الحذف', 'تم حذف الطالب بنجاح', 'success')
                            .then(() => location.reload());
                    } else {
                        Swal.fire('خطأ', 'فشل الحذف', 'error');
                    }
                });
        }
    });
}

// تعديل بيانات الطالب
function editStudent(st) {
    Swal.fire({
        title: 'تعديل بيانات الطالب',
        html: `
            <div style="text-align: right;">
                <label style="font-size: 12px; font-weight: bold;">كود الطالب (غير قابل للتعديل):</label>
                <input id="swal_code" class="swal2-input" style="width: 100%; margin: 6px 0 14px;" value="${st.code}" readonly disabled>
                
                <label style="font-size: 12px; font-weight: bold;">الاسم الكامل:</label>
                <input id="swal_name" class="swal2-input" style="width: 100%; margin: 6px 0 14px;" value="${st.name}">
                
                <label style="font-size: 12px; font-weight: bold;">رقم هاتف الطالب:</label>
                <input id="swal_phone" class="swal2-input" style="width: 100%; margin: 6px 0 14px;" value="${st.phone}">
                
                <label style="font-size: 12px; font-weight: bold;">رقم ولي الأمر:</label>
                <input id="swal_parent" class="swal2-input" style="width: 100%; margin: 6px 0 14px;" value="${st.parentPhone}">
                
                <label style="font-size: 12px; font-weight: bold;">الصف الدراسي:</label>
                <input id="swal_grade" class="swal2-input" style="width: 100%; margin: 6px 0 14px;" value="${st.grade}">
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'حفظ التعديلات',
        cancelButtonText: 'إلغاء',
        preConfirm: () => {
            return {
                student_code: document.getElementById('swal_code').value,
                full_name: document.getElementById('swal_name').value,
                phone: document.getElementById('swal_phone').value,
                parent_phone: document.getElementById('swal_parent').value,
                grade: document.getElementById('swal_grade').value
            };
        }
    }).then((res) => {
        if (res.isConfirmed) {
            const fd = new FormData();
            fd.append('action', 'save_student');
            for (const k in res.value) {
                fd.append(k, res.value[k]);
            }

            fetch('api/students.php', { method: 'POST', body: fd })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('تم الحفظ', 'تم تحديث بيانات الطالب بنجاح', 'success')
                            .then(() => location.reload());
                    } else {
                        Swal.fire('خطأ', data.error || 'فشل الحفظ', 'error');
                    }
                });
        }
    });
}

// إضافة طالب جديد
function openAddStudentModal() {
    Swal.fire({
        title: 'إضافة طالب جديد',
        html: `
            <div style="text-align: right;">
                <label style="font-size: 12px; font-weight: bold;">كود الطالب (رقم فريد أو رقم الهاتف):</label>
                <input id="new_code" class="swal2-input" style="width: 100%; margin: 6px 0 14px;" placeholder="مثال: 10050">
                
                <label style="font-size: 12px; font-weight: bold;">الاسم الكامل:</label>
                <input id="new_name" class="swal2-input" style="width: 100%; margin: 6px 0 14px;" placeholder="مثال: أحمد محمد">
                
                <label style="font-size: 12px; font-weight: bold;">رقم هاتف الطالب:</label>
                <input id="new_phone" class="swal2-input" style="width: 100%; margin: 6px 0 14px;" placeholder="01xxxxxxxxx">
                
                <label style="font-size: 12px; font-weight: bold;">رقم ولي الأمر:</label>
                <input id="new_parent" class="swal2-input" style="width: 100%; margin: 6px 0 14px;" placeholder="01xxxxxxxxx">
                
                <label style="font-size: 12px; font-weight: bold;">الصف الدراسي:</label>
                <input id="new_grade" class="swal2-input" style="width: 100%; margin: 6px 0 14px;" placeholder="مثال: الصف الثالث الثانوي">
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'إضافة الطالب',
        cancelButtonText: 'إلغاء',
        preConfirm: () => {
            const code = document.getElementById('new_code').value.trim();
            const name = document.getElementById('new_name').value.trim();
            if (!code || !name) {
                Swal.showValidationMessage('يرجى إدخال الكود والاسم الكامل');
                return false;
            }
            return {
                student_code: code,
                full_name: name,
                phone: document.getElementById('new_phone').value.trim(),
                parent_phone: document.getElementById('new_parent').value.trim(),
                grade: document.getElementById('new_grade').value.trim()
            };
        }
    }).then((res) => {
        if (res.isConfirmed) {
            const fd = new FormData();
            fd.append('action', 'save_student');
            for (const k in res.value) {
                fd.append(k, res.value[k]);
            }

            fetch('api/students.php', { method: 'POST', body: fd })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('تمت الإضافة', 'تم تسجيل الطالب بنجاح في Firebase', 'success')
                            .then(() => location.reload());
                    } else {
                        Swal.fire('خطأ', data.error || 'فشلت العملية', 'error');
                    }
                });
        }
    });
}
</script>

<?php include __DIR__ . '/includes/footer.php'; ?>
