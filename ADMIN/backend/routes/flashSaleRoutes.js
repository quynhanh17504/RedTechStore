const express = require('express');
const router = express.Router();
const db = require('../db');
const cron = require('node-cron'); 

// TỰ ĐỘNG HÓA: Quét mỗi phút để dọn dẹp 
cron.schedule('* * * * *', async () => {
    try {
        const now = new Date();
        const [expiredSales] = await db.execute(
            'SELECT id FROM flash_sales WHERE end_time < ? AND status = 1', 
            [now]
        );

        if (expiredSales.length > 0) {
            const ids = expiredSales.map(s => s.id);
            await db.execute(
                `UPDATE products SET flash_sale_id = NULL WHERE flash_sale_id IN (${ids.join(',')})`
            );
            await db.execute(
                `UPDATE flash_sales SET status = 0 WHERE id IN (${ids.join(',')})`
            );
            console.log(`[System] Đã tự động kết thúc ${ids.length} chiến dịch.`);
        }
    } catch (err) {
        console.error("[Cron Error]:", err.message);
    }
});

// 1. Lấy danh sách Flash Sale
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
        await db.execute('DELETE FROM flash_sales WHERE id = ?', [id]);
        res.json({ message: "Đã xóa chiến dịch" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;