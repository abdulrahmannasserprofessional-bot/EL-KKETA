/**
 * ELKHETA Universal Student Guard & Maintenance Timer System
 * فحص حظر الطالب + فحص وتطبيق وضع الصيانة بالتايمر والعد التنازلي على كافة الشاشات
 */

(function() {
    let isBanModalShown = false;
    let isMaintenanceOverlayShown = false;
    let maintenanceInterval = null;

    function getDB() {
        if (typeof firebase !== 'undefined' && firebase.database && firebase.apps && firebase.apps.length) {
            return firebase.database();
        }
        return null;
    }

    function ensureFirebase(callback) {
        const db = getDB();
        if (db) {
            callback(db);
            return;
        }

        // تحضير SDKs لـ Firebase إذا لم تكن موجودة بالصفحة
        if (typeof firebase === 'undefined') {
            const s1 = document.createElement('script');
            s1.src = "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js";
            document.head.appendChild(s1);

            const s2 = document.createElement('script');
            s2.src = "https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js";
            document.head.appendChild(s2);

            const s3 = document.createElement('script');
            s3.src = "firebase-config.js";
            document.head.appendChild(s3);
        } else if (!firebase.database) {
            const s2 = document.createElement('script');
            s2.src = "https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js";
            document.head.appendChild(s2);
            
            if (typeof window.database === 'undefined') {
                const s3 = document.createElement('script');
                s3.src = "firebase-config.js";
                document.head.appendChild(s3);
            }
        }

        let attempts = 0;
        const timer = setInterval(() => {
            attempts++;
            const activeDb = getDB();
            if (activeDb) {
                clearInterval(timer);
                callback(activeDb);
            } else if (attempts > 25) {
                clearInterval(timer);
            }
        }, 300);
    }

    // ==========================================
    // 1. Student Ban Check Guard
    // ==========================================
    function showBanLockScreen(studentName) {
        if (isBanModalShown) return;
        isBanModalShown = true;

        localStorage.removeItem('user');
        localStorage.removeItem('studentCode');
        sessionStorage.clear();

        const overlay = document.createElement('div');
        overlay.id = 'elkhetaBanOverlay';
        overlay.style.cssText = `
            position: fixed; inset: 0;
            background: rgba(15, 23, 42, 0.94);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            z-index: 99999999;
            display: flex; align-items: center; justify-content: center;
            padding: 20px; font-family: 'Cairo', sans-serif; direction: rtl;
        `;

        overlay.innerHTML = `
            <div style="
                background: #FFFFFF; border-radius: 28px; padding: 40px 30px;
                max-width: 440px; width: 100%; text-align: center;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(239, 68, 68, 0.3);
                animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            ">
                <div style="
                    width: 80px; height: 80px; background: #FEE2E2; border: 3px solid #FECACA;
                    color: #DC2626; border-radius: 24px; display: flex; align-items: center;
                    justify-content: center; font-size: 40px; margin: 0 auto 20px;
                ">🚫</div>

                <h2 style="font-size: 22px; font-weight: 900; color: #1E293B; margin-bottom: 8px;">حسابك موقوف ومعطل</h2>
                <p style="font-size: 14px; font-weight: 700; color: #64748B; margin-bottom: 20px; line-height: 1.6;">
                    عزيزي الطالب <strong id="_ban_name" style="color:#0F172A;"></strong>،<br>
                    تم إيقاف وتعطيل حسابك من قبل إدارة المنصة.<br>
                    يرجى التواصل مع الدعم الفني لحل المشكلة.
                </p>

                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <a href="chat.html" style="
                        display: flex; align-items: center; justify-content: center; gap: 8px;
                        background: linear-gradient(135deg, #0284C7, #0369A1); color: white; padding: 12px; border-radius: 14px;
                        font-weight: 800; font-size: 14px; text-decoration: none;
                    ">
                        💬 تواصل مع الدعم الفني عبر الشات المباشر
                    </a>
                    
                    <button onclick="window.location.href='index.html'" style="
                        background: #F1F5F9; color: #475569; border: 1px solid #E2E8F0;
                        padding: 12px; border-radius: 14px; font-weight: 800; font-size: 14px;
                        cursor: pointer; font-family: 'Cairo', sans-serif;
                    ">
                        العودة لصفحة الدخول الرئيسية
                    </button>
                </div>
            </div>
        `;

        const nameEl = overlay.querySelector('#_ban_name');
        if (nameEl) nameEl.textContent = studentName || '';

        document.body.appendChild(overlay);
    }

    async function checkStudentBan() {
        const page = window.location.pathname.split('/').pop();
        if (page === 'index.html' || page === 'register.html' || page.startsWith('admin')) return;

        const storedUser = localStorage.getItem('user');
        const studentCode = localStorage.getItem('studentCode') || (storedUser ? JSON.parse(storedUser).studentCode || JSON.parse(storedUser).code : null);

        if (!studentCode) return;

        try {
            const res = await fetch(`https://backendapi-pi.vercel.app/api/students?search=${encodeURIComponent(studentCode)}`);
            const data = await res.json();

            if (data.success && data.students && data.students.length > 0) {
                const currentStudent = data.students.find(s => s.student_code.toUpperCase() === studentCode.toUpperCase());
                if (currentStudent && (currentStudent.is_banned == 1 || currentStudent.is_banned === true)) {
                    showBanLockScreen(currentStudent.full_name);
                }
            }
        } catch (e) {
            console.warn('Ban check delay');
        }
    }

    // ==========================================
    // 2. Realtime Maintenance & Full-Screen Redirect Guard
    // ==========================================
    function initMaintenanceGuard(db) {
        const page = window.location.pathname.split('/').pop().toLowerCase() || 'index.html';
        if (page.startsWith('admin') || page === 'admin-gate.html' || page === 'admin-panel.html' || page === 'admin-config.html' || page === 'admin-maintenance.html') return;
        if (page === 'maintenance.html') return;

        // Admin bypass for inspection and development
        const isAdmin = sessionStorage.getItem('adminRole') || localStorage.getItem('isAdmin');
        if (isAdmin) {
            return;
        }

        db.ref('Settings').on('value', snap => {
            if (!snap.exists()) return;

            // Re-check admin session on value change
            if (sessionStorage.getItem('adminRole') || localStorage.getItem('isAdmin')) {
                return;
            }
            const s = snap.val();
            const isMaint = Boolean(s.maintenance);

            if (isMaint) {
                const curPage = window.location.pathname.split('/').pop().toLowerCase() || 'index.html';
                if (curPage !== 'maintenance.html' && !curPage.startsWith('admin')) {
                    window.location.replace('maintenance.html');
                }
            }
        });
    }

    window.showEmergencyReportModal = function() {
        const existing = document.getElementById('elkhetaEmergencyModal');
        if (existing) existing.remove();

        const storedUser = localStorage.getItem('user');
        let uObj = {};
        try { if (storedUser) uObj = JSON.parse(storedUser); } catch(e){}
        const defaultCode = uObj.studentCode || uObj.code || localStorage.getItem('studentCode') || '';
        const defaultName = uObj.fullName || uObj.name || '';
        const defaultPhone = uObj.phone || '';

        const modal = document.createElement('div');
        modal.id = 'elkhetaEmergencyModal';
        modal.style.cssText = `
            position: fixed; inset: 0;
            background: rgba(5, 8, 17, 0.85);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            z-index: 1000000000;
            display: flex; align-items: center; justify-content: center;
            padding: 20px; font-family: 'Cairo', sans-serif; direction: rtl;
        `;

        modal.innerHTML = `
            <div style="
                background: linear-gradient(145deg, #0F172A 0%, #1E293B 100%);
                border: 1.5px solid rgba(99, 102, 241, 0.4);
                border-radius: 26px;
                padding: 28px 24px;
                max-width: 460px; width: 100%;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(99, 102, 241, 0.25);
                color: #F8FAFC;
                position: relative;
                animation: emgFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            ">
                <style>
                    @keyframes emgFadeIn {
                        from { opacity: 0; transform: scale(0.95) translateY(10px); }
                        to { opacity: 1; transform: scale(1) translateY(0); }
                    }
                    .emg-input-field {
                        width: 100%;
                        background: rgba(0, 0, 0, 0.35);
                        border: 1px solid rgba(255, 255, 255, 0.15);
                        border-radius: 12px;
                        padding: 10px 14px;
                        color: #FFFFFF;
                        font-family: 'Cairo', sans-serif;
                        font-size: 13.5px;
                        font-weight: 700;
                        outline: none;
                        transition: all 0.2s;
                        box-sizing: border-box;
                    }
                    .emg-input-field:focus {
                        border-color: #6366F1;
                        box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
                        background: rgba(0, 0, 0, 0.5);
                    }
                </style>

                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(239, 68, 68, 0.2); color: #EF4444; display: flex; align-items: center; justify-content: center; font-size: 20px;">🚨</div>
                        <div>
                            <h3 style="font-size: 16px; font-weight: 900; color: #FFFFFF; margin: 0;">الإبلاغ عن مشكلة عاجلة</h3>
                            <span style="font-size: 11px; color: #94A3B8; font-weight: 700;">يصل بلاغك فوراً لغرفة عمليات الأدمن للمتابعة</span>
                        </div>
                    </div>
                    <button type="button" onclick="document.getElementById('elkhetaEmergencyModal').remove()" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #94A3B8; width: 32px; height: 32px; border-radius: 50%; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
                </div>

                <div id="emgFormBody" style="display: flex; flex-direction: column; gap: 12px;">
                    <div>
                        <label style="font-size: 11.5px; font-weight: 800; color: #CBD5E1; display: block; margin-bottom: 4px;">كود الطالب (إن وجد):</label>
                        <input id="emgCode" class="emg-input-field" value="${defaultCode}" placeholder="كود الطالب (مثال: ST101)" style="color: #38BDF8; font-family: monospace; font-size: 14px; font-weight: 800;">
                    </div>

                    <div>
                        <label style="font-size: 11.5px; font-weight: 800; color: #CBD5E1; display: block; margin-bottom: 4px;">اسم الطالب الكامل:</label>
                        <input id="emgName" class="emg-input-field" value="${defaultName}" placeholder="اكتب اسمك الثلاثي أو الرباعي">
                    </div>

                    <div>
                        <label style="font-size: 11.5px; font-weight: 800; color: #CBD5E1; display: block; margin-bottom: 4px;">رقم الهاتف / الواتساب:</label>
                        <input id="emgPhone" class="emg-input-field" value="${defaultPhone}" placeholder="01xxxxxxxxx">
                    </div>

                    <div>
                        <label style="font-size: 11.5px; font-weight: 800; color: #CBD5E1; display: block; margin-bottom: 4px;">نوع المشكلة:</label>
                        <select id="emgType" class="emg-input-field" style="color: #FFF; background: #0F172A;">
                            <option value="تسجيل الدخول والأكواد">مشكلة في كود الدخول أو الحساب</option>
                            <option value="فتح المحاضرات">مشكلة في تشغيل أو فتح المحاضرات</option>
                            <option value="الامتحانات والنتائج">مشكلة في الامتحان أو النتيجة</option>
                            <option value="أخرى عاجلة">مشكلة أخرى عاجلة</option>
                        </select>
                    </div>

                    <div>
                        <label style="font-size: 11.5px; font-weight: 800; color: #CBD5E1; display: block; margin-bottom: 4px;">تفاصيل المشكلة:</label>
                        <textarea id="emgMsg" class="emg-input-field" placeholder="اشرح المشكلة بالتفصيل لمساعدتك فوراً..." style="height: 80px; resize: vertical;"></textarea>
                    </div>

                    <div id="emgErrorNotice" style="display: none; color: #F87171; font-size: 12px; font-weight: 800; text-align: center;"></div>

                    <div style="display: flex; gap: 8px; margin-top: 6px;">
                        <button id="emgSubmitBtn" type="button" style="
                            flex: 1; background: linear-gradient(135deg, #6366F1, #4F46E5);
                            color: white; border: none; padding: 12px; border-radius: 12px;
                            font-weight: 900; font-size: 14px; font-family: inherit; cursor: pointer;
                            display: flex; align-items: center; justify-content: center; gap: 8px;
                            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
                        ">
                            <span>إرسال البلاغ فوراً 🚀</span>
                        </button>
                        <button type="button" onclick="document.getElementById('elkhetaEmergencyModal').remove()" style="
                            background: rgba(255, 255, 255, 0.08); color: #94A3B8;
                            border: 1px solid rgba(255, 255, 255, 0.15); padding: 12px 18px;
                            border-radius: 12px; font-weight: 800; font-size: 13px;
                            cursor: pointer; font-family: inherit;
                        ">
                            إلغاء
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('emgSubmitBtn').onclick = function() {
            const code = document.getElementById('emgCode').value.trim();
            const name = document.getElementById('emgName').value.trim();
            const phone = document.getElementById('emgPhone').value.trim();
            const issueType = document.getElementById('emgType').value;
            const message = document.getElementById('emgMsg').value.trim();
            const errEl = document.getElementById('emgErrorNotice');

            if (!message) {
                if (errEl) {
                    errEl.style.display = 'block';
                    errEl.textContent = '⚠️ يرجى كتابة تفاصيل المشكلة أولاً';
                }
                return;
            }

            const btn = document.getElementById('emgSubmitBtn');
            btn.disabled = true;
            btn.innerHTML = '<span>جاري الإرسال... ⏳</span>';

            saveEmergencyIssueDirect({
                studentCode: code,
                studentName: name,
                phone: phone,
                issueType: issueType,
                message: message
            });

            const body = document.getElementById('emgFormBody');
            if (body) {
                body.innerHTML = `
                    <div style="text-align: center; padding: 20px 10px;">
                        <div style="font-size: 44px; margin-bottom: 12px;">✅</div>
                        <h4 style="font-size: 17px; font-weight: 900; color: #34D399; margin-bottom: 8px;">تم إرسال بلاغك بنجاح!</h4>
                        <p style="font-size: 13px; color: #E2E8F0; line-height: 1.6; font-weight: 600;">
                            تم تسجيل البلاغ ووصل مباشرةً إلى لوحة الأدمن وغرفة العمليات، وسيتواصل معك الدعم الفني فوراً.
                        </p>
                        <button onclick="document.getElementById('elkhetaEmergencyModal').remove()" style="
                            margin-top: 18px; background: linear-gradient(135deg, #10B981, #059669);
                            color: white; border: none; padding: 10px 24px; border-radius: 12px;
                            font-weight: 900; font-size: 13.5px; cursor: pointer; font-family: inherit;
                        ">
                            إغلاق ✔️
                        </button>
                    </div>
                `;
            }

            setTimeout(() => {
                const m = document.getElementById('elkhetaEmergencyModal');
                if (m) m.remove();
            }, 3500);
        };
    };

    function showFallbackEmergencyModal(defaultCode, defaultName, defaultPhone) {
        window.showEmergencyReportModal();
    }

    function saveEmergencyIssueDirect(data) {
        ensureFirebase((db) => {
            const ref = db.ref('EmergencyIssues').push();
            ref.set({
                ...data,
                pageUrl: window.location.href,
                userAgent: navigator.userAgent,
                screenRes: `${window.innerWidth}x${window.innerHeight}`,
                timestamp: Date.now(),
                status: 'pending'
            }).then(() => {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'تم إرسال البلاغ بنجاح 🎉',
                        text: 'تم وصول بلاغك مع تشخيص جهازك كلياً للوحة الأدمن وسيتم التواصل معك فوراً.',
                        icon: 'success',
                        confirmButtonColor: '#6366F1'
                    });
                } else {
                    alert('تم إرسال بلاغك بنجاح للأدمن');
                }
            });
        });
    }

    // ==========================================
    // 3. Multi-Device Security & Approval System
    // ==========================================
    window.getOrCreateDeviceId = function() {
        let devId = localStorage.getItem('elkheta_device_fingerprint');
        if (!devId) {
            devId = 'dev_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
            localStorage.setItem('elkheta_device_fingerprint', devId);
        }
        return devId;
    };

    window.getDeviceName = function() {
        const ua = navigator.userAgent;
        let os = 'جهاز غير معروف';
        if (ua.includes('Win')) os = 'كمبيوتر ويندوز (Windows PC)';
        else if (ua.includes('Android')) os = 'هاتف أندرويد (Android Phone)';
        else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'آيفون / آيباد (iOS Device)';
        else if (ua.includes('Mac')) os = 'جهاز ماك (Mac OS)';
        else if (ua.includes('Linux')) os = 'نظام لينكس (Linux)';
        return os;
    };

    // ==========================================
    // 3. إلغاء اعتماد الأجهزة وطلب الموافقة نهائياً
    // ==========================================
    let isDeviceLockShown = false;
    let deviceApprovalListener = null;

    function removeDeviceLockOverlay() {
        const existing = document.getElementById('elkhetaDeviceLockOverlay');
        if (existing) existing.remove();
        if (deviceApprovalListener) {
            try { deviceApprovalListener.off(); } catch(e) {}
            deviceApprovalListener = null;
        }
        isDeviceLockShown = false;
    }
    removeDeviceLockOverlay();

    window.showDeviceLockScreen = function() {
        removeDeviceLockOverlay();
    };

    function checkStudentDeviceAuth(db) {
        removeDeviceLockOverlay();
    }

    // حذف قسري فوري لزر الإبلاغ القديم واستبداله بمنظومة الشات والدعم الحي
    function purgeOldBugButton() {
        const ids = ['elkhetaFloatingBugBtn', 'bug-report-btn', 'reportEmergencyBtn'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
        });
        document.querySelectorAll('button').forEach(btn => {
            if (btn.textContent && btn.textContent.includes('الإبلاغ عن عطل')) {
                btn.remove();
            }
        });
    }
    purgeOldBugButton();

    // ─── 9. ELKHETA ANTI-INSPECTION & DEVTOOLS LOCKDOWN (حماية F12 والأكواد) ───
    function isCurrentUserAdmin() {
        try {
            const path = (window.location.pathname || '').toLowerCase();
            if (path.includes('admin-') || path.includes('admin.html') || path.includes('admin/') || path.includes('admin_')) {
                return true;
            }
            const isStudentLearningPage = path.includes('lectures') || path.includes('quiz') || path.includes('mistakes') || 
                                          path.includes('notes-viewer') || path.includes('courses') || path.includes('planner') || 
                                          path.includes('leaderboard') || path.includes('video') || path.includes('display-code') ||
                                          path.includes('profile') || path.includes('community') || path.includes('home') ||
                                          path.includes('notifications') || path.includes('map') || path.includes('guide') ||
                                          path.includes('chat') || path.includes('index') || path.includes('ai-report');
            if (isStudentLearningPage) {
                return false;
            }
            if (sessionStorage.getItem('isAdmin') === 'true' && (sessionStorage.getItem('adminRole') || sessionStorage.getItem('adminUser'))) {
                return true;
            }
        } catch(e) {}
        return false;
    }

    function initAntiInspectionGuard() {
        if (isCurrentUserAdmin()) return;

        // If motion-fx.js is already running security shield, let motion-fx.js drive or run fallback
        if (typeof window.showRightClickSecurityNotice === 'function') {
            return;
        }

        // Block Keyboard Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+Shift+K, Ctrl+U, Ctrl+S)
        window.addEventListener('keydown', function(e) {
            if (isCurrentUserAdmin()) return;
            const isCtrlOrMeta = e.ctrlKey || e.metaKey;
            const isAlt = e.altKey;
            const isShift = e.shiftKey;
            const key = (e.key || '').toLowerCase();
            const keyCode = e.keyCode || e.which;

            if (keyCode === 123 || key === 'f12' || e.code === 'F12') {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                if (typeof window.showRightClickSecurityNotice === 'function') {
                    window.showRightClickSecurityNotice("محاولة فتح أدوات المطور (F12) محظورة 🛡️");
                }
                return false;
            }

            if (
                (isCtrlOrMeta && isShift && ['i', 'j', 'c', 'k', 'e', 's', 'x'].includes(key)) ||
                (isCtrlOrMeta && isAlt && ['i', 'j', 'c'].includes(key)) ||
                (keyCode === 73 && isCtrlOrMeta && isShift) ||
                (keyCode === 74 && isCtrlOrMeta && isShift) ||
                (keyCode === 67 && isCtrlOrMeta && isShift)
            ) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                if (typeof window.showRightClickSecurityNotice === 'function') {
                    window.showRightClickSecurityNotice("محاولة فحص عناصر وأكواد المنصة محظورة 🛡️");
                }
                return false;
            }

            if (isCtrlOrMeta && (key === 'u' || keyCode === 85)) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                if (typeof window.showRightClickSecurityNotice === 'function') {
                    window.showRightClickSecurityNotice("عرض الكود المصدري محظور 🛡️");
                }
                return false;
            }

            if (isCtrlOrMeta && (key === 's' || keyCode === 83)) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }
        }, true);

        // Block Context Menu (Right Click)
        document.addEventListener('contextmenu', function(e) {
            if (isCurrentUserAdmin()) return;
            const tag = (e.target && e.target.tagName) || '';
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;

            e.preventDefault();
            e.stopPropagation();
            if (typeof window.showRightClickSecurityNotice === 'function') {
                window.showRightClickSecurityNotice("النقر بالزر الأيمن واستدعاء القوائم غير مسموح به لحماية المحتوى وسرية الامتحانات 🛡️");
            }
            return false;
        }, true);
    }

    // ─── 10. MULTI-DEVICE SESSION MANAGER (سماح حتى 3 أجهزة متزامنة لكل طالب ومنع الزيادة) ───
    const MAX_ALLOWED_DEVICES = 3;

    function initSingleSessionLock(db) {
        if (isCurrentUserAdmin()) return;
        let u = null;
        try { u = JSON.parse(localStorage.getItem('user')); } catch(e){}
        if (!u || (!u.studentCode && !u.student_code && !u.code)) return;

        const rawCode = u.studentCode || u.student_code || u.code || '';
        const stCode = rawCode.toString().trim().replace(/[.#$\[\]]/g, '_');
        if (!stCode) return;

        // استخدام معرّف فريد للجهاز في localStorage حتى تشترك كل التبويبات في نفس الجهاز
        let deviceToken = localStorage.getItem('elkheta_device_session_token');
        if (!deviceToken) {
            deviceToken = 'dev_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
            localStorage.setItem('elkheta_device_session_token', deviceToken);
        }

        const devRef = db.ref(`ActiveSessions/${stCode}/devices/${deviceToken}`);

        // تسجيل نبضة نشاط الجهاز (Heartbeat)
        function updateHeartbeat() {
            try {
                devRef.update({
                    token: deviceToken,
                    lastSeen: firebase.database.ServerValue.TIMESTAMP,
                    device: (window.getDeviceName ? window.getDeviceName() : navigator.userAgent || 'Web Browser')
                });
            } catch(e){}
        }
        updateHeartbeat();
        const heartbeatInterval = setInterval(updateHeartbeat, 60000);

        // مراقبة فورية لعدد الأجهزة النشطة للطالب (حتى 3 أجهزة مسموح بها معاً)
        db.ref(`ActiveSessions/${stCode}/devices`).on('value', snap => {
            if (isCurrentUserAdmin()) return;
            if (!snap.exists()) return;

            const devices = snap.val();
            if (!devices || typeof devices !== 'object') return;

            const now = Date.now();
            const activeList = [];

            Object.keys(devices).forEach(key => {
                const dev = devices[key];
                if (!dev) return;
                const lastSeen = dev.lastSeen || 0;
                // تنظيف الأجهزة الخاملة التي لم تفتح منذ أكثر من 48 ساعة
                if (now - lastSeen > 48 * 60 * 60 * 1000) {
                    try { db.ref(`ActiveSessions/${stCode}/devices/${key}`).remove(); } catch(e){}
                } else {
                    activeList.push({ token: key, lastSeen: lastSeen });
                }
            });

            // لو عدد الأجهزة النشطة الفعلي أكبر من 3 (مثلاً 4 أجهزة أو أكثر)
            if (activeList.length > MAX_ALLOWED_DEVICES) {
                // ترتيب الأجهزة حسب الأحدث نشاطاً
                activeList.sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));
                // الاحتفاظ بأحدث 3 أجهزة
                const allowedTokens = activeList.slice(0, MAX_ALLOWED_DEVICES).map(d => d.token);

                // إذا كان هذا الجهاز الحالي خارج قائمة الـ 3 المسموح بها، يتم إنهاء جلسته
                if (!allowedTokens.includes(deviceToken)) {
                    clearInterval(heartbeatInterval);
                    handleConcurrentLoginDetected();
                }
            }
        });
    }

    function handleConcurrentLoginDetected() {
        if (isCurrentUserAdmin()) return;
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        if (document.getElementById('elkhetaConcurrentLockOverlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'elkhetaConcurrentLockOverlay';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(8, 14, 31, 0.98);
            z-index: 2147483647;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            text-align: center;
            direction: rtl;
            font-family: 'Cairo', sans-serif;
            color: #FFFFFF;
            backdrop-filter: blur(20px);
        `;
        overlay.innerHTML = `
            <div style="background: rgba(30, 41, 59, 0.95); border: 2px solid #EF4444; border-radius: 26px; padding: 36px 26px; max-width: 480px; width: 90%; box-shadow: 0 0 60px rgba(239, 68, 68, 0.45);">
                <div style="font-size: 52px; margin-bottom: 12px;">🚫</div>
                <h2 style="font-size: 20px; font-weight: 900; color: #FCA5A5; margin: 0 0 10px 0;">تجاوز الحد الأقصى للأجهزة (3 أجهزة)</h2>
                <p style="font-size: 13.5px; color: #CBD5E1; line-height: 1.7; margin: 0 0 20px 0; font-weight: 600;">
                    تم إنهاء هذه الجلسة لأنك قمت بفتح الحساب على أكثر من 3 أجهزة في وقت واحد (مثل الهاتف والكمبيوتر والتابلت).<br>
                    تسمح منصة <strong>الخطة</strong> باستخدام حتى 3 أجهزة لنفس الطالب، ولمنع مشاركة الحسابات يتم قفل الأجهزة الإضافية.
                </p>
                <button onclick="location.href='index.html'" style="background: linear-gradient(135deg, #2563EB, #1D4ED8); color: #FFFFFF; border: none; padding: 12px 34px; border-radius: 50px; font-size: 14px; font-weight: 800; cursor: pointer; font-family: 'Cairo', sans-serif; box-shadow: 0 4px 18px rgba(37, 99, 235, 0.45);">
                    العودة لتسجيل الدخول 🔑
                </button>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    // ═══════════════════════════════════════════════════════════════════
    // 🛡️ ELKHETA ENTERPRISE SECURITY SYSTEM API
    // ═══════════════════════════════════════════════════════════════════
    window.ElkhetaSecurity = {
        // 1. Audit Log Recorder for Admin Operations
        logAdminAudit: function(action, target, meta = {}) {
            ensureFirebase(db => {
                try {
                    const adminUser = sessionStorage.getItem('adminUser') || localStorage.getItem('adminUser') || 'SuperAdmin';
                    const adminRole = sessionStorage.getItem('adminRole') || localStorage.getItem('adminRole') || 'Administrator';
                    const logRef = db.ref('AuditLogs').push();
                    logRef.set({
                        action: action,
                        target: target || 'General',
                        admin: adminUser,
                        role: adminRole,
                        meta: meta,
                        device: window.getDeviceName ? window.getDeviceName() : navigator.userAgent,
                        timestamp: Date.now(),
                        ipSession: window.getOrCreateDeviceId ? window.getOrCreateDeviceId() : 'dev_session'
                    });
                } catch(e) {}
            });
        },

        // 2. Security Alert / Threat Telemetry
        logSecurityEvent: function(type, severity = 'warning', details = {}) {
            ensureFirebase(db => {
                try {
                    const alertRef = db.ref('SecurityAlerts').push();
                    alertRef.set({
                        type: type,
                        severity: severity, // 'critical', 'warning', 'info'
                        details: details,
                        url: window.location.href,
                        device: window.getDeviceName ? window.getDeviceName() : navigator.userAgent,
                        timestamp: Date.now(),
                        status: 'active'
                    });
                } catch(e) {}
            });
        },

        // 3. Brute Force Login Lockout Checker
        checkBruteForceLockout: function(identifier) {
            const key = 'elkheta_bf_' + (identifier || 'global').replace(/[.#$\[\]]/g, '_');
            const data = JSON.parse(localStorage.getItem(key) || '{"attempts":0,"lockUntil":0}');
            const now = Date.now();
            if (data.lockUntil && now < data.lockUntil) {
                const remSec = Math.ceil((data.lockUntil - now) / 1000);
                return { locked: true, remainingSeconds: remSec };
            }
            return { locked: false, remainingSeconds: 0 };
        },

        // 4. Record Failed Login Attempt
        recordFailedLogin: function(identifier) {
            const key = 'elkheta_bf_' + (identifier || 'global').replace(/[.#$\[\]]/g, '_');
            const data = JSON.parse(localStorage.getItem(key) || '{"attempts":0,"lockUntil":0}');
            const now = Date.now();
            data.attempts = (data.attempts || 0) + 1;
            data.lastAttempt = now;

            if (data.attempts >= 5) {
                data.lockUntil = now + (5 * 60 * 1000); // 5 minutes lockout
                window.ElkhetaSecurity.logSecurityEvent('BRUTE_FORCE_LOCKOUT', 'warning', {
                    identifier: identifier,
                    attempts: data.attempts
                });
            }
            localStorage.setItem(key, JSON.stringify(data));
            return data;
        },

        // 5. Clear Failed Login Attempts
        clearFailedLogins: function(identifier) {
            const key = 'elkheta_bf_' + (identifier || 'global').replace(/[.#$\[\]]/g, '_');
            localStorage.removeItem(key);
        },

        // 6. Anti-Privilege Escalation Client Guard
        verifyClientIntegrity: function() {
            try {
                const uStr = localStorage.getItem('user');
                if (uStr) {
                    const u = JSON.parse(uStr);
                    if ((u.role === 'admin' || u.isAdmin === true) && !sessionStorage.getItem('adminRole')) {
                        console.warn('Tampering detected: resetting unauthorized admin elevation');
                        u.role = 'student';
                        u.isAdmin = false;
                        localStorage.setItem('user', JSON.stringify(u));
                        window.ElkhetaSecurity.logSecurityEvent('UNAUTHORIZED_ROLE_ELEVATION_ATTEMPT', 'critical', {
                            studentCode: u.studentCode || u.code || 'unknown'
                        });
                    }
                }
            } catch(e) {}
        }
    };

    // تشغيل الحماية الشاملة فور جاهزية الصفحة وقاعدة البيانات
    function startGuards() {
        purgeOldBugButton();
        initAntiInspectionGuard();
        checkStudentBan();
        if (window.ElkhetaSecurity && window.ElkhetaSecurity.verifyClientIntegrity) {
            window.ElkhetaSecurity.verifyClientIntegrity();
        }
        ensureFirebase((db) => {
            initMaintenanceGuard(db);
            checkStudentDeviceAuth(db);
            initSingleSessionLock(db);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startGuards);
    } else {
        startGuards();
    }

    setInterval(checkStudentBan, 15000);
})();
