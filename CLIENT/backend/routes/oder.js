const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * 1. API: Đặt hàng (Place Order)
 * Đã sửa: Ghi vào cột 'total' thay vì 'total_price'
 */
router.post('/place', async (req, res) => {
    const { userId, fullname, phone, address, totalPrice, paymentMethod, items } = req.body;

    if (!userId || !items || items.length === 0) {
        return res.status(400).json({ message: "Dữ liệu đơn hàng không hợp lệ" });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // --- BƯỚC 1: CHÈN VÀO BẢNG ORDERS ---
        // Sử dụng cột 'total' để khớp với database của bạn
        const orderQuery = `
            INSERT INTO orders (user_id, fullname, phone, address, total, status, payment_method, payment_status, created_at)
            VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, NOW())
        `;
        
        const paymentStatus = paymentMethod === 'COD' ? 'Pending' : 'Unpaid';
        
        const [orderResult] = await connection.execute(orderQuery, [
            userId, fullname, phone, address, totalPrice, paymentMethod, paymentStatus
        ]);

        const orderId = orderResult.insertId;

       // --- BƯỚC 2: CHÈN VÀO ORDER_ITEMS & CẬP NHẬT KHO ---
            const itemQuery = `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`;
            const updateStockQuery = `UPDATE products SET stock = stock - ? WHERE id = ?`;

            for (const item of items) {
                // 1. Lấy ID sản phẩm (linh hoạt giữa product_id hoặc id)
                const pId = item.product_id || item.id; 
                
                // 2. Lấy giá từ Frontend gửi lên (đây là giá đã áp dụng Flash Sale/Member)
                // Nếu price_at_purchase không tồn tại thì mới dùng item.price làm dự phòng
                const pPrice = item.price_at_purchase !== undefined ? item.price_at_purchase : item.price;
                
                const pQty = item.quantity;

                // Kiểm tra an toàn để tránh lỗi "Bind parameters must not contain undefined"
                if (!pId || pPrice === undefined || !pQty) {
                    console.error("Dữ liệu item không hợp lệ:", item);
                    throw new Error(`Sản phẩm ${item.name || pId} thiếu thông tin giá hoặc ID.`);
                }

                // Thực thi chèn dữ liệu vào bảng order_items
                await connection.execute(itemQuery, [orderId, pId, pQty, pPrice]);
                
                // Cập nhật giảm số lượng tồn kho
                await connection.execute(updateStockQuery, [pQty, pId]);
            }
        // --- BƯỚC 3: XÓA GIỎ HÀNG SAU KHI ĐẶT ---
        const [cart] = await connection.execute('SELECT id FROM carts WHERE user_id = ?', [userId]);
        if (cart.length > 0) {
            const cartId = cart[0].id;
            await connection.execute('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
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

/**
 * 2. API: Lấy danh sách đơn hàng của người dùng (User Side)
 * Đã sửa: Dùng Alias để khớp với Frontend 'total_price'
 * URL: http://localhost:3005/client/order/my-orders/:userId
 */
router.get('/my-orders/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Lấy danh sách đơn hàng
        // Alias 'total AS total_price' là chìa khóa để fix lỗi 500
        const [orders] = await db.execute(
            `SELECT id, total AS total_price, status, payment_method, created_at 
             FROM orders 
             WHERE user_id = ? 
             ORDER BY created_at DESC`, 
            [userId]
        );

        // Lấy chi tiết sản phẩm cho từng đơn hàng để hiển thị số lượng ở FE
        const ordersWithDetails = await Promise.all(orders.map(async (order) => {
            const [items] = await db.execute(
                `SELECT oi.*, p.name as product_name 
                 FROM order_items oi
                 JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id = ?`,
                [order.id]
            );
            return {
                ...order,
                products: items // Trả về mảng để FE dùng products.length
            };
        }));

        res.json(ordersWithDetails);
    } catch (err) {
        console.error("Lỗi lấy danh sách đơn hàng:", err);
        res.status(500).json({ message: "Lỗi lấy dữ liệu đơn hàng", error: err.message });
    }
});

/**
 * 3. API: Lấy chi tiết một đơn hàng cụ thể
 */
router.get('/detail/:orderId', async (req, res) => {
    try {
        // Lấy thông tin chung của đơn hàng
        // SELECT * để lấy fullname, phone, address, payment_method, status...
        const [orders] = await db.execute(
            `SELECT *, total AS total_price FROM orders WHERE id = ?`, 
            [req.params.orderId]
        );
        
        if (orders.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        const orderData = orders[0];

        // Lấy danh sách sản phẩm trong đơn hàng
        const [items] = await db.execute(
            `SELECT oi.product_id, oi.quantity, oi.price, p.name, p.image 
             FROM order_items oi 
             JOIN products p ON oi.product_id = p.id 
             WHERE oi.order_id = ?`, 
            [req.params.orderId]
        );

        // Trả về object gộp lại, đặt tên là 'products' để khớp với Frontend
        res.json({ 
            ...orderData, 
            products: items 
        });
    } catch (err) {
        console.error("Lỗi lấy chi tiết đơn hàng:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;