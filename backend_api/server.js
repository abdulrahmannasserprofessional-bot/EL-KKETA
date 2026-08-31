const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// تفعيل CORS و معالجة JSON
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// مسار الترحيب والواجهة الأساسية
app.get('/', (req, res) => {
    res.json({
        platform: 'منصة الخطة التعليمية - ELKHETA',
        service: 'MySQL REST API Server',
        status: 'Online 🚀',
        version: '1.0.0',
        documentation: '/api/health'
    });
});

// تركيب مسارات الـ API
app.use('/api', apiRoutes);

// معالجة الأخطاء والمسارات غير الموجودة
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'المسار غير موجود (Endpoint Not Found)' });
});

// تشغيل السيرفر في البيئة المحلية
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 السيرفر يعمل الآن على: http://localhost:${PORT}`);
    });
}

// تصدير التطبيق لدعم Vercel Serverless
module.exports = app;
