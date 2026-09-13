/**
 * 🎬 ELKHETA KINETIC MOTION & INTERACTION ENGINE (PRO 2027)
 * Hardware-accelerated 3D Tilt, Kinetic Number Counters, Liquid Ripples & Scroll Reveals.
 */

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

    // ─── 2. Interactive 3D Card Tilt Physics ───
    function initCardTilt() {
        // Do not enable on touch devices to conserve battery & prevent jumpy touch scrolling
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

        const tiltCards = document.querySelectorAll('.service-card, .kpi-card, .subject-card, .stat-chip, .card');
        
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Max tilt 3.5 degrees
                const rotateX = ((y - centerY) / centerY) * -3.5;
                const rotateY = ((x - centerX) / centerX) * 3.5;

                card.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px) scale(1.008)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
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

    // ─── 4. Precision Site Assembly Engine (تجميع جزء جزء نقطة نقطة) ───
    function initSiteAssembly() {
        // 1. Stage 1: Structural Foundations & Headers (جزء الهيكل العلوي)
        const topHeaders = document.querySelectorAll('.dynamic-island-pill, .site-header, .main-topbar, .topbar, .header-island, .app-header');
        topHeaders.forEach((el, idx) => {
            el.classList.add('assemble-unit', `assemble-part-${idx + 1}`);
        });

        // 2. Stage 2: Navigation Dock & Sidebars (جزء القائمة والدوك)
        const navDocks = document.querySelectorAll('.dock-sidebar, .sidebar, .nav-dock, .bottom-nav, .mobile-bottom-bar');
        navDocks.forEach((el, idx) => {
            el.classList.add('assemble-unit', `assemble-part-${idx + 2}`);
        });

        // 3. Stage 3: KPI Widgets & Live Counters (أجزاء العدادات الذكية)
        const kpiCards = document.querySelectorAll('.kpi-card, .stat-chip, .kpi-widget, .summary-metric-card');
        kpiCards.forEach((el, idx) => {
            const step = Math.min(idx + 3, 7);
            el.classList.add('assemble-unit', `assemble-part-${step}`);
            el.style.setProperty('--assemble-base-delay', `${(step * 0.05).toFixed(2)}s`);
        });

        // 4. Stage 4: Sectors & Main Service Containers (قطاعات المنظومة والخدمات)
        const sectorHeaders = document.querySelectorAll('.sector-header, .list-section-header, .form-card, .section-title-wrap');
        sectorHeaders.forEach((el, idx) => {
            const step = Math.min(idx + 6, 11);
            el.classList.add('assemble-unit', `assemble-part-${step}`);
            el.style.setProperty('--assemble-base-delay', `${(step * 0.05).toFixed(2)}s`);
        });

        // 5. Stage 5: Cards, Lessons, Students & Buttons (البطاقات والوحدات التفاعلية)
        function registerDynamicAssemblyItems(root = document) {
            const cards = root.querySelectorAll(
                '.service-card, .student-item-card, .lesson-card-item, .subject-group-card, .exam-box, .card, .course-card, .quiz-card'
            );

            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('motion-reveal');
                            // Add locked-in precision snap indicator once assembled
                            setTimeout(() => {
                                entry.target.classList.add('locked-in');
                            }, 550);
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });

                cards.forEach((el, idx) => {
                    if (el._hasAssemblySetup) return;
                    el._hasAssemblySetup = true;
                    const step = (idx % 12) + 1;
                    el.classList.add(`assemble-part-${step}`);
                    el.style.setProperty('--assemble-base-delay', `${(step * 0.04).toFixed(2)}s`);
                    observer.observe(el);
                });
            } else {
                cards.forEach((el, idx) => {
                    el.classList.add('motion-reveal', `assemble-part-${(idx % 12) + 1}`);
                });
            }
        }

        registerDynamicAssemblyItems(document);

        // 6. Observe dynamic container insertions from Firebase (المحاضرات والطلاب عند جلبهم لحظياً)
        const dynamicContainers = document.querySelectorAll(
            '#adminLessonsList, #studentsContainer, #coursesContainer, .lessons-container, .students-grid, .dynamic-cards-list'
        );

        dynamicContainers.forEach(container => {
            const mutObserver = new MutationObserver(() => {
                registerDynamicAssemblyItems(container);
            });
            mutObserver.observe(container, { childList: true });
        });
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

    // ─── 6. Cinematic Assembly Opening Motion (موشن افتتاح وتجميع المنصة 🧩) ───
    window.playElkhetaIntroMotion = function(force = false) {
        if (!force && sessionStorage.getItem('elkheta_intro_seen') === 'true') return;
        
        let overlay = document.getElementById('elkhetaIntroOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'elkheta-intro-overlay';
            overlay.id = 'elkhetaIntroOverlay';
            overlay.innerHTML = `
                <div class="intro-cyber-grid"></div>
                <button type="button" class="intro-skip-btn" onclick="window.dismissElkhetaIntro()">تخطي العرض ✕</button>
                <div class="intro-stage-container">
                    <div class="intro-shockwave"></div>
                    <div class="intro-module-block intro-mod-1"><span style="font-size:18px;">📚</span> المحتوى والدروس</div>
                    <div class="intro-module-block intro-mod-2"><span style="font-size:18px;">📝</span> بنوك الأسئلة والامتحانات</div>
                    <div class="intro-module-block intro-mod-3"><span style="font-size:18px;">🎧</span> الشرح الصوتي المطور</div>
                    <div class="intro-module-block intro-mod-4"><span style="font-size:18px;">📊</span> التقارير والذكاء الاصطناعي</div>
                    <div class="intro-module-block intro-mod-5"><span style="font-size:18px;">🏆</span> لوحة الشرف والأوائل</div>
                    
                    <div class="intro-assembled-core">
                        <div class="intro-logo-badge">🎓</div>
                        <div class="intro-brand-title">منصة الخطة</div>
                        <div class="intro-brand-sub">EL KHETA PRO 2027 • المنظومة المتكاملة</div>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
        }

        overlay.classList.remove('dismissed');
        sessionStorage.setItem('elkheta_intro_seen', 'true');

        // Auto dismiss after 3.6s
        clearTimeout(overlay._dismissTimer);
        overlay._dismissTimer = setTimeout(() => {
            window.dismissElkhetaIntro();
        }, 3600);
    };

    window.dismissElkhetaIntro = function() {
        const overlay = document.getElementById('elkhetaIntroOverlay');
        if (overlay) {
            overlay.classList.add('dismissed');
            setTimeout(() => {
                if (overlay.parentElement) overlay.remove();
            }, 650);
        }
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
        initCardTilt();
        initRippleClicks();
        initSiteAssembly();

        // Auto launch intro only on home.html on first entry of the session
        const path = window.location.pathname.toLowerCase();
        if ((path.endsWith('home.html') || path.endsWith('/') || path.endsWith('index.html')) && !sessionStorage.getItem('elkheta_intro_seen')) {
            // Slight delay for smooth visual paint
            setTimeout(() => {
                if (window.playElkhetaIntroMotion) {
                    window.playElkhetaIntroMotion();
                }
            }, 300);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAllMotionSystems);
    } else {
        initAllMotionSystems();
    }

})();
