// ملف إعدادات Firebase الموحد لنسخة الويب
const firebaseConfig = {
    apiKey: "AIzaSyBMuMzSDklOoE5dfjirxKJaw2m5ru-TkP8",
    authDomain: "elkhotta.firebaseapp.com",
    databaseURL: "https://elkhotta-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "elkhotta",
    storageBucket: "elkhotta.firebasestorage.app",
    messagingSenderId: "458941220534",
    appId: "1:458941220534:web:6e18f2f2118335f608817"
};

// تهيئة Firebase
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
if (typeof firebase !== 'undefined') {
    window.database = firebase.database();
    var database = window.database;
}

// Global Theme & Helper Protection
window.savedTheme = localStorage.getItem('admin_theme') || 'light';
if (typeof window.updateThemeIcon !== 'function') {
    window.updateThemeIcon = function(t) {
        const icon = document.getElementById('themeIcon');
        if (icon) icon.className = (t === 'dark') ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    };
}

// ─── Universal Instant Realtime Maintenance Guard (All Screens & Entry Links) ───
(function initUniversalMaintenanceGuard() {
    try {
        const rawPath = window.location.pathname.toLowerCase();
        const page = rawPath.split('/').pop().split('?')[0].split('#')[0] || 'index.html';

        // Never redirect maintenance screen itself or admin management screens
        if (page === 'maintenance.html' || page.startsWith('admin') || page === 'admin-gate.html' || 
            page === 'admin-panel.html' || page === 'admin-config.html' || page === 'admin-maintenance.html') {
            return;
        }

        // Fast Local Cache Check
        if (localStorage.getItem('elkheta_maintenance_mode') === 'true') {
            window.location.replace('maintenance.html');
            return;
        }

        if (window.database) {
            function handleMaintenanceState(isMaint) {
                if (isMaint === true) {
                    localStorage.setItem('elkheta_maintenance_mode', 'true');
                    const curPage = window.location.pathname.toLowerCase().split('/').pop().split('?')[0].split('#')[0] || 'index.html';
                    if (curPage !== 'maintenance.html' && !curPage.startsWith('admin')) {
                        window.location.replace('maintenance.html');
                    }
                } else {
                    localStorage.removeItem('elkheta_maintenance_mode');
                }
            }

            // Realtime Listener on PlatformSettings/maintenanceMode
            window.database.ref('PlatformSettings/maintenanceMode').on('value', function(snap) {
                if (snap.exists()) {
                    handleMaintenanceState(snap.val() === true);
                }
            });

            // Realtime Fallback on Settings/maintenance
            window.database.ref('Settings/maintenance').on('value', function(snap) {
                if (snap.exists()) {
                    handleMaintenanceState(snap.val() === true);
                }
            });
        }
    } catch(e) {}
})();


// ─── Universal Mobile Navigation Engine (Bottom Dock, Drawer & Hamburger) ───
function initUniversalMobileNav() {
    try {
        const rawPath = window.location.pathname.toLowerCase();
        const page = rawPath.split('/').pop().split('?')[0].split('#')[0] || 'index.html';

        // Determine page type
        const studentPages = [
            'home.html', 'courses.html', 'lectures.html', 'profile.html', 
            'leaderboard.html', 'mistakes.html', 'planner.html', 'notifications.html', 
            'chat.html', 'community.html', 'notes-viewer.html', 'quiz.html'
        ];

        const isAdminPage = page.startsWith('admin-') && page !== 'admin-gate.html';
        const isStudentPage = studentPages.includes(page);

        if (!isStudentPage && !isAdminPage) {
            return;
        }

        // Inject Drawer CSS Guard (Hidden on desktop, sliding drawer on mobile)
        if (!document.getElementById('mobileInjectedDrawerStyles')) {
            const style = document.createElement('style');
            style.id = 'mobileInjectedDrawerStyles';
            style.textContent = `
                .mobile-injected-sidebar {
                    display: none !important;
                }
                @media (max-width: 992px) {
                    .mobile-injected-sidebar {
                        display: flex !important;
                        position: fixed !important;
                        top: 0 !important;
                        right: -340px !important;
                        left: auto !important;
                        width: 290px !important;
                        max-width: 85vw !important;
                        height: 100vh !important;
                        height: 100dvh !important;
                        z-index: 999999 !important;
                        background: #FFFFFF !important;
                        box-shadow: -8px 0 35px rgba(0, 0, 0, 0.25) !important;
                        transition: right 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
                        flex-direction: column !important;
                        padding: 20px 16px !important;
                        box-sizing: border-box !important;
                        overflow-y: auto !important;
                    }
                    .mobile-injected-sidebar.mobile-open,
                    .mobile-injected-sidebar.show-mobile {
                        right: 0 !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // 1. Create Drawer Backdrop if not exists
        let backdrop = document.getElementById('mobileDrawerBackdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.id = 'mobileDrawerBackdrop';
            backdrop.className = 'mobile-drawer-backdrop';
            document.body.appendChild(backdrop);
        }

        let sidebar = document.querySelector('.student-sidebar') || 
                        document.querySelector('.dashboard-sidebar') || 
                        document.querySelector('.admin-sidebar') || 
                        document.querySelector('aside.sidebar');

        // Dynamically inject sidebar drawer if not present in the HTML
        if (!sidebar) {
            sidebar = document.createElement('aside');
            if (isAdminPage) {
                sidebar.className = 'dashboard-sidebar admin-sidebar mobile-injected-sidebar';
                sidebar.id = 'mobileAdminDrawer';

                const adminNavLinks = [
                    { href: 'admin-panel.html', title: 'لوحة التحكم الرئيسية', icon: 'fa-solid fa-house' },
                    { href: 'admin-students.html', title: 'إدارة الطلاب والاشتراكات', icon: 'fa-solid fa-users' },
                    { href: 'admin-courses.html', title: 'إدارة المواد الدراسية', icon: 'fa-solid fa-book-bookmark' },
                    { href: 'admin-lessons.html', title: 'إدارة المحاضرات والدروس', icon: 'fa-solid fa-clapperboard' },
                    { href: 'admin-exams.html', title: 'إدارة الامتحانات والاختبارات', icon: 'fa-solid fa-clipboard-list' },
                    { href: 'admin-notes-builder.html', title: 'إدارة المذكرات والنوتس', icon: 'fa-solid fa-note-sticky' },
                    { href: 'admin-codes.html', title: 'أكواد التفعيل والاشتراك', icon: 'fa-solid fa-key' },
                    { href: 'admin-maintenance.html', title: 'مركز ووضع الصيانة', icon: 'fa-solid fa-screwdriver-wrench' },
                    { href: 'admin-notifications.html', title: 'مركز الإشعارات والرسائل', icon: 'fa-solid fa-bullhorn' },
                    { href: 'admin-chat.html', title: 'الدعم والشات المباشر', icon: 'fa-solid fa-headset' },
                    { href: 'admin-community.html', title: 'إدارة المجتمع والمنشورات', icon: 'fa-solid fa-users-rectangle' },
                    { href: 'admin-results.html', title: 'سجل النتائج والدرجات', icon: 'fa-solid fa-square-poll-vertical' },
                    { href: 'admin-mistakes.html', title: 'تحليل الأخطاء الشائعة', icon: 'fa-solid fa-triangle-exclamation' },
                    { href: 'admin-reports.html', title: 'التقارير والإحصائيات', icon: 'fa-solid fa-chart-line' },
                    { href: 'admin-config.html', title: 'إعدادات النظام والمنصة', icon: 'fa-solid fa-gear' },
                    { href: 'admin-mysql.html', title: 'قاعدة بيانات MySQL', icon: 'fa-solid fa-database' }
                ];

                let navListHTML = '';
                adminNavLinks.forEach(link => {
                    const isActive = (page === link.href) ? 'active' : '';
                    navListHTML += `
                        <li style="margin-bottom:6px; list-style:none;">
                            <a href="${link.href}" class="nav-item-link ${isActive}" style="display:flex; align-items:center; gap:12px; padding:10px 14px; border-radius:12px; color:#475569; text-decoration:none; font-size:13.5px; font-weight:700; transition:all 0.2s ease;">
                                <i class="${link.icon}" style="width:20px; font-size:15px; text-align:center; color:#8C827A;"></i>
                                <span>${link.title}</span>
                            </a>
                        </li>
                    `;
                });

                sidebar.innerHTML = `
                    <div style="display:flex; flex-direction:column; height:100%; justify-content:space-between;">
                        <div>
                            <!-- Brand & Header -->
                            <div style="display:flex; align-items:center; justify-content:space-between; padding-bottom:14px; margin-bottom:14px; border-bottom:1px solid #EFE8DC;">
                                <a href="admin-panel.html" style="display:flex; align-items:center; gap:10px; text-decoration:none;">
                                    <div style="width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg, #D4973B, #B88028); display:flex; align-items:center; justify-content:center; color:#FFFFFF; font-size:15px;">
                                        <i class="fa-solid fa-shield-halved"></i>
                                    </div>
                                    <div>
                                        <div style="font-size:13.5px; font-weight:900; color:#1E293B; line-height:1.2;">ELKHETA <span style="color:#C28B38;">Admin</span></div>
                                        <div style="font-size:10.5px; font-weight:700; color:#8C827A;">لوحة الإدارة الشاملة</div>
                                    </div>
                                </a>
                                <button type="button" onclick="window.toggleMobileSidebar(false)" style="background:#F1F5F9; border:none; color:#475569; font-size:16px; cursor:pointer; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                                    <i class="fa-solid fa-xmark"></i>
                                </button>
                            </div>

                            <!-- Nav List -->
                            <ul style="list-style:none; padding:0; margin:0; max-height:calc(100vh - 160px); overflow-y:auto;">
                                ${navListHTML}
                            </ul>
                        </div>

                        <!-- Footer / Logout -->
                        <div style="padding-top:12px; border-top:1px solid #EFE8DC; margin-top:12px;">
                            <button type="button" onclick="localStorage.removeItem('adminToken'); location.href='admin-gate.html';" style="width:100%; display:flex; align-items:center; justify-content:center; gap:8px; padding:10px 14px; background:#FFF1F2; border:1px solid rgba(225,29,72,0.2); border-radius:12px; color:#E11D48; font-size:13px; font-weight:800; cursor:pointer; font-family:'Cairo', sans-serif;">
                                <i class="fa-solid fa-arrow-right-from-bracket"></i>
                                <span>تسجيل الخروج من الإدارة</span>
                            </button>
                        </div>
                    </div>
                `;
                document.body.appendChild(sidebar);
            } else if (isStudentPage) {
                sidebar.className = 'student-sidebar mobile-injected-sidebar';
                sidebar.id = 'mobileStudentDrawer';

                const studentNavLinks = [
                    { href: 'home.html', title: 'الرئيسية', icon: 'fa-solid fa-house' },
                    { href: 'courses.html', title: 'المواد والمناهج', icon: 'fa-solid fa-book-open' },
                    { href: 'lectures.html', title: 'المحاضرات والشروحات', icon: 'fa-solid fa-clapperboard' },
                    { href: 'quiz.html', title: 'الامتحانات والاختبارات', icon: 'fa-solid fa-clipboard-list' },
                    { href: 'mistakes.html', title: 'دفتر أخطائي الذكي', icon: 'fa-solid fa-circle-exclamation' },
                    { href: 'planner.html', title: 'جدول المذاكرة', icon: 'fa-solid fa-calendar-check' },
                    { href: 'profile.html', title: 'الملف الشخصي', icon: 'fa-solid fa-user-gear' },
                    { href: 'chat.html', title: 'شات الدعم والمعلمين', icon: 'fa-solid fa-comments' },
                    { href: 'community.html', title: 'مجتمع الأبطال', icon: 'fa-solid fa-users' },
                    { href: 'leaderboard.html', title: 'لوحة الأوائل', icon: 'fa-solid fa-trophy' },
                    { href: 'notifications.html', title: 'التنبيهات والإشعارات', icon: 'fa-solid fa-bell' }
                ];

                let navListHTML = '';
                studentNavLinks.forEach(link => {
                    const isActive = (page === link.href) ? 'active' : '';
                    navListHTML += `
                        <li style="margin-bottom:6px; list-style:none;">
                            <a href="${link.href}" class="nav-item-link ${isActive}" style="display:flex; align-items:center; gap:12px; padding:10px 14px; border-radius:12px; color:#475569; text-decoration:none; font-size:13.5px; font-weight:700; transition:all 0.2s ease;">
                                <i class="${link.icon}" style="width:20px; font-size:15px; text-align:center; color:#8C827A;"></i>
                                <span>${link.title}</span>
                            </a>
                        </li>
                    `;
                });

                sidebar.innerHTML = `
                    <div style="display:flex; flex-direction:column; height:100%; justify-content:space-between;">
                        <div>
                            <!-- Brand & Header -->
                            <div style="display:flex; align-items:center; justify-content:space-between; padding-bottom:14px; margin-bottom:14px; border-bottom:1px solid #EFE8DC;">
                                <a href="home.html" style="display:flex; align-items:center; gap:10px; text-decoration:none;">
                                    <div style="width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg, #D4973B, #B88028); display:flex; align-items:center; justify-content:center; color:#FFFFFF; font-size:15px;">
                                        <i class="fa-solid fa-graduation-cap"></i>
                                    </div>
                                    <div>
                                        <div style="font-size:13.5px; font-weight:900; color:#1E293B; line-height:1.2;">ELKHETA <span style="color:#C28B38;">منصة الخطة</span></div>
                                        <div style="font-size:10.5px; font-weight:700; color:#8C827A;">الصف الرابع الابتدائي</div>
                                    </div>
                                </a>
                                <button type="button" onclick="window.toggleMobileSidebar(false)" style="background:#F1F5F9; border:none; color:#475569; font-size:16px; cursor:pointer; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                                    <i class="fa-solid fa-xmark"></i>
                                </button>
                            </div>

                            <!-- Nav List -->
                            <ul style="list-style:none; padding:0; margin:0; max-height:calc(100vh - 160px); overflow-y:auto;">
                                ${navListHTML}
                            </ul>
                        </div>

                        <!-- Footer / Logout -->
                        <div style="padding-top:12px; border-top:1px solid #EFE8DC; margin-top:12px;">
                            <button type="button" onclick="localStorage.clear(); sessionStorage.clear(); location.href='index.html';" style="width:100%; display:flex; align-items:center; justify-content:center; gap:8px; padding:10px 14px; background:#FFF1F2; border:1px solid rgba(225,29,72,0.2); border-radius:12px; color:#E11D48; font-size:13px; font-weight:800; cursor:pointer; font-family:'Cairo', sans-serif;">
                                <i class="fa-solid fa-arrow-right-from-bracket"></i>
                                <span>تسجيل الخروج</span>
                            </button>
                        </div>
                    </div>
                `;
                document.body.appendChild(sidebar);
            }
        }

        // Toggle Sidebar Function
        window.toggleMobileSidebar = function(open) {
            const activeSidebar = document.querySelector('.student-sidebar') || 
                                 document.querySelector('.dashboard-sidebar') || 
                                 document.querySelector('.admin-sidebar') || 
                                 document.querySelector('aside.sidebar');
            if (!activeSidebar) return;
            const isOpen = open !== undefined ? open : (!activeSidebar.classList.contains('mobile-open') && !activeSidebar.classList.contains('show-mobile'));
            if (isOpen) {
                activeSidebar.classList.add('mobile-open');
                activeSidebar.classList.add('show-mobile');
                backdrop.classList.add('active');
            } else {
                activeSidebar.classList.remove('mobile-open');
                activeSidebar.classList.remove('show-mobile');
                backdrop.classList.remove('active');
            }
        };

        backdrop.addEventListener('click', () => window.toggleMobileSidebar(false));

        // Inject global mobile nav CSS overrides (fixes purple links & underlines)
        if (!document.getElementById('mobileNavStyleOverride')) {
            const style = document.createElement('style');
            style.id = 'mobileNavStyleOverride';
            style.textContent = `
                .universal-mobile-dock {
                    background: rgba(15, 23, 42, 0.97) !important;
                    backdrop-filter: blur(16px) !important;
                    -webkit-backdrop-filter: blur(16px) !important;
                    border-top: 1.5px solid #334155 !important;
                    box-shadow: 0 -4px 25px rgba(0, 0, 0, 0.4) !important;
                }
                .mobile-dock-btn, .mobile-dock-btn:visited, .mobile-dock-btn:link, .mobile-dock-btn:active {
                    color: #94A3B8 !important;
                    text-decoration: none !important;
                    font-family: 'Cairo', system-ui, sans-serif !important;
                }
                .mobile-dock-btn span {
                    color: inherit !important;
                    text-decoration: none !important;
                }
                .mobile-dock-btn i {
                    color: inherit !important;
                }
                .mobile-dock-btn:hover, .mobile-dock-btn.active {
                    color: #D4973B !important;
                    text-decoration: none !important;
                    font-weight: 900 !important;
                }
                .mobile-dock-btn.active i {
                    color: #D4973B !important;
                }
            `;
            document.head.appendChild(style);
        }

        // 2. Inject Universal Mobile Bottom Navigation Dock (if not already statically in HTML)
        if (!document.getElementById('universalMobileDock')) {
            const dock = document.createElement('nav');
            dock.id = 'universalMobileDock';
            dock.className = 'universal-mobile-dock';

            const navItems = isAdminPage ? [
                { id: 'admin-home', title: 'الرئيسية', icon: 'fa-solid fa-gauge-high', href: 'admin-panel.html' },
                { id: 'admin-radar', title: 'الرادار', icon: 'fa-solid fa-radar', href: 'admin-radar.html' },
                { id: 'admin-students', title: 'الطلاب', icon: 'fa-solid fa-users', href: 'admin-students.html' },
                { id: 'admin-exams', title: 'الامتحانات', icon: 'fa-solid fa-clipboard-list', href: 'admin-exams.html' },
                { id: 'admin-lessons', title: 'المحاضرات', icon: 'fa-solid fa-clapperboard', href: 'admin-lessons.html' },
                { id: 'admin-config', title: 'الإعدادات', icon: 'fa-solid fa-gear', href: 'admin-config.html' },
                { id: 'menu', title: 'القائمة', icon: 'fa-solid fa-bars', href: 'javascript:void(0)', onClick: 'window.toggleMobileSidebar()' }
            ] : [
                { id: 'home', title: 'الرئيسية', icon: 'fa-solid fa-house', href: 'home.html' },
                { id: 'courses', title: 'المواد', icon: 'fa-solid fa-book-open', href: 'courses.html' },
                { id: 'lectures', title: 'المحاضرات', icon: 'fa-solid fa-clapperboard', href: 'lectures.html' },
                { id: 'quiz', title: 'الامتحانات', icon: 'fa-solid fa-clipboard-list', href: 'quiz.html' },
                { id: 'profile', title: 'حسابي', icon: 'fa-solid fa-circle-user', href: 'profile.html' },
                { id: 'menu', title: 'القائمة', icon: 'fa-solid fa-bars', href: 'javascript:void(0)', onClick: 'window.toggleMobileSidebar()' }
            ];

            let dockHTML = '';
            navItems.forEach(item => {
                const isActive = (item.href === page) ? 'active' : '';
                const clickAttr = item.onClick ? `onclick="${item.onClick}"` : '';
                dockHTML += `
                    <a href="${item.href}" class="mobile-dock-btn ${isActive}" ${clickAttr}>
                        <i class="${item.icon}"></i>
                        <span>${item.title}</span>
                    </a>
                `;
            });

            dock.innerHTML = dockHTML;
            document.body.appendChild(dock);
        }
    } catch (err) {
        console.error('Mobile Nav Init Error:', err);
    }
}

// ─── Universal Top Animated Glowing Neon Disclaimer Ticker ───
// ─── Universal Floating Announcement Message Toast (Appears on Entry & Auto-Fades) ───
function initUniversalTickerBanner() {
    try {
        if (document.getElementById('universalTopTicker')) return;
        if (sessionStorage.getItem('elkheta_ticker_dismissed') === 'true') return;

        const tickerContainer = document.createElement('div');
        tickerContainer.id = 'universalTopTicker';
        tickerContainer.className = 'universal-floating-toast';

        tickerContainer.innerHTML = `
            <div class="toast-card-head">
                <div class="toast-badge-tag">
                    <i class="fa-solid fa-shield-halved"></i>
                    <span>تنويه وإخلاء مسؤولية رسمي</span>
                </div>
                <button type="button" class="toast-close-btn" onclick="window.dismissUniversalTicker()" title="إغلاق التنويه">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="toast-card-body">
                منصة <strong>الخطة التعليمية</strong> هي مبادرة أحيائية ومجانية تم إنشاؤها بجهود فردية مساندة لخدمة الطلاب وتسهيل الدراسة. 
                المنصة <span class="toast-highlight-cyan">مستقلة تماماً وغير تابعة ولا تربطها أي صلة رسمية أو قانونية بأي كلية، جامعة، أو مؤسسة حكومية.</span>
            </div>
            <div class="toast-progress-bar">
                <div class="toast-progress-fill" id="toastProgressFill"></div>
            </div>
        `;

        if (!document.getElementById('universalTickerStyles')) {
            const style = document.createElement('style');
            style.id = 'universalTickerStyles';
            style.textContent = `
                .universal-floating-toast {
                    position: fixed !important;
                    top: 20px !important;
                    right: 20px !important;
                    left: auto !important;
                    max-width: 440px !important;
                    width: calc(100vw - 40px) !important;
                    background: rgba(11, 15, 25, 0.96) !important;
                    backdrop-filter: blur(18px) !important;
                    -webkit-backdrop-filter: blur(18px) !important;
                    border: 1.5px solid #D4973B !important;
                    border-radius: 16px !important;
                    padding: 14px 16px 12px !important;
                    color: #F8FAFC !important;
                    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.6), 0 0 20px rgba(212, 151, 59, 0.25) !important;
                    z-index: 9999999 !important;
                    font-family: 'Cairo', system-ui, -apple-system, sans-serif !important;
                    direction: rtl !important;
                    box-sizing: border-box !important;
                    animation: toastSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
                }
                .universal-floating-toast.toast-hiding {
                    animation: toastSlideOut 0.4s cubic-bezier(0.7, 0, 0.84, 0) forwards !important;
                }
                .toast-card-head {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: space-between !important;
                    margin-bottom: 8px !important;
                }
                .toast-badge-tag {
                    background: rgba(212, 151, 59, 0.2) !important;
                    color: #FFE600 !important;
                    -webkit-text-fill-color: #FFE600 !important;
                    border: 1px solid #D4973B !important;
                    border-radius: 8px !important;
                    font-weight: 800 !important;
                    font-size: 11.5px !important;
                    padding: 3px 10px !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 6px !important;
                }
                .toast-close-btn {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: none !important;
                    color: #CBD5E1 !important;
                    -webkit-text-fill-color: #CBD5E1 !important;
                    width: 24px !important;
                    height: 24px !important;
                    border-radius: 50% !important;
                    cursor: pointer !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    font-size: 12px !important;
                    transition: all 0.2s ease !important;
                }
                .toast-close-btn:hover {
                    background: rgba(244, 63, 94, 0.3) !important;
                    color: #FB7185 !important;
                    -webkit-text-fill-color: #FB7185 !important;
                }
                .toast-card-body {
                    font-size: 12.5px !important;
                    line-height: 1.6 !important;
                    color: #CBD5E1 !important;
                    -webkit-text-fill-color: #CBD5E1 !important;
                    font-weight: 600 !important;
                }
                .toast-card-body strong {
                    color: #FFE600 !important;
                    -webkit-text-fill-color: #FFE600 !important;
                }
                .toast-highlight-cyan {
                    color: #38BDF8 !important;
                    -webkit-text-fill-color: #38BDF8 !important;
                    font-weight: 700 !important;
                }
                .toast-progress-bar {
                    width: 100% !important;
                    height: 3px !important;
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-radius: 3px !important;
                    margin-top: 10px !important;
                    overflow: hidden !important;
                }
                .toast-progress-fill {
                    height: 100% !important;
                    background: linear-gradient(90deg, #D4973B, #FFE600) !important;
                    width: 100% !important;
                    animation: toastCountdown 6.5s linear forwards !important;
                }
                @keyframes toastSlideIn {
                    from { transform: translateY(-30px) scale(0.95); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
                @keyframes toastSlideOut {
                    from { transform: translateY(-30px) scale(0.95); opacity: 0; }
                    to { transform: translateY(-30px) scale(0.95); opacity: 0; }
                }
                @keyframes toastCountdown {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(tickerContainer);

        let dismissTimeout = setTimeout(() => {
            window.dismissUniversalTicker();
        }, 6500);

        window.dismissUniversalTicker = function() {
            clearTimeout(dismissTimeout);
            const elem = document.getElementById('universalTopTicker');
            if (!elem) return;
            elem.classList.add('toast-hiding');
            setTimeout(() => {
                if (elem && elem.parentNode) elem.parentNode.removeChild(elem);
            }, 400);
            sessionStorage.setItem('elkheta_ticker_dismissed', 'true');
        };
    } catch (e) {
        console.error('Universal Ticker Toast Error:', e);
    }
}



// ─── Universal High-Contrast Footer with Disclaimer & Vision ───
function initUniversalFooter() {
    try {
        if (document.getElementById('universalAppFooter')) return;

        const rawPath = window.location.pathname.toLowerCase();
        const page = rawPath.split('/').pop().split('?')[0].split('#')[0] || 'index.html';

        if (page === 'splash.html') return;

        const footer = document.createElement('footer');
        footer.id = 'universalAppFooter';
        footer.className = 'universal-app-footer';

        footer.innerHTML = `
            <div class="footer-inner-wrap">
                <div class="footer-cards-grid">
                    <!-- Card 1: Official Disclaimer -->
                    <div class="footer-info-card disclaimer-box">
                        <div class="footer-card-head">
                            <div class="footer-icon-badge gold-badge">
                                <i class="fa-solid fa-shield-halved"></i>
                            </div>
                            <div>
                                <h4 class="footer-card-title">تنويه وإخلاء مسؤولية 🛡️</h4>
                                <span class="footer-card-subtitle">مبادرة تعليمية مجانية ومستقلة 100%</span>
                            </div>
                        </div>
                        <p class="footer-card-desc">
                            منصة <strong>الخطة التعليمية</strong> هي مبادرة أحيائية ومجانية تم إنشاؤها بجهود فردية مساندة بهدف خدمة الطلاب وتسهيل الوصول إلى المحتوى الأكاديمي وحساب المعدلات. 
                            المنصة <strong>مستقلة تماماً وغير تابعة ولا تربطها أي صلة رسمية أو قانونية بأي كلية، جامعة، أو مؤسسة حكومية</strong>.
                        </p>
                    </div>

                    <!-- Card 2: Promotional & Vision Statement -->
                    <div class="footer-info-card promo-box">
                        <div class="footer-card-head">
                            <div class="footer-icon-badge star-badge">
                                <i class="fa-solid fa-wand-magic-sparkles"></i>
                            </div>
                            <div>
                                <h4 class="footer-card-title">منصة الخطة - رفيقك للقمة 🚀</h4>
                                <span class="footer-card-subtitle">معلمك الأكاديمي الذكي والتفاعلي</span>
                            </div>
                        </div>
                        <p class="footer-card-desc">
                            نوفر لك أحدث وسائل التعلم الذكي، المذكرات الشاملة، بنوك الأسئلة، الشروحات، ومتابعة الأداء الأكاديمي مجاناً بالكامل بأعلى جودة. 
                            <strong>هدفنا نجاحك، ورؤيتنا تميزك وتصدرك للمراكز الأولى دائماً!</strong>
                        </p>
                    </div>
                </div>

                <div class="footer-bottom-bar">
                    <div class="footer-brand">
                        <span class="brand-text">ELKHETA <span class="brand-highlight">منصة الخطة</span></span>
                    </div>
                    <div class="footer-copyright-text">
                        © 2026 جميع الحقوق محفوظة - منصة الخطة التعليمية ✨ | صُممت بحب ودقة لدعم مسيرة الطلاب
                    </div>
                </div>
            </div>
        `;

        if (!document.getElementById('universalFooterStyles')) {
            const style = document.createElement('style');
            style.id = 'universalFooterStyles';
            style.textContent = `
                .universal-app-footer {
                    background: #0B0F19 !important;
                    color: #F8FAFC !important;
                    padding: 20px 16px 80px !important;
                    margin-top: auto !important;
                    border-top: 2px solid #D4973B !important;
                    font-family: 'Cairo', system-ui, -apple-system, sans-serif !important;
                    direction: rtl !important;
                    position: relative !important;
                    box-sizing: border-box !important;
                    clear: both !important;
                    z-index: 10 !important;
                    width: 100% !important;
                }
                .universal-app-footer .footer-inner-wrap {
                    max-width: 1100px !important;
                    margin: 0 auto !important;
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 14px !important;
                }
                .universal-app-footer .footer-cards-grid {
                    display: grid !important;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
                    gap: 12px !important;
                }
                .universal-app-footer .footer-info-card {
                    background: rgba(15, 23, 42, 0.95) !important;
                    border: 1px solid rgba(212, 151, 59, 0.4) !important;
                    border-radius: 12px !important;
                    padding: 12px 16px !important;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4) !important;
                    transition: transform 0.2s ease, border-color 0.2s ease !important;
                }
                .universal-app-footer .footer-info-card:hover {
                    border-color: #FFE600 !important;
                    transform: translateY(-2px) !important;
                }
                .universal-app-footer .footer-card-head {
                    display: flex !important;
                    align-items: center !important;
                    gap: 10px !important;
                    margin-bottom: 8px !important;
                }
                .universal-app-footer .footer-icon-badge {
                    width: 32px !important;
                    height: 32px !important;
                    border-radius: 10px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    font-size: 15px !important;
                    flex-shrink: 0 !important;
                }
                .universal-app-footer .gold-badge {
                    background: rgba(212, 151, 59, 0.25) !important;
                    color: #FFE600 !important;
                    border: 1px solid #D4973B !important;
                }
                .universal-app-footer .star-badge {
                    background: rgba(16, 185, 129, 0.25) !important;
                    color: #00F5D4 !important;
                    border: 1px solid #10B981 !important;
                }
                .universal-app-footer h4,
                .universal-app-footer .footer-card-title {
                    font-size: 14px !important;
                    font-weight: 900 !important;
                    color: #FFFFFF !important;
                    -webkit-text-fill-color: #FFFFFF !important;
                    margin: 0 !important;
                    line-height: 1.3 !important;
                }
                .universal-app-footer .footer-card-subtitle {
                    font-size: 11px !important;
                    font-weight: 700 !important;
                    color: #FCD34D !important;
                    -webkit-text-fill-color: #FCD34D !important;
                    display: block !important;
                    margin-top: 1px !important;
                }
                .universal-app-footer p,
                .universal-app-footer .footer-card-desc {
                    font-size: 12px !important;
                    line-height: 1.6 !important;
                    color: #CBD5E1 !important;
                    -webkit-text-fill-color: #CBD5E1 !important;
                    margin: 0 !important;
                    font-weight: 600 !important;
                }
                .universal-app-footer .footer-card-desc strong {
                    color: #FFE600 !important;
                    -webkit-text-fill-color: #FFE600 !important;
                    font-weight: 800 !important;
                }
                .universal-app-footer .footer-bottom-bar {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: space-between !important;
                    flex-wrap: wrap !important;
                    gap: 10px !important;
                    padding-top: 10px !important;
                    border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
                    font-size: 11.5px !important;
                    color: #94A3B8 !important;
                }
                .universal-app-footer .brand-text {
                    font-weight: 900 !important;
                    font-size: 13.5px !important;
                    color: #FFFFFF !important;
                    -webkit-text-fill-color: #FFFFFF !important;
                }
                .universal-app-footer .brand-highlight {
                    color: #D4973B !important;
                    -webkit-text-fill-color: #D4973B !important;
                }
                .universal-app-footer .footer-copyright-text {
                    font-weight: 700 !important;
                    font-size: 11.5px !important;
                    color: #CBD5E1 !important;
                    -webkit-text-fill-color: #CBD5E1 !important;
                }
                @media (max-width: 992px) {
                    .universal-app-footer {
                        padding-bottom: 110px !important;
                    }
                    .universal-app-footer .footer-bottom-bar {
                        flex-direction: column !important;
                        text-align: center !important;
                        align-items: center !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        const stageContainer = document.querySelector('.stage-container');
        if (stageContainer) {
            stageContainer.appendChild(footer);
        } else {
            document.body.appendChild(footer);
        }
    } catch (e) {
        console.error('Universal Footer Error:', e);
    }
}

function initAllUniversalFeatures() {
    initUniversalMobileNav();
    initUniversalTickerBanner();
    initUniversalFooter();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllUniversalFeatures);
} else {
    initAllUniversalFeatures();
}



