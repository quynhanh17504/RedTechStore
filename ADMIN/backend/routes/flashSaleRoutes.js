const express = require('express');
const router = express.Router();
const db = require('../db');
const cron = require('node-cron'); 

// TỰ ĐỘNG HÓA: Quét mỗi phút để dọn dẹp các đợt Sale hết hạn
cron.schedule('* * * * *', async () => {
    try {
        const now = new Date();
        
        // 1. Tìm các chiến dịch đã quá giờ kết thúc nhưng vẫn đang để status = 1[cite: 6]
        const [expiredSales] = await db.execute(
            'SELECT id FROM flash_sales WHERE end_time < ? AND status = 1', 
            [now]
        );

        if (expiredSales.length > 0) {
            const ids = expiredSales.map(s => s.id);
            
            // 2. Gỡ bỏ flash_sale_id khỏi bảng products để sản phẩm trở về giá thường
            await db.execute(
                `UPDATE products SET flash_sale_id = NULL WHERE flash_sale_id IN (${ids.join(',')})`
            );
            
            // 3. Cập nhật trạng thái chiến dịch Flash Sale thành kết thúc (0)[cite: 6]
            await db.execute(
                `UPDATE flash_sales SET status = 0 WHERE id IN (${ids.join(',')})`
            );
            
            console.log(`[System] Đã tự động kết thúc ${ids.length} chiến dịch Flash Sale.`);
        }
    } catch (err) {
        console.error("[Cron Error]:", err.message);
    }
});

// Lấy danh sách Flash Sale cho dropdown[cite: 6]
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM flash_sales ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Thêm mới chiến dịch
router.post('/add', async (req, res) => {
    try {
        const { name, start_time, end_time, status } = req.body;
        
        // Nếu chiến dịch này được kích hoạt (status = 1), 
        // có thể cần tắt các chiến dịch khác để đảm bảo chỉ có 1 campaign chạy tại 1 thời điểm
        if (parseInt(status) === 1) {
            await db.execute('UPDATE flash_sales SET status = 0');
        }

        const sql = `INSERT INTO flash_sales (name, start_time, end_time, status) VALUES (?, ?, ?, ?)`;
        await db.execute(sql, [name, start_time, end_time, parseInt(status) || 0]);
        
        res.status(201).json({ message: "Tạo chiến dịch Flash Sale thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Cập nhật chiến dịch
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, start_time, end_time, status } = req.body;

        // Nếu cập nhật thành active, tắt các cái khác
        if (parseInt(status) === 1) {
            await db.execute('UPDATE flash_sales SET status = 0 WHERE id != ?', [id]);
        }

        const sql = `UPDATE flash_sales SET name=?, start_time=?, end_time=?, status=? WHERE id=?`;
        await db.execute(sql, [name, start_time, end_time, parseInt(status), id]);
        
        res.json({ message: "Cập nhật chiến dịch thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Xóa chiến dịch
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Khi xóa chiến dịch, database sẽ tự SET NULL flash_sale_id trong bảng products 
        await db.execute('DELETE FROM flash_sales WHERE id = ?', [id]);
        
        res.json({ message: "Đã xóa chiến dịch" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;