const express = require('express');
const router = express.Router();
const db = require('../db');
const cron = require('node-cron'); 

// --- TỰ ĐỘNG HÓA ---
// Quét mỗi phút một lần để tắt các chiến dịch đã quá giờ kết thúc
cron.schedule('* * * * *', async () => {
    try {
        const now = new Date();
        // Cập nhật status về 0 cho các chiến dịch có end_time < thời gian hiện tại và vẫn đang active
        const [result] = await db.execute(
            'UPDATE flash_sales SET status = 0 WHERE end_time < ? AND status = 1', 
            [now]
        );
        if (result.affectedRows > 0) {
            console.log(`[Flash Sale] Đã tự động tắt ${result.affectedRows} chiến dịch hết hạn.`);
        }
    } catch (err) {
        console.error("[Flash Sale Cron Error]:", err.message);
    }
});

// 1. Lấy tất cả chiến dịch (Bổ sung logic kiểm tra thời gian thực)
router.get('/', async (req, res) => {
    try {
        // Trước khi trả về cho UI, chạy một câu lệnh check nhanh để đảm bảo dữ liệu hiển thị là mới nhất
        const now = new Date();
        await db.execute('UPDATE flash_sales SET status = 0 WHERE end_time < ? AND status = 1', [now]);

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