const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: __dirname + '/.env' });

async function syncData() {
    console.log('⏳ جاري الاتصال بقاعدة بيانات TiDB Cloud...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    });

    console.log('✅ متصل بالسيرفر السحابي');

    // 1. تحديث كلمة مرور المسؤول العام إلى: 2862005
    console.log('⏳ تحديث حساب المسؤول العام (Password: 2862005)...');
    const masterPasswordHash = await bcrypt.hash('2862005', 10);
    
    await connection.query(`
        INSERT INTO admins (username, password, role)
        VALUES ('admin', ?, 'super_admin')
        ON DUPLICATE KEY UPDATE password = ?, role = 'super_admin'
    `, [masterPasswordHash, masterPasswordHash]);
    console.log('✅ تم تعيين كلمة مرور المسؤول: 2862005');

    // 2. جلب جميع الطلاب من Firebase واستيرادهم إلى MySQL
    console.log('⏳ جاري جلب الطلاب من Firebase Realtime Database...');
    try {
        const response = await fetch('https://elkhotta-default-rtdb.europe-west1.firebasedatabase.app/Students.json');
        const studentsData = await response.json();

        if (studentsData && typeof studentsData === 'object') {
            let count = 0;
            for (const [key, st] of Object.entries(studentsData)) {
                if (!st) continue;
                const code = st.studentCode || st.code || key;
                const name = st.fullName || st.name || 'طالب';
                const phone = st.phone || '';
                const parentPhone = st.parentPhone || '';
                const grade = st.grade || st.stage || 'الصف الثالث الثانوي';
                const deviceId = st.deviceId || null;
                const isBanned = st.isBanned ? 1 : 0;
                const balance = st.walletBalance || 0.00;

                await connection.query(`
                    INSERT INTO students (student_code, full_name, phone, parent_phone, grade, device_id, is_banned, wallet_balance)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        full_name = VALUES(full_name),
                        phone = VALUES(phone),
                        parent_phone = VALUES(parent_phone),
                        grade = VALUES(grade),
                        is_banned = VALUES(is_banned)
                `, [code, name, phone, parentPhone, grade, deviceId, isBanned, balance]);
                count++;
            }
            console.log(`🎉 تم استيراد ونقل ${count} طالب بنجاح من Firebase إلى MySQL!`);
        }
    } catch (e) {
        console.error('⚠️ خطأ أثناء جلب الطلاب من Firebase:', e.message);
    }

    // 3. جلب الأكواد من Firebase واستيرادها
    console.log('⏳ جاري جلب الأكواد من Firebase...');
    try {
        const resCodes = await fetch('https://elkhotta-default-rtdb.europe-west1.firebasedatabase.app/Codes.json');
        const codesData = await resCodes.json();
        if (codesData && typeof codesData === 'object') {
            let codeCount = 0;
            for (const [key, c] of Object.entries(codesData)) {
                if (!c) continue;
                const codeStr = c.code || key;
                const type = c.type || 'wallet';
                const value = c.value || 0.00;
                const isUsed = c.isUsed ? 1 : 0;
                const usedBy = c.usedBy || null;
                const notes = c.notes || null;

                await connection.query(`
                    INSERT INTO recharge_codes (code, type, value, is_used, used_by_student_code, notes)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE is_used = VALUES(is_used), used_by_student_code = VALUES(used_by_student_code)
                `, [codeStr, type, value, isUsed, usedBy, notes]);
                codeCount++;
            }
            console.log(`🎉 تم استيراد ${codeCount} كود شحن إلى MySQL!`);
        }
    } catch(e) {}

    await connection.end();
    console.log('🏁 اكتملت المزامنة بنجاح!');
}

syncData();
