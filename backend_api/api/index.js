const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const apiRoutes = require('../routes/api');
const { getAdminHtml } = require('../views/adminHtml');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (req, res) => {
    res.json({ success: true, status: 'ok', time: new Date().toISOString() });
});

app.get('/admin', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(getAdminHtml());
});

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(getAdminHtml());
});

app.use((req, res) => {
    res.status(404).json({ success: false, error: 'المسار غير موجود (Endpoint Not Found)' });
});

module.exports = app;

