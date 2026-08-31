/**
 * ELKHETA Live Student Ban Enforcement Guard
 * شاشة قفل ثابتة تظهر بوضوح وبشكل دائم عند حظر الطالب لمنع الدخول وتنبيهه
 */

(function() {
    let isBanModalShown = false;

    function showBanLockScreen(studentName) {
        if (isBanModalShown) return;
        isBanModalShown = true;

        // تنظيف الجلسة
        localStorage.removeItem('user');
        localStorage.removeItem('studentCode');
        sessionStorage.clear();

        // إنشاء شاشة حظر ثابتة تغطي الصفحة بالكامل
        const overlay = document.createElement('div');
        overlay.id = 'elkhetaBanOverlay';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.92);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            z-index: 99999999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            font-family: 'Cairo', sans-serif;
            direction: rtl;
        `;

        overlay.innerHTML = `
            <div style="
                background: #FFFFFF;
                border-radius: 28px;
                padding: 40px 30px;
                max-width: 440px;
                width: 100%;
                text-align: center;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(239, 68, 68, 0.3);
                animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            ">
                <div style="
                    width: 80px; height: 80px;
                    background: #FEE2E2;
                    border: 3px solid #FECACA;
                    color: #DC2626;
                    border-radius: 24px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 40px;
                    margin: 0 auto 20px;
                ">🚫</div>

                <h2 style="font-size: 22px; font-weight: 900; color: #1E293B; margin-bottom: 8px;">حسابك موقوف ومعطل</h2>
                <p style="font-size: 14px; font-weight: 700; color: #64748B; margin-bottom: 20px; line-height: 1.6;">
                    عزيزي الطالب <strong style="color:#0F172A;">${studentName || ''}</strong>،<br>
                    تم إيقاف وتعطيل حسابك من قبل إدارة المنصة.<br>
                    يرجى التواصل مع الدعم الفني لحل المشكلة.
                </p>

                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <a href="https://wa.me/201158210358" target="_blank" style="
                        display: flex; align-items: center; justify-content: center; gap: 8px;
                        background: #10B981; color: white; padding: 12px; border-radius: 14px;
                        font-weight: 800; font-size: 14px; text-decoration: none;
                    ">
                        💬 تواصل مع الدعم الفني عبر واتساب
                    </a>
                    
                    <button onclick="window.location.href='index.html'" style="
                        background: #F1F5F9; color: #475569; border: 1px solid #E2E8F0;
                        padding: 12px; border-radius: 14px; font-weight: 800; font-size: 14px;
                        cursor: pointer; font-family: 'Cairo', sans-serif;
                    ">
                        العودة لصفحة الدخول الرئيسية
                    </button>
                </div>
            </div>
            <style>
                @keyframes popIn {
                    from { transform: scale(0.85); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            </style>
        `;

        document.body.appendChild(overlay);
    }

    async function checkStudentBan() {
        const page = window.location.pathname.split('/').pop();
        if (page === 'index.html' || page === 'register.html' || page.startsWith('admin')) return;

        const storedUser = localStorage.getItem('user');
        const studentCode = localStorage.getItem('studentCode') || (storedUser ? JSON.parse(storedUser).studentCode || JSON.parse(storedUser).code : null);

        if (!studentCode) return;

        try {
            const res = await fetch(`https://backendapi-pi.vercel.app/api/students?search=${encodeURIComponent(studentCode)}`);
            const data = await res.json();

            if (data.success && data.students && data.students.length > 0) {
                const currentStudent = data.students.find(s => s.student_code.toUpperCase() === studentCode.toUpperCase());
                if (currentStudent && (currentStudent.is_banned == 1 || currentStudent.is_banned === true)) {
                    showBanLockScreen(currentStudent.full_name);
                }
            }
        } catch (e) {
            console.warn('Ban check delay');
        }
    }

    // فحص فوري عند فتح الصفحة ودوري كل 15 ثانية
    window.addEventListener('DOMContentLoaded', checkStudentBan);
    setInterval(checkStudentBan, 15000);
})();
