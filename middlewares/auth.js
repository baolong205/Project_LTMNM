const express = require('express');
const router = express.Router();

// Middleware kiểm tra quyền Admin
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).send('Bạn không có quyền truy cập!');
    }
};

// Middleware kiểm tra quyền Nhân viên
const isStaff = (req, res, next) => {
    if (req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'staff')) {
        next();
    } else {
        res.status(403).send('Bạn không có quyền truy cập!');
    }
};

// Giả lập một danh sách người dùng (thực tế bạn sẽ kiểm tra trong cơ sở dữ liệu)
const users = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'staff', password: 'staff123', role: 'staff' }
];

// Xử lý đăng nhập
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Tìm người dùng trong danh sách giả lập
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Lưu thông tin người dùng vào session
        req.session.user = user;

        // Đăng nhập thành công, chuyển hướng về trang chủ hoặc trang nào đó
        res.redirect('/');
    } else {
        // Nếu thông tin đăng nhập sai
        res.render('auth/login', { error: 'Sai tên đăng nhập hoặc mật khẩu!' });
    }
});

// Xử lý đăng xuất
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
});

// Xuất cả router và middleware
module.exports = { router, isAdmin, isStaff };
