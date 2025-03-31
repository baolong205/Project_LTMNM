const express = require('express');
const fs = require('fs');
const router = express.Router();

// Xử lý đăng nhập
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Đọc dữ liệu từ db.json
    fs.readFile('./db.json', 'utf8', (err, data) => {
        if (err) {
            console.log('Lỗi khi đọc file db.json:', err);
            return res.status(500).send('Lỗi máy chủ');
        }

        const db = JSON.parse(data);
        const user = db.users.find(u => u.username === username && u.password === password);

        if (user) {
            req.session.user = user;  // Lưu thông tin người dùng vào session
            res.redirect('/menu');  // Chuyển hướng về trang menu sau khi đăng nhập
        } else {
            // Nếu không tìm thấy người dùng, hiển thị lỗi
            res.render('auth/login', { error: 'Sai tên đăng nhập hoặc mật khẩu!' });
        }
    });
});

// Route GET /logout để đăng xuất
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log('Lỗi khi xóa session:', err);
            return res.status(500).send('Lỗi khi đăng xuất');
        }
        res.redirect('/auth/login');  // Chuyển hướng về trang đăng nhập sau khi đăng xuất
    });
});

// Đảm bảo route GET /login cũng render trang đăng nhập mà không có lỗi
router.get('/login', (req, res) => {
    res.render('auth/login', { error: null });
});

module.exports = router;
