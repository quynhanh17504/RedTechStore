const express = require('express');
const router = express.Router();
const db = require('../db');
const upload = require('../cloudinary');

// 1. Lấy danh sách sản phẩm
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

// 2. Thêm sản phẩm
router.post('/add', upload.array('images', 4), async (req, res) => {
    try {
        const { name, price, category_id, brand_id, stock, description, specifications } = req.body;
        let imagesData = "[]"; 
        if (req.files && req.files.length > 0) {
            const imageUrls = req.files.map(file => file.path);
            imagesData = JSON.stringify(imageUrls);
        }

        const sql = `INSERT INTO products (name, description, price, stock, image, category_id, brand_id, specifications) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        
        await db.execute(sql, [
            name, description || "", parseFloat(price), parseInt(stock), 
            imagesData, parseInt(category_id) || null, parseInt(brand_id) || null, specifications || null 
        ]);

        res.status(201).json({ message: "Thêm sản phẩm thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Cập nhật sản phẩm (BỔ SUNG ĐỂ SỬA LỖI 404 KHI UPDATE)
router.put('/update/:id', upload.array('images', 4), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, category_id, brand_id, stock, description, specifications, existingImages } = req.body;

        // Xử lý ảnh: Kết hợp ảnh cũ giữ lại và ảnh mới upload
        let finalImages = JSON.parse(existingImages || "[]");
        if (req.files && req.files.length > 0) {
            const newImageUrls = req.files.map(file => file.path);
            finalImages = [...finalImages, ...newImageUrls];
        }

        const sql = `UPDATE products SET name=?, description=?, price=?, stock=?, image=?, category_id=?, brand_id=?, specifications=? WHERE id=?`;
        await db.execute(sql, [
            name, description, parseFloat(price), parseInt(stock), 
            JSON.stringify(finalImages), parseInt(category_id), parseInt(brand_id), specifications, id
        ]);

        res.json({ message: "Cập nhật thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Xóa sản phẩm
router.delete('/delete/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: "Đã xóa sản phẩm" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;