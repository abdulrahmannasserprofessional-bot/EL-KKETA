const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (req, res) => {
    res.json({ success: true, status: 'ok', time: new Date().toISOString() });
});

try {
    const apiRoutes = require('../backend_api/routes/api');
    const { getAdminHtml } = require('../backend_api/views/adminHtml');

    app.get('/admin', (req, res) => {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(getAdminHtml());
    });

    app.use('/api', apiRoutes);

    app.get('/', (req, res) => {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(getAdminHtml());
    });
} catch(err) {
    console.error('SERVER INITIALIZATION ERROR:', err);
    app.use((req, res) => {
        res.status(500).json({ success: false, error: 'Init Error: ' + err.message, stack: err.stack });
    });
}

// Global error handler
app.use((err, req, res, next) => {
    console.error('EXPRESS ROUTE ERROR:', err);
    res.status(500).json({ success: false, error: err.message, stack: err.stack });
});

app.use((req, res) => {
    res.status(404).json({ success: false, error: 'المسار غير موجود (Endpoint Not Found)' });
});

module.exports = app;


