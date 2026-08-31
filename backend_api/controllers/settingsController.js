const db = require('../config/db');

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
