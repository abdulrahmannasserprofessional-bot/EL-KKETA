const db = require('../config/db');

// جلب جميع الطلاب
exports.getStudents = async (req, res) => {
    try {
        const { search } = req.query;
        let query = 'SELECT * FROM students WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND (student_code LIKE ? OR full_name LIKE ? OR phone LIKE ? OR parent_phone LIKE ?)';
            const term = `%${search}%`;
            params.push(term, term, term, term);
        }

        query += ' ORDER BY id DESC';

        const [rows] = await db.query(query, params);
        res.json({ success: true, count: rows.length, students: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// تبديل حالة الحظر وتحديثها في MySQL و Firebase معاً بشكل دائم
exports.toggleBan = async (req, res) => {
    try {
        const { student_code, is_banned } = req.body;
        if (!student_code) {
            return res.status(400).json({ success: false, error: 'كود الطالب مطلوب' });
        }

        const codeUpper = student_code.trim().toUpperCase();
        const banStatus = is_banned ? 1 : 0;
        const banBool = is_banned ? true : false;

        // 1. تحديث في قاعدة بيانات MySQL
        await db.query('UPDATE students SET is_banned = ? WHERE UPPER(student_code) = ?', [banStatus, codeUpper]);

        // 2. تحديث متزامن في Firebase Realtime Database
        try {
            await fetch(`https://elkhotta-default-rtdb.europe-west1.firebasedatabase.app/Students/${codeUpper}.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isBanned: banBool,
                    is_banned: banStatus,
                    banReason: banBool ? 'موقوف من قبل الإدارة' : ''
                })
            });
        } catch (fbErr) {
            console.error('Firebase sync error:', fbErr.message);
        }

        res.json({
            success: true,
            is_banned: banStatus,
            message: banStatus ? 'تم حظر وتعطيل حساب الطالب بشكل دائم' : 'تم فك الحظر وتفعيل الحساب بنجاح'
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// فك قفل الجهاز في MySQL و Firebase
exports.resetDevice = async (req, res) => {
    try {
        const { student_code } = req.body;
        if (!student_code) {
            return res.status(400).json({ success: false, error: 'كود الطالب مطلوب' });
        }

        const codeUpper = student_code.trim().toUpperCase();

        await db.query('UPDATE students SET device_id = NULL WHERE UPPER(student_code) = ?', [codeUpper]);

        try {
            await fetch(`https://elkhotta-default-rtdb.europe-west1.firebasedatabase.app/Students/${codeUpper}.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId: null, device_id: null })
            });
        } catch (e) {}

        res.json({ success: true, message: 'تم فك قفل الجهاز للطالب بنجاح' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// تعديل بيانات طالب كاملة
exports.updateStudent = async (req, res) => {
    try {
        const { student_code, full_name, phone, parent_phone } = req.body;
        if (!student_code) {
            return res.status(400).json({ success: false, error: 'كود الطالب مطلوب' });
        }

        const codeUpper = student_code.trim().toUpperCase();

        await db.query(
            `UPDATE students SET
                full_name = ?,
                phone = ?,
                parent_phone = ?,
                grade = 'فرقة رابعة خدمة اجتماعية'
             WHERE UPPER(student_code) = ?`,
            [full_name || 'طالب', phone || '', parent_phone || '', codeUpper]
        );

        // تحديث في Firebase
        try {
            await fetch(`https://elkhotta-default-rtdb.europe-west1.firebasedatabase.app/Students/${codeUpper}.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: full_name || 'طالب',
                    whatsapp: phone || '',
                    parentWhatsapp: parent_phone || '',
                    grade: 'فرقة رابعة خدمة اجتماعية'
                })
            });
        } catch (e) {}

        res.json({ success: true, message: 'تم حفظ وتعديل بيانات الطالب بنجاح' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// حذف طالب نهائياً من MySQL و Firebase
exports.deleteStudent = async (req, res) => {
    try {
        const { student_code } = req.params;
        if (!student_code) {
            return res.status(400).json({ success: false, error: 'كود الطالب مطلوب' });
        }

        const codeUpper = student_code.trim().toUpperCase();

        await db.query('DELETE FROM students WHERE UPPER(student_code) = ?', [codeUpper]);

        try {
            await fetch(`https://elkhotta-default-rtdb.europe-west1.firebasedatabase.app/Students/${codeUpper}.json`, {
                method: 'DELETE'
            });
        } catch (e) {}

        res.json({ success: true, message: 'تم حذف الطالب نهائياً من كافة قواعد البيانات' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// شحن محفظة الطالب
exports.rechargeStudentWallet = async (req, res) => {
    try {
        const { student_code, amount } = req.body;
        if (!student_code) {
            return res.status(400).json({ success: false, error: 'كود الطالب مطلوب' });
        }
        const val = parseFloat(amount) || 0;
        const codeUpper = student_code.trim().toUpperCase();

        await db.query('UPDATE students SET wallet_balance = wallet_balance + ? WHERE UPPER(student_code) = ?', [val, codeUpper]);
        res.json({ success: true, message: 'تم شحن المحفظة بنجاح' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
