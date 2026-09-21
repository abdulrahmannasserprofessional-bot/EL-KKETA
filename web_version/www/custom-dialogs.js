/**
 * ELKHETA Custom Dialogs & Modal System
 * Replaces default browser alerts ('the site said') with ultra-sleek, modern modals
 */

(function() {
    // Inject Custom Dialog CSS
    const style = document.createElement('style');
    style.innerHTML = `
        .elkheta-modal-backdrop {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 999999;
            display: flex; align-items: center; justify-content: center;
            padding: 20px;
            opacity: 0; pointer-events: none;
            transition: opacity 0.25s ease;
            font-family: 'Cairo', sans-serif;
            direction: rtl;
        }
        .elkheta-modal-backdrop.active {
            opacity: 1; pointer-events: auto;
        }
        .elkheta-modal-box {
            background: #FFFFFF;
            border-radius: 28px;
            padding: 35px 25px 25px;
            max-width: 440px; width: 100%;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8);
            transform: scale(0.9) translateY(20px);
            transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
            position: relative;
        }
        .elkheta-modal-backdrop.active .elkheta-modal-box {
            transform: scale(1) translateY(0);
        }
        .elkheta-dialog-icon {
            width: 75px; height: 75px;
            border-radius: 24px;
            display: flex; align-items: center; justify-content: center;
            font-size: 38px;
            margin: 0 auto 18px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.06);
        }
        .elkheta-dialog-icon.info { background: #EEF2FF; border: 2px solid #C7D2FE; color: #4F46E5; }
        .elkheta-dialog-icon.success { background: #DCFCE7; border: 2px solid #86EFAC; color: #166534; }
        .elkheta-dialog-icon.warning { background: #FEF3C7; border: 2px solid #FDE68A; color: #D97706; }
        .elkheta-dialog-icon.error { background: #FEE2E2; border: 2px solid #FECACA; color: #DC2626; }

        .elkheta-dialog-title {
            font-size: 20px; font-weight: 900; color: #1E293B; margin-bottom: 10px;
        }
        .elkheta-dialog-msg {
            font-size: 15px; font-weight: 700; color: #64748B; line-height: 1.6; margin-bottom: 25px;
            white-space: pre-line; word-break: break-word;
        }
        .elkheta-dialog-actions {
            display: flex; gap: 10px; justify-content: center;
        }
        .elkheta-dialog-btn {
            padding: 13px 25px; border-radius: 16px; font-size: 15px; font-weight: 900;
            cursor: pointer; border: none; font-family: 'Cairo', sans-serif;
            transition: all 0.2s; flex: 1;
        }
        .elkheta-dialog-btn.primary {
            background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
            color: white; box-shadow: 0 6px 18px rgba(59, 130, 246, 0.35);
        }
        .elkheta-dialog-btn.primary:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(59, 130, 246, 0.45); }
        .elkheta-dialog-btn.secondary {
            background: #F1F5F9; color: #475569; border: 1px solid #E2E8F0;
        }
        .elkheta-dialog-btn.secondary:hover { background: #E2E8F0; }
        .elkheta-dialog-btn.danger {
            background: linear-gradient(135deg, #EF4444, #DC2626); color: white;
            box-shadow: 0 6px 18px rgba(239, 68, 68, 0.35);
        }
    `;
    document.head.appendChild(style);

    // Create Modal DOM Elements
    let modalBackdrop = null;

    function getModalElements() {
        if (!modalBackdrop) {
            modalBackdrop = document.createElement('div');
            modalBackdrop.className = 'elkheta-modal-backdrop';
            modalBackdrop.innerHTML = `
                <div class="elkheta-modal-box">
                    <div class="elkheta-dialog-icon" id="elkhetaDialogIcon">🎓</div>
                    <div class="elkheta-dialog-title" id="elkhetaDialogTitle">منصة الخطة التعليمية</div>
                    <div class="elkheta-dialog-msg" id="elkhetaDialogMsg"></div>
                    <div class="elkheta-dialog-actions" id="elkhetaDialogActions"></div>
                </div>
            `;
            document.body.appendChild(modalBackdrop);
        }
        return {
            backdrop: modalBackdrop,
            icon: document.getElementById('elkhetaDialogIcon'),
            title: document.getElementById('elkhetaDialogTitle'),
            msg: document.getElementById('elkhetaDialogMsg'),
            actions: document.getElementById('elkhetaDialogActions')
        };
    }

    // Global Styled Alert
    window.showCustomAlert = function(title, message, type = 'info') {
        return new Promise(resolve => {
            const el = getModalElements();
            
            let iconText = 'ℹ️';
            let iconClass = 'info';
            if (type === 'success' || (message && (message.includes('نجاح') || message.includes('🎉')))) {
                iconText = '🎉'; iconClass = 'success';
            } else if (type === 'warning' || (message && (message.includes('تنبيه') || message.includes('يرجى') || message.includes('⚠️')))) {
                iconText = '⚠️'; iconClass = 'warning';
            } else if (type === 'error' || (message && (message.includes('خطأ') || message.includes('إيقاف') || message.includes('❌')))) {
                iconText = '🚫'; iconClass = 'error';
            }

            el.icon.textContent = iconText;
            el.icon.className = `elkheta-dialog-icon ${iconClass}`;
            el.title.textContent = title || 'منصة الخطة التعليمية';
            el.msg.textContent = message || '';
            
            el.actions.innerHTML = `<button class="elkheta-dialog-btn primary" id="elkhetaAlertOkBtn">حسناً فهمت 👍</button>`;
            el.backdrop.classList.add('active');

            const okBtn = document.getElementById('elkhetaAlertOkBtn');
            if (okBtn) {
                okBtn.focus();
                okBtn.onclick = function() {
                    el.backdrop.classList.remove('active');
                    resolve(true);
                };
            }
        });
    };

    // Global Styled Confirm
    window.showCustomConfirm = function(title, message, confirmText = 'نعم، متأكد', cancelText = 'إلغاء', isDanger = false) {
        let onConfirmCb = null;
        let onCancelCb = null;
        let actualConfirmText = 'نعم، متأكد';
        let actualCancelText = 'إلغاء';
        let actualIsDanger = isDanger;

        if (typeof confirmText === 'function') {
            onConfirmCb = confirmText;
            actualConfirmText = 'نعم، متأكد';
            if (typeof cancelText === 'function') {
                onCancelCb = cancelText;
                actualCancelText = 'إلغاء';
            }
        } else if (typeof confirmText === 'string') {
            if (confirmText.includes('=>') || confirmText.includes('{') || confirmText.includes('function') || confirmText.includes('localStorage')) {
                actualConfirmText = 'نعم، خروج 🚪';
            } else {
                actualConfirmText = confirmText.trim() || 'نعم، متأكد';
            }
            if (typeof cancelText === 'string') actualCancelText = cancelText.trim() || 'إلغاء';
        }

        return new Promise(resolve => {
            const el = getModalElements();
            el.icon.textContent = actualIsDanger ? '⚠️' : '❓';
            el.icon.className = actualIsDanger ? 'elkheta-dialog-icon error' : 'elkheta-dialog-icon info';
            el.title.textContent = title || 'تأكيد الإجراء';
            el.msg.textContent = message || '';

            el.actions.innerHTML = `
                <button class="elkheta-dialog-btn ${actualIsDanger ? 'danger' : 'primary'}" id="elkhetaConfirmYesBtn">${actualConfirmText}</button>
                <button class="elkheta-dialog-btn secondary" id="elkhetaConfirmCancelBtn">${actualCancelText}</button>
            `;
            el.backdrop.classList.add('active');

            document.getElementById('elkhetaConfirmYesBtn').onclick = function() {
                el.backdrop.classList.remove('active');
                if (onConfirmCb) onConfirmCb();
                resolve(true);
            };
            document.getElementById('elkhetaConfirmCancelBtn').onclick = function() {
                el.backdrop.classList.remove('active');
                if (onCancelCb) onCancelCb();
                resolve(false);
            };
        });
    };

    // OVERRIDE default browser alert & confirm so "the site said" NEVER shows!
    window.alert = function(message) {
        window.showCustomAlert('تنبيه من منصة الخطة', message, 'info');
    };

})();
