/**
 * ELKHETA MySQL Cloud REST API Client
 * مكتبة الربط الموحدة لجميع صفحات الويب مع سيرفر MySQL السحابي
 */

const API_BASE_URL = 'https://backendapi-pi.vercel.app/api';

const ElkhetaAPI = {
    // 1. تسجيل ودخول الطالب
    async studentAuth(studentCode, fullName = '', phone = '', parentPhone = '', grade = '', deviceId = '') {
        const res = await fetch(`${API_BASE_URL}/auth/student`, {
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
        });
        return await res.json();
    },

    // 2. تسجيل دخول المشرف / الأدمن
    async adminLogin(username, password) {
        const res = await fetch(`${API_BASE_URL}/auth/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        return await res.json();
    },

    // 3. المحاضرات والكورسات
    async getLectures(grade = '') {
        const url = grade ? `${API_BASE_URL}/lectures?grade=${encodeURIComponent(grade)}` : `${API_BASE_URL}/lectures`;
        const res = await fetch(url);
        return await res.json();
    },

    async saveLecture(lectureData) {
        const res = await fetch(`${API_BASE_URL}/lectures/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lectureData)
        });
        return await res.json();
    },

    async deleteLecture(id) {
        const res = await fetch(`${API_BASE_URL}/lectures/${id}`, { method: 'DELETE' });
        return await res.json();
    },

    // 4. أكواد الشحن والتفعيل
    async getCodes(status = '', search = '') {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (search) params.append('search', search);
        const res = await fetch(`${API_BASE_URL}/codes?${params.toString()}`);
        return await res.json();
    },

    async generateCodes(count, prefix, value) {
        const res = await fetch(`${API_BASE_URL}/codes/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ count, prefix, value })
        });
        return await res.json();
    },

    async redeemCode(code, studentCode) {
        const res = await fetch(`${API_BASE_URL}/codes/redeem`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, student_code: studentCode })
        });
        return await res.json();
    },

    // 5. الامتحانات والأسئلة
    async getExams(grade = '') {
        const url = grade ? `${API_BASE_URL}/exams?grade=${encodeURIComponent(grade)}` : `${API_BASE_URL}/exams`;
        const res = await fetch(url);
        return await res.json();
    },

    async saveExam(examData) {
        const res = await fetch(`${API_BASE_URL}/exams/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(examData)
        });
        return await res.json();
    },

    async submitExam(studentCode, examId, answers) {
        const res = await fetch(`${API_BASE_URL}/exams/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_code: studentCode, exam_id: examId, answers: answers })
        });
        return await res.json();
    },

    // 6. إدارة الطلاب (الأدمن)
    async getStudents(search = '', grade = '') {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (grade) params.append('grade', grade);
        const res = await fetch(`${API_BASE_URL}/students?${params.toString()}`);
        return await res.json();
    },

    async toggleBan(studentCode, isBanned) {
        const res = await fetch(`${API_BASE_URL}/students/toggle-ban`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_code: studentCode, is_banned: isBanned })
        });
        return await res.json();
    },

    async resetDevice(studentCode) {
        const res = await fetch(`${API_BASE_URL}/students/reset-device`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_code: studentCode })
        });
        return await res.json();
    },

    // 7. إعدادات المنصة والصيانة
    async getSettings() {
        const res = await fetch(`${API_BASE_URL}/settings`);
        return await res.json();
    },

    async saveSettings(settings) {
        const res = await fetch(`${API_BASE_URL}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        return await res.json();
    }
};

window.ElkhetaAPI = ElkhetaAPI;
