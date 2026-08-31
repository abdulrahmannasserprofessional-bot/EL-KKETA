<?php
/**
 * Settings & Gate Management Page
 * إعدادات المنصة، الصيانة، والمشرفين
 */
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/FirebaseService.php';

checkAuth();

$fb = new FirebaseService();
$settings = $fb->get('Settings') ?? [];
$supervisors = $fb->get('Supervisors') ?? [];

$isMaintenance = !empty($settings['isMaintenance']);
$maintenanceMsg = $settings['maintenanceMessage'] ?? 'المنصة تحت الصيانة والتحديث حالياً، نعود قريباً!';
$supportWhatsapp = $settings['supportWhatsapp'] ?? '';
$appMinVersion = $settings['appMinVersion'] ?? '1.0.0';
$noticeBar = $settings['noticeBar'] ?? '';

$pageTitle = 'إعدادات المنصة والسيرفر';
include __DIR__ . '/includes/header.php';
?>

<div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; align-items: start; margin-bottom: 30px;">
    <!-- إعدادات البوابة والمنصة -->
    <div class="panel-card" style="margin-bottom: 0;">
        <div class="panel-header">
            <div class="panel-title">
                <i class="fa-solid fa-sliders" style="color: var(--primary);"></i>
                <span>إعدادات البوابة والتطبيق (Gate & App Settings)</span>
            </div>
        </div>
        <div class="panel-body">
            <form id="settingsForm" onsubmit="saveSettings(event)">
                <!-- وضع الصيانة -->
                <div style="background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 14px; padding: 18px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <div>
                            <span style="font-weight: 800; font-size: 15px; color: #1E293B;">وضع الصيانة وقفل المنصة (Maintenance Mode)</span>
                            <p style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">عند التفعيل، يتم حجب المنصة عن جميع الطلاب وإظهار رسالة الصيانة</p>
                        </div>
                        <input type="checkbox" id="maintenance_mode" style="width: 22px; height: 22px; cursor: pointer;" <?= $isMaintenance ? 'checked' : '' ?>>
                    </div>

                    <label class="form-label"><i class="fa-solid fa-triangle-exclamation"></i> رسالة الصيانة للطلاب:</label>
                    <input type="text" id="maintenance_message" class="form-control" value="<?= htmlspecialchars($maintenanceMsg) ?>" placeholder="المنصة تحت الصيانة...">
                </div>

                <div class="form-group">
                    <label class="form-label"><i class="fa-brands fa-whatsapp" style="color: #10B981;"></i> رقم واتساب الدعم الفني المباشر:</label>
                    <input type="text" id="support_whatsapp" class="form-control" dir="ltr" style="text-align: right;" value="<?= htmlspecialchars($supportWhatsapp) ?>" placeholder="مثال: 201012345678">
                </div>

                <div class="form-group">
                    <label class="form-label"><i class="fa-solid fa-code-branch"></i> أقل إصدار مسموح به للتطبيق (Force Update):</label>
                    <input type="text" id="app_min_version" class="form-control" dir="ltr" style="text-align: right;" value="<?= htmlspecialchars($appMinVersion) ?>" placeholder="1.0.0">
                </div>

                <div class="form-group">
                    <label class="form-label"><i class="fa-solid fa-bullhorn"></i> شريط التنبيهات العلوي للمنصة (Notice Bar):</label>
                    <input type="text" id="notice_bar" class="form-control" value="<?= htmlspecialchars($noticeBar) ?>" placeholder="مثال: خصم 20% على اشتراكات الشهر الجديد!">
                </div>

                <button type="submit" class="btn btn-primary" style="padding: 12px 24px; font-weight: 800;">
                    <i class="fa-solid fa-floppy-disk"></i> حفظ الإعدادات في Firebase
                </button>
            </form>
        </div>
    </div>

    <!-- اختبار الاتصال وحسابات المشرفين -->
    <div>
        <!-- بطاقة اختبار الاتصال -->
        <div class="panel-card" style="margin-bottom: 24px;">
            <div class="panel-header">
                <div class="panel-title">
                    <i class="fa-solid fa-network-wired" style="color: var(--success);"></i>
                    <span>فحص الاتصال مع Firebase</span>
                </div>
            </div>
            <div class="panel-body">
                <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
                    يمكنك اختبار استجابة سيرفر PHP وسرعة القراءة والكتابة مع قاعدة بيانات Realtime Database.
                </p>
                <button class="btn btn-secondary" style="width: 100%; justify-content: center; font-weight: 800;" onclick="testFirebaseConnection()">
                    <i class="fa-solid fa-bolt"></i> اختبار الاتصال السريع الآن
                </button>
            </div>
        </div>

        <!-- بطاقة إدارة المشرفين والمساعدين -->
        <div class="panel-card" style="margin-bottom: 0;">
            <div class="panel-header">
                <div class="panel-title">
                    <i class="fa-solid fa-user-shield" style="color: var(--accent);"></i>
                    <span>حسابات المشرفين (Supervisors)</span>
                </div>
                <button class="btn btn-primary" style="padding: 5px 12px; font-size: 12px;" onclick="openAddAdminModal()">
                    <i class="fa-solid fa-plus"></i> إضافة مشرف
                </button>
            </div>
            <div class="panel-body" style="padding: 0;">
                <div class="table-responsive">
                    <table class="custom-table">
                        <thead>
                            <tr>
                                <th>اسم المستخدم</th>
                                <th>الدور</th>
                                <th style="text-align: center;">إجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- الحساب الافتراضي -->
                            <tr>
                                <td style="font-weight: 800;"><?= htmlspecialchars(ADMIN_DEFAULT_USER) ?></td>
                                <td><span class="badge badge-danger">المدير العام (Config)</span></td>
                                <td style="text-align: center; color: var(--text-muted); font-size: 11px;">محمي</td>
                            </tr>
                            <?php if (is_array($supervisors)): ?>
                                <?php foreach ($supervisors as $supId => $sup): ?>
                                    <tr>
                                        <td style="font-weight: 700;"><?= htmlspecialchars($sup['username'] ?? '') ?></td>
                                        <td><span class="badge badge-info"><?= htmlspecialchars($sup['role'] ?? 'مشرف') ?></span></td>
                                        <td style="text-align: center;">
                                            <button class="btn btn-danger" style="padding: 4px 8px; font-size: 11px;" onclick="deleteSupervisor('<?= htmlspecialchars($supId) ?>')">
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
    </div>
</div>

<script>
function saveSettings(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('action', 'save_settings');
    fd.append('maintenance_mode', document.getElementById('maintenance_mode').checked ? '1' : '0');
    fd.append('maintenance_message', document.getElementById('maintenance_message').value.trim());
    fd.append('support_whatsapp', document.getElementById('support_whatsapp').value.trim());
    fd.append('app_min_version', document.getElementById('app_min_version').value.trim());
    fd.append('notice_bar', document.getElementById('notice_bar').value.trim());

    fetch('api/settings.php', { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                Swal.fire('تم الحفظ', 'تم تحديث إعدادات المنصة في Firebase بنجاح', 'success');
            } else {
                Swal.fire('خطأ', 'فشل حفظ الإعدادات', 'error');
            }
        });
}

function testFirebaseConnection() {
    Swal.fire({
        title: 'جاري فحص الاتصال...',
        text: 'يتم الآن إرسال طلب تجريبي لـ Firebase RTDB',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    fetch('api/settings.php?action=test_connection')
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                Swal.fire('الاتصال ناجح ⚡', data.message, 'success');
            } else {
                Swal.fire('فشل الاتصال', data.error || 'تأكد من إعدادات المفاتيح', 'error');
            }
        })
        .catch(err => {
            Swal.fire('خطأ في الشبكة', err.message, 'error');
        });
}

function openAddAdminModal() {
    Swal.fire({
        title: 'إضافة مشرف جديد',
        html: `
            <div style="text-align: right;">
                <label style="font-size: 12px; font-weight: bold;">اسم المستخدم:</label>
                <input id="sup_user" class="swal2-input" style="width: 100%; margin: 6px 0 14px;" placeholder="username">
                
                <label style="font-size: 12px; font-weight: bold;">كلمة المرور:</label>
                <input id="sup_pass" type="password" class="swal2-input" style="width: 100%; margin: 6px 0 14px;" placeholder="••••••••">
                
                <label style="font-size: 12px; font-weight: bold;">الدور / الصلاحية:</label>
                <select id="sup_role" class="swal2-input" style="width: 100%; margin: 6px 0 14px;">
                    <option value="supervisor">مشرف مساعد (Supervisor)</option>
                    <option value="admin">مدير فرعي (Admin)</option>
                </select>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'إضافة المشرف',
        cancelButtonText: 'إلغاء',
        confirmButtonColor: '#2563EB',
        preConfirm: () => {
            const user = document.getElementById('sup_user').value.trim();
            const pass = document.getElementById('sup_pass').value.trim();
            if (!user || !pass) {
                Swal.showValidationMessage('يرجى إدخال اسم المستخدم وكلمة المرور');
                return false;
            }
            return {
                username: user,
                password: pass,
                role: document.getElementById('sup_role').value
            };
        }
    }).then((res) => {
        if (res.isConfirmed) {
            const fd = new FormData();
            fd.append('action', 'add_admin');
            for (const k in res.value) {
                fd.append(k, res.value[k]);
            }

            fetch('api/settings.php', { method: 'POST', body: fd })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('تمت الإضافة', 'تم إنشاء حساب المشرف بنجاح', 'success')
                            .then(() => location.reload());
                    } else {
                        Swal.fire('خطأ', data.error || 'فشلت العملية', 'error');
                    }
                });
        }
    });
}

function deleteSupervisor(id) {
    Swal.fire({
        title: 'حذف المشرف؟',
        text: 'هل أنت متأكد من حذف هذا الحساب؟',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'نعم، احذف',
        cancelButtonText: 'إلغاء'
    }).then((res) => {
        if (res.isConfirmed) {
            const fd = new FormData();
            fd.append('action', 'delete_admin');
            fd.append('id', id);

            fetch('api/settings.php', { method: 'POST', body: fd })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('تم الحذف', 'تم حذف حساب المشرف', 'success')
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
