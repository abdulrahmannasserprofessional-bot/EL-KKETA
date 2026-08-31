const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/.env' });

async function syncPhoneAndGrade() {
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

    console.log('⏳ جاري جلب أرقام الهواتف وبيانات الطلاب من Firebase Realtime Database...');
    const response = await fetch('https://elkhotta-default-rtdb.europe-west1.firebasedatabase.app/Students.json');
    const studentsData = await response.json();

    if (studentsData && typeof studentsData === 'object') {
        let count = 0;
        for (const [key, st] of Object.entries(studentsData)) {
            if (!st) continue;
            const code = st.studentCode || st.code || key;
            const name = st.fullName || st.name || 'طالب';
            const phone = st.whatsapp || st.phone || st.mobile || '';
            const parentPhone = st.parentWhatsapp || st.parentPhone || '';
            const grade = 'فرقة رابعة خدمة اجتماعية'; // تعيين الفرقة لجميع الطلاب المسجلين
            const isBanned = st.isBanned ? 1 : 0;
            const balance = st.walletBalance || 0.00;

            await connection.query(`
                INSERT INTO students (student_code, full_name, phone, parent_phone, grade, is_banned, wallet_balance)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    full_name = VALUES(full_name),
                    phone = VALUES(phone),
                    parent_phone = VALUES(parent_phone),
                    grade = VALUES(grade),
                    is_banned = VALUES(is_banned)
            `, [code, name, phone, parentPhone, grade, isBanned, balance]);
            count++;
            console.log(`[${count}] ${code} - ${name} -> هاتف: ${phone} | ${grade}`);
        }
        console.log(`🎉 تم تحديث وسحب أرقام هواتف ${count} طالب وتعيينهم "فرقة رابعة خدمة اجتماعية" بنجاح!`);
    }

    await connection.end();
}

syncPhoneAndGrade();
