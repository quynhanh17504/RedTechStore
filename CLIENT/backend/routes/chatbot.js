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

        // 3. Tìm kiếm linh hoạt (Trường hợp tìm Laptop, iPhone, v.v.)
        else {
            query = `
                SELECT p.id, p.name, p.price, p.stock, p.image, c.name as category_name, b.name as brand_name 
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN brands b ON p.brand_id = b.id
                WHERE 1=1
            `;

            if (search && search.trim() !== "") {
                query += ` 
                    AND (p.name LIKE ? 
                    OR b.name LIKE ? 
                    OR c.name LIKE ?)
                `;
                const searchTerm = `%${search.trim()}%`;
                params = [searchTerm, searchTerm, searchTerm];
            }
            // Sắp xếp sản phẩm mới nhất lên đầu nếu tìm kiếm chung
            query += ` ORDER BY p.id DESC LIMIT 6`;
        }

        const [rows] = await db.execute(query, params);

        // Xử lý dữ liệu trả về cho Rasa/React
        const formattedData = rows.map(p => {
            let imgList = [];
            try {
                // Xử lý ảnh linh hoạt cho cả chuỗi JSON và chuỗi đơn
                if (p.image) {
                    if (typeof p.image === 'string' && p.image.startsWith('[')) {
                        imgList = JSON.parse(p.image);
                    } else if (Array.isArray(p.image)) {
                        imgList = p.image;
                    } else {
                        imgList = [p.image];
                    }
                } else {
                    imgList = ['default.jpg'];
                }
            } catch (e) {
                console.error("Lỗi parse ảnh:", e);
                imgList = ['default.jpg'];
            }
            
            return {
                id: p.id,
                name: p.name,
                price: p.price,
                stock: p.stock || 0,
                image: imgList,
                brand: p.brand_name || '',
                category: p.category_name || ''
            };
        });

        // Debug nhẹ để Ngọc kiểm tra log ở terminal Node.js
        console.log(`🔍 Chatbot tìm kiếm: "${search || 'N/A'}" | Kết quả: ${formattedData.length}`);

        return res.json(formattedData);

    } catch (err) {
        console.error("❌ Chatbot API Error:", err.message);
        return res.status(500).json([]);
    }
});

module.exports = router;