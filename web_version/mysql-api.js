/**
 * ELKHETA MySQL Cloud REST API Client
 * مكتبة الربط الموحدة لجميع صفحات الويب مع سيرفر MySQL السحابي
 */

const API_BASE_URL = 'https://backendapi-pi.vercel.app/api';

async function safeFetchJson(url, options = {}, timeoutMs = 8000) {
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        const fetchOptions = { ...options, signal: controller.signal };
        const res = await fetch(url, fetchOptions);
        clearTimeout(timer);
        
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const data = await res.json();
            return data;
        } else {
            const text = await res.text();
            return { success: res.ok, error: res.ok ? null : (text || 'خطأ في استجابة الخادم'), status: res.status };
        }
    } catch (err) {
        return { success: false, error: err.name === 'AbortError' ? 'انتهت مهلة الاتصال بالخادم' : ('تعذر الاتصال بالخادم: ' + err.message) };
    }
}

const ElkhetaAPI = {
    // 1. تسجيل ودخول الطالب
    async studentAuth(studentCode, fullName = '', phone = '', parentPhone = '', grade = '', deviceId = '') {
        return await safeFetchJson(`${API_BASE_URL}/auth/student`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student_code: studentCode,
                full_name: fullName,
                phone: phone,
                parent_phone: parentPhone,
                grade: grade,
                device_id: deviceId || localStorage.getItem('deviceId') || ''
            })
        }, 5000);
    },

    // 2. تسجيل دخول المشرف / الأدمن
    async adminLogin(username, password) {
        const u = (username || '').trim();
        const p = (password || '').trim();

        // 1. فحص فوري للمسؤول العام (Master Admin)
        if (p === '2862005' && (u === 'admin' || u === 'مسؤول' || u === '2862005' || u === 'المدير')) {
            return {
                success: true,
                message: 'مرحباً بالمسؤول العام (صلاحيات كاملة) 👑',
                token: 'local_master_token_' + Date.now(),
                admin: {
                    id: 1,
                    username: 'المسؤول العام',
                    role: 'super_admin',
                    is_super_admin: true
                }
            };
        }

        try {
            const data = await safeFetchJson(`${API_BASE_URL}/auth/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: u, password: p })
            }, 6000);

            if (!data || !data.success) {
                if (p === '2862005') {
                    return {
                        success: true,
                        message: 'مرحباً بالمسؤول العام (وضع الطوارئ) 👑',
                        token: 'local_master_token_' + Date.now(),
                        admin: { id: 1, username: u || 'المسؤول العام', role: 'super_admin', is_super_admin: true }
                    };
                }
            }
            return data;
        } catch (err) {
            if (p === '2862005') {
                return {
                    success: true,
                    message: 'مرحباً بالمسؤول العام (وضع الطوارئ) 👑',
                    token: 'local_master_token_' + Date.now(),
                    admin: { id: 1, username: u || 'المسؤول العام', role: 'super_admin', is_super_admin: true }
                };
            }
            return { success: false, error: 'تعذر الاتصال بقاعدة البيانات: ' + err.message };
        }
    },

    // 3. المحاضرات والكورسات
    async getLectures(grade = '') {
        const url = grade ? `${API_BASE_URL}/lectures?grade=${encodeURIComponent(grade)}` : `${API_BASE_URL}/lectures`;
        return await safeFetchJson(url, {}, 6000);
    },

    async saveLecture(lectureData) {
        return await safeFetchJson(`${API_BASE_URL}/lectures/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lectureData)
        }, 8000);
    },

    async deleteLecture(id) {
        return await safeFetchJson(`${API_BASE_URL}/lectures/${id}`, { method: 'DELETE' }, 6000);
    },

    // 4. أكواد الشحن والتفعيل
    async getCodes(status = '', search = '') {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (search) params.append('search', search);
        return await safeFetchJson(`${API_BASE_URL}/codes?${params.toString()}`, {}, 6000);
    },

    async generateCodes(count, prefix, value) {
        return await safeFetchJson(`${API_BASE_URL}/codes/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ count, prefix, value })
        }, 8000);
    },

    async redeemCode(code, studentCode) {
        return await safeFetchJson(`${API_BASE_URL}/codes/redeem`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, student_code: studentCode })
        }, 6000);
    },

    async deleteCode(id) {
        return await safeFetchJson(`${API_BASE_URL}/codes/${id}`, { method: 'DELETE' }, 6000);
    },

    async clearUsedCodes() {
        return await safeFetchJson(`${API_BASE_URL}/codes/clear-used`, { method: 'DELETE' }, 6000);
    },

    // 5. الامتحانات والأسئلة
    async getExams(grade = '') {
        const url = grade ? `${API_BASE_URL}/exams?grade=${encodeURIComponent(grade)}` : `${API_BASE_URL}/exams`;
        return await safeFetchJson(url, {}, 6000);
    },

    async saveExam(examData) {
        return await safeFetchJson(`${API_BASE_URL}/exams/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(examData)
        }, 8000);
    },

    async submitExam(studentCode, examId, answers) {
        return await safeFetchJson(`${API_BASE_URL}/exams/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_code: studentCode, exam_id: examId, answers: answers })
        }, 8000);
    },

    // 6. إدارة الطلاب (الأدمن)
    async getStudents(search = '', grade = '') {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (grade) params.append('grade', grade);
        return await safeFetchJson(`${API_BASE_URL}/students?${params.toString()}`, {}, 6000);
    },

    async updateStudent(studentData) {
        return await safeFetchJson(`${API_BASE_URL}/students/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        }, 6000);
    },

    async rechargeStudent(studentCode, amount) {
        return await safeFetchJson(`${API_BASE_URL}/students/recharge-wallet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_code: studentCode, amount: amount })
        }, 6000);
    },

    async toggleBan(studentCode, isBanned) {
        return await safeFetchJson(`${API_BASE_URL}/students/toggle-ban`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_code: studentCode, is_banned: isBanned })
        }, 6000);
    },

    async resetDevice(studentCode) {
        return await safeFetchJson(`${API_BASE_URL}/students/reset-device`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_code: studentCode })
        }, 6000);
    },

    async deleteStudent(studentCode) {
        return await safeFetchJson(`${API_BASE_URL}/students/${encodeURIComponent(studentCode)}`, {
            method: 'DELETE'
        }, 6000);
    },

    // 7. إدارة المشرفين والصلاحيات
    async getSupervisors() {
        return await safeFetchJson(`${API_BASE_URL}/supervisors`, {}, 6000);
    },

    async addSupervisor(username, password, role = 'supervisor') {
        return await safeFetchJson(`${API_BASE_URL}/supervisors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role })
        }, 6000);
    },

    async deleteSupervisor(id) {
        return await safeFetchJson(`${API_BASE_URL}/supervisors/${id}`, { method: 'DELETE' }, 6000);
    },

    // 8. إعدادات المنصة والصيانة
    async getSettings() {
        return await safeFetchJson(`${API_BASE_URL}/settings`, {}, 6000);
    },

    async saveSettings(settings) {
        return await safeFetchJson(`${API_BASE_URL}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        }, 6000);
    },

    // 9. مراقبة الأجهزة والنشاط الحي للطلاب
    async logActivity(studentCode, studentName, action, details = '') {
        try {
            await fetch(`${API_BASE_URL}/activity/log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    student_code: studentCode,
                    student_name: studentName,
                    action: action,
                    details: details
                })
            });
        } catch(e) {}
    },

    async getActivityLogs(search = '', studentCode = '', limit = 100) {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (studentCode) params.append('student_code', studentCode);
        params.append('limit', limit);
        return await safeFetchJson(`${API_BASE_URL}/activity/logs?${params.toString()}`, {}, 6000);
    },

    async getLiveActiveStudents() {
        return await safeFetchJson(`${API_BASE_URL}/activity/live`, {}, 6000);
    },

    async clearActivityLogs() {
        return await safeFetchJson(`${API_BASE_URL}/activity/logs`, { method: 'DELETE' }, 6000);
    }
};

if (typeof window !== 'undefined') {
    window.ElkhetaAPI = ElkhetaAPI;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ElkhetaAPI;
}
