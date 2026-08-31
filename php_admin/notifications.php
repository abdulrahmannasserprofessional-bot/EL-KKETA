<?php
/**
 * Push Notifications Management Page
 * إرسال الإشعارات الفورية للطلاب
 */
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/FirebaseService.php';

checkAuth();

$fb = new FirebaseService();
$notifications = $fb->get('Notifications') ?? [];

$notifList = [];
if (is_array($notifications)) {
    $reversed = array_reverse($notifications, true);
    foreach ($reversed as $key => $n) {
        $notifList[] = [
            'id' => $n['id'] ?? $key,
            'title' => $n['title'] ?? 'إشعار',
            'body' => $n['body'] ?? '',
            'target' => $n['target'] ?? 'all',
            'link' => $n['link'] ?? '',
            'sender' => $n['sender'] ?? 'الإدارة',
            'createdAt' => $n['createdAt'] ?? '—'
        ];
    }
}

$pageTitle = 'إرسال الإشعارات';
include __DIR__ . '/includes/header.php';
?>

<div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; align-items: start; margin-bottom: 30px;">
    <!-- نموذج إرسال الإشعار -->
    <div class="panel-card" style="margin-bottom: 0;">
        <div class="panel-header">
            <div class="panel-title">
                <i class="fa-solid fa-paper-plane" style="color: var(--primary);"></i>
                <span>إنشاء وإرسال إشعار فوري</span>
            </div>
        </div>
        <div class="panel-body">
            <form id="notifForm" onsubmit="sendNotification(event)">
                <div class="form-group">
                    <label class="form-label"><i class="fa-solid fa-heading"></i> عنوان الإشعار:</label>
                    <input type="text" id="notif_title" class="form-control" placeholder="مثال: تم رفع محاضرة الباب الثاني! ✨" required oninput="updatePreview()">
                </div>

                <div class="form-group">
                    <label class="form-label"><i class="fa-solid fa-align-right"></i> نص ورسالة الإشعار:</label>
                    <textarea id="notif_body" class="form-control" style="min-height: 110px; resize: vertical;" placeholder="مثال: ادخل الآن لمشاهدة شرح أهم النقاط وحل الواجب..." required oninput="updatePreview()"></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label"><i class="fa-solid fa-bullseye"></i> الفئة المستهدفة:</label>
                    <select id="notif_target" class="form-control" onchange="updatePreview()">
                        <option value="all">جميع الطلاب (عام)</option>
                        <option value="grade_1">طلاب الصف الأول الثانوي</option>
                        <option value="grade_2">طلاب الصف الثاني الثانوي</option>
                        <option value="grade_3">طلاب الصف الثالث الثانوي</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label"><i class="fa-solid fa-link"></i> رابط مخصص عند النقر (اختياري):</label>
                    <input type="text" id="notif_link" class="form-control" placeholder="مثال: lectures.html أو https://...">
                </div>

                <button type="submit" class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 15px; font-weight: 800; justify-content: center;">
                    <i class="fa-solid fa-paper-plane"></i> بث الإشعار الآن لجميع الأجهزة
                </button>
            </form>
        </div>
    </div>

    <!-- معاينة شكل الإشعار على الهاتف -->
    <div>
        <div class="panel-card" style="margin-bottom: 0;">
            <div class="panel-header">
                <div class="panel-title">
                    <i class="fa-solid fa-mobile-screen" style="color: var(--accent);"></i>
                    <span>معاينة حية للإشعار على هاتف الطالب</span>
                </div>
            </div>
            <div class="panel-body" style="background: #F1F5F9; display: flex; justify-content: center; padding: 30px 15px;">
                <div style="background: #FFFFFF; border-radius: 18px; width: 100%; max-width: 340px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); padding: 16px; border: 1px solid #E2E8F0;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #F1F5F9; padding-bottom: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 26px; height: 26px; background: #2563EB; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">
                                <i class="fa-solid fa-graduation-cap"></i>
                            </div>
                            <span style="font-size: 12px; font-weight: 800; color: #1E293B;">الخطة - ELKHETA</span>
                        </div>
                        <span style="font-size: 10px; color: #94A3B8;">الآن</span>
                    </div>
                    <div id="preview_title" style="font-size: 14px; font-weight: 800; color: #0F172A; margin-bottom: 4px;">
                        عنوان الإشعار يظهر هنا...
                    </div>
                    <div id="preview_body" style="font-size: 12px; color: #475569; line-height: 1.5;">
                        محتوى الإشعار وتفاصيل الرسالة تظهر هنا كما ستصل للمشترك على جهازه مباشرة.
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- سجل الإشعارات السابقة -->
<div class="panel-card">
    <div class="panel-header">
        <div class="panel-title">
            <i class="fa-solid fa-clock-rotate-left" style="color: var(--primary);"></i>
            <span>سجل الإشعارات المرسلة (<?= count($notifList) ?> إشعار)</span>
        </div>
    </div>

    <div class="panel-body" style="padding: 0;">
        <div class="table-responsive">
            <table class="custom-table">
                <thead>
                    <tr>
                        <th>عنوان الإشعار</th>
                        <th>نص الرسالة</th>
                        <th>الفئة المستهدفة</th>
                        <th>المرسل</th>
                        <th>تاريخ الإرسال</th>
                        <th style="text-align: center;">إجراء</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($notifList)): ?>
                        <tr>
                            <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 40px;">
                                لم يتم إرسال إشعارات سابقة حتى الآن.
                            </td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($notifList as $notif): ?>
                            <tr>
                                <td style="font-weight: 800; color: var(--text-main);"><?= htmlspecialchars($notif['title']) ?></td>
                                <td style="color: #475569; max-width: 350px;"><?= htmlspecialchars($notif['body']) ?></td>
                                <td><span class="badge badge-info"><?= htmlspecialchars($notif['target']) ?></span></td>
                                <td style="font-size: 12px; font-weight: 700; color: var(--text-muted);"><?= htmlspecialchars($notif['sender']) ?></td>
                                <td style="font-size: 12px; color: var(--text-muted);"><?= htmlspecialchars($notif['createdAt']) ?></td>
                                <td style="text-align: center;">
                                    <button class="btn btn-danger" style="padding: 6px 10px; font-size: 12px;" onclick="deleteNotif('<?= htmlspecialchars($notif['id']) ?>')">
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
function updatePreview() {
    const title = document.getElementById('notif_title').value.trim();
    const body = document.getElementById('notif_body').value.trim();

    document.getElementById('preview_title').textContent = title || 'عنوان الإشعار يظهر هنا...';
    document.getElementById('preview_body').textContent = body || 'محتوى الإشعار وتفاصيل الرسالة تظهر هنا كما ستصل للمشترك على جهازه مباشرة.';
}

function sendNotification(e) {
    e.preventDefault();
    const title = document.getElementById('notif_title').value.trim();
    const body = document.getElementById('notif_body').value.trim();
    const target = document.getElementById('notif_target').value;
    const link = document.getElementById('notif_link').value.trim();

    Swal.fire({
        title: 'تأكيد إرسال الإشعار',
        text: 'هل أنت متأكد من رغبتك في بث هذا الإشعار للطلاب الآن؟',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'نعم، أرسل الآن',
        cancelButtonText: 'إلغاء',
        confirmButtonColor: '#2563EB'
    }).then((res) => {
        if (res.isConfirmed) {
            const fd = new FormData();
            fd.append('action', 'send_notification');
            fd.append('title', title);
            fd.append('body', body);
            fd.append('target', target);
            fd.append('link', link);

            fetch('api/notifications.php', { method: 'POST', body: fd })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('تم الإرسال بنجاح', 'تم تسجيل وبث الإشعار للطلاب بنجاح', 'success')
                            .then(() => location.reload());
                    } else {
                        Swal.fire('خطأ', data.error || 'فشل إرسال الإشعار', 'error');
                    }
                });
        }
    });
}

function deleteNotif(id) {
    Swal.fire({
        title: 'حذف الإشعار؟',
        text: 'هل تريد حذف هذا الإشعار من السجل؟',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'نعم، احذف',
        cancelButtonText: 'إلغاء'
    }).then((res) => {
        if (res.isConfirmed) {
            const fd = new FormData();
            fd.append('action', 'delete_notification');
            fd.append('id', id);

            fetch('api/notifications.php', { method: 'POST', body: fd })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('تم الحذف', 'تم مسح الإشعار من السجل', 'success')
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
