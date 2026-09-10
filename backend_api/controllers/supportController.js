const db = require('../config/db');

// إنشاء جدول support_tickets تلقائياً إن لم يكن موجوداً
async function ensureTicketsTable() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS support_tickets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_code VARCHAR(50) NOT NULL,
                student_name VARCHAR(100) DEFAULT 'طالب',
                subject_title VARCHAR(255) DEFAULT '',
                category VARCHAR(50) DEFAULT 'عام',
                message TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'open',
                admin_reply TEXT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_student (student_code),
                INDEX idx_status (status)
            )
        `);
    } catch(e) {
        console.error('ensureTicketsTable error:', e.message);
    }
}
ensureTicketsTable();

// 1. إنشاء تذكرة دعم فني جديدة (من قبل الطالب)
exports.createTicket = async (req, res) => {
    try {
        const { student_code, student_name, subject_title = '', category = 'عام', message } = req.body;

        if (!student_code || !message) {
            return res.status(400).json({ success: false, error: 'كود الطالب ونص الرسالة مطلوبان' });
        }

        const [result] = await db.query(
            `INSERT INTO support_tickets (student_code, student_name, subject_title, category, message, status)
             VALUES (?, ?, ?, ?, ?, 'open')`,
            [student_code.trim(), student_name || 'طالب', subject_title, category, message.trim()]
        );

        res.json({
            success: true,
            message: 'تم إرسال تذكرة الدعم الفني بنجاح! سيتم الرد عليك قريباً 💬',
            ticket_id: result.insertId
        });
    } catch (err) {
        console.error('createTicket error:', err);
        res.status(500).json({ success: false, error: 'حدث خطأ في تقديم التذكرة: ' + err.message });
    }
};

// 2. جلب تذاكر الدعم الفني (للطالب أو للمشرفين)
exports.getTickets = async (req, res) => {
    try {
        const { student_code, status, limit = 50 } = req.query;
        let query = 'SELECT * FROM support_tickets WHERE 1=1';
        const params = [];

        if (student_code) {
            query += ' AND student_code = ?';
            params.push(student_code.trim());
        }

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY id DESC LIMIT ?';
        params.push(parseInt(limit) || 50);

        const [rows] = await db.query(query, params);
        res.json({ success: true, count: rows.length, tickets: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 3. الرد على تذكرة دعم وتغيير حالتها (من قبل الأدمن / المشرف)
exports.replyTicket = async (req, res) => {
    try {
        const { ticket_id, reply, status = 'resolved' } = req.body;

        if (!ticket_id || !reply) {
            return res.status(400).json({ success: false, error: 'معرف التذكرة والرد مطلوبان' });
        }

        await db.query(
            `UPDATE support_tickets SET admin_reply = ?, status = ? WHERE id = ?`,
            [reply.trim(), status, ticket_id]
        );

        res.json({
            success: true,
            message: 'تم الرد على التذكرة وتحديث حالتها بنجاح 🛡️'
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 4. حذف تذكرة دعم
exports.deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM support_tickets WHERE id = ?', [id]);
        res.json({ success: true, message: 'تم حذف التذكرة بنجاح' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
