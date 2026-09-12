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
                    <a href="https://wa.me/201158210358" target="_blank" style="
                        display: flex; align-items: center; justify-content: center; gap: 8px;
                        background: #10B981; color: white; padding: 12px; border-radius: 14px;
                        font-weight: 800; font-size: 14px; text-decoration: none;
                    ">
                        💬 تواصل مع الدعم الفني عبر واتساب
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
    // 2. Realtime Maintenance & Live Timer Guard
    // ==========================================
    function initMaintenanceGuard(db) {
        const page = window.location.pathname.split('/').pop();
        if (page.startsWith('admin') || page === 'admin-gate.html' || page === 'admin-panel.html' || page === 'admin-config.html') return;

        db.ref('Settings').on('value', snap => {
            if (!snap.exists()) {
                removeMaintenanceOverlay();
                return;
            }
            const s = snap.val();
            const isMaint = Boolean(s.maintenance);
            const details = s.maintenanceDetails || {};

            if (isMaint) {
                showMaintenanceScreen(details);
            } else {
                removeMaintenanceOverlay();
            }
        });
    }

    function removeMaintenanceOverlay() {
        const existing = document.getElementById('elkhetaMaintenanceOverlay');
        if (existing) existing.remove();
        if (maintenanceInterval) clearInterval(maintenanceInterval);
        isMaintenanceOverlayShown = false;
    }

    function showMaintenanceScreen(details) {
        if (isMaintenanceOverlayShown) {
            updateMaintenanceDetails(details);
            return;
        }
        isMaintenanceOverlayShown = true;

        const overlay = document.createElement('div');
        overlay.id = 'elkhetaMaintenanceOverlay';
        overlay.style.cssText = `
            position: fixed; inset: 0;
            background: rgba(9, 13, 22, 0.96);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            z-index: 99999999;
            display: flex; align-items: center; justify-content: center;
            padding: 20px; font-family: 'Cairo', sans-serif; direction: rtl;
        `;

        overlay.innerHTML = `
            <div style="
                background: rgba(17, 24, 39, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-radius: 28px;
                padding: 36px 28px;
                max-width: 480px;
                width: 100%;
                text-align: center;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.25);
                color: #F8FAFC;
                position: relative; overflow: hidden;
            ">
                <div style="
                    width: 80px; height: 80px;
                    background: linear-gradient(135deg, #1E1B4B, #312E81);
                    border: 2px solid rgba(99, 102, 241, 0.4);
                    color: #38BDF8;
                    border-radius: 24px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 38px; margin: 0 auto 20px;
                    box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
                ">🛠️</div>

                <h2 style="font-size: 22px; font-weight: 900; color: #F8FAFC; margin-bottom: 6px;">المنصة تحت الصيانة والتحديث الفني</h2>
                <p id="maintReasonText" style="font-size: 13.5px; font-weight: 700; color: #94A3B8; margin-bottom: 20px; line-height: 1.6;">
                    ${details.reason || 'نقوم حالياً بتحسين وتحديث سيرفرات المنصة لتقديم أفضل تجربة تعلم 🎓'}
                </p>

                <!-- Live Timer Card -->
                <div style="
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 20px;
                    padding: 16px;
                    margin-bottom: 22px;
                ">
                    <div style="font-size: 12px; font-weight: 800; color: #F59E0B; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                        <span>⏱️ الوقت المتبقي لانتهاء الصيانة:</span>
                    </div>
                    <div id="maintTimerDisplay" style="font-size: 32px; font-weight: 900; font-family: monospace; color: #38BDF8; letter-spacing: 3px;">
                        --:--:--
                    </div>
                </div>

                <!-- Action Buttons -->
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button onclick="window.showEmergencyReportModal()" style="
                        background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
                        color: white; border: none; padding: 13px; border-radius: 14px;
                        font-weight: 800; font-size: 14px; font-family: inherit; cursor: pointer;
                        display: flex; align-items: center; justify-content: center; gap: 8px;
                        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
                    ">
                        🚨 الإبلاغ عن مشكلة عاجلة أثناء الصيانة
                    </button>

                    <div style="display: flex; gap: 8px;">
                        <button onclick="window.location.reload()" style="
                            flex: 1; background: rgba(255, 255, 255, 0.06); color: #F8FAFC;
                            border: 1px solid rgba(255, 255, 255, 0.12); padding: 11px;
                            border-radius: 14px; font-weight: 800; font-size: 13px;
                            cursor: pointer; font-family: inherit;
                        ">
                            🔄 تحديث ومراجعة
                        </button>
                        <a href="https://wa.me/201158210358" target="_blank" style="
                            flex: 1; background: rgba(34, 197, 94, 0.15); color: #4ADE80;
                            border: 1px solid rgba(34, 197, 94, 0.3); padding: 11px;
                            border-radius: 14px; font-weight: 800; font-size: 13px;
                            text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 6px;
                        ">
                            💬 دعم واتساب
                        </a>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        startMaintenanceTimer(details.timerEnd);
    }

    function updateMaintenanceDetails(details) {
        const reasonEl = document.getElementById('maintReasonText');
        if (reasonEl && details.reason) reasonEl.textContent = details.reason;
        startMaintenanceTimer(details.timerEnd);
    }

    function startMaintenanceTimer(timerEnd) {
        if (maintenanceInterval) clearInterval(maintenanceInterval);

        function tick() {
            const timerDisplay = document.getElementById('maintTimerDisplay');
            if (!timerDisplay) return;

            if (!timerEnd) {
                timerDisplay.textContent = 'قيد العمل...';
                return;
            }

            const now = Date.now();
            const diff = Math.max(0, Math.floor((timerEnd - now) / 1000));

            if (diff <= 0) {
                timerDisplay.textContent = 'أوشكنا على الانتهاء 🎉';
                return;
            }

            const hrs = Math.floor(diff / 3600);
            const mins = Math.floor((diff % 3600) / 60);
            const secs = diff % 60;

            const pad = n => n.toString().padStart(2, '0');
            timerDisplay.textContent = `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
        }

        tick();
        maintenanceInterval = setInterval(tick, 1000);
    }

    window.showEmergencyReportModal = function() {
        const storedUser = localStorage.getItem('user');
        let uObj = {};
        try { if (storedUser) uObj = JSON.parse(storedUser); } catch(e){}
        const defaultCode = uObj.studentCode || uObj.code || localStorage.getItem('studentCode') || '';
        const defaultName = uObj.fullName || uObj.name || '';
        const defaultPhone = uObj.phone || '';

        if (typeof Swal === 'undefined') {
            const msg = prompt("اكتب تفاصيل المشكلة أو كود الحساب ليصل للادمن مباشرة:");
            if (msg) {
                saveEmergencyIssueDirect({ studentCode: defaultCode, studentName: defaultName, phone: defaultPhone, issueType: 'أخرى', message: msg });
            }
            return;
        }

        Swal.fire({
            title: 'الإبلاغ عن مشكلة عاجلة 🚨',
            html: `
                <div style="text-align:right; font-family:'Cairo', sans-serif; font-size:13px;">
                    <div style="margin-bottom:10px;">
                        <label style="font-weight:800; display:block; margin-bottom:4px; color:#F8FAFC;">كود الطالب:</label>
                        <input id="emgCode" class="swal2-input" value="${defaultCode}" placeholder="كود الطالب" style="width:100%; margin:0; text-align:right; font-family:monospace; font-weight:800; font-size:15px; color:#38BDF8;">
                    </div>
                    <div style="margin-bottom:10px;">
                        <label style="font-weight:800; display:block; margin-bottom:4px; color:#F8FAFC;">اسم الطالب الكامل:</label>
                        <input id="emgName" class="swal2-input" value="${defaultName}" placeholder="اسم الطالب" style="width:100%; margin:0; text-align:right;">
                    </div>
                    <div style="margin-bottom:10px;">
                        <label style="font-weight:800; display:block; margin-bottom:4px; color:#F8FAFC;">رقم الواتساب للتواصل:</label>
                        <input id="emgPhone" class="swal2-input" value="${defaultPhone}" placeholder="01xxxxxxxxx" style="width:100%; margin:0; text-align:right;">
                    </div>
                    <div style="margin-bottom:10px;">
                        <label style="font-weight:800; display:block; margin-bottom:4px; color:#F8FAFC;">نوع المشكلة:</label>
                        <select id="emgType" class="swal2-input" style="width:100%; margin:0; text-align:right;">
                            <option value="تسجيل الدخول والأكواد">مشكلة في كود الدخول أو الحساب</option>
                            <option value="بطء أو توقف المحاضرة">مشكلة في فتح المحاضرة</option>
                            <option value="الامتحانات والتقارير">مشكلة في الامتحان والنتيجة</option>
                            <option value="أخرى">مشكلة أخرى عاجلة</option>
                        </select>
                    </div>
                    <div style="margin-bottom:10px;">
                        <label style="font-weight:800; display:block; margin-bottom:4px; color:#F8FAFC;">تفاصيل المشكلة:</label>
                        <textarea id="emgMsg" class="swal2-input" placeholder="اشرح المشكلة بالتفصيل..." style="width:100%; margin:0; height:80px; text-align:right; font-family:inherit; font-size:13px; padding:10px;"></textarea>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'إرسال البلاغ فوراً 🚀',
            cancelButtonText: 'إلغاء',
            confirmButtonColor: '#6366F1',
            cancelButtonColor: '#64748B',
            preConfirm: () => {
                const code = document.getElementById('emgCode').value.trim();
                const name = document.getElementById('emgName').value.trim();
                const phone = document.getElementById('emgPhone').value.trim();
                const issueType = document.getElementById('emgType').value;
                const message = document.getElementById('emgMsg').value.trim();

                if (!message) {
                    Swal.showValidationMessage('يرجى كتابة تفاصيل المشكلة');
                    return false;
                }

                return { studentCode: code, studentName: name, phone: phone, issueType: issueType, message: message };
            }
        }).then(result => {
            if (result.isConfirmed && result.value) {
                saveEmergencyIssueDirect(result.value);
            }
        });
    };

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

    // زر الإبلاغ السريع العائم عن المشاكل الأكاديمية والفنية
    function initFloatingBugButton() {
        const page = window.location.pathname.split('/').pop();
        if (page.startsWith('admin') || page === 'index.html' || page === 'register.html') return;
        if (document.getElementById('elkhetaFloatingBugBtn')) return;

        const btn = document.createElement('button');
        btn.id = 'elkhetaFloatingBugBtn';
        btn.innerHTML = '<span>🐞 الإبلاغ عن عطل</span>';
        btn.title = 'تجاوزت مشكلة أو واجهت عطلاً؟ أبلغ الإدارة فوراً';
        btn.onclick = () => window.showEmergencyReportModal();
        btn.style.cssText = `
            position: fixed;
            bottom: 82px;
            left: 18px;
            z-index: 9999;
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.95));
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            color: #EF4444;
            border: 1px solid rgba(239, 68, 68, 0.35);
            padding: 8px 14px;
            border-radius: 20px;
            font-family: 'Cairo', sans-serif;
            font-size: 12px;
            font-weight: 800;
            cursor: pointer;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3), 0 0 15px rgba(239, 68, 68, 0.15);
            display: flex; align-items: center; gap: 6px;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        btn.onmouseover = () => { btn.style.transform = 'translateY(-2px) scale(1.04)'; btn.style.borderColor = '#EF4444'; btn.style.color = '#F8FAFC'; btn.style.background = '#EF4444'; };
        btn.onmouseout = () => { btn.style.transform = 'translateY(0) scale(1)'; btn.style.borderColor = 'rgba(239, 68, 68, 0.35)'; btn.style.color = '#EF4444'; btn.style.background = 'linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.95))'; };

        document.body.appendChild(btn);
    }

    // تشغيل الحماية الشاملة فور جاهزية الصفحة وقاعدة البيانات
    function startGuards() {
        checkStudentBan();
        initFloatingBugButton();
        ensureFirebase((db) => {
            initMaintenanceGuard(db);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startGuards);
    } else {
        startGuards();
    }

    setInterval(checkStudentBan, 15000);
})();
