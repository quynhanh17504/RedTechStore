const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * 1. Lấy toàn bộ danh sách đánh giá (Dành cho Admin)
 */
router.get('/', async (req, res) => {
    // JOIN với bảng users và products để lấy tên hiển thị thay vì chỉ lấy ID
    const sql = `
        SELECT 
            r.*, 
            u.fullname AS user_name, 
            p.name AS product_name
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN products p ON r.product_id = p.id
        ORDER BY r.created_at DESC
    `;

    try {
        const [results] = await db.query(sql);
        res.json(results);
    } catch (err) {
        console.error("Lỗi lấy danh sách đánh giá (Admin):", err);
        res.status(500).json({ 
            message: "Lỗi hệ thống khi lấy danh sách đánh giá", 
            error: err.message 
        });
    }
});

/**
 * 2. Xóa một đánh giá
 * DELETE /admin/reviews/delete/:id
 */
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    const sql = `DELETE FROM reviews WHERE id = ?`;

    try {
        const [result] = await db.query(sql, [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy đánh giá để xóa" });
        }
        
        res.json({ message: "Đã xóa đánh giá thành công" });
    } catch (err) {
        console.error("Lỗi khi xóa đánh giá:", err);
        res.status(500).json({ 
            message: "Không thể xóa đánh giá", 
            error: err.message 
        });
    }
});

module.exports = router;