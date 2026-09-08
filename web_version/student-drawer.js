/**
 * ELKHETA Ultra-Modern VIP Student Sidebar / Drawer
 * Luxury Glassmorphism Design, Batch 2027 Branding, Gamification Stats & Quick Utilities
 */

(function() {
    // Inject Ultra-Modern Drawer CSS
    const style = document.createElement('style');
    style.innerHTML = `
        /* Drawer Overlay */
        .elkheta-drawer-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(11, 17, 32, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            z-index: 99999;
            opacity: 0; pointer-events: none;
            transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .elkheta-drawer-overlay.active {
            opacity: 1; pointer-events: auto;
        }

        /* Drawer Main Panel */
        .elkheta-drawer {
            position: fixed; top: 0; right: -380px;
            width: 325px; max-width: 86vw; height: 100%;
            background: #FFFFFF;
            z-index: 100000;
            display: flex; flex-direction: column;
            box-shadow: -20px 0 60px rgba(11, 17, 32, 0.35);
            transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            font-family: 'Cairo', sans-serif;
            direction: rtl;
            border-left: 1px solid rgba(226, 232, 240, 0.8);
            border-radius: 28px 0 0 28px;
            overflow: hidden;
            box-sizing: border-box;
        }
        .elkheta-drawer.active {
            right: 0;
        }

        body.dark-theme .elkheta-drawer {
            background: #0F172A;
            border-left-color: #334155;
            box-shadow: -20px 0 60px rgba(0, 0, 0, 0.6);
        }

        /* VIP Profile Header */
        .elkheta-drawer-header {
            background: linear-gradient(135deg, #090D16 0%, #0F172A 30%, #1E3A8A 75%, #2563EB 100%);
            color: white;
            padding: 26px 18px 18px;
            position: relative;
            box-shadow: 0 12px 30px rgba(30, 58, 138, 0.35);
            overflow: hidden;
            flex-shrink: 0;
        }
        .elkheta-drawer-header::before {
            content: '';
            position: absolute;
            width: 220px; height: 220px;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, transparent 70%);
            top: -70px; left: -50px;
            border-radius: 50%;
            pointer-events: none;
        }
        .elkheta-drawer-header::after {
            content: '';
            position: absolute;
            width: 140px; height: 140px;
            background: radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%);
            bottom: -40px; right: -20px;
            border-radius: 50%;
            pointer-events: none;
        }

        .elkheta-drawer-close {
            position: absolute; top: 14px; left: 14px;
            background: rgba(255, 255, 255, 0.12);
            backdrop-filter: blur(8px);
            color: #E2E8F0; border: 1px solid rgba(255, 255, 255, 0.2);
            width: 32px; height: 32px;
            border-radius: 50%; font-size: 13px; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 5;
        }
        .elkheta-drawer-close:hover { 
            background: rgba(239, 68, 68, 0.9); 
            border-color: #EF4444; 
            color: white; 
            transform: scale(1.1) rotate(90deg); 
        }

        .elkheta-drawer-user {
            display: flex; align-items: center; gap: 14px; position: relative; z-index: 2;
        }
        .elkheta-avatar-wrap {
            position: relative;
            flex-shrink: 0;
        }
        .elkheta-drawer-avatar {
            width: 60px; height: 60px;
            border-radius: 20px;
            background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 50%, #1E1B4B 100%);
            border: 2.5px solid #F59E0B;
            display: flex; align-items: center; justify-content: center;
            font-size: 24px; font-weight: 900; color: white;
            box-shadow: 0 0 25px rgba(245, 158, 11, 0.4), 0 8px 20px rgba(0,0,0,0.3);
        }
        .elkheta-avatar-badge {
            position: absolute;
            bottom: -3px; right: -3px;
            background: #10B981;
            width: 16px; height: 16px;
            border-radius: 50%;
            border: 2.5px solid #0F172A;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.8);
        }

        .elkheta-drawer-info {
            flex: 1; min-width: 0;
        }
        .elkheta-drawer-name {
            font-size: 16px; font-weight: 900; color: #FFFFFF;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            line-height: 1.3;
            letter-spacing: -0.2px;
        }
        .elkheta-drawer-stage {
            display: inline-flex;
            align-items: center; gap: 5px;
            background: rgba(255, 255, 255, 0.12);
            backdrop-filter: blur(6px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 2px 8px; border-radius: 8px;
            font-size: 10.5px; font-weight: 800; color: #BFDBFE; margin-top: 4px;
        }
        .elkheta-drawer-code-pill {
            display: inline-flex; align-items: center; gap: 6px;
            background: rgba(245, 158, 11, 0.15);
            backdrop-filter: blur(6px);
            border: 1px solid rgba(245, 158, 11, 0.4);
            padding: 3px 10px; border-radius: 10px; font-size: 11px;
            font-weight: 900; color: #FEF3C7; margin-top: 6px;
            cursor: pointer; transition: all 0.2s;
        }
        .elkheta-drawer-code-pill:hover { 
            background: rgba(245, 158, 11, 0.35); 
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
        }

        /* Triple Stats Bar */
        .elkheta-drawer-stats {
            display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;
            margin-top: 14px; padding-top: 12px;
            border-top: 1px solid rgba(255, 255, 255, 0.12);
            position: relative; z-index: 2;
        }
        .elkheta-drawer-stat-col {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.12);
            backdrop-filter: blur(6px);
            border-radius: 12px; padding: 6px 4px; text-align: center;
        }
        .elkheta-stat-label {
            font-size: 9.5px; font-weight: 800; color: #93C5FD; display: block;
        }
        .elkheta-drawer-stat-val {
            font-size: 13px; font-weight: 900; color: #FFFFFF; display: block; margin-top: 1px;
        }

        /* Quick Utility Strip */
        .elkheta-quick-strip {
            display: flex; gap: 8px;
            padding: 10px 14px;
            background: #F1F5F9;
            border-bottom: 1px solid #E2E8F0;
        }
        body.dark-theme .elkheta-quick-strip {
            background: #1E293B;
            border-color: #334155;
        }
        .elkheta-quick-btn {
            flex: 1;
            display: flex; align-items: center; justify-content: center; gap: 6px;
            background: #FFFFFF;
            border: 1px solid #CBD5E1;
            border-radius: 10px;
            padding: 6px 10px;
            font-size: 11.5px; font-weight: 800;
            color: #334155;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
        }
        body.dark-theme .elkheta-quick-btn {
            background: #0F172A;
            border-color: #334155;
            color: #E2E8F0;
        }
        .elkheta-quick-btn:hover {
            border-color: #2563EB;
            color: #2563EB;
            transform: translateY(-1px);
        }

        /* Menu Body */
        .elkheta-drawer-body {
            padding: 14px 12px 20px;
            flex: 1;
            overflow-y: auto;
            background: #F8FAFC;
        }
        body.dark-theme .elkheta-drawer-body {
            background: #0F172A;
        }
        .elkheta-drawer-body::-webkit-scrollbar {
            width: 4px;
        }
        .elkheta-drawer-body::-webkit-scrollbar-thumb {
            background: #CBD5E1;
            border-radius: 4px;
        }
        body.dark-theme .elkheta-drawer-body::-webkit-scrollbar-thumb {
            background: #334155;
        }

        .elkheta-menu-section-title {
            font-size: 10.5px; font-weight: 900; color: #64748B;
            padding: 8px 8px 4px; text-transform: uppercase;
            letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px;
        }
        body.dark-theme .elkheta-menu-section-title {
            color: #94A3B8;
        }
        .elkheta-menu-section-title::before {
            content: '•';
            color: #2563EB;
            font-size: 16px;
            line-height: 0;
        }

        /* Luxury Nav Cards */
        .elkheta-nav-card {
            display: flex; align-items: center; justify-content: space-between;
            padding: 9px 12px; margin-bottom: 6px;
            border-radius: 14px; text-decoration: none;
            background: #FFFFFF;
            border: 1.5px solid #E2E8F0;
            color: #1E293B;
            transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
            position: relative;
        }
        body.dark-theme .elkheta-nav-card {
            background: #1E293B;
            border-color: #334155;
            color: #F8FAFC;
        }
        .elkheta-nav-card:hover {
            background: #EEF2FF;
            border-color: #93C5FD;
            transform: translateX(-4px);
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.12);
        }
        body.dark-theme .elkheta-nav-card:hover {
            background: #1E1B4B;
            border-color: #4F46E5;
        }
        .elkheta-nav-card.active {
            background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
            border-color: #3B82F6;
            box-shadow: 0 4px 15px rgba(37, 99, 235, 0.15);
        }
        body.dark-theme .elkheta-nav-card.active {
            background: linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(30, 58, 138, 0.3) 100%);
            border-color: #60A5FA;
        }

        .elkheta-nav-card-left {
            display: flex; align-items: center; gap: 10px;
            min-width: 0;
        }
        .elkheta-nav-icon-box {
            width: 36px; height: 36px; border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            font-size: 16px; transition: all 0.2s;
            flex-shrink: 0;
            color: white;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
        }
        .elkheta-nav-card-texts {
            display: flex; flex-direction: column;
            min-width: 0;
        }
        .elkheta-nav-title {
            font-size: 13px; font-weight: 900;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .elkheta-nav-subtitle {
            font-size: 10px; font-weight: 600; color: #64748B;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            margin-top: 1px;
        }
        body.dark-theme .elkheta-nav-subtitle {
            color: #94A3B8;
        }

        .elkheta-nav-badge-pill {
            font-size: 9.5px; font-weight: 900; padding: 2px 7px;
            border-radius: 6px; flex-shrink: 0; margin-right: 4px;
        }
        .badge-blue { background: #EEF2FF; color: #2563EB; border: 1px solid #BFDBFE; }
        .badge-emerald { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
        .badge-amber { background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A; }
        .badge-purple { background: #F3E8FF; color: #7E22CE; border: 1px solid #E9D5FF; }

        /* Drawer Footer */
        .elkheta-drawer-footer {
            padding: 12px 14px 16px;
            border-top: 1px solid #E2E8F0;
            background: #FFFFFF;
            flex-shrink: 0;
            display: flex; flex-direction: column; gap: 8px;
        }
        body.dark-theme .elkheta-drawer-footer {
            background: #0F172A;
            border-color: #334155;
        }
        .elkheta-drawer-logout {
            width: 100%;
            background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
            color: #DC2626;
            border: 1.5px solid #FECACA;
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 900;
            font-family: 'Cairo', sans-serif;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }
        body.dark-theme .elkheta-drawer-logout {
            background: rgba(220, 38, 38, 0.15);
            border-color: rgba(220, 38, 38, 0.3);
            color: #F87171;
        }
        .elkheta-drawer-logout:hover {
            background: #FEE2E2;
            border-color: #F87171;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
        }

        .elkheta-footer-watermark {
            font-size: 10px;
            color: #94A3B8;
            text-align: center;
            font-weight: 700;
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

    function toggleAppTheme() {
        const isDark = document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        const themeBtn = document.getElementById('drawerThemeBtn');
        if (themeBtn) {
            themeBtn.innerHTML = isDark ? '☀️ نهاري' : '🌙 ليلي';
        }
        if (window.showToast) {
            window.showToast(isDark ? 'تم تفعيل الوضع الليلي 🌙' : 'تم تفعيل الوضع النهاري ☀️', 'info');
        }
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
        const isDark = document.body.classList.contains('dark-theme') || localStorage.getItem('theme') === 'dark';



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
