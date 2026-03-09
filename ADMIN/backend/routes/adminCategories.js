const express = require('express');
const router = express.Router();
const db = require('../db'); 

// 1. LẤY DANH SÁCH DANH MỤC
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                c.id, 
                c.name, 
                c.attributes_json, 
                COUNT(DISTINCT p.id) AS productCount,
                COUNT(DISTINCT b.id) AS brandCount,
                GROUP_CONCAT(DISTINCT b.name SEPARATOR ', ') AS brandNames
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            LEFT JOIN brands b ON p.brand_id = b.id
            GROUP BY c.id, c.name, c.attributes_json 
            ORDER BY c.id DESC
        `;
        const [rows] = await db.execute(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Lỗi lấy dữ liệu", error: err.message });
    }
});

// 2. THÊM DANH MỤC MỚI
router.post('/add', async (req, res) => {
    const { name, attributes_json } = req.body; 
    if (!name) return res.status(400).json({ message: "Tên danh mục không được để trống" });

    try {
        // Đảm bảo nếu không có thông số thì lưu là mảng rỗng [] thay vì NULL để tránh lỗi FE
        const finalSpecs = attributes_json || '[]';

        const [result] = await db.execute(
            'INSERT INTO categories (name, attributes_json) VALUES (?, ?)', 
            [name, finalSpecs]
        );
        res.status(201).json({ message: "Thêm thành công", id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi thêm", error: err.message });
    }
});

// 3. CẬP NHẬT DANH MỤC
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { name, attributes_json } = req.body; 

    try {
        const finalSpecs = attributes_json || '[]';

        const [result] = await db.execute(
            'UPDATE categories SET name = ?, attributes_json = ? WHERE id = ?', 
            [name, finalSpecs, id]
        );
        
        if (result.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy danh mục" });
        res.json({ message: "Cập nhật thành công" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi cập nhật", error: err.message });
    }
});

// 4. XÓA DANH MỤC
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [products] = await db.execute('SELECT id FROM products WHERE category_id = ? LIMIT 1', [id]);
        if (products.length > 0) {
            return res.status(400).json({ message: "Không thể xóa danh mục đang có sản phẩm!" });
        }

        await db.execute('DELETE FROM categories WHERE id = ?', [id]);
        res.json({ message: "Xóa danh mục thành công" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi xóa", error: err.message });
    }
});

module.exports = router;