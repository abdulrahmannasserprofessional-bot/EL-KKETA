<?php
/**
 * Courses & Lectures Management Page
 * إدارة الكورسات والمحاضرات والسنوات الدراسية
 */
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/FirebaseService.php';

checkAuth();

$fb = new FirebaseService();
$lectures = $fb->get('Lectures') ?? [];

$search = trim($_GET['search'] ?? '');
$filterGrade = trim($_GET['grade'] ?? '');

$lectureList = [];
$gradesList = [];

if (is_array($lectures)) {
    foreach ($lectures as $key => $lec) {
        $id = $lec['id'] ?? $key;
        $title = $lec['title'] ?? 'محاضرة بدون عنوان';
        $grade = $lec['grade'] ?? 'عام';
        $videoUrl = $lec['videoUrl'] ?? '';
        $pdfUrl = $lec['pdfUrl'] ?? '';
        $examId = $lec['examId'] ?? '';
        $price = $lec['price'] ?? 0;
        $isFree = !empty($lec['isFree']);
        $desc = $lec['description'] ?? '';

        if (!empty($grade) && !in_array($grade, $gradesList)) {
            $gradesList[] = $grade;
        }

        if (!empty($search) && stripos($title, $search) === false && stripos($grade, $search) === false) {
            continue;
        }

        if (!empty($filterGrade) && $grade !== $filterGrade) {
            continue;
        }

        $lectureList[] = [
            'id' => $id,
            'title' => $title,
            'grade' => $grade,
            'videoUrl' => $videoUrl,
            'pdfUrl' => $pdfUrl,
            'examId' => $examId,
            'price' => $price,
            'isFree' => $isFree,
            'description' => $desc,
            'raw' => $lec
        ];
    }
}

$pageTitle = 'الكورسات والمحاضرات';
include __DIR__ . '/includes/header.php';
?>

<!-- شريط الفلاتر والتحكم -->
<div class="panel-card" style="margin-bottom: 24px;">
    <div class="panel-body">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
            <form method="GET" action="courses.php" style="display: flex; gap: 12px; flex-wrap: wrap; flex: 1;">
                <input type="text" name="search" class="form-control" style="max-width: 280px;" placeholder="ابحث باسم المحاضرة..." value="<?= htmlspecialchars($search) ?>">
                <select name="grade" class="form-control" style="max-width: 200px;">
                    <option value="">جميع المراحل الدراسية</option>
                    <?php foreach ($gradesList as $g): ?>
                        <option value="<?= htmlspecialchars($g) ?>" <?= $filterGrade === $g ? 'selected' : '' ?>>
                            <?= htmlspecialchars($g) ?>
                        </option>
                    <?php endforeach; ?>
                </select>
                <button type="submit" class="btn btn-primary"><i class="fa-solid fa-filter"></i> تصفية</button>
                <?php if (!empty($search) || !empty($filterGrade)): ?>
                    <a href="courses.php" class="btn btn-secondary">إلغاء</a>
                <?php endif; ?>
            </form>

            <button class="btn btn-primary" onclick="openLectureModal()">
                <i class="fa-solid fa-plus-circle"></i> إضافة محاضرة جديدة
            </button>
        </div>
    </div>
</div>

<!-- بطاقات المحاضرات -->
<div class="panel-card">
    <div class="panel-header">
        <div class="panel-title">
            <i class="fa-solid fa-book-bookmark" style="color: var(--primary);"></i>
            <span>المحاضرات المتاحة (<?= count($lectureList) ?> محاضرة)</span>
        </div>
    </div>

    <div class="panel-body" style="padding: 0;">
        <div class="table-responsive">
            <table class="custom-table">
                <thead>
                    <tr>
                        <th>عنوان المحاضرة</th>
                        <th>الصف الدراسي</th>
                        <th>الفيديو</th>
                        <th>المذكرات (PDF)</th>
                        <th>الامتحان المرفق</th>
                        <th>السعر / الإتاحة</th>
                        <th style="text-align: center;">إجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($lectureList)): ?>
                        <tr>
                            <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px;">
                                لا توجد محاضرات مضافة حتى الآن.
                            </td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($lectureList as $lec): ?>
                            <tr>
                                <td style="font-weight: 800; color: var(--text-main);">
                                    <?= htmlspecialchars($lec['title']) ?>
                                    <?php if (!empty($lec['description'])): ?>
                                        <div style="font-size: 11px; color: var(--text-muted); font-weight: normal; margin-top: 2px;">
                                            <?= htmlspecialchars(mb_substr($lec['description'], 0, 50, 'UTF-8')) ?>...
                                        </div>
                                    <?php endif; ?>
                                </td>
                                <td><span class="badge badge-info"><?= htmlspecialchars($lec['grade']) ?></span></td>
                                <td>
                                    <?php if (!empty($lec['videoUrl'])): ?>
                                        <a href="<?= htmlspecialchars($lec['videoUrl']) ?>" target="_blank" class="badge badge-success" style="text-decoration: none;">
                                            <i class="fa-solid fa-play"></i> رابط الفيديو
                                        </a>
                                    <?php else: ?>
                                        <span style="color: var(--text-muted); font-size: 12px;">بدون فيديو</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?php if (!empty($lec['pdfUrl'])): ?>
                                        <a href="<?= htmlspecialchars($lec['pdfUrl']) ?>" target="_blank" class="badge badge-warning" style="text-decoration: none;">
                                            <i class="fa-solid fa-file-pdf"></i> تحميل PDF
                                        </a>
                                    <?php else: ?>
                                        <span style="color: var(--text-muted); font-size: 12px;">بدون ملف</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?php if (!empty($lec['examId'])): ?>
                                        <span class="badge badge-info"><i class="fa-solid fa-clipboard-question"></i> <?= htmlspecialchars($lec['examId']) ?></span>
                                    <?php else: ?>
                                        <span style="color: var(--text-muted); font-size: 12px;">—</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?php if ($lec['isFree']): ?>
                                        <span class="badge badge-success"><i class="fa-solid fa-gift"></i> مجانية</span>
                                    <?php else: ?>
                                        <span style="font-weight: 800; color: #4F46E5;"><?= htmlspecialchars($lec['price']) ?> ج.م</span>
                                    <?php endif; ?>
                                </td>
                                <td style="text-align: center;">
                                    <div style="display: flex; gap: 6px; justify-content: center;">
                                        <button class="btn btn-secondary" style="padding: 6px 10px; font-size: 12px;" onclick='openLectureModal(<?= json_encode($lec, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE) ?>)'>
                                            <i class="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button class="btn btn-danger" style="padding: 6px 10px; font-size: 12px;" onclick="deleteLecture('<?= htmlspecialchars($lec['id']) ?>', '<?= htmlspecialchars($lec['title']) ?>')">
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
// فتح نافذة إضافة / تعديل محاضرة
function openLectureModal(data = null) {
    const isEdit = data !== null;
    Swal.fire({
        title: isEdit ? 'تعديل المحاضرة' : 'إضافة محاضرة جديدة',
        html: `
            <div style="text-align: right;">
                <input type="hidden" id="lec_id" value="${isEdit ? data.id : ''}">

                <label style="font-size: 12px; font-weight: bold;">عنوان المحاضرة:</label>
                <input id="lec_title" class="swal2-input" style="width: 100%; margin: 6px 0 14px;" placeholder="مثال: شرح الباب الأول - فيزياء" value="${isEdit ? data.title : ''}">

                <label style="font-size: 12px; font-weight: bold;">الصف الدراسي:</label>
                <input id="lec_grade" class="swal2-input" style="width: 100%; margin: 6px 0 14px;" placeholder="مثال: الصف الثالث الثانوي" value="${isEdit ? data.grade : ''}">

                <label style="font-size: 12px; font-weight: bold;">رابط الفيديو (YouTube / Bunny / Drive / HLS):</label>
                <input id="lec_video" class="swal2-input" style="width: 100%; margin: 6px 0 14px;" placeholder="https://..." value="${isEdit ? data.videoUrl : ''}">

                <label style="font-size: 12px; font-weight: bold;">رابط مذكرة / ملف PDF:</label>
                <input id="lec_pdf" class="swal2-input" style="width: 100%; margin: 6px 0 14px;" placeholder="https://..." value="${isEdit ? data.pdfUrl : ''}">

                <div style="display: flex; gap: 10px; margin: 10px 0;">
                    <div style="flex: 1;">
                        <label style="font-size: 12px; font-weight: bold;">سعر المحاضرة (ج.م):</label>
                        <input id="lec_price" type="number" class="swal2-input" style="width: 100%; margin-top: 6px;" value="${isEdit ? data.price : '50'}">
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-top: 25px;">
                        <input id="lec_isfree" type="checkbox" style="width: 18px; height: 18px;" ${isEdit && data.isFree ? 'checked' : ''}>
                        <label for="lec_isfree" style="font-size: 13px; font-weight: bold; cursor: pointer;">محاضرة مجانية</label>
                    </div>
                </div>

                <label style="font-size: 12px; font-weight: bold;">وصف وتفاصيل المحاضرة:</label>
                <textarea id="lec_desc" class="swal2-textarea" style="width: 100%; margin-top: 6px; font-size: 13px;" placeholder="اكتب نقاط وتفاصيل الدرس...">${isEdit ? data.description : ''}</textarea>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: isEdit ? 'حفظ التعديلات' : 'إضافة المحاضرة',
        cancelButtonText: 'إلغاء',
        confirmButtonColor: '#2563EB',
        preConfirm: () => {
            const title = document.getElementById('lec_title').value.trim();
            if (!title) {
                Swal.showValidationMessage('عنوان المحاضرة مطلوب');
                return false;
            }
            return {
                lecture_id: document.getElementById('lec_id').value,
                title: title,
                grade: document.getElementById('lec_grade').value.trim(),
                video_url: document.getElementById('lec_video').value.trim(),
                pdf_url: document.getElementById('lec_pdf').value.trim(),
                price: document.getElementById('lec_price').value,
                is_free: document.getElementById('lec_isfree').checked ? '1' : '0',
                description: document.getElementById('lec_desc').value.trim()
            };
        }
    }).then((res) => {
        if (res.isConfirmed) {
            const fd = new FormData();
            fd.append('action', 'save_lecture');
            for (const k in res.value) {
                fd.append(k, res.value[k]);
            }

            fetch('api/courses.php', { method: 'POST', body: fd })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('تم بنجاح', 'تم حفظ بيانات المحاضرة في Firebase', 'success')
                            .then(() => location.reload());
                    } else {
                        Swal.fire('خطأ', data.error || 'فشلت العملية', 'error');
                    }
                });
        }
    });
}

// حذف محاضرة
function deleteLecture(id, title) {
    Swal.fire({
        title: 'حذف المحاضرة؟',
        text: `هل تريد بالتأكيد حذف "${title}"؟`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'نعم، احذف',
        cancelButtonText: 'إلغاء'
    }).then((res) => {
        if (res.isConfirmed) {
            const fd = new FormData();
            fd.append('action', 'delete_lecture');
            fd.append('lecture_id', id);

            fetch('api/courses.php', { method: 'POST', body: fd })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('تم الحذف', 'تم حذف المحاضرة بنجاح', 'success')
                            .then(() => location.reload());
                    } else {
                        Swal.fire('خطأ', 'فشل الحذف', 'error');
                    }
                });
        }
    });
}
</script>

<?php include __DIR__ . '/includes/footer.php'; ?>
