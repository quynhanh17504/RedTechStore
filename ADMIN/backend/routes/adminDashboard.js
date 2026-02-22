const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/stats', async (req, res) => {
    try {
        const [
            [orderStats],    
            [userStats],     
            [productStats],  
            [recentOrders],  // Đã fix destructuring
            [chartStats]     // Đã fix destructuring
        ] = await Promise.all([
            // Fix: Đổi total_price -> total
            db.execute('SELECT COUNT(id) as totalOrders, SUM(total) as totalRevenue FROM orders WHERE status != "cancelled"'),
            db.execute('SELECT COUNT(id) as totalUsers FROM users WHERE role = "client"'),
            db.execute('SELECT SUM(stock) as totalStock FROM products'),
            // Fix: Đổi total_price -> total
            db.execute(`
                SELECT o.id, u.fullname as user, o.total, o.status 
                FROM orders o 
                JOIN users u ON o.user_id = u.id 
                ORDER BY o.created_at DESC LIMIT 5
            `),
            // Fix: Đổi total_price -> total
            db.execute(`
                SELECT 
                    DATE_FORMAT(created_at, '%d/%m') as day, 
                    SUM(total) as revenue 
                FROM orders 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                AND status != "cancelled"
                GROUP BY day 
                ORDER BY MIN(created_at) ASC
            `)
        ]);

        res.json({
            success: true,
            stats: {
                orders: orderStats[0].totalOrders || 0,
                revenue: orderStats[0].totalRevenue || 0,
                users: userStats[0].totalUsers || 0,
                stock: productStats[0].totalStock || 0
            },
            recentOrders: recentOrders,
            chartData: chartStats
        });

    } catch (err) {
        console.error("Lỗi Dashboard API:", err);
        res.status(500).json({ 
            success: false, 
            message: "Không thể lấy dữ liệu thống kê", 
            error: err.message 
        });
    }
});

module.exports = router;