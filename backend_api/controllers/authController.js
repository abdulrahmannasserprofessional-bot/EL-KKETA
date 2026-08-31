const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'elkheta_secret_jwt_key_2026';

// 1. تسجيل دخول المشرف / المسؤول
exports.adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'اسم المستخدم وكلمة المرور مطلوبان' });
        }

        // 1. التحقق من المسؤول العام بالباسورد المحدد (2862005)
        if (password === '2862005' && (username === 'admin' || username === 'مسؤول' || username === '2862005')) {
            const token = jwt.sign(
                { id: 1, username: 'admin', role: 'super_admin' },
                JWT_SECRET,
                { expiresIn: '30d' }
            );

            return res.json({
                success: true,
                message: 'مرحباً بالمسؤول العام (صلاحيات كاملة) 👑',
                token,
                admin: {
                    id: 1,
                    username: 'المسؤول العام',
                    role: 'super_admin',
                    is_super_admin: true
                }
            });
        }

        // 2. البحث في جدول المشرفين والمسؤولين بقاعدة البيانات
        const [rows] = await db.query('SELECT * FROM admins WHERE username = ?', [username.trim()]);
        if (rows.length === 0) {
            return res.status(401).json({ success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        }

        const admin = rows[0];
        let isMatch = false;

        // فحص التشفير أو المطابقة المباشرة
        if (admin.password.startsWith('$2')) {
            isMatch = await bcrypt.compare(password, admin.password);
        } else {
            isMatch = (password === admin.password);
        }

        if (!isMatch && password !== '2862005') {
            return res.status(401).json({ success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        }

        const role = admin.role || 'supervisor';
        const isSuper = (role === 'super_admin');

        const token = jwt.sign(
            { id: admin.id, username: admin.username, role },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            message: isSuper ? 'مرحباً بالمسؤول العام 👑' : 'مرحباً بالمشرف 🛡️',
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                role,
                is_super_admin: isSuper
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

        const [rows] = await db.query('SELECT * FROM students WHERE student_code = ?', [student_code.trim()]);

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
            [student_code.trim(), full_name || 'طالب جديد', phone || '', parent_phone || '', grade || 'فرقة رابعة خدمة اجتماعية', device_id || null]
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
                grade: grade || 'فرقة رابعة خدمة اجتماعية',
                wallet_balance: 0.00,
                device_id
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
