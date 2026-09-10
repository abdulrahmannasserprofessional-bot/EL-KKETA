const db = require('../config/db');
const https = require('https');

// =====================================================
// دالة مساعدة: قراءة بيانات من Firebase عبر REST API
// تُستخدم مرة واحدة للـ Migration فقط
// =====================================================
function fetchFromFirebase(path) {
    return new Promise((resolve, reject) => {
        const url = `https://elkhotta-default-rtdb.europe-west1.firebasedatabase.app/${path}.json`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch(e) { reject(e); }
            });
        }).on('error', reject);
    });
}

// =====================================================
// 1. التحقق من PIN المشرف عبر MySQL
// POST /api/auth/verify-supervisor-pin
// Body: { pin: "1234" }
// =====================================================
exports.verifySupervisorPin = async (req, res) => {
    try {
        const { pin } = req.body;
        if (!pin || typeof pin !== 'string') {
            return res.status(400).json({ success: false, error: 'PIN مطلوب' });
        }

        const normalizedPin = pin.replace(/[٠-٩]/g, d => d.charCodeAt(0) - 1632).trim();

        // البحث في MySQL أولاً
        const [rows] = await db.query(
            'SELECT * FROM admins WHERE pin = ? AND (is_active IS NULL OR is_active = 1)',
            [normalizedPin]
        );

        if (rows.length > 0) {
            const sup = rows[0];
            let permissions = {};
            try {
                permissions = sup.permissions
                    ? (typeof sup.permissions === 'string' ? JSON.parse(sup.permissions) : sup.permissions)
                    : {};
            } catch(e) {}

            return res.json({
                success: true,
                type: 'supervisor',
                supervisor: {
                    id: sup.id,
                    name: sup.supervisor_name || sup.username || 'مشرف',
                    roleTitle: sup.role_title || sup.role || 'مشرف المنصة',
                    permissions,
                    role: sup.role || 'supervisor'
                }
            });
        }

        return res.json({ success: false, error: 'PIN غير صحيح أو غير مفعّل' });

    } catch (err) {
        console.error('verifySupervisorPin error:', err);
        res.status(500).json({ success: false, error: 'خطأ في الاتصال بقاعدة البيانات' });
    }
};

// =====================================================
// 2. التحقق من كود التفعيل عبر MySQL
// POST /api/auth/check-activation-code
// Body: { code: "ABCD1234" }
// =====================================================
exports.checkActivationCode = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ success: false, error: 'الكود مطلوب' });
        }

        const upperCode = code.trim().toUpperCase();

        // البحث في MySQL
        const [rows] = await db.query(
            'SELECT * FROM activation_codes WHERE code = ? AND (is_used = 0 OR is_used IS NULL)',
            [upperCode]
        );

        if (rows.length > 0) {
            return res.json({ success: true, exists: true, code: upperCode });
        }

        return res.json({ success: true, exists: false });

    } catch (err) {
        // الجدول قد لا يكون موجوداً بعد — نُعيد false بدلاً من error
        if (err.code === 'ER_NO_SUCH_TABLE') {
            return res.json({ success: true, exists: false, _note: 'table_not_created_yet' });
        }
        res.status(500).json({ success: false, error: 'خطأ في الاتصال بقاعدة البيانات' });
    }
};

// =====================================================
// 3. Migration: نقل Supervisors من Firebase إلى MySQL
// GET /api/auth/migrate-supervisors
// (يُستخدم مرة واحدة فقط — يُحذف بعد التنفيذ)
// =====================================================
exports.migrateSupervisors = async (req, res) => {
    try {
        // التحقق من secret مخصص للحماية
        const secret = req.headers['x-migrate-secret'] || req.query.secret;
        if (secret !== (process.env.MIGRATE_SECRET || 'elkheta_migrate_2026')) {
            return res.status(403).json({ success: false, error: 'غير مصرح' });
        }

        // إضافة الأعمدة الناقصة لجدول admins إن لم تكن موجودة
        try { await db.query("ALTER TABLE admins ADD COLUMN pin VARCHAR(50) NULL INDEX(pin)"); } catch(e){}
        try { await db.query("ALTER TABLE admins ADD COLUMN supervisor_name VARCHAR(100) NULL"); } catch(e){}
        try { await db.query("ALTER TABLE admins ADD COLUMN role_title VARCHAR(100) NULL"); } catch(e){}
        try { await db.query("ALTER TABLE admins ADD COLUMN is_active TINYINT(1) DEFAULT 1"); } catch(e){}
        try { await db.query("ALTER TABLE admins ADD COLUMN permissions TEXT NULL"); } catch(e){}

        // قراءة Supervisors من Firebase (بينما القواعد مفتوحة)
        const data = await fetchFromFirebase('Supervisors');

        if (!data || typeof data !== 'object') {
            return res.json({ success: true, message: 'لا توجد بيانات في Firebase Supervisors', count: 0 });
        }

        let inserted = 0;
        let skipped = 0;

        for (const [key, sup] of Object.entries(data)) {
            if (!sup || !sup.pin) { skipped++; continue; }

            const pin = String(sup.pin).replace(/[٠-٩]/g, d => d.charCodeAt(0) - 1632).trim();
            const name = sup.name || sup.supervisorName || 'مشرف';
            const roleTitle = sup.roleTitle || 'مشرف المنصة';
            const isActive = sup.isActive !== false ? 1 : 0;
            const permissions = JSON.stringify(sup.permissions || {});
            const username = `supervisor_${key.slice(-6)}`;

            // تحقق إذا كان PIN موجود مسبقاً
            const [existing] = await db.query('SELECT id FROM admins WHERE pin = ?', [pin]);
            if (existing.length > 0) { skipped++; continue; }

            await db.query(
                `INSERT INTO admins (username, password, role, pin, supervisor_name, role_title, is_active, permissions)
                 VALUES (?, ?, 'supervisor', ?, ?, ?, ?, ?)`,
                [username, 'migrated_from_firebase', pin, name, roleTitle, isActive, permissions]
            );
            inserted++;
        }

        res.json({
            success: true,
            message: `تم النقل بنجاح: ${inserted} مشرف جديد، ${skipped} تم تخطيه`,
            inserted,
            skipped
        });

    } catch (err) {
        console.error('migrateSupervisors error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// =====================================================
// 4. إنشاء جدول activation_codes في MySQL
// POST /api/auth/setup-activation-table
// =====================================================
exports.setupActivationTable = async (req, res) => {
    try {
        const secret = req.headers['x-migrate-secret'] || req.query.secret;
        if (secret !== (process.env.MIGRATE_SECRET || 'elkheta_migrate_2026')) {
            return res.status(403).json({ success: false, error: 'غير مصرح' });
        }

        await db.query(`
            CREATE TABLE IF NOT EXISTS activation_codes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) NOT NULL UNIQUE,
                is_used TINYINT(1) DEFAULT 0,
                used_by VARCHAR(100) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                used_at TIMESTAMP NULL DEFAULT NULL,
                INDEX idx_code (code),
                INDEX idx_is_used (is_used)
            )
        `);

        // نقل بيانات Firebase activation codes
        const data = await fetchFromFirebase('ActivationCodes');
        let inserted = 0;

        if (data && typeof data === 'object') {
            for (const [code, val] of Object.entries(data)) {
                if (!code) continue;
                const isUsed = (val && (val.isUsed === true || val.isUsed === 1)) ? 1 : 0;
                const usedBy = (val && val.usedBy) ? val.usedBy : null;
                try {
                    await db.query(
                        'INSERT IGNORE INTO activation_codes (code, is_used, used_by) VALUES (?, ?, ?)',
                        [code.trim().toUpperCase(), isUsed, usedBy]
                    );
                    inserted++;
                } catch(e) {}
            }
        }

        res.json({ success: true, message: `تم إنشاء جدول activation_codes ونقل ${inserted} كود`, inserted });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
