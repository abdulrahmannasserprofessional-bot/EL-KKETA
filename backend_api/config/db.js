/**
 * MySQL Connection Pool Configuration
 * يدعم قواعد بيانات MySQL السحابية (TiDB, Aiven, Cleardb) والمحلية
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

const DEFAULT_DB_URL = 'mysql://47Br8Hqq6DayzGQ.root:UpRS6NizAvgka1fd@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/test?ssl={"rejectUnauthorized":false}';

// دعم رابط الاتصال الكامل (DATABASE_URL) أو المتغيرات المنفصلة
let poolConfig = {};

const dbUrl = process.env.DATABASE_URL || DEFAULT_DB_URL;

if (dbUrl) {
    poolConfig = {
        uri: dbUrl,
        ssl: {
            rejectUnauthorized: false
        },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };
} else {
    poolConfig = {
        host: process.env.DB_HOST || 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
        user: process.env.DB_USER || '47Br8Hqq6DayzGQ.root',
        password: process.env.DB_PASSWORD || 'UpRS6NizAvgka1fd',
        database: process.env.DB_NAME || 'test',
        port: parseInt(process.env.DB_PORT) || 4000,
        ssl: { rejectUnauthorized: false },
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
