const db = require('../config/db');

// جلب جميع الطلاب مع فلتر وبحث
exports.getStudents = async (req, res) => {
    try {
        const { search, grade } = req.query;
        let query = 'SELECT * FROM students WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND (student_code LIKE ? OR full_name LIKE ? OR phone LIKE ?)';
            const term = `%${search}%`;
            params.push(term, term, term);
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
        res.json({ success: true, message: 'تم تحديث حالة الحظر بنجاح' });
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

// تعديل بيانات طالب
exports.updateStudent = async (req, res) => {
    try {
        const { student_code, full_name, phone, parent_phone, grade, wallet_balance } = req.body;
        if (!student_code) {
            return res.status(400).json({ success: false, error: 'كود الطالب مطلوب' });
        }

        await db.query(
            `UPDATE students SET full_name = ?, phone = ?, parent_phone = ?, grade = ?, wallet_balance = ? WHERE student_code = ?`,
            [full_name, phone, parent_phone, grade, wallet_balance || 0, student_code]
        );

        res.json({ success: true, message: 'تم تعديل بيانات الطالب بنجاح' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// حذف طالب
exports.deleteStudent = async (req, res) => {
    try {
        const { student_code } = req.params;
        if (!student_code) {
            return res.status(400).json({ success: false, error: 'كود الطالب مطلوب' });
        }

        await db.query('DELETE FROM students WHERE student_code = ?', [student_code]);
        res.json({ success: true, message: 'تم حذف الطالب بنجاح' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
