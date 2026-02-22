const express = require('express');
const router = express.Router();
const db = require('../db');

// API: Lấy danh sách thương hiệu (Chỉ ID và Name)
router.get('/', async (req, res) => {
    try {
        const query = 'SELECT id, name FROM brands ORDER BY name ASC';
        const [rows] = await db.execute(query);
        res.json(rows);
    } catch (err) {
        console.error("Lỗi lấy danh sách thương hiệu:", err.message);
        res.status(500).json({ 
            message: "Không thể lấy dữ liệu thương hiệu", 
            error: err.message 
        });
    }
});

module.exports = router;