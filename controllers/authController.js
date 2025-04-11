const express = require('express');
const router = express.Router();
const users = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'staff', password: 'staff123', role: 'staff', staffRole: null } // staffRole sẽ lưu thông tin quyền của staff
];

// Xử lý đăng nhập
router.post('/login', (req, res) => {
    const { username, password, role } = req.body;

    // Tìm người dùng trong danh sách giả lập
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Nếu là staff, lưu thêm quyền vào session
        if (user.role === 'staff' && role) {
            user.staffRole = role; // Lưu quyền staff
        }
        
        // Lưu thông tin người dùng vào session
        req.session.user = user;

        // Đăng nhập thành công, chuyển hướng về trang chủ hoặc trang nào đó
        res.redirect('/');
    } else {
        // Nếu thông tin đăng nhập sai
        res.render('auth/login', { error: 'Sai tên đăng nhập hoặc mật khẩu!' });
    }
});

module.exports = router;
