const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: "Không có token, quyền truy cập bị từ chối" });

    try {
        const decoded = jwt.verify(token.split(" ")[1], 'redtech_secret_key');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Token không hợp lệ" });
    }
};