const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

const path = require('path');

// تفعيل CORS و معالجة JSON
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// مسار لوحة التحكم الرئيسية
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// مسار الترحيب والواجهة الأساسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
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
