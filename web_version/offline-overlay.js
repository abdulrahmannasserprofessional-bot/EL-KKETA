/**
 * ELKHETA Global Offline Screen & Overlay
 * Appears seamlessly on ANY page when internet is disconnected
 */

(function() {
    // Inject Styles
    const style = document.createElement('style');
    style.innerHTML = `
        .elkheta-offline-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(15, 23, 42, 0.94);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            z-index: 9999999;
            display: flex; align-items: center; justify-content: center;
            padding: 20px 16px;
            opacity: 0; pointer-events: none;
            transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: 'Cairo', sans-serif;
            direction: rtl;
            color: #F8FAFC;
        }
        .elkheta-offline-overlay.active {
            opacity: 1; pointer-events: auto;
        }
        .elkheta-offline-card {
            background: rgba(30, 41, 59, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 32px;
            padding: 35px 25px;
            max-width: 480px; width: 100%;
            text-align: center;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
            transform: scale(0.92) translateY(20px);
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            position: relative;
            max-height: 90vh;
            overflow-y: auto;
        }
        .elkheta-offline-overlay.active .elkheta-offline-card {
            transform: scale(1) translateY(0);
        }
        .elkheta-offline-icon-wrap {
            width: 85px; height: 85px;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(245, 158, 11, 0.2));
            border: 2px solid rgba(239, 68, 68, 0.4);
            border-radius: 26px;
            display: flex; align-items: center; justify-content: center;
            font-size: 40px; margin: 0 auto 20px;
            position: relative;
            animation: floatRadar 3s ease-in-out infinite;
        }
        @keyframes floatRadar {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
        }
        .elkheta-offline-ping {
            position: absolute; top: -5px; right: -5px; width: 18px; height: 18px;
            background: #EF4444; border: 3px solid #0F172A; border-radius: 50%;
            animation: radarPing 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes radarPing { 75%, 100% { transform: scale(2); opacity: 0; } }

        .elkheta-offline-btn-retry {
            width: 100%;
            background: linear-gradient(135deg, #4318FF 0%, #868CFF 100%);
            color: white; border: none; padding: 15px; border-radius: 18px;
            font-size: 15px; font-weight: 900; font-family: 'Cairo', sans-serif;
            cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
            box-shadow: 0 10px 25px rgba(67, 24, 255, 0.35);
            transition: all 0.2s; margin-top: 20px;
        }
        .elkheta-offline-btn-retry:hover { transform: translateY(-2px); box-shadow: 0 15px 35px rgba(67, 24, 255, 0.45); }

        .elkheta-offline-btn-file {
            width: 100%;
            background: rgba(255, 255, 255, 0.06);
            color: #E2E8F0; border: 1px solid rgba(255, 255, 255, 0.15);
            padding: 13px; border-radius: 16px; font-size: 13px; font-weight: 800;
            font-family: 'Cairo', sans-serif; cursor: pointer;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            margin-top: 10px; transition: all 0.2s;
        }
        .elkheta-offline-btn-file:hover { background: rgba(255, 255, 255, 0.12); }

        .elkheta-offline-dismiss {
            position: absolute; top: 18px; left: 18px;
            background: rgba(255, 255, 255, 0.08);
            color: #94A3B8; border: none; width: 34px; height: 34px;
            border-radius: 50%; font-size: 16px; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
        }
        .elkheta-offline-dismiss:hover { background: rgba(255, 255, 255, 0.18); color: white; }

        .elkheta-mini-math {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px; padding: 16px; margin-top: 20px;
        }
    `;
    document.head.appendChild(style);

    // Create Global Overlay Element
    let overlay = null;
    let mathQ = { n1: 7, n2: 8, op: '×', ans: 56, score: 0 };

    function createOverlay() {
        if (overlay) return overlay;
        overlay = document.createElement('div');
        overlay.className = 'elkheta-offline-overlay';
        overlay.id = 'elkhetaOfflineOverlay';
        overlay.innerHTML = `
            <div class="elkheta-offline-card">
                <button class="elkheta-offline-dismiss" onclick="dismissOfflineOverlay()" title="إغلاق والتصفح أوفلاين">✕</button>
                <div class="elkheta-offline-icon-wrap">
                    📡
                    <div class="elkheta-offline-ping"></div>
                </div>
                <h2 style="font-size: 22px; font-weight: 900; color: #FFFFFF; margin-bottom: 6px;">انقطع الاتصال بالإنترنت</h2>
                <p style="font-size: 13px; color: #94A3B8; line-height: 1.6;">
                    يبدو أن جهازك غير متصل بالشبكة حالياً.<br>
                    يمكنك متابعة حل الامتحانات المحملة مسبقاً بدون نت! 🚀
                </p>

                <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,0.05); padding:6px 16px; border-radius:20px; font-size:12px; font-weight:800; margin-top:14px; border:1px solid rgba(255,255,255,0.1);" id="globalNetStatusPill">
                    <span style="width:8px; height:8px; border-radius:50%; background:#EF4444;" id="globalNetStatusDot"></span>
                    <span id="globalNetStatusMsg">غير متصل بالإنترنت</span>
                </div>

                <button class="elkheta-offline-btn-retry" onclick="retryGlobalConnection()">
                    <span>🔄</span> إعادة فحص الاتصال وتحديث الصفحة
                </button>

                <button class="elkheta-offline-btn-file" onclick="openGlobalOfflineFile()">
                    <span>📂</span> فتح امتحان محمل أوفلاين (ملف HTML)
                </button>
                <input type="file" id="globalOfflineFileInput" accept=".html,.htm" style="display:none;" onchange="handleGlobalOfflineFile(this)">

                <div class="elkheta-mini-math">
                    <div style="font-size: 12px; font-weight: 800; color: #F59E0B; margin-bottom: 8px;">⚡ تنشيط سريع للعقل حتى يعود النت:</div>
                    <div style="font-size: 20px; font-weight: 900; color: white; margin-bottom: 10px; direction: ltr;" id="overlayMathQ">8 × 7 = ?</div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;" id="overlayMathOpts"></div>
                    <div style="font-size:11px; color:#94A3B8; font-weight:800; margin-top:8px;">النقاط: <span id="overlayMathScore" style="color:#10B981;">0</span> 🌟</div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        initMathMiniGame();
        return overlay;
    }

    window.showOfflineOverlay = function() {
        // Skip on offline.html itself
        if (window.location.pathname.includes('offline.html')) return;
        const el = createOverlay();
        el.classList.add('active');
    };

    window.dismissOfflineOverlay = function() {
        if (overlay) overlay.classList.remove('active');
    };

    window.retryGlobalConnection = function() {
        const dot = document.getElementById('globalNetStatusDot');
        const msg = document.getElementById('globalNetStatusMsg');
        if (dot) dot.style.background = '#F59E0B';
        if (msg) msg.textContent = 'جاري التحقق من الشبكة...';

        if (navigator.onLine) {
            fetch('https://www.gstatic.com/generate_204', { mode: 'no-cors', cache: 'no-store' })
                .then(() => {
                    if (dot) dot.style.background = '#10B981';
                    if (msg) msg.textContent = 'تمت استعادة الاتصال بنجاح! 🟢';
                    setTimeout(() => {
                        window.dismissOfflineOverlay();
                        if (window.showToast) window.showToast('🟢 تمت استعادة الاتصال بالإنترنت بنجاح!', 'success');
                    }, 500);
                })
                .catch(() => {
                    if (dot) dot.style.background = '#EF4444';
                    if (msg) msg.textContent = 'لا يوجد اتصال فعلي بالإنترنت';
                });
        } else {
            setTimeout(() => {
                if (dot) dot.style.background = '#EF4444';
                if (msg) msg.textContent = 'غير متصل بالإنترنت';
            }, 400);
        }
    };

    window.openGlobalOfflineFile = function() {
        const inp = document.getElementById('globalOfflineFileInput');
        if (inp) inp.click();
    };

    window.handleGlobalOfflineFile = function(input) {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const blob = new Blob([e.target.result], { type: 'text/html;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                window.location.href = url;
            };
            reader.readAsText(file);
        }
    };

    function initMathMiniGame() {
        const ops = ['+', '-', '×'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        let n1 = Math.floor(Math.random() * 12) + 2;
        let n2 = Math.floor(Math.random() * 12) + 2;
        let ans = 0;
        if (op === '+') ans = n1 + n2;
        else if (op === '-') { if (n1 < n2) { const t = n1; n1 = n2; n2 = t; } ans = n1 - n2; }
        else { n1 = Math.floor(Math.random() * 9) + 2; n2 = Math.floor(Math.random() * 9) + 2; ans = n1 * n2; }

        mathQ.ans = ans;
        const qEl = document.getElementById('overlayMathQ');
        if (qEl) qEl.textContent = `${n1} ${op} ${n2} = ?`;

        const choices = [ans];
        while (choices.length < 4) {
            const fake = ans + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
            if (fake >= 0 && !choices.includes(fake)) choices.push(fake);
        }
        choices.sort(() => 0.5 - Math.random());

        const optsEl = document.getElementById('overlayMathOpts');
        if (!optsEl) return;
        optsEl.innerHTML = '';
        choices.forEach(val => {
            const b = document.createElement('button');
            b.style.cssText = 'background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); color:white; padding:8px; border-radius:10px; font-weight:800; font-size:14px; cursor:pointer;';
            b.textContent = val;
            b.onclick = function() {
                if (val === mathQ.ans) {
                    b.style.background = '#10B981';
                    mathQ.score++;
                    const scEl = document.getElementById('overlayMathScore');
                    if (scEl) scEl.textContent = mathQ.score;
                    setTimeout(initMathMiniGame, 350);
                } else {
                    b.style.background = '#EF4444';
                    setTimeout(initMathMiniGame, 450);
                }
            };
            optsEl.appendChild(b);
        });
    }

    // Network Event Listeners
    window.addEventListener('offline', () => {
        window.showOfflineOverlay();
    });

    window.addEventListener('online', () => {
        window.retryGlobalConnection();
    });

    // Check initial state
    window.addEventListener('DOMContentLoaded', () => {
        if (!navigator.onLine) {
            window.showOfflineOverlay();
        }
    });

})();
