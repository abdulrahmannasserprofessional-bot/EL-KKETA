<?php
/**
 * Exams & Quizzes Management Page
 * إدارة وتصميم الامتحانات وبنك الأسئلة
 */
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/FirebaseService.php';

checkAuth();

$fb = new FirebaseService();
$exams = $fb->get('Exams') ?? [];

$examList = [];
if (is_array($exams)) {
    foreach ($exams as $key => $ex) {
        $id = $ex['id'] ?? $key;
        $title = $ex['title'] ?? 'امتحان بدون عنوان';
        $grade = $ex['grade'] ?? 'عام';
        $duration = $ex['duration'] ?? 30;
        $totalMarks = $ex['totalMarks'] ?? 100;
        $qCount = $ex['questionsCount'] ?? (is_array($ex['questions'] ?? null) ? count($ex['questions']) : 0);

        $examList[] = [
            'id' => $id,
            'title' => $title,
            'grade' => $grade,
            'duration' => $duration,
            'totalMarks' => $totalMarks,
            'questionsCount' => $qCount,
            'questions' => $ex['questions'] ?? [],
            'updatedAt' => $ex['updatedAt'] ?? '—'
        ];
    }
}

$pageTitle = 'الامتحانات والواجبات';
include __DIR__ . '/includes/header.php';
?>

<!-- بطاقة التحكم والإنشاء -->
<div class="panel-card" style="margin-bottom: 24px;">
    <div class="panel-body">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
            <div>
                <h3 style="font-size: 16px; font-weight: 800; color: var(--text-main);">نظام إدارة الامتحانات والاختبارات التفاعلية</h3>
                <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">يمكنك إنشاء امتحانات مع تصحيح تلقائي وتحديد الوقت المسموح للطالب</p>
            </div>
            <button class="btn btn-primary" onclick="openExamModal()">
                <i class="fa-solid fa-file-circle-plus"></i> إنشاء امتحان جديد
            </button>
        </div>
    </div>
</div>

<!-- جدول الامتحانات -->
<div class="panel-card">
    <div class="panel-header">
        <div class="panel-title">
            <i class="fa-solid fa-file-signature" style="color: var(--primary);"></i>
            <span>قائمة الامتحانات (<?= count($examList) ?> امتحان)</span>
        </div>
    </div>

    <div class="panel-body" style="padding: 0;">
        <div class="table-responsive">
            <table class="custom-table">
                <thead>
                    <tr>
                        <th>معرف الامتحان</th>
                        <th>عنوان الامتحان</th>
                        <th>الصف الدراسي</th>
                        <th>عدد الأسئلة</th>
                        <th>المدة (بالدقائق)</th>
                        <th>الدرجة الكلية</th>
                        <th>تاريخ التحديث</th>
                        <th style="text-align: center;">إجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($examList)): ?>
                        <tr>
                            <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 40px;">
                                لا توجد امتحانات مسجلة. اضغط على زر "إنشاء امتحان جديد" لإضافة أول امتحان.
                            </td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($examList as $ex): ?>
                            <tr>
                                <td>
                                    <span style="font-family: monospace; font-size: 12px; font-weight: 800; color: #4F46E5; background: #EEF2FF; padding: 3px 8px; border-radius: 6px;">
                                        <?= htmlspecialchars($ex['id']) ?>
                                    </span>
                                </td>
                                <td style="font-weight: 800; color: var(--text-main);"><?= htmlspecialchars($ex['title']) ?></td>
                                <td><span class="badge badge-info"><?= htmlspecialchars($ex['grade']) ?></span></td>
                                <td><span class="badge badge-warning"><?= $ex['questionsCount'] ?> سؤال</span></td>
                                <td><i class="fa-regular fa-clock"></i> <?= htmlspecialchars($ex['duration']) ?> دقيقة</td>
                                <td><span style="font-weight: 800; color: var(--success);"><?= htmlspecialchars($ex['totalMarks']) ?> درجة</span></td>
                                <td style="font-size: 12px; color: var(--text-muted);"><?= htmlspecialchars($ex['updatedAt']) ?></td>
                                <td style="text-align: center;">
                                    <div style="display: flex; gap: 6px; justify-content: center;">
                                        <button class="btn btn-secondary" style="padding: 6px 10px; font-size: 12px;" onclick='openExamModal(<?= json_encode($ex, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE) ?>)'>
                                            <i class="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button class="btn btn-danger" style="padding: 6px 10px; font-size: 12px;" onclick="deleteExam('<?= htmlspecialchars($ex['id']) ?>', '<?= htmlspecialchars($ex['title']) ?>')">
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
let currentQuestions = [];

function openExamModal(data = null) {
    const isEdit = data !== null;
    currentQuestions = isEdit && Array.isArray(data.questions) ? JSON.parse(JSON.stringify(data.questions)) : [];

    Swal.fire({
        title: isEdit ? 'تعديل الامتحان والأسئلة' : 'إنشاء امتحان تفاعلي جديد',
        width: '850px',
        html: `
            <div style="text-align: right;">
                <input type="hidden" id="ex_id" value="${isEdit ? data.id : ''}">

                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px; margin-bottom: 12px;">
                    <div>
                        <label style="font-size: 12px; font-weight: bold;">عنوان الامتحان:</label>
                        <input id="ex_title" class="swal2-input" style="width: 100%; margin: 4px 0 0;" placeholder="مثال: امتحان شامل على الفصل الأول" value="${isEdit ? data.title : ''}">
                    </div>
                    <div>
                        <label style="font-size: 12px; font-weight: bold;">الصف الدراسي:</label>
                        <input id="ex_grade" class="swal2-input" style="width: 100%; margin: 4px 0 0;" placeholder="مثال: الصف الثالث الثانوي" value="${isEdit ? data.grade : ''}">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                    <div>
                        <label style="font-size: 12px; font-weight: bold;">مدة الامتحان (بالدقائق):</label>
                        <input id="ex_dur" type="number" class="swal2-input" style="width: 100%; margin: 4px 0 0;" value="${isEdit ? data.duration : '45'}">
                    </div>
                    <div>
                        <label style="font-size: 12px; font-weight: bold;">الدرجة الكلية:</label>
                        <input id="ex_marks" type="number" class="swal2-input" style="width: 100%; margin: 4px 0 0;" value="${isEdit ? data.totalMarks : '100'}">
                    </div>
                </div>

                <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 15px 0;">

                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="font-weight: 800; font-size: 14px; color: #1E293B;">أسئلة الاختيار من متعدد (MCQ)</span>
                    <button type="button" class="btn btn-secondary" style="padding: 5px 12px; font-size: 12px;" onclick="addNewQuestionRow()">
                        <i class="fa-solid fa-plus"></i> إضافة سؤال جديد
                    </button>
                </div>

                <div id="questionsContainer" style="max-height: 280px; overflow-y: auto; padding: 10px; background: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0;">
                    <!-- سيتم حقن الأسئلة هنا -->
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: isEdit ? 'حفظ التعديلات' : 'حفظ ونشر الامتحان',
        cancelButtonText: 'إلغاء',
        confirmButtonColor: '#2563EB',
        didOpen: () => {
            renderQuestionsList();
        },
        preConfirm: () => {
            const title = document.getElementById('ex_title').value.trim();
            if (!title) {
                Swal.showValidationMessage('عنوان الامتحان مطلوب');
                return false;
            }
            return {
                exam_id: document.getElementById('ex_id').value,
                title: title,
                grade: document.getElementById('ex_grade').value.trim(),
                duration: document.getElementById('ex_dur').value,
                total_marks: document.getElementById('ex_marks').value,
                questions_json: JSON.stringify(currentQuestions)
            };
        }
    }).then((res) => {
        if (res.isConfirmed) {
            const fd = new FormData();
            fd.append('action', 'save_exam');
            for (const k in res.value) {
                fd.append(k, res.value[k]);
            }

            fetch('api/exams.php', { method: 'POST', body: fd })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('تم الحفظ', 'تم نشر وتحديث الامتحان في Firebase بنجاح', 'success')
                            .then(() => location.reload());
                    } else {
                        Swal.fire('خطأ', data.error || 'فشلت العملية', 'error');
                    }
                });
        }
    });
}

function renderQuestionsList() {
    const box = document.getElementById('questionsContainer');
    if (!box) return;
    if (currentQuestions.length === 0) {
        box.innerHTML = '<div style="text-align: center; color: #94A3B8; padding: 20px; font-size: 13px;">لا توجد أسئلة بعد. اضغط "إضافة سؤال جديد" للبدء.</div>';
        return;
    }

    let html = '';
    currentQuestions.forEach((q, idx) => {
        html += `
            <div style="background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 10px; padding: 12px; margin-bottom: 10px; position: relative;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span style="font-weight: bold; font-size: 13px; color: #2563EB;">السؤال ${idx + 1}</span>
                    <button type="button" style="background: none; border: none; color: #EF4444; cursor: pointer; font-size: 14px;" onclick="removeQuestion(${idx})" title="حذف السؤال">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
                <input type="text" placeholder="نص السؤال..." style="width: 100%; padding: 8px; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 13px; margin-bottom: 8px;" value="${q.question || ''}" onchange="currentQuestions[${idx}].question = this.value">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 12px;">
                    <input type="text" placeholder="الخيار أ" style="padding: 6px; border: 1px solid #E2E8F0; border-radius: 6px;" value="${q.options ? q.options[0] || '' : ''}" onchange="updateOption(${idx}, 0, this.value)">
                    <input type="text" placeholder="الخيار ب" style="padding: 6px; border: 1px solid #E2E8F0; border-radius: 6px;" value="${q.options ? q.options[1] || '' : ''}" onchange="updateOption(${idx}, 1, this.value)">
                    <input type="text" placeholder="الخيار ج" style="padding: 6px; border: 1px solid #E2E8F0; border-radius: 6px;" value="${q.options ? q.options[2] || '' : ''}" onchange="updateOption(${idx}, 2, this.value)">
                    <input type="text" placeholder="الخيار د" style="padding: 6px; border: 1px solid #E2E8F0; border-radius: 6px;" value="${q.options ? q.options[3] || '' : ''}" onchange="updateOption(${idx}, 3, this.value)">
                </div>
                <div style="margin-top: 8px; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 11px; font-weight: bold;">الإجابة الصحيحة:</span>
                    <select style="padding: 4px 8px; border-radius: 6px; border: 1px solid #CBD5E1; font-size: 12px;" onchange="currentQuestions[${idx}].correctIndex = parseInt(this.value)">
                        <option value="0" ${q.correctIndex === 0 ? 'selected' : ''}>الخيار أ</option>
                        <option value="1" ${q.correctIndex === 1 ? 'selected' : ''}>الخيار ب</option>
                        <option value="2" ${q.correctIndex === 2 ? 'selected' : ''}>الخيار ج</option>
                        <option value="3" ${q.correctIndex === 3 ? 'selected' : ''}>الخيار د</option>
                    </select>
                </div>
            </div>
        `;
    });
    box.innerHTML = html;
}

function addNewQuestionRow() {
    currentQuestions.push({
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0
    });
    renderQuestionsList();
}

function removeQuestion(idx) {
    currentQuestions.splice(idx, 1);
    renderQuestionsList();
}

function updateOption(qIdx, optIdx, val) {
    if (!currentQuestions[qIdx].options) currentQuestions[qIdx].options = ['', '', '', ''];
    currentQuestions[qIdx].options[optIdx] = val;
}

function deleteExam(id, title) {
    Swal.fire({
        title: 'حذف الامتحان؟',
        text: `هل تريد بالتأكيد حذف "${title}"؟`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'نعم، احذف',
        cancelButtonText: 'إلغاء'
    }).then((res) => {
        if (res.isConfirmed) {
            const fd = new FormData();
            fd.append('action', 'delete_exam');
            fd.append('exam_id', id);

            fetch('api/exams.php', { method: 'POST', body: fd })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('تم الحذف', 'تم مسح الامتحان بنجاح', 'success')
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
