/**
 * ELKHETA Ultra-Sleek PWA Installation System
 * Premium centered UI, custom installation sheet, and multi-platform support
 */

(function() {
    let deferredPrompt = null;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

    // Inject Styles
    const style = document.createElement('style');
    style.innerHTML = `
        /* In-Card Banner (Centered) */
        .pwa-card-widget {
            background: linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%);
            border: 1.5px solid rgba(129, 140, 248, 0.4);
            border-radius: 20px;
            padding: 16px;
            margin: 20px 0 10px;
            color: white;
            box-shadow: 0 10px 30px rgba(67, 56, 202, 0.25);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            text-align: right;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }
        .pwa-card-widget:before {
            content: '';
            position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
            animation: shinePWA 3.5s infinite;
        }
        @keyframes shinePWA {
            0% { left: -100%; }
            20% { left: 100%; }
            100% { left: 100%; }
        }
        .pwa-card-widget:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 35px rgba(67, 56, 202, 0.4);
            border-color: #A5B4FC;
        }
        .pwa-card-widget-btn {
            background: #FFFFFF;
            color: #312E81;
            border: none;
            padding: 9px 16px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 900;
            font-family: 'Cairo', sans-serif;
            cursor: pointer;
            white-space: nowrap;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.2s;
        }
        .pwa-card-widget-btn:hover { transform: scale(1.05); }

        /* Floating Centered Bottom Pill */
        .pwa-floating-center {
            position: fixed;
            bottom: 22px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            background: rgba(15, 23, 42, 0.88);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            border: 1.5px solid rgba(99, 102, 241, 0.4);
            color: white;
            padding: 10px 22px;
            border-radius: 30px;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4), 0 0 20px rgba(99, 102, 241, 0.2);
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            font-family: 'Cairo', sans-serif;
            font-size: 13px;
            font-weight: 800;
            white-space: nowrap;
        }
        .pwa-floating-center:hover {
            transform: translateX(-50%) translateY(-3px);
            border-color: #818CF8;
            box-shadow: 0 18px 45px rgba(0, 0, 0, 0.5), 0 0 25px rgba(99, 102, 241, 0.35);
        }
        .pwa-floating-center:active { transform: translateX(-50%) scale(0.97); }

        /* Custom In-App Install Modal Sheet */
        .pwa-sheet-backdrop {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            z-index: 999999;
            display: flex; align-items: center; justify-content: center;
            padding: 20px 16px;
            opacity: 0; pointer-events: none;
            transition: opacity 0.25s ease;
            font-family: 'Cairo', sans-serif;
            direction: rtl;
        }
        .pwa-sheet-backdrop.active { opacity: 1; pointer-events: auto; }
        .pwa-sheet-box {
            background: #FFFFFF;
            border-radius: 28px;
            padding: 35px 24px 25px;
            max-width: 440px; width: 100%;
            text-align: center;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
            transform: scale(0.92) translateY(20px);
            transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
            position: relative;
        }
        .pwa-sheet-backdrop.active .pwa-sheet-box { transform: scale(1) translateY(0); }

        .pwa-app-logo {
            width: 80px; height: 80px;
            border-radius: 24px;
            box-shadow: 0 12px 25px rgba(79, 70, 229, 0.3);
            margin: 0 auto 16px;
            display: block;
        }

        .pwa-features-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 10px;
            text-align: right;
            margin: 20px 0 25px;
        }
        .pwa-feature-row {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 14px;
            padding: 10px 14px;
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 13px;
            font-weight: 800;
            color: #334155;
        }

        .pwa-btn-submit {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #4F46E5 100%);
            color: white;
            border: none;
            border-radius: 16px;
            font-size: 16px;
            font-weight: 900;
            font-family: 'Cairo', sans-serif;
            cursor: pointer;
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.35);
            transition: all 0.2s;
            display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .pwa-btn-submit:hover { transform: translateY(-2px); box-shadow: 0 15px 35px rgba(59, 130, 246, 0.45); }
    `;
    document.head.appendChild(style);

    // Capture install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
    });

    // Custom In-App Install Sheet
    let sheetBackdrop = null;

    function createInstallSheet() {
        if (sheetBackdrop) return sheetBackdrop;
        sheetBackdrop = document.createElement('div');
        sheetBackdrop.className = 'pwa-sheet-backdrop';
        sheetBackdrop.id = 'pwaSheetBackdrop';

        let actionContent = '';
        if (isIOS) {
            actionContent = `
                <div style="background:#EFF6FF; border:1.5px solid #BFDBFE; border-radius:16px; padding:14px; text-align:right; font-size:13px; color:#1E40AF; line-height:1.7; margin-bottom:20px;">
                    <div style="font-weight:900; margin-bottom:4px;">📲 خطوات التثبيت على آيفون / آيباد:</div>
                    1. اضغط على زر <strong>المشاركة ⎋</strong> بأسفل المتصفح.<br>
                    2. مرر للأسفل واختر <strong>إضافة إلى الشاشة الرئيسية ➕</strong>.<br>
                    3. اضغط على <strong>إضافة</strong> وسيظهر التطبيق على شاشتك فوراً!
                </div>
                <button class="pwa-btn-submit" onclick="closeInstallSheet()">حسناً، فهمت الخطوات 👍</button>
            `;
        } else {
            actionContent = `
                <button class="pwa-btn-submit" onclick="executeNativeInstall()">
                    <span>📲</span> تثبيت التطبيق على جهازي الآن
                </button>
                <button style="background:none; border:none; color:#94A3B8; font-size:13px; font-weight:800; margin-top:12px; cursor:pointer; font-family:'Cairo',sans-serif;" onclick="closeInstallSheet()">لاحقاً</button>
            `;
        }

        sheetBackdrop.innerHTML = `
            <div class="pwa-sheet-box">
                <img src="icons/icon-192.png" alt="الخطة" class="pwa-app-logo">
                <h2 style="font-size:20px; font-weight:900; color:#1E293B; margin-bottom:4px;">تطبيق منصة الخطة التعليمية</h2>
                <p style="font-size:12px; color:#6366F1; font-weight:800;">نسخة سريعة • تعمل بدون نت • إشعارات فورية</p>

                <div class="pwa-features-grid">
                    <div class="pwa-feature-row">
                        <span style="font-size:18px;">⚡</span>
                        <span>سرعة فائقة (0 ثانية) بدون أي تأخير</span>
                    </div>
                    <div class="pwa-feature-row">
                        <span style="font-size:18px;">📶</span>
                        <span>متابعة وحل الامتحانات حتى عند انقطاع النت</span>
                    </div>
                    <div class="pwa-feature-row">
                        <span style="font-size:18px;">🔔</span>
                        <span>تنبيهات فورية عند رفع محاضرات أو امتحانات جديدة</span>
                    </div>
                </div>

                ${actionContent}
            </div>
        `;
        document.body.appendChild(sheetBackdrop);
        return sheetBackdrop;
    }

    window.openInstallSheet = function() {
        if (isStandalone) {
            if (window.showCustomAlert) {
                window.showCustomAlert('التطبيق مثبت بالفعل 🚀', 'أنت تستخدم تطبيق المنصة المثبت على جهازك حالياً!', 'success');
            } else {
                alert('أنت تستخدم التطبيق المثبت بالفعل 🚀');
            }
            return;
        }
        const sheet = createInstallSheet();
        sheet.classList.add('active');
    };

    window.closeInstallSheet = function() {
        if (sheetBackdrop) sheetBackdrop.classList.remove('active');
    };

    window.executeNativeInstall = function() {
        closeInstallSheet();
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('App install accepted');
                }
                deferredPrompt = null;
            });
        } else {
            if (window.showCustomAlert) {
                window.showCustomAlert('تثبيت التطبيق', 'من قائمة المتصفح (الثلاث نقاط ︙ بالأعلى)، اضغط على "تثبيت التطبيق" أو "إضافة للشاشة الرئيسية" 🚀', 'info');
            }
        }
    };

    window.installPWA = window.openInstallSheet;

    // Render Floating Center Pill on Login Page
    window.addEventListener('DOMContentLoaded', () => {
        if (!isStandalone && (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/'))) {
            // Remove any old buttons if present
            document.querySelectorAll('.pwa-floating-btn').forEach(e => e.remove());
            
            const pill = document.createElement('div');
            pill.className = 'pwa-floating-center';
            pill.innerHTML = `
                <span style="font-size:16px;">📲</span>
                <span>تثبيت تطبيق الخطة على جهازك</span>
                <span style="background:#4F46E5; color:white; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:900;">مجاناً ✨</span>
            `;
            pill.onclick = window.openInstallSheet;
            document.body.appendChild(pill);
        }
    });

})();



    // Force Service Worker Update & Cache Purge on every load
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            for (let registration of registrations) {
                registration.update();
            }
        });
    }
