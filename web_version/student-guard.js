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

        // Admin bypass for inspection and development
        const isAdmin = sessionStorage.getItem('adminRole') || localStorage.getItem('isAdmin');
        if (isAdmin) {
            removeMaintenanceOverlay();
            return;
        }

        db.ref('Settings').on('value', snap => {
            if (!snap.exists()) {
                removeMaintenanceOverlay();
                return;
            }
            // Re-check admin session on value change
            if (sessionStorage.getItem('adminRole') || localStorage.getItem('isAdmin')) {
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
            const u = JSON.parse(localStorage.getItem('user')) || JSON.parse(sessionStorage.getItem('adminUser'));
            if (u && (u.role === 'admin' || u.isAdmin === true || u.userType === 'admin')) {
                return true;
            }
        } catch(e) {}
        return false;
    }

    let lastWarningTime = 0;
    function showAntiInspectWarning(msg) {
        const now = Date.now();
        if (now - lastWarningTime < 3000) return;
        lastWarningTime = now;

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'warning',
                title: msg,
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
                background: '#0F172A',
                color: '#FFFFFF'
            });
        } else if (typeof showToast === 'function') {
            showToast(msg, 'warning');
        }
    }

    let isDevToolsOpen = false;
    let debuggerTrapInterval = null;

    function handleDevToolsOpen() {
        if (isCurrentUserAdmin()) return;
        if (isDevToolsOpen) return;
        isDevToolsOpen = true;

        showDevToolsLockOverlay();
        startDebuggerFreeze();
    }

    function showDevToolsLockOverlay() {
        if (document.getElementById('elkhetaDevToolsLockOverlay')) return;
        const overlay = document.createElement('div');
        overlay.id = 'elkhetaDevToolsLockOverlay';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(8, 14, 31, 0.97);
            backdrop-filter: blur(25px);
            z-index: 2147483647;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: #FFFFFF;
            font-family: 'Cairo', sans-serif;
            direction: rtl;
            padding: 24px;
            box-sizing: border-box;
        `;
        overlay.innerHTML = `
            <style>
                @keyframes devToolsPop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            </style>
            <div style="background: rgba(30, 41, 59, 0.9); border: 2px solid #EF4444; border-radius: 26px; padding: 36px 28px; max-width: 480px; width: 90%; box-shadow: 0 0 60px rgba(239, 68, 68, 0.45); animation: devToolsPop 0.3s ease;">
                <div style="font-size: 54px; margin-bottom: 14px; filter: drop-shadow(0 4px 14px rgba(239, 68, 68, 0.6));">🛡️</div>
                <h2 style="font-size: 21px; font-weight: 900; margin: 0 0 10px 0; color: #FCA5A5;">تنبيه أمني: أدوات الفحص محظورة</h2>
                <p style="font-size: 13.5px; color: #CBD5E1; line-height: 1.7; margin: 0 0 18px 0; font-weight: 600;">
                    نظام الحماية لمنصة <strong>الخطة التعليمية</strong> يمنع فحص الأكواد أو فتح أدوات المطورين (DevTools) لحماية المحتوى وحقوق الملكية الفكرية.
                </p>
                <div style="background: rgba(239, 68, 68, 0.15); border: 1px dashed rgba(239, 68, 68, 0.45); border-radius: 14px; padding: 12px; margin-bottom: 22px; font-size: 13px; color: #FCA5A5; font-weight: 700;">
                    يرجى إغلاق نافذة الفحص (F12) لإعادة فتح المنصة ومتابعة دراستك.
                </div>
                <button onclick="window.location.reload();" style="background: linear-gradient(135deg, #2563EB, #1D4ED8); color: #FFFFFF; border: none; padding: 12px 34px; border-radius: 50px; font-size: 14px; font-weight: 800; font-family: 'Cairo', sans-serif; cursor: pointer; box-shadow: 0 4px 18px rgba(37, 99, 235, 0.45); transition: 0.2s;">
                    🔄 إعادة تحميل الصفحة
                </button>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    function startDebuggerFreeze() {
        if (debuggerTrapInterval) return;
        debuggerTrapInterval = setInterval(function() {
            if (isCurrentUserAdmin()) {
                clearInterval(debuggerTrapInterval);
                return;
            }
            (function() { return false; }['constructor']('debugger')());
        }, 400);
    }

    function initAntiInspectionGuard() {
        if (isCurrentUserAdmin()) return;

        // 1. Block Keyboard Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S)
        window.addEventListener('keydown', function(e) {
            if (isCurrentUserAdmin()) return;

            // F12
            if (e.keyCode === 123 || e.key === 'F12') {
                e.preventDefault();
                e.stopPropagation();
                showAntiInspectWarning("محاولة فتح أدوات المطور (F12) محظورة 🛡️");
                handleDevToolsOpen();
                return false;
            }

            // Ctrl+Shift+I, J, C, K
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && (
                e.key === 'I' || e.key === 'i' ||
                e.key === 'J' || e.key === 'j' ||
                e.key === 'C' || e.key === 'c' ||
                e.key === 'K' || e.key === 'k'
            )) {
                e.preventDefault();
                e.stopPropagation();
                showAntiInspectWarning("محاولة فحص عناصر المنصة محظورة 🛡️");
                handleDevToolsOpen();
                return false;
            }

            // Ctrl+U (View Source)
            if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
                e.preventDefault();
                e.stopPropagation();
                showAntiInspectWarning("عرض الكود المصدري محظور 🛡️");
                return false;
            }

            // Ctrl+S (Save Page)
            if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }, true);

        // Anti-PrintScreen & Clipboard Eraser
        window.addEventListener('keyup', function(e) {
            if (isCurrentUserAdmin()) return;
            if (e.key === 'PrintScreen' || e.keyCode === 44) {
                try {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText('');
                    }
                } catch(err){}
                showAntiInspectWarning("⚠️ التقاط لقطات الشاشة محظور لحماية المحتوى!");
                triggerScreenBlackout();
            }
        });

        function triggerScreenBlackout() {
            const b = document.createElement('div');
            b.style.cssText = "position:fixed;inset:0;background:#000000;z-index:2147483646;opacity:1;transition:opacity 0.6s ease;pointer-events:none;";
            document.body.appendChild(b);
            setTimeout(() => { b.style.opacity = '0'; setTimeout(() => b.remove(), 600); }, 600);
        }

        // 2. Block Right-Click Context Menu (Except on input/textarea for typing)
        document.addEventListener('contextmenu', function(e) {
            if (isCurrentUserAdmin()) return;
            const tag = e.target && e.target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;

            e.preventDefault();
            showAntiInspectWarning("القائمة المنسدلة وسرقة المحتوى معطلة لحماية حقوق المنصة 🛡️");
            return false;
        }, true);

        // 3. Mute Console Output in Production (No token, URL, or data leaks)
        try {
            const noop = function() {};
            window.console.log = noop;
            window.console.info = noop;
            window.console.debug = noop;
            window.console.dir = noop;
        } catch(e) {}

        // 4. Periodic DevTools Detection Check
        setInterval(function() {
            if (isCurrentUserAdmin()) return;
            const start = performance.now();
            (function() { return false; }['constructor']('debugger')());
            const end = performance.now();
            if (end - start > 100) {
                handleDevToolsOpen();
            }
        }, 1500);
    }

    // ─── 10. SINGLE ACTIVE SESSION LOCK (منع مشاركة الحسابات على جهازين) ───
    function initSingleSessionLock(db) {
        if (isCurrentUserAdmin()) return;
        let u = null;
        try { u = JSON.parse(localStorage.getItem('user')); } catch(e){}
        if (!u || (!u.studentCode && !u.student_code && !u.code)) return;

        const rawCode = u.studentCode || u.student_code || u.code || '';
        const stCode = rawCode.toString().trim().replace(/[.#$\[\]]/g, '_');
        if (!stCode) return;

        let sessionToken = sessionStorage.getItem('elkheta_active_session_token');
        if (!sessionToken) {
            sessionToken = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
            sessionStorage.setItem('elkheta_active_session_token', sessionToken);
            db.ref(`ActiveSessions/${stCode}`).set({
                token: sessionToken,
                lastSeen: firebase.database.ServerValue.TIMESTAMP,
                device: navigator.userAgent || ''
            });
        }

        // مراقبة فورية: لو فتح من لابتوب أو موبايل تاني، يطرد الجهاز الأول فوراً
        db.ref(`ActiveSessions/${stCode}/token`).on('value', snap => {
            if (snap.exists()) {
                const liveToken = snap.val();
                if (liveToken && liveToken !== sessionToken) {
                    handleConcurrentLoginDetected();
                }
            }
        });
    }

    function handleConcurrentLoginDetected() {
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
                <h2 style="font-size: 20px; font-weight: 900; color: #FCA5A5; margin: 0 0 10px 0;">تم تسجيل الدخول من جهاز آخر</h2>
                <p style="font-size: 13.5px; color: #CBD5E1; line-height: 1.7; margin: 0 0 20px 0; font-weight: 600;">
                    تم إنهاء هذه الجلسة تلقائياً لحماية حسابك، لأن سياسة منصة <strong>الخطة</strong> تمنع فتح الحساب في جهازين في نفس الوقت لمنع مشاركة الحسابات.
                </p>
                <button onclick="location.href='index.html'" style="background: linear-gradient(135deg, #2563EB, #1D4ED8); color: #FFFFFF; border: none; padding: 12px 34px; border-radius: 50px; font-size: 14px; font-weight: 800; cursor: pointer; font-family: 'Cairo', sans-serif; box-shadow: 0 4px 18px rgba(37, 99, 235, 0.45);">
                    العودة لتسجيل الدخول 🔑
                </button>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    // تشغيل الحماية الشاملة فور جاهزية الصفحة وقاعدة البيانات
    function startGuards() {
        purgeOldBugButton();
        initAntiInspectionGuard();
        checkStudentBan();
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
