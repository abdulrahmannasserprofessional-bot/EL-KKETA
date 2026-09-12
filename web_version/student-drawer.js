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
            position: fixed; inset: 0;
            background: rgba(11, 17, 32, 0.7);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            z-index: 999998;
            opacity: 0; pointer-events: none;
            transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .elkheta-drawer-overlay.active {
            opacity: 1; pointer-events: auto;
        }

        /* Drawer Main Panel */
        .elkheta-drawer {
            position: fixed; top: 0; right: -380px;
            width: 325px; max-width: 86vw;
            height: 100vh; height: 100dvh; max-height: 100vh;
            background: #FFFFFF;
            z-index: 999999;
            display: flex; flex-direction: column;
            box-shadow: -20px 0 60px rgba(11, 17, 32, 0.35);
            transition: right 0.38s cubic-bezier(0.16, 1, 0.3, 1);
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

        /* VIP Profile Header — Compact & Responsive */
        .elkheta-drawer-header {
            background: linear-gradient(135deg, #090D16 0%, #0F172A 30%, #1E3A8A 75%, #2563EB 100%);
            color: white;
            padding: 18px 16px 14px;
            position: relative;
            box-shadow: 0 8px 24px rgba(30, 58, 138, 0.3);
            overflow: hidden;
            flex-shrink: 0;
        }
        .elkheta-drawer-header::before {
            content: '';
            position: absolute;
            width: 180px; height: 180px;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
            top: -60px; left: -40px;
            border-radius: 50%;
            pointer-events: none;
        }
        .elkheta-drawer-header::after {
            content: '';
            position: absolute;
            width: 120px; height: 120px;
            background: radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%);
            bottom: -30px; right: -15px;
            border-radius: 50%;
            pointer-events: none;
        }

        .elkheta-drawer-close {
            position: absolute; top: 14px; left: 14px;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(8px);
            color: #E2E8F0; border: 1px solid rgba(255, 255, 255, 0.25);
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
            display: flex; align-items: center; gap: 12px; position: relative; z-index: 2;
        }
        .elkheta-avatar-wrap {
            position: relative;
            flex-shrink: 0;
        }
        .elkheta-drawer-avatar {
            width: 48px; height: 48px;
            border-radius: 16px;
            background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 50%, #1E1B4B 100%);
            border: 2px solid #F59E0B;
            display: flex; align-items: center; justify-content: center;
            font-size: 20px; font-weight: 900; color: white;
            box-shadow: 0 0 18px rgba(245, 158, 11, 0.35);
        }
        .elkheta-avatar-badge {
            position: absolute;
            bottom: -2px; right: -2px;
            background: #10B981;
            width: 13px; height: 13px;
            border-radius: 50%;
            border: 2px solid #0F172A;
            box-shadow: 0 0 8px #10B981;
        }

        .elkheta-drawer-info {
            flex: 1; min-width: 0;
        }
        .elkheta-drawer-name {
            font-size: 15px; font-weight: 900; color: #FFFFFF;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            line-height: 1.2;
        }
        .elkheta-drawer-stage {
            display: inline-flex;
            align-items: center; gap: 4px;
            background: rgba(255, 255, 255, 0.12);
            backdrop-filter: blur(6px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 2px 8px; border-radius: 8px;
            font-size: 10px; font-weight: 800; color: #BFDBFE; margin-top: 3px;
        }
        .elkheta-drawer-code-pill {
            display: inline-flex; align-items: center; gap: 4px;
            background: rgba(245, 158, 11, 0.15);
            backdrop-filter: blur(6px);
            border: 1px solid rgba(245, 158, 11, 0.4);
            padding: 2px 8px; border-radius: 8px; font-size: 11px;
            font-weight: 900; color: #FEF3C7; margin-top: 4px;
            cursor: pointer; transition: all 0.2s;
        }
        .elkheta-drawer-code-pill:hover { 
            background: rgba(245, 158, 11, 0.35); 
            transform: translateY(-1px);
        }

        /* Triple Stats Bar */
        .elkheta-drawer-stats {
            display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;
            margin-top: 12px; padding-top: 10px;
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
            font-size: 12px; font-weight: 900; color: #FFFFFF; display: block; margin-top: 2px;
        }

        /* Quick Utility Strip */
        .elkheta-quick-strip {
            display: flex; gap: 6px;
            padding: 8px 12px;
            background: #F1F5F9;
            border-bottom: 1px solid #E2E8F0;
            flex-shrink: 0;
        }
        body.dark-theme .elkheta-quick-strip {
            background: #1E293B;
            border-color: #334155;
        }
        .elkheta-quick-btn {
            flex: 1;
            display: flex; align-items: center; justify-content: center; gap: 4px;
            background: #FFFFFF;
            border: 1px solid #CBD5E1;
            border-radius: 10px;
            padding: 6px 8px;
            font-size: 11px; font-weight: 800;
            color: #334155;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
            text-decoration: none;
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

        /* Menu Body with Smooth Scrollbar */
        .elkheta-drawer-body {
            padding: 12px 12px 30px;
            flex: 1 1 0px !important;
            min-height: 0 !important;
            max-height: 100% !important;
            overflow-y: auto !important;
            overflow-x: hidden;
            -webkit-overflow-scrolling: touch;
            touch-action: pan-y;
            overscroll-behavior: contain;
            background: #F8FAFC;
        }
        body.dark-theme .elkheta-drawer-body {
            background: #0F172A;
        }
        .elkheta-drawer-body::-webkit-scrollbar {
            width: 6px !important;
            display: block !important;
        }
        .elkheta-drawer-body::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.03);
        }
        .elkheta-drawer-body::-webkit-scrollbar-thumb {
            background: rgba(99, 102, 241, 0.35);
            border-radius: 10px;
        }
        .elkheta-drawer-body::-webkit-scrollbar-thumb:hover {
            background: rgba(99, 102, 241, 0.7);
        }

        .elkheta-menu-section-title {
            font-size: 11px; font-weight: 900; color: #64748B;
            padding: 10px 8px 4px; text-transform: uppercase;
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
            padding: 10px 12px; margin-bottom: 6px;
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
            width: 38px; height: 38px; border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            font-size: 17px; transition: all 0.2s;
            flex-shrink: 0;
            color: white;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
        }
        .elkheta-nav-card-texts {
            display: flex; flex-direction: column;
            min-width: 0;
        }
        .elkheta-nav-title {
            font-size: 13.5px; font-weight: 900;
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
            font-size: 10.5px;
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

        drawerEl.innerHTML = `
            <!-- VIP Header -->
            <div class="elkheta-drawer-header">
                <button type="button" class="elkheta-drawer-close" onclick="closeStudentDrawer()" title="إغلاق القائمة">✕</button>
                <div class="elkheta-drawer-user">
                    <div class="elkheta-avatar-wrap">
                        <div class="elkheta-drawer-avatar">${initial}</div>
                        <div class="elkheta-avatar-badge" title="متصل الآن"></div>
                    </div>
                    <div class="elkheta-drawer-info">
                        <div class="elkheta-drawer-name" id="_drawer_name"></div>
                        <div class="elkheta-drawer-code-pill" onclick="copyDrawerStudentCode()" title="اضغط لنسخ الكود الخاص بك">
                            <span>🔑</span>
                            <span id="drawerUserCode"></span>
                            <span style="font-size: 9px; opacity: 0.7;">📋</span>
                        </div>
                        <div class="elkheta-drawer-stage">الفرقة الرابعة • خدمة اجتماعية 2027 🎓</div>
                    </div>
                </div>

                <!-- Triple KPIs -->
                <div class="elkheta-drawer-stats">
                    <div class="elkheta-drawer-stat-col">
                        <span class="elkheta-stat-label">⭐ النقاط</span>
                        <span class="elkheta-drawer-stat-val">${user.points || 0}</span>
                    </div>
                    <div class="elkheta-drawer-stat-col">
                        <span class="elkheta-stat-label">🔥 الالتزام</span>
                        <span class="elkheta-drawer-stat-val">${user.streak || 1} أيام</span>
                    </div>
                    <div class="elkheta-drawer-stat-col">
                        <span class="elkheta-stat-label">🏆 المستوى</span>
                        <span class="elkheta-drawer-stat-val">لفل ${user.level || 1}</span>
                    </div>
                </div>
            </div>

            <!-- Quick Utility Strip -->
            <div class="elkheta-quick-strip">
                <button type="button" class="elkheta-quick-btn" id="drawerThemeBtn" onclick="toggleDrawerTheme()">
                    ${isDark ? '☀️ نهاري' : '🌙 ليلي'}
                </button>
                <button type="button" class="elkheta-quick-btn" onclick="window.showPwaInstallModal && window.showPwaInstallModal()">
                    📲 التطبيق
                </button>
                <a href="ai-report.html" class="elkheta-quick-btn">
                    🧠 تقريري
                </a>
            </div>

            <!-- Menu Body -->
            <div class="elkheta-drawer-body">
                <!-- Section 1: التعليم والمحاضرات -->
                <div class="elkheta-menu-section-title">المحتوى الأكاديمي والتعلم</div>

                <a href="home.html" class="elkheta-nav-card ${isActive('home.html')}">
                    <div class="elkheta-nav-card-left">
                        <div class="elkheta-nav-icon-box" style="background: linear-gradient(135deg, #2563EB, #1D4ED8);">🏠</div>
                        <div class="elkheta-nav-card-texts">
                            <span class="elkheta-nav-title">الرئيسية</span>
                            <span class="elkheta-nav-subtitle">نظرة عامة والدروس الحالية</span>
                        </div>
                    </div>
                </a>

                <a href="courses.html" class="elkheta-nav-card ${isActive('courses.html')}">
                    <div class="elkheta-nav-card-left">
                        <div class="elkheta-nav-icon-box" style="background: linear-gradient(135deg, #7C3AED, #9333EA);">📚</div>
                        <div class="elkheta-nav-card-texts">
                            <span class="elkheta-nav-title">المواد والمقررات</span>
                            <span class="elkheta-nav-subtitle">محاضرات وبنوك أسئلة 2027</span>
                        </div>
                    </div>
                    <span class="elkheta-nav-badge-pill badge-purple">دفعة 2027</span>
                </a>

                <a href="planner.html" class="elkheta-nav-card ${isActive('planner.html')}">
                    <div class="elkheta-nav-card-left">
                        <div class="elkheta-nav-icon-box" style="background: linear-gradient(135deg, #059669, #10B981);">📅</div>
                        <div class="elkheta-nav-card-texts">
                            <span class="elkheta-nav-title">الخطة الدراسية وجدول المذاكرة</span>
                            <span class="elkheta-nav-subtitle">تنظيم الوقت وجدول المحاضرات</span>
                        </div>
                    </div>
                </a>

                <a href="map.html" class="elkheta-nav-card ${isActive('map.html')}">
                    <div class="elkheta-nav-card-left">
                        <div class="elkheta-nav-icon-box" style="background: linear-gradient(135deg, #0284C7, #0EA5E9);">🗺️</div>
                        <div class="elkheta-nav-card-texts">
                            <span class="elkheta-nav-title">المراكز وقاعات الشرح</span>
                            <span class="elkheta-nav-subtitle">عناوين السناتر والخرائط</span>
                        </div>
                    </div>
                </a>

                <!-- Section 2: التفاعل والذكاء والتقييم -->
                <div class="elkheta-menu-section-title" style="margin-top: 10px;">التفاعل والتقييم والذكاء</div>

                <a href="community.html" class="elkheta-nav-card ${isActive('community.html')}">
                    <div class="elkheta-nav-card-left">
                        <div class="elkheta-nav-icon-box" style="background: linear-gradient(135deg, #D97706, #F59E0B);">💬</div>
                        <div class="elkheta-nav-card-texts">
                            <span class="elkheta-nav-title">مجتمع واستفسارات الطلاب</span>
                            <span class="elkheta-nav-subtitle">اطرح سؤالك لدكاترة ومعيدي المادة</span>
                        </div>
                    </div>
                    <span class="elkheta-nav-badge-pill badge-amber">مباشر ⚡</span>
                </a>

                <a href="leaderboard.html" class="elkheta-nav-card ${isActive('leaderboard.html')}">
                    <div class="elkheta-nav-card-left">
                        <div class="elkheta-nav-icon-box" style="background: linear-gradient(135deg, #EA580C, #F97316);">🏆</div>
                        <div class="elkheta-nav-card-texts">
                            <span class="elkheta-nav-title">لوحة الأوائل والمتفوقين</span>
                            <span class="elkheta-nav-subtitle">ترتيب أبطال الدفعة أسبوعياً</span>
                        </div>
                    </div>
                    <span class="elkheta-nav-badge-pill badge-emerald">VIP</span>
                </a>

                <a href="mistakes.html" class="elkheta-nav-card ${isActive('mistakes.html')}">
                    <div class="elkheta-nav-card-left">
                        <div class="elkheta-nav-icon-box" style="background: linear-gradient(135deg, #DC2626, #EF4444);">🎯</div>
                        <div class="elkheta-nav-card-texts">
                            <span class="elkheta-nav-title">بنك أخطائي ومراجعاتي</span>
                            <span class="elkheta-nav-subtitle">إعادة حل وتثبيت النقاط الصعبة</span>
                        </div>
                    </div>
                </a>

                <a href="offline.html" class="elkheta-nav-card ${isActive('offline.html')}">
                    <div class="elkheta-nav-card-left">
                        <div class="elkheta-nav-icon-box" style="background: linear-gradient(135deg, #475569, #64748B);">⚡</div>
                        <div class="elkheta-nav-card-texts">
                            <span class="elkheta-nav-title">وضع بدون إنترنت</span>
                            <span class="elkheta-nav-subtitle">المحاضرات والملخصات المحفوظة</span>
                        </div>
                    </div>
                </a>

                <!-- Section 3: الحساب الشخصي -->
                <div class="elkheta-menu-section-title" style="margin-top: 10px;">إعدادات الحساب والدعم</div>

                <a href="profile.html" class="elkheta-nav-card ${isActive('profile.html')}">
                    <div class="elkheta-nav-card-left">
                        <div class="elkheta-nav-icon-box" style="background: linear-gradient(135deg, #0D9488, #14B8A6);">👤</div>
                        <div class="elkheta-nav-card-texts">
                            <span class="elkheta-nav-title">الملف الشخصي والبيانات</span>
                            <span class="elkheta-nav-subtitle">تعديل الاسم ورقم الهاتف والمستوى</span>
                        </div>
                    </div>
                </a>


            </div>

            <!-- Footer -->
            <div class="elkheta-drawer-footer">
                <button type="button" class="elkheta-drawer-logout" onclick="drawerLogout()">
                    <span>🚪 تسجيل الخروج</span>
                </button>
                <div class="elkheta-footer-watermark">
                    منصة الخطة التعليمية • دفعة 2027 🎓
                </div>
            </div>
        `;

        // Safe DOM insertion
        const nameEl = drawerEl.querySelector('#_drawer_name');
        if (nameEl) nameEl.textContent = user.fullName || 'طالب منصة الخطة';
        const codeEl = drawerEl.querySelector('#drawerUserCode');
        if (codeEl) codeEl.textContent = user.code || '---';

        document.body.appendChild(drawerEl);
    }

    window.toggleStudentDrawer = function() {
        if (!drawerEl) buildDrawer();
        if (drawerEl.classList.contains('active')) {
            closeStudentDrawer();
        } else {
            openStudentDrawer();
        }
    };

    window.openStudentDrawer = function() {
        if (!drawerEl) buildDrawer();
        overlayEl.classList.add('active');
        drawerEl.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeStudentDrawer = function() {
        if (drawerEl) drawerEl.classList.remove('active');
        if (overlayEl) overlayEl.classList.remove('active');
        document.body.style.overflow = '';
    };

    window.toggleDrawerTheme = function() {
        toggleAppTheme();
    };

    window.copyDrawerStudentCode = function() {
        const user = getStoredUser();
        const code = user.code || localStorage.getItem('studentCode') || '';
        if (code && code !== '---') {
            navigator.clipboard.writeText(code).then(() => {
                if (window.showToast) {
                    window.showToast(`تم نسخ الكود: ${code} بنجاح 📋`, 'success');
                } else {
                    alert(`تم نسخ كود الدخول: ${code}`);
                }
            }).catch(() => {});
        }
    };

    window.drawerLogout = function() {
        if (window.confirmLogout) {
            window.confirmLogout();
        } else if (window.Swal) {
            Swal.fire({
                title: 'تسجيل الخروج',
                text: 'هل أنت متأكد من رغبتك في تسجيل الخروج من المنصة؟',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#EF4444',
                cancelButtonColor: '#64748B',
                confirmButtonText: 'نعم، تسجيل الخروج',
                cancelButtonText: 'إلغاء'
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = 'index.html';
                }
            });
        } else {
            if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = 'index.html';
            }
        }
    };

    // Auto attach click triggers to all hamburger buttons
    function attachDrawerTriggers() {
        buildDrawer();
        document.querySelectorAll('#openDrawer, .menu-btn, .header-menu-btn, [data-action="open-drawer"], .drawer-toggle-btn, .btn-top-icon#openDrawer').forEach(btn => {
            btn.onclick = (e) => {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                if (window.openStudentDrawer) {
                    window.openStudentDrawer();
                } else if (window.toggleStudentDrawer) {
                    window.toggleStudentDrawer();
                }
            };
        });
    }

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

    // ==========================================
    // Real-Time Detailed Content Addition Listener
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
        document.addEventListener('DOMContentLoaded', () => {
            attachDrawerTriggers();
            initPersonalNoticeListener();
            initContentAdditionAnnouncer();
        });
    } else {
        attachDrawerTriggers();
        initPersonalNoticeListener();
        initContentAdditionAnnouncer();
    }
})();
