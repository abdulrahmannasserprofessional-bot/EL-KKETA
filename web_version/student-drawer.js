/**
 * ELKHETA Modern Unified Student Sidebar / Drawer
 * Full-featured profile header, organized sections, active page indicators & PWA triggers
 */

(function() {
    // Inject Drawer CSS
    const style = document.createElement('style');
    style.innerHTML = `
        /* Drawer Overlay */
        .elkheta-drawer-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(15, 23, 42, 0.65);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 99999;
            opacity: 0; pointer-events: none;
            transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .elkheta-drawer-overlay.active {
            opacity: 1; pointer-events: auto;
        }

        /* Drawer Main Panel */
        .elkheta-drawer {
            position: fixed; top: 0; right: -360px;
            width: 320px; max-width: 85vw; height: 100%;
            background: #FFFFFF;
            z-index: 100000;
            display: flex; flex-direction: column;
            box-shadow: -10px 0 40px rgba(0, 0, 0, 0.2);
            transition: right 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
            font-family: 'Cairo', sans-serif;
            direction: rtl;
            overflow-y: auto;
            border-left: 1px solid #E2E8F0;
        }
        .elkheta-drawer.active {
            right: 0;
        }

        /* Profile Header */
        .elkheta-drawer-header {
            background: linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%);
            color: white;
            padding: 30px 20px 22px;
            position: relative;
            box-shadow: 0 10px 25px rgba(67, 56, 202, 0.2);
        }
        .elkheta-drawer-close {
            position: absolute; top: 18px; left: 18px;
            background: rgba(255, 255, 255, 0.12);
            color: #E2E8F0; border: none; width: 32px; height: 32px;
            border-radius: 50%; font-size: 14px; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.2s;
        }
        .elkheta-drawer-close:hover { background: rgba(255, 255, 255, 0.25); color: white; }

        .elkheta-drawer-user {
            display: flex; align-items: center; gap: 14px; margin-top: 5px;
        }
        .elkheta-drawer-avatar {
            width: 58px; height: 58px;
            border-radius: 20px;
            background: linear-gradient(135deg, #6366F1, #A855F7);
            border: 2.5px solid rgba(255, 255, 255, 0.3);
            display: flex; align-items: center; justify-content: center;
            font-size: 26px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
            flex-shrink: 0;
        }
        .elkheta-drawer-name {
            font-size: 16px; font-weight: 900; color: #FFFFFF;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            max-width: 170px;
        }
        .elkheta-drawer-code-pill {
            display: inline-flex; align-items: center; gap: 6px;
            background: rgba(255, 255, 255, 0.15);
            padding: 3px 10px; border-radius: 10px; font-size: 11px;
            font-weight: 800; color: #E0E7FF; margin-top: 4px;
            cursor: pointer; transition: all 0.2s;
        }
        .elkheta-drawer-code-pill:hover { background: rgba(255, 255, 255, 0.25); }

        /* Stats Bar inside Drawer */
        .elkheta-drawer-stats {
            display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
            margin-top: 16px; padding-top: 14px;
            border-top: 1px solid rgba(255, 255, 255, 0.12);
        }
        .elkheta-drawer-stat-col {
            background: rgba(255, 255, 255, 0.08);
            border-radius: 12px; padding: 6px 10px; text-align: center;
            font-size: 11px; font-weight: 800; color: #C7D2FE;
        }
        .elkheta-drawer-stat-val {
            font-size: 14px; font-weight: 900; color: #FFFFFF; display: block;
        }

        /* Menu Body */
        .elkheta-drawer-body {
            padding: 15px 12px;
            flex: 1;
            overflow-y: auto;
        }
        .elkheta-menu-section-title {
            font-size: 11px; font-weight: 900; color: #94A3B8;
            padding: 8px 12px 4px; text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .elkheta-nav-link {
            display: flex; align-items: center; justify-content: space-between;
            padding: 11px 14px; margin-bottom: 4px;
            border-radius: 14px; text-decoration: none;
            color: #334155; font-size: 14px; font-weight: 800;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
        }
        .elkheta-nav-link:hover {
            background: #F1F5F9; color: #4338CA;
            transform: translateX(-4px);
        }
        .elkheta-nav-link.active {
            background: #EEF2FF; color: #4F46E5;
            font-weight: 900;
        }
        .elkheta-nav-link-left {
            display: flex; align-items: center; gap: 12px;
        }
        .elkheta-nav-icon {
            width: 32px; height: 32px; border-radius: 10px;
            background: #F8FAFC; border: 1px solid #E2E8F0;
            display: flex; align-items: center; justify-content: center;
            font-size: 15px; transition: all 0.2s;
        }
        .elkheta-nav-link.active .elkheta-nav-icon {
            background: #4F46E5; color: white; border-color: #4F46E5;
        }
        .elkheta-nav-badge {
            font-size: 10px; font-weight: 900; padding: 2px 8px;
            border-radius: 8px; background: #F1F5F9; color: #64748B;
        }
        .elkheta-nav-badge.new {
            background: #FEF3C7; color: #B45309;
        }

        /* Drawer Footer */
        .elkheta-drawer-footer {
            padding: 14px 14px 20px;
            border-top: 1px solid #F1F5F9;
            background: #FAFAFA;
        }
        .elkheta-drawer-logout {
            width: 100%;
            background: #FFF1F2;
            color: #E11D48;
            border: 1.5px solid #FFE4E6;
            padding: 12px;
            border-radius: 14px;
            font-size: 14px;
            font-weight: 900;
            font-family: 'Cairo', sans-serif;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .elkheta-drawer-logout:hover {
            background: #FFE4E6;
            transform: translateY(-2px);
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
                // Background lookup from Firebase if available
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

        drawerEl.innerHTML = `
            <div class="elkheta-drawer-header">
                <button class="elkheta-drawer-close" onclick="closeStudentDrawer()">✕</button>
                <div class="elkheta-drawer-user">
                    <div class="elkheta-drawer-avatar">🎓</div>
                    <div>
                        <div class="elkheta-drawer-name" id="drawerUserName">${user.fullName || 'طالب منصة الخطة'}</div>
                        <div class="elkheta-drawer-code-pill" onclick="copyStudentCode('${user.code || ''}')" title="انقر لنسخ الكود">
                            <span>🔑</span>
                            <span id="drawerUserCode">${user.code || '---'}</span>
                            <span style="font-size:10px; opacity:0.8;">📋</span>
                        </div>
                    </div>
                </div>
                <div class="elkheta-drawer-stats">
                    <div class="elkheta-drawer-stat-col">
                        <span>🏆 النقاط</span>
                        <span class="elkheta-drawer-stat-val" id="drawerUserPoints">${user.points || 0}</span>
                    </div>
                    <div class="elkheta-drawer-stat-col">
                        <span>🔥 السلسلة</span>
                        <span class="elkheta-drawer-stat-val" id="drawerUserStreak">${user.streak || 1} يوم</span>
                    </div>
                </div>
            </div>

            <div class="elkheta-drawer-body">
                <div class="elkheta-menu-section-title">مسار التعلم والدراسة 📚</div>

                <a href="home.html" class="elkheta-nav-link ${isActive('home.html')}">
                    <div class="elkheta-nav-link-left">
                        <span class="elkheta-nav-icon">🏠</span>
                        <span>الرئيسية</span>
                    </div>
                </a>

                <a href="courses.html" class="elkheta-nav-link ${isActive('courses.html') || isActive('lectures.html')}">
                    <div class="elkheta-nav-link-left">
                        <span class="elkheta-nav-icon">📚</span>
                        <span>المواد الدراسية</span>
                    </div>
                    <span class="elkheta-nav-badge">الدروس</span>
                </a>

                <a href="map.html" class="elkheta-nav-link ${isActive('map.html')}">
                    <div class="elkheta-nav-link-left">
                        <span class="elkheta-nav-icon">🗺️</span>
                        <span>خريطة المنهج</span>
                    </div>
                </a>

                <a href="planner.html" class="elkheta-nav-link ${isActive('planner.html')}">
                    <div class="elkheta-nav-link-left">
                        <span class="elkheta-nav-icon">📅</span>
                        <span>منظم المذاكرة</span>
                    </div>
                    <span class="elkheta-nav-badge new">مهم ⚡</span>
                </a>

                <a href="mistakes.html" class="elkheta-nav-link ${isActive('mistakes.html')}">
                    <div class="elkheta-nav-link-left">
                        <span class="elkheta-nav-icon">🧠</span>
                        <span>سجل الأسئلة والأخطاء</span>
                    </div>
                </a>

                <a href="leaderboard.html" class="elkheta-nav-link ${isActive('leaderboard.html')}">
                    <div class="elkheta-nav-link-left">
                        <span class="elkheta-nav-icon">🏆</span>
                        <span>أوائل المنصة والتصنيف</span>
                    </div>
                </a>

                <div class="elkheta-menu-section-title" style="margin-top:12px;">أدوات وتطبيق المنصة ⚡</div>

                <div class="elkheta-nav-link" onclick="if(window.openInstallSheet) window.openInstallSheet(); closeStudentDrawer();" style="background:#EEF2FF; color:#4F46E5;">
                    <div class="elkheta-nav-link-left">
                        <span class="elkheta-nav-icon" style="background:#4F46E5; color:white;">📲</span>
                        <span>تثبيت التطبيق على جهازك</span>
                    </div>
                    <span class="elkheta-nav-badge" style="background:#4F46E5; color:white;">تطبيق ⚡</span>
                </div>



                <a href="profile.html" class="elkheta-nav-link ${isActive('profile.html')}">
                    <div class="elkheta-nav-link-left">
                        <span class="elkheta-nav-icon">👤</span>
                        <span>حسابي والبيانات</span>
                    </div>
                </a>

                <div class="elkheta-menu-section-title" style="margin-top:12px;">المساعدة والتواصل 🤝</div>

                <a href="https://chat.whatsapp.com/DkMNxi1wDq3APscsSGBoFn" target="_blank" class="elkheta-nav-link">
                    <div class="elkheta-nav-link-left">
                        <span class="elkheta-nav-icon">💬</span>
                        <span>جروب استفسارات الواتساب</span>
                    </div>
                </a>

                <a href="https://wa.me/201158210358" target="_blank" class="elkheta-nav-link">
                    <div class="elkheta-nav-link-left">
                        <span class="elkheta-nav-icon">📞</span>
                        <span>تواصل مع الدعم الفني</span>
                    </div>
                </a>

                <a href="privacy.html" class="elkheta-nav-link ${isActive('privacy.html')}">
                    <div class="elkheta-nav-link-left">
                        <span class="elkheta-nav-icon">📜</span>
                        <span>سياسة الخصوصية</span>
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
        if (nameEl) nameEl.textContent = user.fullName || 'طالب منصة الخطة';
        if (codeEl) codeEl.textContent = user.code || '---';
        if (ptsEl) ptsEl.textContent = user.points || 0;
        if (strkEl) strkEl.textContent = (user.streak || 1) + ' يوم';

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

        // Also bind any .drawer-trigger or .icon-btn with burger icon
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
