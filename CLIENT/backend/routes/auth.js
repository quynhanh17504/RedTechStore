const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios'); 
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

        // Khởi tạo mặc định: Hạng Member, 0 điểm
        await db.execute(
            'INSERT INTO users (fullname, email, password, gender, role, member_rank, total_points, total_spent) VALUES (?, ?, ?, ?, "client", "Member", 0, 0)',
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
        // Query có JOIN để lấy mã màu và giảm giá ngay khi đăng nhập
        const query = `
            SELECT u.*, r.color_code, r.discount_percent 
            FROM users u 
            LEFT JOIN rank_configs r ON u.member_rank = r.rank_name 
            WHERE u.email = ?`;
            
        const [users] = await db.execute(query, [email]);
        if (users.length === 0) return res.status(400).json({ message: "Email không tồn tại!" });

        const user = users[0];
        if (user.password === 'google_authenticated') {
            return res.status(400).json({ message: "Tài khoản này dùng Google. Hãy chọn 'Đăng nhập bằng Google'." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu!" });

        const token = generateToken(user);
        
        res.json({ 
            token, 
            user: { 
                id: user.id, 
                fullname: user.fullname, 
                role: user.role, 
                email: user.email,
                member_rank: user.member_rank,
                total_points: user.total_points,
                color_code: user.color_code,
                discount_percent: user.discount_percent
            } 
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// 3. API LẤY THÔNG TIN PROFILE (Quan trọng nhất cho MemberCard)
router.get('/profile/:id', async (req, res) => {
    try {
        // Sử dụng LEFT JOIN để lấy thông tin từ bảng rank_configs dựa trên member_rank của user
        const query = `
            SELECT 
                u.id, u.fullname, u.email, u.gender, u.member_rank, u.total_points, u.total_spent,
                r.color_code, r.discount_percent
            FROM users u
            LEFT JOIN rank_configs r ON u.member_rank = r.rank_name
            WHERE u.id = ?
        `;
        
        const [users] = await db.execute(query, [req.params.id]);
        
        if (users.length === 0) return res.status(404).json({ message: "Không tìm thấy user" });
        res.json(users[0]);
    } catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// 4. API CẬP NHẬT PROFILE
router.put('/update-profile', async (req, res) => {
    const { userId, fullName, email, currentPassword, newPassword } = req.body;

    try {
        const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: "User không tồn tại" });
        const user = users[0];

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

// 5. API ĐĂNG NHẬP BẰNG GOOGLE
router.post('/google-login', async (req, res) => {
    const { email, fullname } = req.body; 

    try {
        if (!email) return res.status(400).json({ message: "Thiếu thông tin email từ Google" });

        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        let user;

        if (users.length === 0) {
            const [result] = await db.execute(
                'INSERT INTO users (fullname, email, password, role, gender, member_rank, total_points, total_spent) VALUES (?, ?, ?, "client", "Khác", "Member", 0, 0)',
                [fullname, email, 'google_authenticated']
            );
            const [newUser] = await db.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
            user = newUser[0];
        } else {
            user = users[0];
            await db.execute('UPDATE users SET fullname = ? WHERE id = ?', [fullname, user.id]);
        }

        // Lấy lại thông tin hoàn chỉnh (kèm Rank Config) sau khi xử lý Google Login
        const [completeUser] = await db.execute(`
            SELECT u.*, r.color_code, r.discount_percent 
            FROM users u 
            LEFT JOIN rank_configs r ON u.member_rank = r.rank_name 
            WHERE u.id = ?`, [user.id]);

        const finalUser = completeUser[0];
        const sysToken = generateToken(finalUser);

        res.json({
            message: "Đăng nhập Google thành công!",
            token: sysToken,
            user: {
                id: finalUser.id,
                fullname: finalUser.fullname,
                email: finalUser.email,
                role: finalUser.role,
                member_rank: finalUser.member_rank,
                total_points: finalUser.total_points,
                color_code: finalUser.color_code,
                discount_percent: finalUser.discount_percent
            }
        });

    } catch (err) {
        console.error("Lỗi Google Login:", err);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
});

module.exports = router;