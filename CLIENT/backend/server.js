const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const categoryRoutes = require('./routes/categories');
const brandRoutes = require('./routes/brand');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/oder'); 
const reviewRoutes = require('./routes/review');
const app = express();
app.use(cors());
app.use(express.json());

app.use('/client/auth', authRoutes);
app.use('/client/products', productRoutes);
app.use('/client/categories', categoryRoutes);
app.use('/client/brands', brandRoutes);
app.use('/client/cart', cartRoutes);
app.use('/client/order', orderRoutes);
app.use('/client/review', reviewRoutes);

const PORT = 3005; 

db.query('SELECT 1')
    .then(() => {
        console.log('✅ [RedTech] Kết nối Database MySQL thành công!');
        app.listen(PORT, () => {
            console.log(`🚀 [RedTech] Server đang chạy tại: http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ [RedTech] Lỗi kết nối Database:', err.message);
        process.exit(1); 
    });