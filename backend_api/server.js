const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const { getAdminHtml } = require('./views/adminHtml');

const app = express();
const PORT = process.env.PORT || 3000;

// تفعيل CORS و معالجة JSON
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (req, res) => {
    res.json({ success: true, status: 'ok', time: new Date().toISOString() });
});

// مسار لوحة التحكم الرئيسية
app.get('/admin', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(getAdminHtml());
});

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(getAdminHtml());
});

// تركيب مسارات الـ API
app.use('/api', apiRoutes);

// معالجة الأخطاء والمسارات غير الموجودة
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'المسار غير موجود (Endpoint Not Found)' });
});

// تشغيل السيرفر في البيئة المحلية فقط عند التشغيل المباشر
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 السيرفر يعمل الآن على: http://localhost:${PORT}`);
    });
}

// تصدير التطبيق لدعم Vercel Serverless
module.exports = app;

