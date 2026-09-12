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

    function checkStudentDeviceAuth(db) {
        const page = window.location.pathname.split('/').pop();
        if (page.startsWith('admin') || page === 'admin-gate.html' || page === 'admin-panel.html' || page === 'admin-config.html' || page === 'register.html') return;

        const storedUser = localStorage.getItem('user');
        if (!storedUser) return;
        let uObj = {};
        try { uObj = JSON.parse(storedUser); } catch(e){}
        const rawCode = uObj.studentCode || uObj.code || uObj.student_code || localStorage.getItem('studentCode');
        const studentName = uObj.fullName || uObj.name || uObj.full_name || 'طالب';
        if (!rawCode) return;

        const studentCode = rawCode.toString().trim().toUpperCase();
        const deviceId = window.getOrCreateDeviceId();
        const deviceName = window.getDeviceName();

        const studentRef = db.ref('Students/' + studentCode);
        studentRef.child('authorizedDevices').on('value', snap => {
            const devices = snap.val();

            if (!devices) {
                // First device ever: auto-authorize!
                studentRef.child('authorizedDevices/' + deviceId).set({
                    deviceName: deviceName,
                    addedAt: Date.now(),
                    userAgent: navigator.userAgent
                });
                removeDeviceLockOverlay();
                return;
            }

            if (devices[deviceId]) {
                // Device is authorized!
                removeDeviceLockOverlay();
            } else {
                // Device not authorized! Show lock screen & send approval request to Admin
                window.showDeviceLockScreen(db, studentCode, studentName, deviceId, deviceName);
            }
        });
    }

    let isDeviceLockShown = false;
    let deviceApprovalListener = null;

    function removeDeviceLockOverlay() {
        const existing = document.getElementById('elkhetaDeviceLockOverlay');
        if (existing) existing.remove();
        if (deviceApprovalListener) deviceApprovalListener.off();
        isDeviceLockShown = false;
    }

    window.showDeviceLockScreen = function(db, studentCode, studentName, deviceId, deviceName) {
        if (isDeviceLockShown) return;
        isDeviceLockShown = true;

        const reqRef = db.ref('DeviceRequests/' + studentCode + '_' + deviceId);
        reqRef.set({
            requestId: studentCode + '_' + deviceId,
            studentCode: studentCode,
            studentName: studentName,
            deviceId: deviceId,
            deviceName: deviceName,
            userAgent: navigator.userAgent,
            screenRes: `${window.innerWidth}x${window.innerHeight}`,
            timestamp: Date.now(),
            status: 'pending'
        });

        const overlay = document.createElement('div');
        overlay.id = 'elkhetaDeviceLockOverlay';
        overlay.style.cssText = `
            position: fixed; inset: 0;
            background: rgba(9, 13, 22, 0.96);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            z-index: 9999999;
            display: flex; align-items: center; justify-content: center;
            padding: 20px; font-family: 'Cairo', sans-serif; direction: rtl;
        `;

        overlay.innerHTML = `
            <div style="
                background: rgba(17, 24, 39, 0.95);
                border: 1px solid rgba(239, 68, 68, 0.35);
                border-radius: 28px;
                padding: 36px 28px;
                max-width: 480px;
                width: 100%;
                text-align: center;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(239, 68, 68, 0.2);
                color: #F8FAFC;
                position: relative; overflow: hidden;
            ">
                <div style="
                    width: 80px; height: 80px;
                    background: linear-gradient(135deg, #7F1D1D, #991B1B);
                    border: 2px solid rgba(239, 68, 68, 0.5);
                    color: #FCA5A5;
                    border-radius: 24px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 38px; margin: 0 auto 20px;
                    box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
                ">🔒</div>

                <h2 style="font-size: 22px; font-weight: 900; color: #F8FAFC; margin-bottom: 8px;">محاولة دخول من جهاز جديد غير مصرح به</h2>
                <p style="font-size: 13.5px; font-weight: 700; color: #94A3B8; margin-bottom: 20px; line-height: 1.6;">
                    عزيزي الطالب <strong style="color:#FFF;">${studentName}</strong>،<br>
                    هذا الجهاز (<span style="color:#38BDF8;">${deviceName}</span>) ليس مدرجاً ضمن أجهزتك المعتمدة.<br>
                    تم إرسال طلب اعتماد لجهازك تلقائياً إلى إدارة المنصة.
                </p>

                <div style="
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 18px;
                    padding: 16px;
                    margin-bottom: 22px;
                ">
                    <div style="font-size: 13px; font-weight: 800; color: #F59E0B; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <span>⏳</span>
                        <span id="deviceStatusText">الطلب قيد المراجعة لدى الأدمن الآن...</span>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <a href="https://wa.me/201158210358" target="_blank" style="
                        background: #10B981; color: white; padding: 13px; border-radius: 14px;
                        font-weight: 800; font-size: 14px; text-decoration: none; display: block;
                    ">
                        💬 تواصل مع الأدمن على واتساب لسرعة الاعتماد
                    </a>
                    <button onclick="window.location.href='index.html'" style="
                        background: rgba(255,255,255,0.06); color: #94A3B8; border: 1px solid rgba(255,255,255,0.1);
                        padding: 11px; border-radius: 14px; font-weight: 800; font-size: 13px; cursor: pointer; font-family: inherit;
                    ">
                        العودة لصفحة الدخول الرئيسية
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        deviceApprovalListener = reqRef.on('value', snap => {
            if (snap.exists()) {
                const data = snap.val();
                const statusEl = document.getElementById('deviceStatusText');
                if (data.status === 'approved') {
                    if (statusEl) statusEl.textContent = '🎉 تم اعتماد جهازك من قبل الأدمن! جاري الدخول...';
                    db.ref(`Students/${studentCode}/authorizedDevices/${deviceId}`).set({
                        deviceName: deviceName,
                        addedAt: Date.now(),
                        userAgent: navigator.userAgent
                    }).then(() => {
                        setTimeout(() => {
                            removeDeviceLockOverlay();
                        }, 1000);
                    });
                } else if (data.status === 'rejected') {
                    if (statusEl) {
                        statusEl.textContent = '❌ تم رفض اعتماد هذا الجهاز من قبل الأدمن.';
                        statusEl.style.color = '#EF4444';
                    }
                }
            }
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
        btn.onmouseout = () => { btn.style.transform = 'translateY(0) scale(1)'; btn.style.borderColor = 'rgba(239, 68, 68, 0.35)'; btn.color = '#EF4444'; btn.style.background = 'linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.95))'; };

        document.body.appendChild(btn);
    }

    // تشغيل الحماية الشاملة فور جاهزية الصفحة وقاعدة البيانات
    function startGuards() {
        checkStudentBan();
        initFloatingBugButton();
        ensureFirebase((db) => {
            initMaintenanceGuard(db);
            checkStudentDeviceAuth(db);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startGuards);
    } else {
        startGuards();
    }

    setInterval(checkStudentBan, 15000);
})();
