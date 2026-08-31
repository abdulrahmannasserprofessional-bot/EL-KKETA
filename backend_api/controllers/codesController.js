const db = require('../config/db');
const crypto = require('crypto');

// جلب الأكواد مع فلتر
exports.getCodes = async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = 'SELECT * FROM recharge_codes WHERE 1=1';
        const params = [];

        if (status === 'used') {
            query += ' AND is_used = 1';
        } else if (status === 'unused') {
            query += ' AND is_used = 0';
        }

        if (search) {
            query += ' AND (code LIKE ? OR used_by_student_code LIKE ? OR notes LIKE ?)';
            const term = `%${search}%`;
            params.push(term, term, term);
        }

        query += ' ORDER BY id DESC';
        const [rows] = await db.query(query, params);
        res.json({ success: true, count: rows.length, codes: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// توليد حزمة أكواد جديدة
exports.generateBulkCodes = async (req, res) => {
    try {
        const { count = 10, prefix = '', type = 'wallet', value = 100, notes = '' } = req.body;
        const total = Math.min(Math.max(parseInt(count) || 1, 1), 500);

        const valuesToInsert = [];
        const generatedList = [];

        for (let i = 0; i < total; i++) {
            const randomCode = crypto.randomBytes(4).toString('hex').toUpperCase();
            const fullCode = (prefix ? `${prefix.trim().toUpperCase()}-` : '') + randomCode;

            valuesToInsert.push([fullCode, type, value, 0, null, null, notes]);
            generatedList.push(fullCode);
        }

        await db.query(
            `INSERT INTO recharge_codes (code, type, value, is_used, used_by_student_code, used_at, notes)
             VALUES ?`,
            [valuesToInsert]
        );

        res.json({
            success: true,
            message: `تم توليد ${total} كود بنجاح`,
            count: total,
            codes: generatedList
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// شحن / استخدام كود بواسطة الطالب
exports.redeemCode = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { code, student_code } = req.body;
        if (!code || !student_code) {
            await conn.rollback();
            return res.status(400).json({ success: false, error: 'الكود وكود الطالب مطلوبان' });
        }

        const [codeRows] = await conn.query('SELECT * FROM recharge_codes WHERE code = ? FOR UPDATE', [code.trim().toUpperCase()]);

        if (codeRows.length === 0) {
            await conn.rollback();
            return res.status(404).json({ success: false, error: 'كود الشحن غير صحيح' });
        }

        const card = codeRows[0];
        if (card.is_used) {
            await conn.rollback();
            return res.status(400).json({ success: false, error: 'هذا الكود تم استخدامه من قبل!' });
        }

        // تحديث الكود
        await conn.query(
            'UPDATE recharge_codes SET is_used = 1, used_by_student_code = ?, used_at = NOW() WHERE id = ?',
            [student_code, card.id]
        );

        // إضافة الرصيد إلى محفظة الطالب
        if (card.type === 'wallet') {
            await conn.query(
                'UPDATE students SET wallet_balance = wallet_balance + ? WHERE student_code = ?',
                [card.value, student_code]
            );
        }

        await conn.commit();

        res.json({
            success: true,
            message: 'تم شحن الكود بنجاح!',
            type: card.type,
            value: card.value
        });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, error: err.message });
    } finally {
        conn.release();
    }
};

// حذف كود
exports.deleteCode = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM recharge_codes WHERE id = ?', [id]);
        res.json({ success: true, message: 'تم حذف الكود بنجاح' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// تنظيف وحذف جميع الأكواد المستخدمة
exports.clearUsedCodes = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM recharge_codes WHERE is_used = 1');
        res.json({ success: true, message: `تم تنظيف ${result.affectedRows} كود مستخدم بنجاح` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
