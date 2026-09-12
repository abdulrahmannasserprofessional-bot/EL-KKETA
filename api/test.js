module.exports = async (req, res) => {
    try {
        const mysql = require('mysql2/promise');
        res.json({ success: true, message: 'mysql2 loaded successfully!', nodeVersion: process.version });
    } catch(err) {
        res.status(500).json({ success: false, error: err.message, stack: err.stack });
    }
};
