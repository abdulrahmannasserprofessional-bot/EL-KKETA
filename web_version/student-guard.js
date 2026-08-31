/**
 * ELKHETA Live Student Guard
 * يتحقق تلقائياً في الخلفية من حالة الطالب وحظره لمنع المحظورين من فتح أي صفحة
 */

(function() {
    async function enforceStudentGuard() {
        // لا يعمل في صفحات تسجيل الدخول أو الإدارة
        const page = window.location.pathname.split('/').pop();
        if (page === 'index.html' || page === 'register.html' || page.startsWith('admin')) return;

        const storedUser = localStorage.getItem('user');
        const studentCode = localStorage.getItem('studentCode') || (storedUser ? JSON.parse(storedUser).studentCode || JSON.parse(storedUser).code : null);

        if (!studentCode) {
            // ليس مسجلاً دخول
            return;
        }

        try {
            const res = await fetch(`https://backendapi-pi.vercel.app/api/students?search=${encodeURIComponent(studentCode)}`);
            const data = await res.json();

            if (data.success && data.students && data.students.length > 0) {
                const currentStudent = data.students.find(s => s.student_code.toUpperCase() === studentCode.toUpperCase());
                if (currentStudent && (currentStudent.is_banned == 1 || currentStudent.is_banned === true)) {
                    // الطالب محظور حالياً!
                    localStorage.removeItem('user');
                    localStorage.removeItem('studentCode');
                    sessionStorage.clear();

                    if (window.Swal) {
                        Swal.fire({
                            title: '🚫 الحساب معطل وموقوف',
                            text: 'تم إيقاف حسابك من قبل إدارة المنصة! يرجى التواصل مع الدعم الفني.',
                            icon: 'error',
                            confirmButtonText: 'العودة لصفحة الدخول',
                            allowOutsideClick: false
                        }).then(() => {
                            window.location.href = 'index.html';
                        });
                    } else {
                        alert('🚫 تم إيقاف حسابك من قبل إدارة المنصة!');
                        window.location.href = 'index.html';
                    }
                }
            }
        } catch (e) {
            console.warn('Student guard check skipped (offline or network delay)');
        }
    }

    // فحص عند تحميل الصفحة وكل 30 ثانية
    window.addEventListener('DOMContentLoaded', enforceStudentGuard);
    setInterval(enforceStudentGuard, 30000);
})();
