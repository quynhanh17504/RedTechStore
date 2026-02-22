const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. LẤY DANH SÁCH THƯƠNG HIỆU VÀ THỐNG KÊ SP
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                b.id, 
                b.name,
                COUNT(CASE WHEN p.category_id = 1 THEN 1 END) as phone,
                COUNT(CASE WHEN p.category_id = 2 THEN 1 END) as laptop,
                COUNT(CASE WHEN p.category_id = 3 THEN 1 END) as accessory
            FROM brands b
            LEFT JOIN products p ON b.id = p.brand_id
            GROUP BY b.id, b.name
            ORDER BY b.name ASC
        `;
        const [rows] = await db.execute(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Lỗi lấy dữ liệu thương hiệu", error: err.message });
    }
});

// 2. THÊM THƯƠNG HIỆU
router.post('/add', async (req, res) => {
    const { name } = req.body;
    try {
        await db.execute('INSERT INTO brands (name) VALUES (?)', [name]);
        res.status(201).json({ message: "Thêm thương hiệu thành công" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi thêm thương hiệu" });
    }
});

// 3. CẬP NHẬT
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        await db.execute('UPDATE brands SET name = ? WHERE id = ?', [name, id]);
        res.json({ message: "Cập nhật thành công" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi cập nhật" });
    }
});

// 4. XÓA
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Kiểm tra ràng buộc sản phẩm trước khi xóa
        const [products] = await db.execute('SELECT id FROM products WHERE brand_id = ? LIMIT 1', [id]);
        if (products.length > 0) {
            return res.status(400).json({ message: "Thương hiệu đang có sản phẩm, không thể xóa!" });
        }
        await db.execute('DELETE FROM brands WHERE id = ?', [id]);
        res.json({ message: "Xóa thành công" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi xóa" });
    }
});

module.exports = router;