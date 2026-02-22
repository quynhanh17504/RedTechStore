const express = require('express');
const router = express.Router();
const db = require('../db');
const upload = require('../cloudinary');

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

// 2. Thêm sản phẩm kèm Upload ảnh
router.post('/add', upload.array('images', 4), async (req, res) => {
    try {
        const { name, price, category_id, brand_id, stock, description, specifications } = req.body;

        // Xử lý mảng ảnh
        let imagesData = ""; 
        if (req.files && req.files.length > 0) {
            // Lấy toàn bộ link .path của tất cả file đã upload thành công
            const imageUrls = req.files.map(file => file.path);
            // Chuyển mảng [url1, url2...] thành chuỗi JSON để lưu vào cột TEXT
            imagesData = JSON.stringify(imageUrls);
        }

        const sql = `INSERT INTO products (name, description, price, stock, image, category_id, brand_id, specifications) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        
        await db.execute(sql, [
            name, 
            description || "", 
            parseFloat(price), 
            parseInt(stock), 
            imagesData, // Lưu chuỗi mảng ảnh JSON vào đây
            parseInt(category_id) || null, 
            parseInt(brand_id) || null,
            specifications || null 
        ]);

        res.status(201).json({ message: "Thêm sản phẩm thành công với đầy đủ ảnh" });
    } catch (err) {
        console.error("Lỗi thực thi SQL:", err.message);
        res.status(500).json({ error: "Lỗi cơ sở dữ liệu: " + err.message });
    }
});

// 3. Xóa sản phẩm
router.delete('/delete/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: "Đã xóa sản phẩm" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;