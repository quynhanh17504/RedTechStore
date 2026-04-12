const express = require('express');
const router = express.Router();
const db = require('../db');
const upload = require('../cloudinary');

// 1. Lấy danh sách sản phẩm (JOIN thêm bảng flash_sales để lấy giờ kết thúc)
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

// Hàm hỗ trợ tìm chiến dịch Flash Sale đang active
const getActiveFlashSaleId = async () => {
    const [rows] = await db.execute('SELECT id FROM flash_sales WHERE status = 1 LIMIT 1');
    return rows.length > 0 ? rows[0].id : null;
};

// 2. Thêm sản phẩm mới
router.post('/add', upload.array('images', 4), async (req, res) => {
    try {
        const { 
            name, price, category_id, brand_id, stock, 
            description, specifications, discount_price, is_flash_sale 
        } = req.body;

        // Tự động tìm ID chiến dịch đang chạy nếu người dùng tick chọn
        let flash_sale_id = null;
        if (parseInt(is_flash_sale) === 1) {
            flash_sale_id = await getActiveFlashSaleId();
        }

        let imagesData = "[]"; 
        if (req.files && req.files.length > 0) {
            const imageUrls = req.files.map(file => file.path);
            imagesData = JSON.stringify(imageUrls);
        }

        const sql = `INSERT INTO products 
            (name, description, price, stock, image, category_id, brand_id, specifications, discount_price, flash_sale_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        await db.execute(sql, [
            name, description || "", parseFloat(price) || 0, parseInt(stock) || 0, 
            imagesData, parseInt(category_id) || null, parseInt(brand_id) || null, 
            specifications || null, parseFloat(discount_price) || 0, flash_sale_id
        ]);

        res.status(201).json({ message: "Thêm sản phẩm thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Cập nhật sản phẩm
router.put('/update/:id', upload.array('images', 4), async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            name, price, category_id, brand_id, stock, 
            description, specifications, existingImages, discount_price, is_flash_sale 
        } = req.body;

        // Xử lý flash_sale_id dựa trên checkbox
        let flash_sale_id = null;
        if (parseInt(is_flash_sale) === 1) {
            flash_sale_id = await getActiveFlashSaleId();
        }

        let finalImages = JSON.parse(existingImages || "[]");
        if (req.files && req.files.length > 0) {
            const newImageUrls = req.files.map(file => file.path);
            finalImages = [...finalImages, ...newImageUrls];
        }

        const sql = `UPDATE products SET 
            name=?, description=?, price=?, stock=?, image=?, 
            category_id=?, brand_id=?, specifications=?, discount_price=?, flash_sale_id=? 
            WHERE id=?`;

        await db.execute(sql, [
            name, description, parseFloat(price) || 0, parseInt(stock) || 0, 
            JSON.stringify(finalImages), parseInt(category_id) || null, 
            parseInt(brand_id) || null, specifications || null, 
            parseFloat(discount_price) || 0, flash_sale_id, id
        ]);

        res.json({ message: "Cập nhật sản phẩm thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Xóa sản phẩm
router.delete('/delete/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: "Đã xóa sản phẩm thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;