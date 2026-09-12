/**
 * MySQL Connection Pool Configuration
 * يدعم قواعد بيانات MySQL السحابية (TiDB, Aiven, Cleardb) والمحلية
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

const poolConfig = {
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

const pool = mysql.createPool(poolConfig);

module.exports = pool;
