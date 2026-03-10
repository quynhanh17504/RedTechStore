const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. Lấy danh sách tất cả đơn hàng (Kèm chi tiết sản phẩm)
router.get('/', async (req, res) => {
    try {
        const [orders] = await db.execute(`
            SELECT o.*, u.email 
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `);

        const ordersWithProducts = await Promise.all(orders.map(async (order) => {
            const [products] = await db.execute(`
                SELECT oi.*, p.name as product_name 
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `, [order.id]);
            
            return {
                ...order,
                total_price: order.total, 
                products: products
            };
        }));

        res.json(ordersWithProducts);
    } catch (err) {
        console.error("Lỗi lấy danh sách đơn hàng Admin:", err);
        res.status(500).json({ error: err.message });
    }
});

// 2. Cập nhật trạng thái đơn hàng (Đã đồng bộ với ảnh MySQL)
router.put('/update-status/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; 

    // ĐỒNG BỘ: Danh sách này phải khớp 100% với các option trong ảnh MySQL của bạn
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Trạng thái không hợp lệ" });
    }

    try {
        // 1. Cập nhật trạng thái chính
        const sql = `UPDATE orders SET status = ? WHERE id = ?`;
        await db.execute(sql, [status, id]);
        
        // 2. Logic tự động cập nhật thanh toán
        // Lưu ý: Trong ảnh của bạn payment_status đang là 'paid' (viết thường), mình sẽ để 'paid' cho khớp
        if (status === 'delivered') {
            await db.execute(`UPDATE orders SET payment_status = 'paid' WHERE id = ?`, [id]);
        }

        res.json({ 
            message: "Cập nhật thành công", 
            orderId: id,
            newStatus: status,
            newPaymentStatus: status === 'delivered' ? 'paid' : undefined
        });
    } catch (err) {
        console.error("Error updating status:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;