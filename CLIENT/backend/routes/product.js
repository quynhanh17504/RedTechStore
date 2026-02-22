const express = require('express');
const router = express.Router();
const db = require('../db');

// API lấy danh sách sản phẩm cho trang chủ
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT p.*, c.name as category_name, b.name as brand_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            ORDER BY p.id DESC
        `;
        const [rows] = await db.execute(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Lấy chi tiết 1 sản phẩm theo ID
router.get('/:id', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.*, 
                b.name as brand_name, 
                c.name as category_name 
            FROM products p
            LEFT JOIN brands b ON p.brand_id = b.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `;
        const [rows] = await db.execute(query, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }

        const product = rows[0];

        // Parse dữ liệu JSON nếu database trả về dạng chuỗi
        if (typeof product.specifications === 'string') {
            product.specifications = JSON.parse(product.specifications);
        }
        if (typeof product.image === 'string') {
            product.image = JSON.parse(product.image);
        }

        res.json(product);
    } catch (err) {
        console.error("Lỗi lấy chi tiết sản phẩm:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;