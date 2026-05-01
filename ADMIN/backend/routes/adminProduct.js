const express = require('express');
const router = express.Router();
const db = require('../db');
const upload = require('../cloudinary');

// Lấy danh sách sản phẩm kèm thông tin Category, Brand và Flash Sale
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT p.*, c.name as category_name, b.name as brand_name, 
                   fs.end_time as flash_sale_end, fs.name as flash_sale_campaign_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            LEFT JOIN flash_sales fs ON p.flash_sale_id = fs.id
            ORDER BY p.id DESC
        `;
        const [rows] = await db.execute(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Thêm sản phẩm mới
router.post('/add', upload.array('images', 4), async (req, res) => {
    try {
        const { 
            name, price, category_id, brand_id, stock, 
            description, specifications, discount_price, is_flash_sale, selectedFlashSale 
        } = req.body;

        // Xử lý logic gán ID chiến dịch và trạng thái Flash Sale
        let flash_sale_id = (parseInt(is_flash_sale) === 1) ? (parseInt(selectedFlashSale) || null) : null;
        let flashSaleStatus = parseInt(is_flash_sale) || 0; 

        // Xử lý danh sách ảnh tải lên Cloudinary
        let imagesData = "[]"; 
        if (req.files && req.files.length > 0) {
            const imageUrls = req.files.map(file => file.path);
            imagesData = JSON.stringify(imageUrls);
        }

        const sql = `INSERT INTO products 
            (name, description, price, stock, image, category_id, brand_id, specifications, discount_price, flash_sale_id, is_flash_sale) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        await db.execute(sql, [
            name, 
            description || "", 
            parseFloat(price) || 0, 
            parseInt(stock) || 0, 
            imagesData, 
            parseInt(category_id) || null, 
            parseInt(brand_id) || null, 
            specifications || null, 
            parseFloat(discount_price) || 0, 
            flash_sale_id,
            flashSaleStatus
        ]);

        res.status(201).json({ message: "Thêm sản phẩm thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cập nhật sản phẩm hiện có
router.put('/update/:id', upload.array('images', 4), async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            name, price, category_id, brand_id, stock, 
            description, specifications, existingImages, discount_price, is_flash_sale, selectedFlashSale 
        } = req.body;

        // Xử lý logic gán ID chiến dịch và trạng thái Flash Sale
        let flash_sale_id = (parseInt(is_flash_sale) === 1) ? (parseInt(selectedFlashSale) || null) : null;
        let flashSaleStatus = parseInt(is_flash_sale) || 0; 

        // Kết hợp ảnh cũ và ảnh mới tải lên
        let finalImages = JSON.parse(existingImages || "[]");
        if (req.files && req.files.length > 0) {
            const newImageUrls = req.files.map(file => file.path);
            finalImages = [...finalImages, ...newImageUrls];
        }

        const sql = `UPDATE products SET 
            name=?, description=?, price=?, stock=?, image=?, 
            category_id=?, brand_id=?, specifications=?, discount_price=?, 
            flash_sale_id=?, is_flash_sale=?
            WHERE id=?`;

        await db.execute(sql, [
            name, 
            description || "", 
            parseFloat(price) || 0, 
            parseInt(stock) || 0, 
            JSON.stringify(finalImages), 
            parseInt(category_id) || null, 
            parseInt(brand_id) || null, 
            specifications || null, 
            parseFloat(discount_price) || 0, 
            flash_sale_id,
            flashSaleStatus,
            id
        ]);

        res.json({ message: "Cập nhật sản phẩm thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Xóa sản phẩm
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM products WHERE id = ?', [id]);
        res.json({ message: "Đã xóa sản phẩm thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;