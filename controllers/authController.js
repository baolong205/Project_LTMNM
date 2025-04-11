const express = require('express');
const router = express.Router();



// Xử lý đăng nhập
router.post('/login', (req, res) => {
    const { username, password, role } = req.body;

    // Tìm người dùng trong danh sách
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Lưu thông tin người dùng vào session
        req.session.user = {
            username: user.username,
            role: user.role
        };

        // Nếu là staff, thêm quyền vào session
        if (user.role === 'staff' && role) {
            req.session.user.staffRole = role; // Lưu vai trò cụ thể: thu_ngan, pha_che, phuc_vu
        }

        res.redirect('/menu');
    } else {
        res.render('auth/login', { error: 'Sai tên đăng nhập hoặc mật khẩu!' });
    }
});

module.exports = router;
