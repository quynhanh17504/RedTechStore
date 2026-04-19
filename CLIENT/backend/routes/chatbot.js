const express = require('express');
const router = express.Router();
const db = require('../db'); 

// API dành riêng cho Chatbot tra cứu
router.get('/search', async (req, res) => {
    const { search, type } = req.query;
    
    try {
        let query = "";
        let params = [];

        // 1. Truy vấn Flash Sale
        // Dựa theo DB: p.flash_sale_id nối với bảng flash_sales
        if (type === 'flash-sale') {
            query = `
                SELECT p.id, p.name, p.price, p.stock, p.image, b.name as brand_name 
                FROM products p
                LEFT JOIN brands b ON p.brand_id = b.id
                INNER JOIN flash_sales fs ON p.flash_sale_id = fs.id
                WHERE fs.status = 1
                ORDER BY p.stock DESC
                LIMIT 6
            `;
        } 
        
        // 2. Truy vấn Bán chạy
        // Dựa theo DB: products -> order_items -> orders
        else if (type === 'best-sellers') {
            query = `
                SELECT p.id, p.name, p.price, p.stock, p.image, SUM(oi.quantity) as total_sold
                FROM products p
                JOIN order_items oi ON p.id = oi.product_id
                JOIN orders o ON oi.order_id = o.id
                WHERE o.status = 'delivered'
                GROUP BY p.id
                ORDER BY total_sold DESC
                LIMIT 6
            `;
        }

        // 3. Tìm kiếm linh hoạt (Mặc định)
        else {
            query = `
                SELECT p.id, p.name, p.price, p.stock, p.image, c.name as category_name, b.name as brand_name 
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN brands b ON p.brand_id = b.id
                WHERE 1=1
            `;

            if (search) {
                query += ` 
                    AND (p.name LIKE ? 
                    OR b.name LIKE ? 
                    OR c.name LIKE ?)
                `;
                const searchTerm = `%${search}%`;
                params = [searchTerm, searchTerm, searchTerm];
            }
            query += ` ORDER BY p.id DESC LIMIT 6`;
        }

        const [rows] = await db.execute(query, params);

        // Xử lý dữ liệu trả về cho Rasa/React
        const formattedData = rows.map(p => {
            let imgList = [];
            try {
                // Xử lý ảnh: Nếu là chuỗi JSON mảng thì parse, nếu không thì tạo mảng 1 phần tử
                if (typeof p.image === 'string' && p.image.startsWith('[')) {
                    imgList = JSON.parse(p.image);
                } else {
                    imgList = p.image ? [p.image] : ['default.jpg'];
                }
            } catch (e) {
                imgList = ['default.jpg'];
            }
            
            return {
                id: p.id,
                name: p.name,
                price: p.price,
                stock: p.stock,
                image: imgList,
                brand: p.brand_name || '',
                category: p.category_name || ''
            };
        });

        return res.json(formattedData);

    } catch (err) {
        console.error("❌ Chatbot API Error:", err.message);
        return res.status(500).json([]);
    }
});

module.exports = router;