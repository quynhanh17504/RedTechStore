const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- HELPER: Tạo JWT Token ---
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role }, 
        'redtech_secret_key', 
        { expiresIn: '1d' }
    );
};

// 1. API ĐĂNG KÝ (Thủ công)
router.post('/register', async (req, res) => {
    // Destructuring và gán giá trị mặc định là null cho các trường không bắt buộc
    const { fullname, email, password, gender, phone = null, address = null } = req.body;
    
    try {
        const [userExists] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (userExists.length > 0) return res.status(400).json({ message: "Email đã tồn tại!" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Chèn vào DB. Các trường phone, address sẽ là NULL nếu không điền.
        await db.execute(
            'INSERT INTO users (fullname, email, password, gender, phone, address, role) VALUES (?, ?, ?, ?, ?, ?, "client")',
            [fullname, email, hashedPassword, gender || 'Khác', phone, address]
        );
        
        res.status(201).json({ message: "Đăng ký thành công!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi hệ thống", error: err.message });
    }
});

// 2. API ĐĂNG NHẬP (Thủ công)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ message: "Email không tồn tại!" });

        const user = users[0];
        // Nếu user này đăng ký qua Google và chưa đặt mật khẩu
        if (user.password === 'google_authenticated') {
            return res.status(400).json({ message: "Tài khoản này được đăng nhập bằng Google. Vui lòng chọn 'Đăng nhập bằng Google'." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu!" });

        const token = generateToken(user);
        res.json({ token, user: { id: user.id, fullname: user.fullname, role: user.role, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// 3. API ĐĂNG NHẬP GOOGLE (Cập nhật để không lỗi)
router.post('/google-login', async (req, res) => {
    const { email, fullname, googleId } = req.body;
    try {
        // Kiểm tra xem email đã tồn tại chưa
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        let user;

        if (users.length > 0) {
            // Trường hợp 1: User đã tồn tại -> Chỉ cần lấy thông tin để đăng nhập
            user = users[0];
        } else {
            // Trường hợp 2: User chưa tồn tại -> Tự động tạo tài khoản mới (Auto-register)
            // Password để giá trị đặc biệt để đánh dấu là user Google
            const [result] = await db.execute(
                'INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, "client")',
                [fullname, email, 'google_authenticated']
            );
            
            // Lấy lại thông tin user vừa insert
            const [newUser] = await db.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
            user = newUser[0];
        }

        // Tạo token như bình thường
        const token = generateToken(user);

        res.json({
            token,
            user: { id: user.id, fullname: user.fullname, role: user.role, email: user.email }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi xử lý đăng nhập Google", error: err.message });
    }
});

module.exports = router;