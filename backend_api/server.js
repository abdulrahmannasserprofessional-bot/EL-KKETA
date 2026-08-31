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

const fs = require('fs');

// مسار لوحة التحكم الرئيسية
const sendAdminHtml = (req, res) => {
    const filePath = path.join(__dirname, 'public', 'admin.html');
    if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(fs.readFileSync(filePath, 'utf8'));
    }
    res.json({
        platform: 'منصة الخطة التعليمية - ELKHETA',
        service: 'MySQL REST API Server',
        status: 'Online 🚀',
        version: '1.0.0',
        documentation: '/api/health'
    });
};

app.get('/admin', sendAdminHtml);
app.get('/', sendAdminHtml);

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
