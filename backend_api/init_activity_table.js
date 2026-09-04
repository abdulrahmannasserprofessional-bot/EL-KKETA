const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/.env' });

async function initActivityTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    });

    console.log('✅ متصل بـ TiDB Cloud');

    await connection.query(`
        CREATE TABLE IF NOT EXISTS student_activity_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_code VARCHAR(50) NOT NULL,
            student_name VARCHAR(150),
            action VARCHAR(255) NOT NULL,
            details TEXT,
            ip_address VARCHAR(100),
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX (student_code),
            INDEX (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('🎉 تم إنشاء جدول مراقبة الأجهزة والنشاط الحي student_activity_logs بنجاح!');
    await connection.end();
}

initActivityTable();
