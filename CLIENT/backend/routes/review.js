const express = require('express');
const router = express.Router();
const db = require('../db'); 

/**
 * 1. Lấy danh sách đánh giá của một sản phẩm
 * GET /client/review/:productId
 */
router.get('/:productId', async (req, res) => {
    const { productId } = req.params;
    
    // SỬA TẠI ĐÂY: Xóa phần "const sql = ..." bị lặp bên trong
    const sql = `
        SELECT r.*, u.fullname 
        FROM reviews r 
        JOIN users u ON r.user_id = u.id 
        WHERE r.product_id = ? 
        ORDER BY r.created_at DESC
    `;

    try {
        const [results] = await db.query(sql, [productId]);
        res.json(results);
    } catch (err) {
        console.error("Lỗi SQL:", err); // Log ra terminal để dễ debug
        res.status(500).json({ message: "Lỗi lấy danh sách đánh giá", error: err.message });
    }
});

/**
 * 2. Gửi đánh giá mới
 * POST /client/reviews/add
 */
router.post('/add', async (req, res) => {
    const { user_id, product_id, rating, comment } = req.body;

    if (!user_id || !product_id || !rating) {
        return res.status(400).json({ message: "Thiếu thông tin đánh giá" });
    }

    const sql = `INSERT INTO reviews (user_id, product_id, rating, comment, created_at) VALUES (?, ?, ?, ?, NOW())`;

    try {
        await db.query(sql, [user_id, product_id, rating, comment]);
        res.status(201).json({ message: "Gửi đánh giá thành công!" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi gửi đánh giá", error: err });
    }
});

module.exports = router;