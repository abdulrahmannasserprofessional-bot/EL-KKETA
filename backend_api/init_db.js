const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: __dirname + '/.env' });

async function initDatabase() {
    console.log('⏳ جاري الاتصال بقاعدة بيانات TiDB Cloud...');
    
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false }
        });

        console.log('✅ تم الاتصال بالسيرفر السحابي بنجاح!');

        console.log('⏳ جاري إنشاء الجداول...');

        // 1. جدول المشرفين
        await connection.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('super_admin', 'supervisor') DEFAULT 'supervisor',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. جدول الطلاب
        await connection.query(`
            CREATE TABLE IF NOT EXISTS students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_code VARCHAR(50) UNIQUE NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                phone VARCHAR(20) DEFAULT NULL,
                parent_phone VARCHAR(20) DEFAULT NULL,
                grade VARCHAR(50) DEFAULT 'الصف الثالث الثانوي',
                device_id VARCHAR(255) DEFAULT NULL,
                is_banned BOOLEAN DEFAULT FALSE,
                wallet_balance DECIMAL(10,2) DEFAULT 0.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. جدول المحاضرات
        await connection.query(`
            CREATE TABLE IF NOT EXISTS lectures (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                grade VARCHAR(50) NOT NULL,
                video_url TEXT DEFAULT NULL,
                pdf_url TEXT DEFAULT NULL,
                price DECIMAL(10,2) DEFAULT 0.00,
                is_free BOOLEAN DEFAULT FALSE,
                description TEXT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 4. جدول أكواد الشحن
        await connection.query(`
            CREATE TABLE IF NOT EXISTS recharge_codes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL,
                type ENUM('wallet', 'course', 'term') DEFAULT 'wallet',
                value DECIMAL(10,2) DEFAULT 0.00,
                is_used BOOLEAN DEFAULT FALSE,
                used_by_student_code VARCHAR(50) DEFAULT NULL,
                used_at TIMESTAMP NULL DEFAULT NULL,
                notes VARCHAR(255) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 5. جدول الامتحانات
        await connection.query(`
            CREATE TABLE IF NOT EXISTS exams (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                grade VARCHAR(50) NOT NULL,
                duration_minutes INT DEFAULT 45,
                total_marks INT DEFAULT 100,
                lecture_id INT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 6. جدول الأسئلة
        await connection.query(`
            CREATE TABLE IF NOT EXISTS questions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                exam_id INT NOT NULL,
                question_text TEXT NOT NULL,
                option_a VARCHAR(255) NOT NULL,
                option_b VARCHAR(255) NOT NULL,
                option_c VARCHAR(255) NOT NULL,
                option_d VARCHAR(255) NOT NULL,
                correct_option ENUM('A', 'B', 'C', 'D') NOT NULL,
                explanation TEXT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 7. جدول النتائج
        await connection.query(`
            CREATE TABLE IF NOT EXISTS exam_results (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_code VARCHAR(50) NOT NULL,
                exam_id INT NOT NULL,
                score INT NOT NULL,
                total_marks INT NOT NULL,
                answers_json JSON DEFAULT NULL,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 8. جدول الإعدادات
        await connection.query(`
            CREATE TABLE IF NOT EXISTS settings (
                id INT PRIMARY KEY DEFAULT 1,
                is_maintenance BOOLEAN DEFAULT FALSE,
                maintenance_message TEXT DEFAULT NULL,
                support_whatsapp VARCHAR(50) DEFAULT NULL,
                min_app_version VARCHAR(20) DEFAULT '1.0.0',
                notice_bar VARCHAR(255) DEFAULT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // إدخال الإعدادات الافتراضية
        await connection.query(`
            INSERT INTO settings (id, is_maintenance, maintenance_message, support_whatsapp, min_app_version, notice_bar)
            VALUES (1, FALSE, 'المنصة تعمل بنجاح وبسرعة فائقة', '201000000000', '1.0.0', 'مرحباً بكم في منصة الخطة ✨')
            ON DUPLICATE KEY UPDATE id=1
        `);

        // إدخال حساب المشرف الافتراضي
        const hashPass = await bcrypt.hash('admin123456', 10);
        await connection.query(`
            INSERT INTO admins (username, password, role)
            VALUES ('admin', ?, 'super_admin')
            ON DUPLICATE KEY UPDATE id=id
        `, [hashPass]);

        console.log('🎉 تم إنشاء جميع الجداول وحساب الإدارة بنجاح داخل قاعدة البيانات السحابية!');
    } catch (err) {
        console.error('❌ خطأ أثناء تهيئة قاعدة البيانات:', err.message);
    } finally {
        if (connection) await connection.end();
    }
}

initDatabase();
