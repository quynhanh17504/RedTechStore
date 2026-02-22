const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');
const adminCategories = require('./routes/adminCategories');
const adminBrands = require('./routes/adminBrands');
const adminProducts = require('./routes/adminProduct');
const adminAuth = require('./routes/adminAuth');
const adminDashboard = require('./routes/adminDashboard');
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/admin/auth', adminAuth);
app.use('/admin/categories', adminCategories);
app.use('/admin/brands', adminBrands);
app.use('/admin/products', adminProducts);
app.use('/admin/dashboard', adminDashboard);
const PORT = 5000; 



db.query('SELECT 1')
    .then(() => {
        console.log('✅ [RedTech Admin] Kết nối Database MySQL thành công!');
        app.listen(PORT, () => {
            console.log(`🚀 [RedTech Admin] Server đang chạy tại: http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ [RedTech Admin] Lỗi kết nối Database:', err.message);
        process.exit(1); 
    });