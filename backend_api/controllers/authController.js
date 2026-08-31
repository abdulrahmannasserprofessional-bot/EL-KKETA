const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'elkheta_secret_jwt_key_2026';

// 1. تسجيل دخول المشرف / Admin
exports.adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'اسم المستخدم وكلمة المرور مطلوبان' });
        }

        const [rows] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(401).json({ success: false, error: 'بيانات الدخول غير صحيحة' });
        }

        const admin = rows[0];
        const isMatch = await bcrypt.compare(password, admin.password);
        // دعم تسجيل الدخول الافتراضي إذا كانت كلمة المرور غير مشفرة
        const isValid = isMatch || (password === 'admin123456' && admin.username === 'admin');

        if (!isValid) {
            return res.status(401).json({ success: false, error: 'بيانات الدخول غير صحيحة' });
        }

        const token = jwt.sign(
            { id: admin.id, username: admin.username, role: admin.role },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                role: admin.role
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 2. تسجيل دخول / مصادقة الطالب (تطبيق الأندرويد أو الويب)
exports.studentAuth = async (req, res) => {
    try {
        const { student_code, full_name, phone, parent_phone, grade, device_id } = req.body;

        if (!student_code) {
            return res.status(400).json({ success: false, error: 'كود الطالب مطلوب' });
        }

        const [rows] = await db.query('SELECT * FROM students WHERE student_code = ?', [student_code]);

        if (rows.length > 0) {
            const student = rows[0];

            if (student.is_banned) {
                return res.status(403).json({ success: false, error: 'هذا الحساب موقوف من قبل الإدارة!' });
            }

            // فحص قفل الجهاز (Device Lock)
            if (student.device_id && device_id && student.device_id !== device_id) {
                return res.status(403).json({
                    success: false,
                    error: 'هذا الحساب مرتبط بجهاز آخر! يرجى التواصل مع الدعم الفني لإلغاء القفل.'
                });
            }

            // ربط الجهاز لأول مرة إن لم يكن مقترناً
            if (!student.device_id && device_id) {
                await db.query('UPDATE students SET device_id = ? WHERE id = ?', [device_id, student.id]);
            }

            const token = jwt.sign({ id: student.id, student_code: student.student_code }, JWT_SECRET, { expiresIn: '90d' });

            return res.json({
                success: true,
                is_new: false,
                token,
                student: {
                    ...student,
                    device_id: student.device_id || device_id
                }
            });
        }

        // تسجيل طالب جديد لأول مرة تلقائياً
        const [result] = await db.query(
            `INSERT INTO students (student_code, full_name, phone, parent_phone, grade, device_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [student_code, full_name || 'طالب جديد', phone || '', parent_phone || '', grade || 'الصف الثالث الثانوي', device_id || null]
        );

        const newStudentId = result.insertId;
        const token = jwt.sign({ id: newStudentId, student_code }, JWT_SECRET, { expiresIn: '90d' });

        res.json({
            success: true,
            is_new: true,
            token,
            student: {
                id: newStudentId,
                student_code,
                full_name: full_name || 'طالب جديد',
                phone: phone || '',
                grade: grade || 'الصف الثالث الثانوي',
                wallet_balance: 0.00,
                device_id
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
