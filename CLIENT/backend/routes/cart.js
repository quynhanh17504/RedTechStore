const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. Lấy danh sách sản phẩm (Thêm cột p.stock để Frontend kiểm tra)
router.get('/:userId', async (req, res) => {
    try {
        const sql = `
            SELECT ci.id as item_id, p.id as product_id, p.name, p.price, p.image, p.stock, ci.quantity 
            FROM carts c
            JOIN cart_items ci ON c.id = ci.cart_id
            JOIN products p ON ci.product_id = p.id
            WHERE c.user_id = ?`;
        const [rows] = await db.execute(sql, [req.params.userId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Thêm mới hoặc tăng số lượng (Dùng cho nút Mua ngay/Thêm vào giỏ)
router.post('/add', async (req, res) => {
    const { userId, productId, quantity } = req.body;
    try {
        let [cart] = await db.execute('SELECT id FROM carts WHERE user_id = ?', [userId]);
        let cartId = cart.length === 0 
            ? (await db.execute('INSERT INTO carts (user_id) VALUES (?)', [userId]))[0].insertId 
            : cart[0].id;

        const [existItem] = await db.execute(
            'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?', 
            [cartId, productId]
        );

        if (existItem.length > 0) {
            await db.execute(
                'UPDATE cart_items SET quantity = quantity + ? WHERE cart_id = ? AND product_id = ?', 
                [quantity, cartId, productId]
            );
        } else {
            await db.execute(
                'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)', 
                [cartId, productId, quantity]
            );
        }
        res.json({ success: true, message: "Đã thêm vào giỏ hàng" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. ROUTE MỚI: Cập nhật số lượng trực tiếp (Sửa lỗi 404)
router.put('/update', async (req, res) => {
    const { userId, productId, delta } = req.body;
    try {
        // Tìm cartId của user
        const [cart] = await db.execute('SELECT id FROM carts WHERE user_id = ?', [userId]);
        if (cart.length === 0) return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

        const cartId = cart[0].id;

        // Cập nhật số lượng nhưng không cho phép nhỏ hơn 1
        // Lưu ý: Việc chặn vượt quá 'stock' đã làm ở Frontend, 
        // nhưng Backend cũng nên dùng MAX(1, quantity + delta) để an toàn.
        const sql = `
            UPDATE cart_items 
            SET quantity = GREATEST(1, quantity + ?) 
            WHERE cart_id = ? AND product_id = ?`;
            
        await db.execute(sql, [delta, cartId, productId]);
        res.json({ success: true, message: "Đã cập nhật số lượng" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Xóa sản phẩm
router.delete('/remove/:userId/:productId', async (req, res) => {
    try {
        const [cart] = await db.execute('SELECT id FROM carts WHERE user_id = ?', [req.params.userId]);
        if (cart.length > 0) {
            await db.execute(
                'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?', 
                [cart[0].id, req.params.productId]
            );
        }
        res.json({ message: "Đã xóa sản phẩm" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;