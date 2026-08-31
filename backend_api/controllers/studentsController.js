const db = require('../config/db');

// جلب جميع الطلاب مع فلتر وبحث
exports.getStudents = async (req, res) => {
    try {
        const { search, grade } = req.query;
        let query = 'SELECT * FROM students WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND (student_code LIKE ? OR full_name LIKE ? OR phone LIKE ? OR parent_phone LIKE ?)';
            const term = `%${search}%`;
            params.push(term, term, term, term);
        }

        if (grade) {
            query += ' AND grade = ?';
            params.push(grade);
        }

        query += ' ORDER BY id DESC';

        const [rows] = await db.query(query, params);
        res.json({ success: true, count: rows.length, students: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// تبديل حالة الحظر
exports.toggleBan = async (req, res) => {
    try {
        const { student_code, is_banned } = req.body;
        if (!student_code) {
            return res.status(400).json({ success: false, error: 'كود الطالب مطلوب' });
        }

        await db.query('UPDATE students SET is_banned = ? WHERE student_code = ?', [is_banned ? 1 : 0, student_code]);
        res.json({ success: true, message: is_banned ? 'تم قفل وتعطيل حساب الطالب بنجاح' : 'تم تفعيل حساب الطالب بنجاح' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// فك قفل الجهاز
exports.resetDevice = async (req, res) => {
    try {
        const { student_code } = req.body;
        if (!student_code) {
            return res.status(400).json({ success: false, error: 'كود الطالب مطلوب' });
        }

        await db.query('UPDATE students SET device_id = NULL WHERE student_code = ?', [student_code]);
        res.json({ success: true, message: 'تم فك قفل الجهاز بنجاح' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// تعديل بيانات طالب كاملة
exports.updateStudent = async (req, res) => {
    try {
        const { student_code, full_name, phone, parent_phone, grade, wallet_balance } = req.body;
        if (!student_code) {
            return res.status(400).json({ success: false, error: 'كود الطالب مطلوب' });
        }

        await db.query(
            `UPDATE students SET
                full_name = ?,
                phone = ?,
                parent_phone = ?,
                grade = ?,
                wallet_balance = ?
             WHERE student_code = ?`,
            [full_name || 'طالب', phone || '', parent_phone || '', grade || 'الصف الثالث الثانوي', wallet_balance || 0, student_code]
        );

        res.json({ success: true, message: 'تم حفظ وتعديل بيانات الطالب في MySQL بنجاح' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// شحن رصيد في محفظة الطالب مباشرة من الإدارة
exports.rechargeStudentWallet = async (req, res) => {
    try {
        const { student_code, amount } = req.body;
        if (!student_code || !amount) {
            return res.status(400).json({ success: false, error: 'كود الطالب والمبلغ مطلوبان' });
        }

        await db.query(
            'UPDATE students SET wallet_balance = wallet_balance + ? WHERE student_code = ?',
            [parseFloat(amount), student_code]
        );

        const [updated] = await db.query('SELECT wallet_balance FROM students WHERE student_code = ?', [student_code]);

        res.json({
            success: true,
            message: `تم شحن ${amount} ج.م بنجاح`,
            new_balance: updated[0] ? updated[0].wallet_balance : 0
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// حذف طالب نهائياً
exports.deleteStudent = async (req, res) => {
    try {
        const { student_code } = req.params;
        if (!student_code) {
            return res.status(400).json({ success: false, error: 'كود الطالب مطلوب' });
        }

        await db.query('DELETE FROM students WHERE student_code = ?', [student_code]);
        res.json({ success: true, message: 'تم حذف الطالب نهائياً من قاعدة البيانات' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
