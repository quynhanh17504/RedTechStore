const express = require('express');
const router = express.Router();
const db = require('../db');

// API: Đặt hàng 
router.post('/place', async (req, res) => {
    const { userId, fullname, phone, address, totalPrice, paymentMethod, items } = req.body;

    if (!userId || !items || items.length === 0) {
        return res.status(400).json({ message: "Dữ liệu đơn hàng không hợp lệ" });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Chèn vào bảng orders
        const orderQuery = `
            INSERT INTO orders (user_id, fullname, phone, address, total, status, payment_method, payment_status, created_at)
            VALUES (?, ?, ?, ?, ?, 'Pending', ?, ?, NOW())
        `;
        
        const paymentStatus = paymentMethod === 'COD' ? 'Pending' : 'Unpaid';
        
        const [orderResult] = await connection.execute(orderQuery, [
            userId, fullname, phone, address, totalPrice, paymentMethod, paymentStatus
        ]);

        const orderId = orderResult.insertId;

        // 2. Chèn vào order_items VÀ Cập nhật Stock sản phẩm
        const itemQuery = `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`;
        const updateStockQuery = `UPDATE products SET stock = stock - ? WHERE id = ?`;

        for (const item of items) {
            // Lưu ý: Dùng item.product_id vì cấu trúc giỏ hàng của bạn trả về product_id
            const pId = item.product_id; 
            
            // Chèn chi tiết đơn hàng
            await connection.execute(itemQuery, [orderId, pId, item.quantity, item.price]);
            
            // Trừ tồn kho
            await connection.execute(updateStockQuery, [item.quantity, pId]);
        }

        // 3. XÓA GIỎ HÀNG (Sửa lỗi Table 'cart' doesn't exist)
        // B1: Tìm cart_id của user
        const [cart] = await connection.execute('SELECT id FROM carts WHERE user_id = ?', [userId]);
        
        if (cart.length > 0) {
            const cartId = cart[0].id;
            // B2: Xóa toàn bộ item trong giỏ hàng đó
            await connection.execute('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
            // (Tùy chọn) Nếu muốn xóa luôn cả bảng carts:
            // await connection.execute('DELETE FROM carts WHERE id = ?', [cartId]);
        }

        await connection.commit();
        res.status(201).json({ message: "Đặt hàng thành công", orderId: orderId });

    } catch (err) {
        await connection.rollback();
        console.error("Lỗi đặt hàng:", err);
        res.status(500).json({ message: "Lỗi hệ thống", error: err.message });
    } finally {
        connection.release();
    }
});

// API: Lấy danh sách đơn hàng của người dùng
router.get('/user/:userId', async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC`, 
            [req.params.userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;