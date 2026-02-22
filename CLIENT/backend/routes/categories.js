const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. Lấy danh sách tất cả danh mục kèm số lượng sản phẩm
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                c.id, 
                c.name, 
                COUNT(p.id) AS product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            GROUP BY c.id, c.name
            ORDER BY c.id ASC
        `;
        const [rows] = await db.execute(query);
        res.json(rows);
    } catch (err) {
        console.error("Lỗi Categories API:", err.message);
        res.status(500).json({ 
            message: "Lỗi lấy dữ liệu danh mục", 
            error: err.message 
        });
    }
});

// 2. Lấy thông tin chi tiết của 1 danh mục theo ID
router.get('/:id', async (req, res) => {
    try {
        const query = 'SELECT id, name FROM categories WHERE id = ?';
        const [rows] = await db.execute(query, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy danh mục" });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error("Lỗi Get Category By ID:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;