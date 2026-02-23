const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'redtech_secret_key';

// --- HELPER: Tạo JWT Token ---
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role }, 
        JWT_SECRET, 
        { expiresIn: '1d' }
    );
};

// 1. API ĐĂNG KÝ
router.post('/register', async (req, res) => {
    const { fullname, email, password, gender } = req.body;
    try {
        const [userExists] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (userExists.length > 0) return res.status(400).json({ message: "Email đã tồn tại!" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Phone và Address mặc định là NULL theo cấu trúc bảng của bạn
        await db.execute(
            'INSERT INTO users (fullname, email, password, gender, role) VALUES (?, ?, ?, ?, "client")',
            [fullname, email, hashedPassword, gender || 'Khác']
        );
        res.status(201).json({ message: "Đăng ký thành công!" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi hệ thống", error: err.message });
    }
});

// 2. API ĐĂNG NHẬP
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ message: "Email không tồn tại!" });

        const user = users[0];
        if (user.password === 'google_authenticated') {
            return res.status(400).json({ message: "Tài khoản này dùng Google. Hãy chọn 'Đăng nhập bằng Google'." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu!" });

        const token = generateToken(user);
        res.json({ token, user: { id: user.id, fullname: user.fullname, role: user.role, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// 3. API LẤY THÔNG TIN PROFILE Để hiện lên Form sửa)
router.get('/profile/:id', async (req, res) => {
    try {
        // Lấy đúng các trường fullname, email từ bảng của bạn
        const [users] = await db.execute('SELECT id, fullname, email, gender FROM users WHERE id = ?', [req.params.id]);
        if (users.length === 0) return res.status(404).json({ message: "Không tìm thấy user" });
        res.json(users[0]);
    } catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// 4. API CẬP NHẬT PROFILE (Đúng tên cột: fullname, email, password)
router.put('/update-profile', async (req, res) => {
    const { userId, fullName, email, currentPassword, newPassword } = req.body;

    try {
        const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: "User không tồn tại" });
        const user = users[0];

        // Nếu thay đổi thông tin nhạy cảm, check mật khẩu cũ (trừ user Google)
        if (user.password !== 'google_authenticated' && (newPassword || email !== user.email)) {
            if (!currentPassword) return res.status(400).json({ message: "Vui lòng nhập mật khẩu cũ" });
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) return res.status(400).json({ message: "Mật khẩu cũ không chính xác" });
        }

        let finalPassword = user.password;
        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            finalPassword = await bcrypt.hash(newPassword, salt);
        }

        // Thực hiện Update vào đúng các cột fullname, email, password
        await db.execute(
            'UPDATE users SET fullname = ?, email = ?, password = ? WHERE id = ?',
            [fullName, email, finalPassword, userId]
        );

        res.json({ message: "Cập nhật dữ liệu thành công!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi cập nhật dữ liệu" });
    }
});

module.exports = router;