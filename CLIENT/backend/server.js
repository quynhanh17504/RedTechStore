const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/client/auth', authRoutes);

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