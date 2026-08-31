/**
 * MySQL Connection Pool Configuration
 * يدعم قواعد بيانات MySQL السحابية (TiDB, Aiven, Cleardb) والمحلية
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

// دعم رابط الاتصال الكامل (DATABASE_URL) أو المتغيرات المنفصلة
let poolConfig = {};

if (process.env.DATABASE_URL) {
    poolConfig = {
        uri: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };
} else {
    poolConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'elkheta_db',
        port: parseInt(process.env.DB_PORT) || 3306,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };
}

const pool = mysql.createPool(poolConfig);

// فحص الاتصال الأولي
pool.getConnection()
    .then(conn => {
        console.log('✅ تم الاتصال بقاعدة بيانات MySQL بنجاح!');
        conn.release();
    })
    .catch(err => {
        console.warn('⚠️ تحذير: لم يتم الاتصال بـ MySQL بعد (يرجى ضبط بيانات .env):', err.message);
    });

module.exports = pool;
