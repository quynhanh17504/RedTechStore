const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// API ĐĂNG NHẬP ADMIN
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.execute(
            'SELECT * FROM users WHERE email = ? AND (role = "admin" OR role = "client")', 
            [email]
        );

        if (users.length === 0) {
            return res.status(403).json({ 
                message: "Truy cập bị từ chối. Tài khoản không có quyền quản trị!" 
            });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu không chính xác!" });
        }

        // Tạo Token Admin
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET || 'redtech_admin_secret_key', 
            { expiresIn: '8h' }
        );

        res.json({
            success: true,
            message: "Chào mừng Admin quay trở lại",
            token,
            user: {
                id: user.id,
                fullname: user.fullname,
                role: user.role
            }
        });

    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
});
// Lấy danh sách tất cả người dùng
router.get('/users', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, fullname, email, gender, role FROM users');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Lỗi lấy danh sách", error: err.message });
    }
});

// Tạo tài khoản mới (Chỉ cho phép role: client hoặc admin)
router.post('/users/create', async (req, res) => {
    const { fullname, email, password, gender, role } = req.body;
    
    // Kiểm tra tính hợp lệ của Role để bảo mật
    const validRoles = ['client', 'admin'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Quyền hạn không hợp lệ!" });
    }

    try {
        const [exists] = await db.execute('SELECT email FROM users WHERE email = ?', [email]);
        if (exists.length > 0) return res.status(400).json({ message: "Email này đã được sử dụng!" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.execute(
            'INSERT INTO users (fullname, email, password, gender, role) VALUES (?, ?, ?, ?, ?)',
            [fullname, email, hashedPassword, gender || 'Nam', role]
        );

        res.status(201).json({ message: "Tạo tài khoản thành công!" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi hệ thống", error: err.message });
    }
});

// API Xóa tài khoản
router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // if (id == req.user.id) return res.status(400).json({ message: "Bạn không thể tự xóa chính mình!" });

        const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng!" });
        }

        res.json({ message: "Đã xóa tài khoản thành công!" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi xóa tài khoản", error: err.message });
    }
});
module.exports = router;

