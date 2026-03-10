const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. Lấy danh sách tất cả đơn hàng (Kèm chi tiết sản phẩm)
router.get('/', async (req, res) => {
    try {
        // Query lấy thông tin order và thông tin user (email)
        const [orders] = await db.execute(`
            SELECT o.*, u.email 
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `);

        // Với mỗi order, lấy danh sách sản phẩm thuộc order đó
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

// 2. Cập nhật trạng thái đơn hàng
router.put('/update-status/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; 

    // Danh sách các key hợp lệ để đối chiếu
    const validStatuses = ['pending', 'shipping', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Trạng thái không hợp lệ" });
    }

    try {
        // 1. Cập nhật trạng thái
        const sql = `UPDATE orders SET status = ? WHERE id = ?`;
        await db.execute(sql, [status, id]);
        
        // 2. Tự động cập nhật thanh toán nếu đã giao hàng
        if (status === 'delivered') {
            await db.execute(`UPDATE orders SET payment_status = 'Paid' WHERE id = ?`, [id]);
        }

        // 3. QUAN TRỌNG: Trả về Object đầy đủ để Frontend không bị mất data
        // Thay vì chỉ trả về status, ta trả về id và status để FE dễ map
        res.json({ 
            message: "Cập nhật thành công", 
            orderId: id,
            newStatus: status 
        });
    } catch (err) {
        console.error("Error updating status:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;