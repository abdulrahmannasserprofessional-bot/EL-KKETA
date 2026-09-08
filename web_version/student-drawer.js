/**
 * ELKHETA Modern Unified Student Sidebar / Drawer
 * Full-featured profile header, organized sections, active page indicators & PWA triggers
 */

(function() {
    // Inject Modern Drawer CSS
    const style = document.createElement('style');
    style.innerHTML = `
        /* Drawer Overlay */
        .elkheta-drawer-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 99999;
            opacity: 0; pointer-events: none;
            transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .elkheta-drawer-overlay.active {
            opacity: 1; pointer-events: auto;
        }

        /* Drawer Main Panel */
        .elkheta-drawer {
            position: fixed; top: 0; right: -360px;
            width: 310px; max-width: 85vw; height: 100%;
            background: #FFFFFF;
            z-index: 100000;
            display: flex; flex-direction: column;
            box-shadow: -15px 0 50px rgba(15, 23, 42, 0.25);
            transition: right 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            font-family: 'Cairo', sans-serif;
            direction: rtl;
            border-left: 1px solid #E2E8F0;
            overflow: hidden;
            box-sizing: border-box;
        }
        .elkheta-drawer.active {
            right: 0;
        }

        /* Profile Header */
        .elkheta-drawer-header {
            background: linear-gradient(145deg, #0F172A 0%, #1E293B 45%, #2563EB 100%);
            color: white;
            padding: 26px 20px 20px;
            position: relative;
            box-shadow: 0 10px 30px rgba(37, 99, 235, 0.2);
            overflow: hidden;
            flex-shrink: 0;
        }
        .elkheta-drawer-header::before {
            content: '';
            position: absolute;
            width: 180px; height: 180px;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 70%);
            top: -50px; left: -40px;
            border-radius: 50%;
            pointer-events: none;
        }

        .elkheta-drawer-close {
            position: absolute; top: 16px; left: 16px;
            background: rgba(255, 255, 255, 0.12);
            backdrop-filter: blur(6px);
            color: #E2E8F0; border: 1px solid rgba(255, 255, 255, 0.2);
            width: 34px; height: 34px;
            border-radius: 50%; font-size: 13px; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.2s;
            z-index: 2;
        }
        .elkheta-drawer-close:hover { 
            background: rgba(239, 68, 68, 0.85); 
            border-color: #EF4444; 
            color: white; 
            transform: scale(1.05); 
        }

        .elkheta-drawer-user {
            display: flex; align-items: center; gap: 14px; position: relative; z-index: 1;
        }
        .elkheta-drawer-avatar {
            width: 58px; height: 58px;
            border-radius: 18px;
            background: linear-gradient(135deg, #3B82F6, #1D4ED8);
            border: 2.5px solid rgba(255, 255, 255, 0.4);
            display: flex; align-items: center; justify-content: center;
            font-size: 24px; font-weight: 900; color: white;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            flex-shrink: 0;
        }
        .elkheta-drawer-info {
            flex: 1; min-width: 0;
        }
        .elkheta-drawer-name {
            font-size: 16px; font-weight: 900; color: #FFFFFF;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            line-height: 1.3;
        }
        .elkheta-drawer-stage {
            font-size: 11px; font-weight: 700; color: #93C5FD; margin-top: 2px;
            display: flex; align-items: center; gap: 4px;
        }
        .elkheta-drawer-code-pill {
            display: inline-flex; align-items: center; gap: 6px;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(6px);
            border: 1px solid rgba(255, 255, 255, 0.25);
            padding: 3px 10px; border-radius: 10px; font-size: 11px;
            font-weight: 800; color: #F8FAFC; margin-top: 6px;
            cursor: pointer; transition: all 0.2s;
        }
        .elkheta-drawer-code-pill:hover { 
            background: rgba(255, 255, 255, 0.3); 
            transform: translateY(-1px);
        }

        /* Stats Bar inside Drawer */
        .elkheta-drawer-stats {
            display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
            margin-top: 15px; padding-top: 14px;
            border-top: 1px solid rgba(255, 255, 255, 0.12);
            position: relative; z-index: 1;
        }
        .elkheta-drawer-stat-col {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.12);
            backdrop-filter: blur(4px);
            border-radius: 12px; padding: 7px 10px; text-align: center;
            font-size: 11px; font-weight: 800; color: #BFDBFE;
        }
        .elkheta-drawer-stat-val {
            font-size: 14px; font-weight: 900; color: #FFFFFF; display: block; margin-top: 2px;
        }

        /* Menu Body */
        .elkheta-drawer-body {
            padding: 16px 14px;
            flex: 1;
            overflow-y: auto;
            background: #F8FAFC;
        }
        .elkheta-drawer-body::-webkit-scrollbar {
            width: 4px;
        }
        .elkheta-drawer-body::-webkit-scrollbar-thumb {
            background: #CBD5E1;
            border-radius: 4px;
        }
        .elkheta-menu-section-title {
            font-size: 11px; font-weight: 900; color: #64748B;
            padding: 8px 10px 5px; text-transform: uppercase;
            letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px;
        }
        .elkheta-nav-link {
            display: flex; align-items: center; justify-content: space-between;
            padding: 10px 14px; margin-bottom: 5px;
            border-radius: 14px; text-decoration: none;
            background: #FFFFFF;
            border: 1px solid #E2E8F0;
            color: #334155; font-size: 13.5px; font-weight: 800;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }
        .elkheta-nav-link:hover {
            background: #EEF2FF; color: #2563EB;
            border-color: #C7D2FE;
            transform: translateX(-4px);
        }
        .elkheta-nav-link.active {
            background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
            color: #1D4ED8;
            border-color: #93C5FD;
            font-weight: 900;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.12);
        }
        .elkheta-nav-link-left {
            display: flex; align-items: center; gap: 11px;
        }
        .elkheta-nav-icon {
            width: 32px; height: 32px; border-radius: 10px;
            background: #F1F5F9; border: 1px solid #E2E8F0;
            display: flex; align-items: center; justify-content: center;
            font-size: 15px; transition: all 0.2s;
            flex-shrink: 0;
        }
        .elkheta-nav-link.active .elkheta-nav-icon {
            background: #2563EB; color: white; border-color: #2563EB;
        }
        .elkheta-nav-badge {
            font-size: 10px; font-weight: 900; padding: 3px 8px;
            border-radius: 8px; background: #F1F5F9; color: #64748B;
        }
        .elkheta-nav-badge.new {
            background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A;
        }

        /* Drawer Footer */
        .elkheta-drawer-footer {
            padding: 14px 16px 20px;
            border-top: 1px solid #E2E8F0;
            background: #FFFFFF;
            flex-shrink: 0;
        }
        .elkheta-drawer-logout {
            width: 100%;
            background: #FEF2F2;
            color: #DC2626;
            border: 1.5px solid #FECACA;
            padding: 12px;
            border-radius: 14px;
            font-size: 13.5px;
            font-weight: 900;
            font-family: 'Cairo', sans-serif;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .elkheta-drawer-logout:hover {
            background: #FEE2E2;
            border-color: #F87171;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
        }
    `;
    document.head.appendChild(style);

    // Build Drawer Elements
    let drawerEl = null;
    let overlayEl = null;

    function getStoredUser() {
        let user = null;
        try {
            const raw = localStorage.getItem('user');
            if (raw) user = JSON.parse(raw);
        } catch(e) {}

        if (!user) user = { fullName: 'طالب منصة الخطة', points: 0, level: 1, streak: 1 };
        
        const fallbackCode = localStorage.getItem('studentCode') || localStorage.getItem('userCode') || '';
        if (!user.code || user.code === '---') {
            if (fallbackCode) {
                user.code = fallbackCode;
                try { localStorage.setItem('user', JSON.stringify(user)); } catch(e){}
            } else if (typeof firebase !== 'undefined' && firebase.database && user.fullName) {
                firebase.database().ref('Students').once('value').then(snap => {
                    if (snap.exists()) {
                        snap.forEach(child => {
                            const val = child.val();
                            if (val && (val.fullName === user.fullName || val.email === user.email)) {
                                user.code = child.key;
                                localStorage.setItem('studentCode', child.key);
                                localStorage.setItem('user', JSON.stringify(user));
                                const cEl = document.getElementById('drawerUserCode');
                                if (cEl) cEl.textContent = child.key;
                            }
                        });
                    }
                }).catch(() => {});
            }
        }
        return user;
    }

    function buildDrawer() {
        if (drawerEl) return;

        overlayEl = document.createElement('div');
        overlayEl.className = 'elkheta-drawer-overlay';
        overlayEl.id = 'elkhetaDrawerOverlay';
        overlayEl.onclick = closeStudentDrawer;
        document.body.appendChild(overlayEl);

        drawerEl = document.createElement('div');
        drawerEl.className = 'elkheta-drawer';
        drawerEl.id = 'elkhetaDrawer';

        const user = getStoredUser();
        const currentPath = window.location.pathname;

        function isActive(page) {
            return currentPath.includes(page) ? 'active' : '';
        }

        const initial = (user.fullName || 'ط').trim().charAt(0) || '🎓';

        drawerEl.innerHTML = `
            <div class="elkheta-drawer-header">
                <button class="elkheta-drawer-close" onclick="closeStudentDrawer()" title="إغلاق">✕</button>
                <div class="elkheta-drawer-user">
                    <div class="elkheta-drawer-avatar" id="drawerUserAvatar">${initial}</div>
                    <div class="elkheta-drawer-info">
                        <div class="elkheta-drawer-name" id="drawerUserName">${user.fullName || 'طالب منصة الخطة'}</div>
                        <div class="elkheta-drawer-stage">
                            <span>🎓</span>
                            <span>الفرقة الرابعة - خدمة اجتماعية</span>
                        </div>
                        <div class="elkheta-drawer-code-pill" onclick="copyStudentCode('${user.code || user.studentCode || ''}')" title="انقر لنسخ الكود">
                            <span>🔑</span>
                            <span id="drawerUserCode">${user.code || user.studentCode || '---'}</span>
                            <span style="font-size:10px; opacity:0.8;">📋</span>
                        </div>
                    </div>
                </div>
                <div class="elkheta-drawer-stats">
                    <div class="elkheta-drawer-stat-col">
                        <span>🏆 مجموع النقاط</span>
                        <span class="elkheta-drawer-stat-val" id="drawerUserPoints">${user.points || 0}</span>
                    </div>
                    <div class="elkheta-drawer-stat-col">
                        <span>🔥 السلسلة اليومية</span>
                        <span class="elkheta-drawer-stat-val" id="drawerUserStreak">${user.streak || 1} يوم</span>
                    </div>
                </div>
            </div>

            <div class="elkheta-drawer-body">
                <div class="elkheta-menu-section-title">
                    <span>📚 مسار الدراسة والتعلم</span>
                </div>

                <a href="home.html" class="elkheta-nav-link ${isActive('home.html')}">
                    <div class="elkheta-nav-link-left">
                        <span class="elkheta-nav-icon">🏠</span>
                        <span>الرئيسية</span>
                    </div>
                </a>

                <a href="courses.html" class="elkheta-nav-link ${isActive('courses.html') || isActive('lectures.html')}">
                    <div class="elkheta-nav-link-left">
                        <span class="elkheta-nav-icon">📚</span>
                        <span>المواد والمحاضرات</span>
                    </div>
                    <span class="elkheta-nav-badge">المنهج</span>
                </a>

                <a href="community.html" class="elkheta-nav-link ${isActive('community.html')}">
                    <div class="elkheta-nav-link-left">
                        <span class="elkheta-nav-icon">💬</span>
                        <span>استفسارات وتساؤلات الطلاب</span>
                    </div>
                    <span class="elkheta-nav-badge new">مباشر ✨</span>
                </a>

                <a href="ai-report.html" class="elkheta-nav-link ${isActive('ai-report.html')}">
                    <div class="elkheta-nav-link-left">
                        <span class="elkheta-nav-icon" style="background: rgba(124, 58, 237, 0.15); color: #7C3AED;">🧠</span>
                        <span>التقرير والتحليل الذكي</span>
                    </div>
                    <span class="elkheta-nav-badge" style="background: linear-gradient(135deg, #A855F7, #6366F1); color: white;">AI ⚡</span>
                </a>

                <a href="leaderboard.html" class="elkheta-nav-link ${isActive('leaderboard.html')}">
                    <div class="elkheta-nav-link-left">
                        <span class="elkheta-nav-icon">🏆</span>
                        <span>أوائل المنصة ولوحة الشرف</span>
                    </div>
                </a>

                <a href="mistakes.html" class="elkheta-nav-link ${isActive('mistakes.html')}">
                    <div class="elkheta-nav-link-left">
                        <span class="elkheta-nav-icon">📝</span>
                        <span>سجل الأسئلة والأخطاء</span>
                    </div>
                </a>

                <div class="elkheta-menu-section-title" style="margin-top:14px;">
                    <span>⚡ تطبيق وأدوات المنصة</span>
                </div>

                <div class="elkheta-nav-link" onclick="if(window.openInstallSheet) window.openInstallSheet(); closeStudentDrawer();" style="background: #F0FDF4; border-color: #BBF7D0; color: #15803D;">
                    <div class="elkheta-nav-link-left">
                        <span class="elkheta-nav-icon" style="background:#10B981; color:white; border-color:#10B981;">📲</span>
                        <span>تثبيت التطبيق على جهازك</span>
                    </div>
                    <span class="elkheta-nav-badge" style="background:#10B981; color:white;">تطبيق ⚡</span>
                </div>

                <a href="profile.html" class="elkheta-nav-link ${isActive('profile.html')}">
                    <div class="elkheta-nav-link-left">
                        <span class="elkheta-nav-icon">👤</span>
                        <span>الملف الشخصي والبيانات</span>
                    </div>
                </a>

                <div class="elkheta-menu-section-title" style="margin-top:14px;">
                    <span>🤝 المساعدة والتواصل</span>
                </div>

                <a href="https://wa.me/201158210358" target="_blank" class="elkheta-nav-link">
                    <div class="elkheta-nav-link-left">
                        <span class="elkheta-nav-icon">📞</span>
                        <span>تواصل مع الدعم الفني</span>
                    </div>
                    <span class="elkheta-nav-badge" style="background:#25D366; color:white;">واتساب</span>
                </a>

                <a href="privacy.html" class="elkheta-nav-link ${isActive('privacy.html')}">
                    <div class="elkheta-nav-link-left">
                        <span class="elkheta-nav-icon">📜</span>
                        <span>سياسة الخصوصية والشروط</span>
                    </div>
                </a>
            </div>

            <div class="elkheta-drawer-footer">
                <button class="elkheta-drawer-logout" onclick="logoutStudent()">
                    <span>🚪</span>
                    <span>تسجيل الخروج من الحساب</span>
                </button>
            </div>
        `;
        document.body.appendChild(drawerEl);
    }

    window.openStudentDrawer = function() {
        buildDrawer();
        const user = getStoredUser();
        const nameEl = document.getElementById('drawerUserName');
        const codeEl = document.getElementById('drawerUserCode');
        const ptsEl = document.getElementById('drawerUserPoints');
        const strkEl = document.getElementById('drawerUserStreak');
        const avEl = document.getElementById('drawerUserAvatar');
        
        if (nameEl) nameEl.textContent = user.fullName || 'طالب منصة الخطة';
        if (codeEl) codeEl.textContent = user.code || user.studentCode || '---';
        if (ptsEl) ptsEl.textContent = user.points || 0;
        if (strkEl) strkEl.textContent = (user.streak || 1) + ' يوم';
        if (avEl) avEl.textContent = (user.fullName || 'ط').trim().charAt(0) || '🎓';

        if (drawerEl) drawerEl.classList.add('active');
        if (overlayEl) overlayEl.classList.add('active');
    };

    window.closeStudentDrawer = function() {
        if (drawerEl) drawerEl.classList.remove('active');
        if (overlayEl) overlayEl.classList.remove('active');
    };

    window.copyStudentCode = function(code) {
        if (!code || code === '---') return;
        navigator.clipboard.writeText(code);
        if (window.showToast) window.showToast(`تم نسخ كود الطالب (${code}) 📋`, 'success');
    };

    window.logoutStudent = async function() {
        let confirmed = false;
        if (window.showCustomConfirm) {
            confirmed = await window.showCustomConfirm('تسجيل الخروج', 'هل أنت متأكد من رغبتك في تسجيل الخروج؟', 'نعم، خروج 🚪', 'إلغاء', true);
        } else {
            confirmed = confirm('هل أنت متأكد من تسجيل الخروج؟');
        }
        if (confirmed) {
            localStorage.removeItem('user');
            localStorage.removeItem('studentCode');
            sessionStorage.clear();
            window.location.href = 'index.html';
        }
    };

    // Auto-bind existing menu buttons
    window.addEventListener('DOMContentLoaded', () => {
        const triggers = ['openDrawer', 'menuBtn', 'btnMenu', 'drawerTrigger'];
        triggers.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.onclick = (e) => {
                    e.preventDefault();
                    window.openStudentDrawer();
                };
            }
        });

        document.querySelectorAll('.open-drawer-btn, [data-action="open-drawer"]').forEach(el => {
            el.onclick = (e) => {
                e.preventDefault();
                window.openStudentDrawer();
            };
        });
    });

})();



    // ==========================================
    // Real-Time Personal Notice & Push Activation
    // ==========================================
    function initPersonalNoticeListener() {
        if (typeof firebase === 'undefined' || !firebase.database) return;
        const user = getStoredUser();
        const code = user.code || localStorage.getItem('studentCode') || localStorage.getItem('userCode');
        if (!code || code === '---') return;

        firebase.database().ref('Students/' + code + '/personalNotice').on('value', snap => {
            const notice = snap.val();
            if (notice && notice.text) {
                renderStudentNoticeModal(notice, code);
            }
        });
    }

    function renderStudentNoticeModal(notice, studentCode) {
        let existing = document.getElementById('studentNoticeModal');
        if (existing) existing.remove();

        const isReminder = Boolean(notice.isPushReminder || notice.text.includes('إشعار') || notice.text.includes('تطبيق'));
        const modal = document.createElement('div');
        modal.id = 'studentNoticeModal';
        modal.style.cssText = 'position: fixed; inset: 0; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(8px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.3s ease;';

        modal.innerHTML = `
            <div style="background: white; width: 100%; max-width: 440px; border-radius: 28px; padding: 30px 24px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3); border: 2px solid ${isReminder ? '#3B82F6' : '#8B5CF6'}; direction: rtl; font-family: 'Cairo', sans-serif;">
                <div style="width: 70px; height: 70px; background: ${isReminder ? 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' : 'linear-gradient(135deg, #F3E8FF, #E9D5FF)'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 32px; box-shadow: 0 8px 20px rgba(0,0,0,0.06);">
                    ${isReminder ? '🔔' : '📩'}
                </div>
                
                <h3 style="font-size: 20px; font-weight: 900; color: #1E293B; margin-bottom: 10px;">
                    ${isReminder ? 'تنبيه تفعيل الإشعارات والتطبيق' : 'رسالة هامة من إدارة المنصة'}
                </h3>
                
                <div style="background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 16px; padding: 16px; margin-bottom: 22px; font-size: 15px; font-weight: 700; color: #334155; line-height: 1.7; text-align: right;">
                    ${notice.text}
                </div>

                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${isReminder ? `
                        <button onclick="window.enablePushFromNotice('${studentCode}')" style="background: linear-gradient(135deg, #2563EB, #1D4ED8); color: white; border: none; padding: 14px 20px; border-radius: 14px; font-weight: 900; font-size: 15px; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 8px 20px rgba(37,99,235,0.35);">
                            <span>🔔 تفعيل الإشعارات فوراً</span>
                        </button>
                        <button onclick="window.showPwaInstallModal && window.showPwaInstallModal(); window.dismissNotice('${studentCode}');" style="background: #F1F5F9; color: #1E293B; border: 1.5px solid #CBD5E1; padding: 12px 20px; border-radius: 14px; font-weight: 800; font-size: 14px; font-family: inherit; cursor: pointer;">
                            <span>📲 تثبيت التطبيق على الجهاز</span>
                        </button>
                    ` : ''}
                    <button onclick="window.dismissNotice('${studentCode}')" style="background: ${isReminder ? 'transparent' : 'linear-gradient(135deg, #10B981, #059669)'}; color: ${isReminder ? '#64748B' : 'white'}; border: none; padding: 12px 20px; border-radius: 14px; font-weight: 800; font-size: 14px; font-family: inherit; cursor: pointer;">
                        ${isReminder ? 'تخطي الآن ✖️' : 'فهمت ذلك ومسح التنبيه ✔️'}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    window.dismissNotice = function(studentCode) {
        if (typeof firebase !== 'undefined' && firebase.database) {
            firebase.database().ref('Students/' + studentCode + '/personalNotice').remove();
        }
        const modal = document.getElementById('studentNoticeModal');
        if (modal) modal.remove();
    };

    window.enablePushFromNotice = function(studentCode) {
        if (!('Notification' in window)) {
            if (window.showToast) showToast('المتصفح لا يدعم الإشعارات', 'warning');
            return;
        }

        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                if (window.showToast) showToast('تم تفعيل الإشعارات بنجاح! 🎉', 'success');
                if (typeof firebase !== 'undefined' && firebase.database) {
                    firebase.database().ref('Students/' + studentCode + '/hasPush').set(true);
                    firebase.database().ref('Students/' + studentCode + '/notificationsEnabled').set(true);
                    firebase.database().ref('Students/' + studentCode + '/personalNotice').remove();
                }
                const modal = document.getElementById('studentNoticeModal');
                if (modal) modal.remove();
            } else {
                if (window.showToast) showToast('يرجى السماح بالإشعارات من إعدادات المتصفح', 'info');
            }
        });
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPersonalNoticeListener);
    } else {
        initPersonalNoticeListener();
    }



    // ==========================================
    // Real-Time Detailed Content Addition Listener (Zero-Refresh Alert)
    // ==========================================
    const pageLoadTime = Date.now();

    function initContentAdditionAnnouncer() {
        if (typeof firebase === 'undefined' || !firebase.database) return;

        firebase.database().ref('Settings/latestAddedContent').on('value', snap => {
            const item = snap.val();
            if (!item || !item.timestamp || item.timestamp <= pageLoadTime) return;

            showContentAdditionToast(item);
        });
    }

    function showContentAdditionToast(item) {
        let existing = document.getElementById('contentAdditionBanner');
        if (existing) existing.remove();

        const banner = document.createElement('div');
        banner.id = 'contentAdditionBanner';
        banner.style.cssText = 'position: fixed; top: 18px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%); color: white; border: 2px solid #818CF8; border-radius: 20px; padding: 14px 20px; box-shadow: 0 20px 40px rgba(67, 56, 202, 0.4); z-index: 9999999; display: flex; align-items: center; gap: 12px; direction: rtl; font-family: "Cairo", sans-serif; max-width: 90vw; cursor: pointer; transition: all 0.3s;';

        const icon = (item.type && item.type.includes('امتحان')) ? '📝' : ((item.type && item.type.includes('مادة')) ? '📚' : '📽️');
        const text = item.message || `تمت إضافة ${item.title || 'محتوى جديد'}`;

        banner.innerHTML = `
            <div style="width: 44px; height: 44px; border-radius: 14px; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">${icon}</div>
            <div style="flex: 1;">
                <div style="font-weight: 900; font-size: 14px; color: #FFFFFF; line-height: 1.5;">${text}</div>
                <div style="font-size: 11px; color: #C7D2FE; font-weight: 700; margin-top: 2px;">اضغط هنا للانتقال للمحتوى مباشرة 🚀</div>
            </div>
            <button onclick="event.stopPropagation(); this.parentElement.remove()" style="background: rgba(255,255,255,0.15); border: none; color: white; width: 26px; height: 26px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; margin-right: 6px;">✕</button>
        `;

        banner.onclick = () => {
            if (item.subject) {
                location.href = `lectures.html?subject=${encodeURIComponent(item.subject)}`;
            } else {
                location.href = 'courses.html';
            }
        };

        document.body.appendChild(banner);

        setTimeout(() => {
            if (banner && banner.parentElement) {
                banner.style.opacity = '0';
                banner.style.transform = 'translateX(-50%) translateY(-20px)';
                setTimeout(() => banner.remove(), 400);
            }
        }, 8000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initContentAdditionAnnouncer);
    } else {
        initContentAdditionAnnouncer();
    }
