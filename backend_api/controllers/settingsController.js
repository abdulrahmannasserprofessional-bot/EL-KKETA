const db = require('../config/db');
const bcrypt = require('bcryptjs');

// جلب إعدادات المنصة
exports.getSettings = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM settings WHERE id = 1');
        if (rows.length === 0) {
            return res.json({
                success: true,
                settings: {
                    is_maintenance: false,
                    maintenance_message: 'المنصة تعمل بشكل طبيعي',
                    support_whatsapp: '',
                    min_app_version: '1.0.0',
                    notice_bar: ''
                }
            });
        }
        res.json({ success: true, settings: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// تحديث الإعدادات
exports.updateSettings = async (req, res) => {
    try {
        const { is_maintenance, maintenance_message, support_whatsapp, min_app_version, notice_bar } = req.body;

        await db.query(
            `UPDATE settings SET
                is_maintenance = ?,
                maintenance_message = ?,
                support_whatsapp = ?,
                min_app_version = ?,
                notice_bar = ?
             WHERE id = 1`,
            [is_maintenance ? 1 : 0, maintenance_message, support_whatsapp, min_app_version || '1.0.0', notice_bar || '']
        );

        res.json({ success: true, message: 'تم حفظ إعدادات المنصة بنجاح' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// جلب قائمة المشرفين
exports.getSupervisors = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, username, role, created_at FROM admins ORDER BY id DESC');
        res.json({ success: true, count: rows.length, supervisors: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// إضافة مشرف جديد بواسطة المسؤول العام
exports.addSupervisor = async (req, res) => {
    try {
        const { username, password, role = 'supervisor' } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'اسم المستخدم وكلمة المرور مطلوبان' });
        }

        const hashed = await bcrypt.hash(password.trim(), 10);
        const [result] = await db.query(
            'INSERT INTO admins (username, password, role) VALUES (?, ?, ?)',
            [username.trim(), hashed, role]
        );

        res.json({
            success: true,
            message: 'تم إضافة حساب المشرف بنجاح',
            id: result.insertId,
            username: username.trim(),
            role
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message.includes('Duplicate') ? 'اسم المستخدم هذا موجود مسبقاً' : err.message });
    }
};

// حذف مشرف
exports.deleteSupervisor = async (req, res) => {
    try {
        const { id } = req.params;
        // منع حذف الحساب الرئيسي admin (id: 1)
        if (id == 1) {
            return res.status(403).json({ success: false, error: 'لا يمكن حذف حساب المسؤول العام الرئيسي' });
        }

        await db.query('DELETE FROM admins WHERE id = ?', [id]);
        res.json({ success: true, message: 'تم حذف حساب المشرف بنجاح' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// فحص الاتصال بقاعدة البيانات
exports.testDb = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS result');
        res.json({
            success: true,
            message: 'تم الاتصال بقاعدة بيانات MySQL بنجاح!',
            test: rows[0]
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'فشل الاتصال بقاعدة البيانات: ' + err.message });
    }
};
