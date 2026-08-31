const db = require('../config/db');

// جلب جميع المحاضرات (أو تصفية حسب الصف)
exports.getLectures = async (req, res) => {
    try {
        const { grade } = req.query;
        let query = 'SELECT * FROM lectures';
        const params = [];

        if (grade) {
            query += ' WHERE grade = ?';
            params.push(grade);
        }

        query += ' ORDER BY id DESC';
        const [rows] = await db.query(query, params);
        res.json({ success: true, count: rows.length, lectures: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// إضافة أو تعديل محاضرة
exports.saveLecture = async (req, res) => {
    try {
        const { id, title, grade, video_url, pdf_url, price, is_free, description } = req.body;

        if (!title || !grade) {
            return res.status(400).json({ success: false, error: 'عنوان المحاضرة والصف الدراسي مطلوبان' });
        }

        if (id) {
            // تعديل
            await db.query(
                `UPDATE lectures SET title = ?, grade = ?, video_url = ?, pdf_url = ?, price = ?, is_free = ?, description = ? WHERE id = ?`,
                [title, grade, video_url || null, pdf_url || null, price || 0, is_free ? 1 : 0, description || null, id]
            );
            return res.json({ success: true, message: 'تم تعديل المحاضرة بنجاح', id });
        }

        // إضافة جديد
        const [result] = await db.query(
            `INSERT INTO lectures (title, grade, video_url, pdf_url, price, is_free, description)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title, grade, video_url || null, pdf_url || null, price || 0, is_free ? 1 : 0, description || null]
        );

        res.json({ success: true, message: 'تمت إضافة المحاضرة بنجاح', id: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// حذف محاضرة
exports.deleteLecture = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM lectures WHERE id = ?', [id]);
        res.json({ success: true, message: 'تم حذف المحاضرة بنجاح' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
