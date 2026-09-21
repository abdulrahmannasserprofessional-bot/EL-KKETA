/**
 * 🌲 EL KHETA — «Nordic Slate & Minimal» Desktop Controller
 * نظام التحكم والشريط الجانبي الإسكندنافي فائق النقاء مع تسميات واضحة ومحاذاة مثالية
 */

(function() {
    if (!window.desktopApi && !window.process?.versions?.electron) {
        return;
    }

    function initDesktopShell() {
        if (document.getElementById('elkheta-desktop-shell')) return;
        if (!document.body) {
            setTimeout(initDesktopShell, 50);
            return;
        }
        document.body.classList.add('is-desktop-app');
        document.documentElement.classList.add('is-desktop-app');
            setTimeout(initDesktopShell, 50);
            return;
        }

        // إعداد جلسة الطالب الافتراضية لمنع التحويل التلقائي
        try {
            if (!localStorage.getItem('user') && !localStorage.getItem('elkheta_student')) {
                const defaultStudent = {
                    fullName: 'طالب الخطة (النسخة المكتبية)',
                    studentCode: 'DESKTOP_STUDENT_2026',
                    phone: '01000000000',
                    stage: 'الفرقة الثالثة',
                    points: 1250,
                    streak: 7,
                    level: 5
                };
                localStorage.setItem('user', JSON.stringify(defaultStudent));
                localStorage.setItem('elkheta_student', JSON.stringify(defaultStudent));
            }
        } catch(e) {}

        const currentPath = location.pathname.split('/').pop() || 'home.html';

        // 1. الشريط العلوي الإسكندنافي (Nordic Top Shell)
        const shellHeader = document.createElement('header');
        shellHeader.id = 'elkheta-desktop-shell';
        shellHeader.innerHTML = `
            <div class="elk-shell-right-side">
                <div class="elk-brand" onclick="location.href='home.html'" title="منصة الخطة">
                    <span class="elk-brand-badge"><i class="fa-solid fa-graduation-cap"></i></span>
                    <span class="elk-brand-text">منصة الخطة</span>
                </div>
                <div class="elk-user-tag" id="elkTopUserBadge">
                    <span class="elk-user-dot"></span>
                    <span id="elkTopUserName">طالب الخطة</span>
                </div>
            </div>

            <div class="elk-shell-center">
                <button type="button" class="elk-search-box" onclick="openDesktopSearch()" title="البحث السريع (Ctrl+K)">
                    <i class="fa-solid fa-magnifying-glass elk-search-icon"></i>
                    <span class="elk-search-text">ابحث في المحاضرات، المواد، الكشكول، والامتحانات...</span>
                    <span class="elk-search-kbd">Ctrl K</span>
                </button>
            </div>

            <div class="elk-shell-left-side">
                <!-- مساحة مخصصة لأزرار ويندوز الرسمية - ▢ ✕ في أعلى اليسار/اليمين -->
                <div class="elk-win-overlay-space"></div>
            </div>
        `;

        // 2. الـ Mini Rail الحديث مع أيقونات وتسميات عربية واضحة
        const miniRail = document.createElement('aside');
        miniRail.id = 'elkheta-desktop-rail';
        miniRail.innerHTML = `
            <nav class="elk-rail-nav">
                <div class="elk-rail-cell ${currentPath.includes('home') ? 'active' : ''}" onclick="location.href='home.html'" title="الرئيسية">
                    <i class="fa-solid fa-house"></i>
                    <span class="elk-rail-label">الرئيسية</span>
                </div>
                <div class="elk-rail-cell ${currentPath.includes('course') ? 'active' : ''}" onclick="location.href='courses.html'" title="المواد">
                    <i class="fa-solid fa-book-bookmark"></i>
                    <span class="elk-rail-label">المواد</span>
                </div>
                <div class="elk-rail-cell ${currentPath.includes('lecture') ? 'active' : ''}" onclick="location.href='lectures.html'" title="المحاضرات">
                    <i class="fa-solid fa-circle-play"></i>
                    <span class="elk-rail-label">المحاضرات</span>
                </div>
                <div class="elk-rail-cell ${currentPath.includes('note') ? 'active' : ''}" onclick="location.href='notes-viewer.html'" title="الكشكول">
                    <i class="fa-solid fa-pen-nib"></i>
                    <span class="elk-rail-label">الكشكول</span>
                </div>
                <div class="elk-rail-cell ${currentPath.includes('mistake') ? 'active' : ''}" onclick="location.href='mistakes.html'" title="بنك الأخطاء">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <span class="elk-rail-label">أخطائي</span>
                </div>
                <div class="elk-rail-cell ${currentPath.includes('quiz') ? 'active' : ''}" onclick="location.href='quiz.html'" title="الامتحانات">
                    <i class="fa-solid fa-clipboard-check"></i>
                    <span class="elk-rail-label">الامتحانات</span>
                </div>
                <div class="elk-rail-cell ${currentPath.includes('leaderboard') ? 'active' : ''}" onclick="location.href='leaderboard.html'" title="لوحة الشرف">
                    <i class="fa-solid fa-trophy"></i>
                    <span class="elk-rail-label">الأوائل</span>
                </div>
            </nav>

            <div class="elk-rail-bottom">
                <div class="elk-rail-cell ${currentPath.includes('profile') ? 'active' : ''}" onclick="location.href='profile.html'" title="حسابي">
                    <i class="fa-solid fa-user-gear"></i>
                    <span class="elk-rail-label">حسابي</span>
                </div>
            </div>
        `;

        // 3. CSS التصميم الإسكندنافي المكتبي
        const style = document.createElement('style');
        style.id = 'elkheta-nordic-shell-css';
        style.textContent = `
            #elkheta-desktop-shell {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 48px;
                background: #FFFFFF;
                border-bottom: 1px solid #EAE0D7;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 16px;
                z-index: 9999999;
                user-select: none;
                -webkit-user-select: none;
                -webkit-app-region: drag;
                font-family: 'Cairo', -apple-system, sans-serif;
                direction: rtl;
                box-shadow: 0 1px 2px rgba(0,0,0,0.03);
            }
            .elk-shell-right-side {
                display: flex;
                align-items: center;
                gap: 12px;
                -webkit-app-region: no-drag;
            }
            .elk-brand {
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
            }
            .elk-brand-badge {
                width: 30px;
                height: 30px;
                background: #F5EFEB;
                border: 1px solid #EAE0D7;
                color: #4A2E1B;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
            }
            .elk-brand-text {
                font-family: 'Alexandria', 'Cairo', sans-serif;
                font-weight: 800;
                font-size: 14.5px;
                color: #2B1810;
                letter-spacing: -0.2px;
            }
            .elk-user-tag {
                font-size: 12px;
                font-weight: 700;
                color: #543D31;
                background: #FAF6F0;
                border: 1px solid #EAE0D7;
                padding: 4px 12px;
                border-radius: 20px;
                display: flex;
                align-items: center;
                gap: 7px;
            }
            .elk-user-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: #4A2E1B;
            }
            .elk-shell-center {
                display: flex;
                align-items: center;
                justify-content: center;
                -webkit-app-region: no-drag;
                flex: 1;
                max-width: 480px;
                margin: 0 20px;
            }
            .elk-search-box {
                background: #FAF6F0;
                border: 1px solid #EAE0D7;
                border-radius: 10px;
                color: #7D6556;
                font-size: 12.5px;
                padding: 6px 14px;
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
                transition: all 0.15s ease;
                width: 100%;
                justify-content: space-between;
                box-sizing: border-box;
            }
            .elk-search-box:hover {
                border-color: #4A2E1B;
                background: #FFFFFF;
                color: #2B1810;
            }
            .elk-search-icon {
                color: #4A2E1B;
                font-size: 12px;
            }
            .elk-search-text {
                flex: 1;
                text-align: right;
                font-weight: 600;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .elk-search-kbd {
                font-family: 'JetBrains Mono', monospace;
                font-size: 10px;
                color: #4A2E1B;
                background: #F5EFEB;
                border: 1px solid #EAE0D7;
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: 700;
            }
            .elk-shell-left-side {
                display: flex;
                align-items: center;
                gap: 12px;
                -webkit-app-region: no-drag;
            }
            .elk-win-overlay-space {
                width: 135px; /* مساحة أزرار ويندوز الرسمية - ▢ ✕ في الزاوية */
                height: 48px;
            }

            /* الـ Mini Rail الحديث على اليمين */
            #elkheta-desktop-rail {
                position: fixed;
                top: 48px;
                right: 0;
                bottom: 0;
                width: 74px;
                background: #FFFFFF;
                border-left: 1px solid #EAE0D7;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                z-index: 9999998;
                user-select: none;
                -webkit-user-select: none;
                direction: rtl;
            }
            .elk-rail-nav {
                display: flex;
                flex-direction: column;
                gap: 4px;
                width: 100%;
                align-items: center;
            }
            .elk-rail-cell {
                position: relative;
                width: 62px;
                height: 52px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 3px;
                border-radius: 10px;
                color: #7D6556;
                cursor: pointer;
                transition: all 0.15s ease;
                border: 1px solid transparent;
                text-decoration: none;
            }
            .elk-rail-cell i {
                font-size: 16px;
                transition: transform 0.15s ease;
            }
            .elk-rail-label {
                font-size: 10px;
                font-weight: 700;
                font-family: 'Cairo', sans-serif;
                line-height: 1;
            }
            .elk-rail-cell:hover {
                color: #4A2E1B;
                background: #FAF6F0;
                border-color: #EAE0D7;
            }
            .elk-rail-cell:hover i {
                transform: scale(1.1);
            }
            .elk-rail-cell.active {
                color: #4A2E1B;
                background: #F5EFEB;
                border-color: #EAE0D7;
                font-weight: 800;
            }
            .elk-rail-cell.active::before {
                content: '';
                position: absolute;
                right: -6px;
                top: 14px;
                bottom: 14px;
                width: 3px;
                border-radius: 3px;
                background: #4A2E1B;
            }
            .elk-rail-bottom {
                margin-top: auto;
                width: 100%;
                display: flex;
                justify-content: center;
            }
        `;

        document.head.appendChild(style);
        document.body.prepend(shellHeader);
        document.body.appendChild(miniRail);

        // تحديث اسم الطالب
        try {
            const savedStudent = localStorage.getItem('elkheta_student') || localStorage.getItem('currentUser') || localStorage.getItem('user');
            if (savedStudent) {
                const parsed = JSON.parse(savedStudent);
                const name = parsed.fullName || parsed.name || parsed.studentName;
                if (name) {
                    const userEl = document.getElementById('elkTopUserName');
                    if (userEl) userEl.textContent = name;
                }
            }
        } catch(e) {}

        // اختصار لوحة المفاتيح Ctrl + K
        window.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                openDesktopSearch();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDesktopShell);
    } else {
        initDesktopShell();
    }

    window.openDesktopSearch = function() {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'البحث السريع في المنصة 🔍',
                input: 'text',
                inputPlaceholder: 'اكتب اسم المادة أو المحاضرة أو الامتحان...',
                showCancelButton: true,
                confirmButtonText: 'انتقال ➔',
                cancelButtonText: 'إلغاء',
                background: '#FFFFFF',
                color: '#2B1810',
                confirmButtonColor: '#4A2E1B',
                cancelButtonColor: '#7D6556',
                customClass: {
                    popup: 'swal2-nordic-popup'
                }
            }).then((res) => {
                if (res.isConfirmed && res.value) {
                    const q = res.value.trim().toLowerCase();
                    if (q.includes('مادة') || q.includes('كورس') || q.includes('منهج')) location.href = 'courses.html';
                    else if (q.includes('محاضر') || q.includes('حصة') || q.includes('درس')) location.href = 'lectures.html';
                    else if (q.includes('امتحان') || q.includes('كويز') || q.includes('اختبار')) location.href = 'quiz.html';
                    else if (q.includes('نوت') || q.includes('كشكول') || q.includes('دفتر')) location.href = 'notes-viewer.html';
                    else if (q.includes('غلط') || q.includes('خطأ')) location.href = 'mistakes.html';
                    else if (q.includes('اوائل') || q.includes('أوائل') || q.includes('شرف')) location.href = 'leaderboard.html';
                    else location.href = 'courses.html';
                }
            });
        }
    };
})();

