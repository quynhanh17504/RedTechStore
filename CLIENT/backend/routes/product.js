const express = require('express');
const router = express.Router();
const db = require('../db');

// API lấy danh sách sản phẩm (Có tích hợp Tìm kiếm & Lọc) - ĐÃ OK
router.get('/', async (req, res) => {
    const { search } = req.query;
    try {
        let query = `
            SELECT p.*, c.name as category_name, b.name as brand_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
        `;
        let params = [];
        if (search) {
            query += ` 
                WHERE p.name LIKE ? 
                OR b.name LIKE ? 
                OR c.name LIKE ? 
                OR p.description LIKE ?
            `;
            const searchTerm = `%${search}%`;
            params = [searchTerm, searchTerm, searchTerm, searchTerm];
        }
        query += ` ORDER BY p.id DESC`;
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. API FLASH SALE
router.get('/flash-sale', async (req, res) => {
    try {
        const query = `
            SELECT p.*, b.name as brand_name, c.name as category_name 
            FROM products p
            LEFT JOIN brands b ON p.brand_id = b.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_flash_sale = 1 AND p.stock > 0
            LIMIT 4
        `;
        const [rows] = await db.execute(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. API BÁN CHẠY
router.get('/best-sellers', async (req, res) => {
    try {
        const query = `
            SELECT p.*, c.name as category_name, b.name as brand_name, SUM(oi.quantity) as total_sold
            FROM products p
            JOIN order_items oi ON p.id = oi.product_id
            JOIN orders o ON oi.order_id = o.id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE o.status = 'delivered'
            GROUP BY p.id
            ORDER BY total_sold DESC
            LIMIT 4
        `;
        const [rows] = await db.execute(query);
        
        if (rows.length === 0) {
            // Backup query cũng cần JOIN để hiển thị đẹp
            const [backupRows] = await db.execute(`
                SELECT p.*, c.name as category_name, b.name as brand_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN brands b ON p.brand_id = b.id
                ORDER BY p.id DESC LIMIT 4
            `);
            return res.json(backupRows);
        }
        
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Lấy chi tiết 1 sản phẩm theo ID 
router.get('/:id', async (req, res) => {
    try {
        const query = `
            SELECT p.*, b.name as brand_name, c.name as category_name 
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

        try {
            if (product.specifications && typeof product.specifications === 'string') {
                product.specifications = JSON.parse(product.specifications);
            }
            if (product.image && typeof product.image === 'string') {
                product.image = JSON.parse(product.image);
            }
        } catch (e) {
            console.warn("Lỗi parse JSON:", e.message);
        }

        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;