/**
 * 🎬 ELKHETA KINETIC MOTION & INTERACTION ENGINE + SECURITY SHIELD (PRO 2026)
 * Hardware-accelerated 3D Tilt, Kinetic Number Counters, Liquid Ripples & Enterprise DevTools Protection.
 */

// ═══════════════════════════════════════════════════════════════════════
// 🛡️ ELKHETA ENTERPRISE ANTI-INSPECTION & ANTI-DATA-LEAK ENGINE (2026)
// منع أدوات المطور (F12, Inspect, Console, Debugger, View Source, Copy)
// ═══════════════════════════════════════════════════════════════════════
(function initEnterpriseSecurityShield() {
    'use strict';

    function isPlatformAdmin() {
        try {
            const path = (window.location.pathname || '').toLowerCase();
            // 1. Strictly Admin Dashboard/Panel pages
            if (path.includes('admin-') || path.includes('admin.html') || path.includes('admin/') || path.includes('admin_')) {
                return true;
            }
            // 2. Student learning pages are ALWAYS strictly protected (no bypass allowed)
            const isStudentPage = path.includes('lectures') || path.includes('quiz') || path.includes('mistakes') || 
                                  path.includes('notes-viewer') || path.includes('courses') || path.includes('planner') || 
                                  path.includes('leaderboard') || path.includes('video') || path.includes('display-code') ||
                                  path.includes('profile') || path.includes('community') || path.includes('home') ||
                                  path.includes('notifications') || path.includes('map') || path.includes('guide') ||
                                  path.includes('chat') || path.includes('index') || path.includes('ai-report');
            if (isStudentPage) {
                return false;
            }
            // 3. For other pages, require active session-only admin credentials
            if (sessionStorage.getItem('isAdmin') === 'true' && (sessionStorage.getItem('adminRole') || sessionStorage.getItem('adminUser'))) {
                return true;
            }
        } catch(e) {}
        return false;
    }

    if (isPlatformAdmin()) return;

    // Preserve raw console methods before silencing public console
    const _rawLog = (window.console && typeof window.console.log === 'function') ? window.console.log.bind(window.console) : function() {};
    const _rawClear = (window.console && typeof window.console.clear === 'function') ? window.console.clear.bind(window.console) : function() {};

    // 1. إيقاف وإلغاء جميع مخرجات الـ Console في وضع الإنتاج لمنع تسريب الروابط أو البيانات
    try {
        const noop = function() {};
        window.console.log = noop;
        window.console.info = noop;
        window.console.warn = noop;
        window.console.debug = noop;
        window.console.dir = noop;
        window.console.table = noop;
    } catch(e) {}

    // 2. قفل واعتراض جميع اختصارات لوحة المفاتيح الخاصة بالمطورين (Capture Phase)
    window.addEventListener('keydown', function(e) {
        if (isPlatformAdmin()) return;

        const isCtrlOrMeta = e.ctrlKey || e.metaKey;
        const isAlt = e.altKey;
        const isShift = e.shiftKey;
        const key = (e.key || '').toLowerCase();
        const keyCode = e.keyCode || e.which;

        // F12
        if (keyCode === 123 || key === 'f12' || e.code === 'F12') {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            showRightClickSecurityNotice('اختصار أدوات المطور (F12) محظور لحماية سرية الامتحانات والمحتوى 🛡️');
            return false;
        }

        // Ctrl+Shift+I, J, C, K, E, S, X or Cmd+Option+I, J, C
        if (
            (isCtrlOrMeta && isShift && ['i', 'j', 'c', 'k', 'e', 's', 'x'].includes(key)) ||
            (isCtrlOrMeta && isAlt && ['i', 'j', 'c'].includes(key)) ||
            (keyCode === 73 && isCtrlOrMeta && isShift) || // I
            (keyCode === 74 && isCtrlOrMeta && isShift) || // J
            (keyCode === 67 && isCtrlOrMeta && isShift)    // C
        ) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            showRightClickSecurityNotice('فحص عناصر وأكواد المنصة محظور لحماية المحتوى الأكاديمي 🛡️');
            return false;
        }

        // Ctrl+U (View Page Source)
        if (isCtrlOrMeta && (key === 'u' || keyCode === 85)) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            showRightClickSecurityNotice('استعراض الكود المصدري محظور لحماية سرية المنصة 🛡️');
            return false;
        }

        // Ctrl+S (Save Page HTML Source)
        if (isCtrlOrMeta && (key === 's' || keyCode === 83)) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }

        // Ctrl+P (Print to PDF leak)
        if (isCtrlOrMeta && (key === 'p' || keyCode === 80)) {
            const isQuizReview = window.location.pathname.includes('quiz') || window.location.pathname.includes('mistakes');
            if (!isQuizReview) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }
    }, true);

    // 3. قفل القائمة المنسدلة للماوس مع إشعار أمني فاخر (Right Click Security Notice)
    function showRightClickSecurityNotice(customMsg) {
        let toast = document.getElementById('elkhetaSecurityRightClickToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'elkhetaSecurityRightClickToast';
            toast.style.cssText = `
                position: fixed;
                top: 24px;
                left: 50%;
                transform: translateX(-50%) translateY(-30px);
                background: rgba(15, 23, 42, 0.98);
                border: 1.5px solid #C28B38;
                border-radius: 20px;
                padding: 14px 22px;
                box-shadow: 0 15px 45px rgba(0, 0, 0, 0.7), 0 0 35px rgba(194, 139, 56, 0.4);
                backdrop-filter: blur(18px);
                -webkit-backdrop-filter: blur(18px);
                z-index: 2147483646;
                display: flex;
                align-items: center;
                gap: 14px;
                color: #FFFFFF;
                font-family: 'Cairo', sans-serif;
                direction: rtl;
                text-align: right;
                max-width: 92vw;
                width: 480px;
                opacity: 0;
                pointer-events: none;
                transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            `;
            toast.innerHTML = `
                <div style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%); color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; box-shadow: 0 4px 14px rgba(239, 68, 68, 0.5);">
                    🛡️
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 14px; font-weight: 900; color: #FDE68A; margin-bottom: 3px; display: flex; align-items: center; gap: 6px;">
                        <span>🔒 تنبيه أمني مشدد • منصة الخطة</span>
                    </div>
                    <div id="elkhetaSecurityNoticeText" style="font-size: 12.5px; color: #E2E8F0; font-weight: 700; line-height: 1.55;">
                        هذا الإجراء غير مسموح به لحماية المحتوى الأكاديمي وسرية الامتحانات.
                    </div>
                </div>
            `;
            if (document.body) {
                document.body.appendChild(toast);
            } else {
                document.addEventListener('DOMContentLoaded', () => document.body.appendChild(toast));
            }
        }

        const textEl = document.getElementById('elkhetaSecurityNoticeText');
        if (textEl && customMsg) textEl.innerHTML = customMsg;

        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
        toast.style.pointerEvents = 'auto';

        if (window.navigator && window.navigator.vibrate) {
            try { window.navigator.vibrate([40, 60, 40]); } catch(e){}
        }

        clearTimeout(toast._hideTimer);
        toast._hideTimer = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(-30px)';
            toast.style.pointerEvents = 'none';
        }, 2800);
    }
    window.showRightClickSecurityNotice = showRightClickSecurityNotice;

    document.addEventListener('contextmenu', function(e) {
        if (isPlatformAdmin()) return;
        const tag = (e.target && e.target.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;

        e.preventDefault();
        e.stopPropagation();
        showRightClickSecurityNotice('النقر بالزر الأيمن واستدعاء القوائم المنسدلة غير مسموح به لحماية المحتوى الأكاديمي وسرية الامتحانات 🛡️');
        return false;
    }, true);

    // 4. قفل سحب الصور والمحتوى (Drag & Drop Protection)
    document.addEventListener('dragstart', function(e) {
        if (isPlatformAdmin()) return;
        e.preventDefault();
        return false;
    }, true);
})();

(function () {
    'use strict';

    // ─── 1. Fluid Number Counter Animation ───
    function animateCounter(el, target, duration = 1200, suffix = '', prefix = '') {
        if (!el || isNaN(target) || el._isAnimatingCounter) return;
        el._isAnimatingCounter = true;
        const start = 0;
        const startTime = performance.now();

        function update(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic formula
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * easeOut);
            
            el.textContent = `${prefix}${current.toLocaleString('en-US')}${suffix}`;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = `${prefix}${target.toLocaleString('en-US')}${suffix}`;
                el._isAnimatingCounter = false;
            }
        }
        requestAnimationFrame(update);
    }

    function initNumberCounters() {
        const selectorList = [
            '.kpi-num',
            '.stat-value',
            '#totalStudents',
            '#onlineStudents',
            '#activeToday',
            '#inactiveStudents',
            '#examsCount',
            '#pdfCount',
            '#totalLessonsCount',
            '#activeSubjectsCount',
            '[data-counter]'
        ];

        const elements = document.querySelectorAll(selectorList.join(', '));
        elements.forEach(el => {
            // Observe DOM text changes if numbers are populated dynamically by Firebase
            const observer = new MutationObserver(() => {
                const raw = el.textContent.trim();
                if (raw && raw !== '—' && raw !== '...' && !el._hasAnimatedOnce) {
                    const match = raw.match(/^([^\d]*)([\d,]+)(.*)$/);
                    if (match) {
                        const prefix = match[1] || '';
                        const num = parseInt(match[2].replace(/,/g, ''), 10);
                        const suffix = match[3] || '';
                        if (!isNaN(num) && num > 0) {
                            el._hasAnimatedOnce = true;
                            animateCounter(el, num, 1100, suffix, prefix);
                        }
                    }
                }
            });

            observer.observe(el, { childList: true, characterData: true, subtree: true });

            // Initial check
            const raw = el.textContent.trim();
            const match = raw.match(/^([^\d]*)([\d,]+)(.*)$/);
            if (match) {
                const prefix = match[1] || '';
                const num = parseInt(match[2].replace(/,/g, ''), 10);
                const suffix = match[3] || '';
                if (!isNaN(num) && num > 0 && !el._hasAnimatedOnce) {
                    el._hasAnimatedOnce = true;
                    animateCounter(el, num, 1100, suffix, prefix);
                }
            }
        });
    }

    // ─── 2. Interactive 3D Card Tilt Physics (Disabled for clean, static UX) ───
    function initCardTilt() {
        // Disabled
    }

    // ─── 3. Liquid Ripple Click System ───
    function initRippleClicks() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('button, .btn, .service-card, .action-icon-btn, .nav-btn, .filter-chip, .sort-btn');
            if (!target) return;

            const rect = target.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'motion-ripple-circle';

            const size = Math.max(rect.width, rect.height) * 1.5;
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

            target.appendChild(ripple);

            setTimeout(() => {
                if (ripple.parentElement) {
                    ripple.remove();
                }
            }, 600);
        });
    }

    // ─── 4. Site Assembly (Disabled - Static Instant Reveal) ───
    function initSiteAssembly() {
        const overlay = document.getElementById('elkhetaIntroOverlay');
        if (overlay) overlay.remove();
    }

    // ─── 4B. 3D Motion Graphics (Disabled for clean, stationary icons) ───
    function init3DMotionGraphics(root = document) {
        // Disabled
    }

    // ─── 5. Golden Confetti / Celebration Engine ───
    window.launchMotionCelebration = function(durationMs = 2800) {
        try {
            const canvas = document.createElement('canvas');
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100vw';
            canvas.style.height = '100vh';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '9999999';
            document.body.appendChild(canvas);

            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            const particles = [];
            const colors = ['#F59E0B', '#FBBF24', '#38BDF8', '#818CF8', '#10B981', '#FFFFFF', '#6366F1'];

            for (let i = 0; i < 90; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height * 0.4,
                    r: Math.random() * 6 + 4,
                    d: Math.random() * 40 + 10,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    tilt: Math.floor(Math.random() * 10) - 10,
                    tiltAngleIncremental: (Math.random() * 0.07) + 0.05,
                    tiltAngle: 0
                });
            }

            let animationFrameId;
            const startTime = performance.now();

            function draw() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles.forEach(p => {
                    p.tiltAngle += p.tiltAngleIncremental;
                    p.y += (Math.cos(p.d) + 3 + p.r / 2) / 1.5;
                    p.tilt = Math.sin(p.tiltAngle - (particles.indexOf(p) / 3)) * 15;

                    ctx.beginPath();
                    ctx.lineWidth = p.r / 2;
                    ctx.strokeStyle = p.color;
                    ctx.moveTo(p.x + p.tilt + p.r, p.y);
                    ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
                    ctx.stroke();
                });

                if (performance.now() - startTime < durationMs) {
                    animationFrameId = requestAnimationFrame(draw);
                } else {
                    cancelAnimationFrame(animationFrameId);
                    if (canvas.parentElement) canvas.remove();
                }
            }

            requestAnimationFrame(draw);
        } catch(e) {
            console.warn('Celebration canvas unsupported', e);
        }
    };

    // ─── 6. Intro Motion (Completely Disabled) ───
    window.playElkhetaIntroMotion = function() {
        const overlay = document.getElementById('elkhetaIntroOverlay');
        if (overlay) overlay.remove();
    };

    window.dismissElkhetaIntro = function() {
        const overlay = document.getElementById('elkhetaIntroOverlay');
        if (overlay) overlay.remove();
    };

    // ─── 7. Luxury Elkheta Pro Loader ⏳ (موشن التحميل الاحترافي) ───
    let _loaderEl = null;
    let _loaderCycleInterval = null;

    window.showElkhetaLoader = function(msg = 'جاري تجهيز بياناتك الأكاديمية...') {
        if (!_loaderEl) {
            _loaderEl = document.createElement('div');
            _loaderEl.className = 'elkheta-pro-loader-wrap';
            _loaderEl.id = 'elkhetaGlobalLoader';
            _loaderEl.innerHTML = `
                <div class="pro-loader-card">
                    <div class="pro-loader-icon-flipper" id="proLoaderFlipperIcon">📚</div>
                    <div class="pro-loader-brand">منصة الخطة • EL KHETA</div>
                    <div class="pro-loader-msg" id="proLoaderMsg">${msg}</div>
                    <div class="pro-loader-track">
                        <div class="pro-loader-fill"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(_loaderEl);
        }

        const msgEl = _loaderEl.querySelector('#proLoaderMsg');
        if (msgEl) msgEl.textContent = msg;

        _loaderEl.classList.add('active');

        // Cycle through icons: 📚 → 📝 → 🎯 → 🏆
        const icons = ['📚', '📝', '🎯', '🏆'];
        let idx = 0;
        const iconEl = _loaderEl.querySelector('#proLoaderFlipperIcon');
        clearInterval(_loaderCycleInterval);
        _loaderCycleInterval = setInterval(() => {
            idx = (idx + 1) % icons.length;
            if (iconEl) iconEl.textContent = icons[idx];
        }, 750);
    };

    window.hideElkhetaLoader = function() {
        clearInterval(_loaderCycleInterval);
        if (_loaderEl) {
            _loaderEl.classList.remove('active');
        }
    };

    // ─── 8. Student Achievement Popup 🏆 (موشن إنجاز الطالب والدرجات) ───
    window.showStudentAchievementMotion = function(targetScore = 90, title = 'أحسنت! إنجاز أكاديمي رائع 🎉', subtitle = 'واصل التألق وتصدر قائمة أوائل دفعة 2027!') {
        let wrap = document.getElementById('elkhetaAchievementModal');
        if (!wrap) {
            wrap = document.createElement('div');
            wrap.className = 'elkheta-achievement-wrap';
            wrap.id = 'elkhetaAchievementModal';
            wrap.innerHTML = `
                <div class="achievement-dialog-card">
                    <div class="achievement-trophy-badge">🏆</div>
                    <div class="achievement-score-num" id="achievementScoreNum">0%</div>
                    <div class="achievement-title" id="achievementTitle">${title}</div>
                    <div class="achievement-subtitle" id="achievementSubtitle">${subtitle}</div>
                    <button type="button" class="achievement-claim-btn" onclick="window.hideStudentAchievementMotion()">
                        ✨ استمرار ومواصلة التعلم
                    </button>
                </div>
            `;
            document.body.appendChild(wrap);
        }

        const numEl = wrap.querySelector('#achievementScoreNum');
        const titleEl = wrap.querySelector('#achievementTitle');
        const subEl = wrap.querySelector('#achievementSubtitle');
        if (titleEl) titleEl.textContent = title;
        if (subEl) subEl.textContent = subtitle;

        wrap.classList.add('active');

        // Ascent animation: 0 -> 25 -> 50 -> 75 -> target
        animateCounter(numEl, targetScore, 1400, '%');
        window.launchMotionCelebration(3200);
    };

    window.hideStudentAchievementMotion = function() {
        const wrap = document.getElementById('elkhetaAchievementModal');
        if (wrap) wrap.classList.remove('active');
    };

    // ─── 9. Mistake Correction Micro-Interaction 🧠 (موشن تصحيح الأخطاء) ───
    window.showMistakeCorrectionMotion = function(elementOrId) {
        const el = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
        if (!el) return;

        el.classList.remove('state-correct', 'state-wrong');
        el.classList.add('mistake-flip-node', 'state-flipping');
        el.innerHTML = '🔄 جاري التحقق...';

        setTimeout(() => {
            el.classList.remove('state-flipping');
            el.classList.add('state-correct');
            el.innerHTML = '✅ تم تصحيح الخطأ وتثبيت المفهوم!';
        }, 650);
    };

    // ─── Initialize All On DOM Ready ───
    function initAllMotionSystems() {
        initNumberCounters();
        initRippleClicks();
        const overlay = document.getElementById('elkhetaIntroOverlay');
        if (overlay) overlay.remove();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAllMotionSystems);
    } else {
        initAllMotionSystems();
    }

})();
