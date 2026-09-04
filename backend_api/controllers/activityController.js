const db = require('../config/db');

// تسجيل حركة / نشاط جديد للطالب
exports.logActivity = async (req, res) => {
    try {
        const { student_code, student_name, action, details } = req.body || {};
        if (!student_code || !action) {
            return res.status(400).json({ success: false, error: 'كود الطالب والنشاط مطلوبان' });
        }

        const ip = (req.headers && req.headers['x-forwarded-for']) || req.ip || (req.socket && req.socket.remoteAddress) || '';
        const userAgent = (req.headers && req.headers['user-agent']) || '';

        await db.query(
            `INSERT INTO student_activity_logs (student_code, student_name, action, details, ip_address, user_agent)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [student_code.trim().toUpperCase(), student_name || 'طالب', action, details || '', String(ip).slice(0, 100), String(userAgent).slice(0, 500)]
        );

        res.json({ success: true, message: 'تم تسجيل النشاط بنجاح' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// جلب سجل النشاط والمراقبة الحية
exports.getActivityLogs = async (req, res) => {
    try {
        const { student_code, search, limit = 100 } = req.query || {};
        let query = 'SELECT * FROM student_activity_logs WHERE 1=1';
        const params = [];

        if (student_code) {
            query += ' AND UPPER(student_code) = ?';
            params.push(student_code.trim().toUpperCase());
        }

        if (search) {
            query += ' AND (student_code LIKE ? OR student_name LIKE ? OR action LIKE ? OR details LIKE ?)';
            const term = `%${search}%`;
            params.push(term, term, term, term);
        }

        const safeLimit = Math.min(Math.max(parseInt(limit) || 100, 1), 500);
        query += ` ORDER BY id DESC LIMIT ${safeLimit}`;

        const [rows] = await db.query(query, params);
        res.json({ success: true, count: rows.length, logs: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// جلب الطلاب المتصلين والنشطين حالياً (في آخر 30 دقيقة)
exports.getLiveActiveStudents = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                student_code,
                student_name,
                action,
                details,
                user_agent,
                MAX(created_at) as last_seen,
                COUNT(id) as actions_count
            FROM student_activity_logs
            WHERE created_at >= NOW() - INTERVAL 30 MINUTE
            GROUP BY student_code, student_name, action, details, user_agent
            ORDER BY last_seen DESC
        `);

        res.json({ success: true, count: rows.length, active_students: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// مسح سجل النشاطات القديمة
exports.clearActivityLogs = async (req, res) => {
    try {
        await db.query('DELETE FROM student_activity_logs');
        res.json({ success: true, message: 'تم مسح سجل النشاط بالكامل' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
