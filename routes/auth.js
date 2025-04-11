const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Đường dẫn đến file db.json
const dbPath = path.join(__dirname, '../db.json');

// Hiển thị trang đăng nhập
router.get('/login', (req, res) => {
    res.render('auth/login', { error: null });
});

// Đăng nhập
router.post('/login', (req, res) => {
    const { username, password, role } = req.body;

    // Đọc dữ liệu từ db.json
    fs.readFile(dbPath, 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).render('auth/login', { error: 'Lỗi đọc dữ liệu' });
        }

        let users;
        try {
            users = JSON.parse(data).users;
        } catch (parseError) {
            return res.status(500).render('auth/login', { error: 'Lỗi phân tích dữ liệu' });
        }

        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            // Nếu là staff, cần kiểm tra role (nếu có)
            if (user.role === 'staff' && role) {
                user.role = role; // Cập nhật role nếu là staff và có thông tin role
            }

            // Lưu thông tin người dùng vào session
            req.session.user = user;
            return res.redirect('/menu'); // Chuyển hướng đến /menu sau khi đăng nhập thành công
        }

        // Nếu thông tin đăng nhập sai
        res.render('auth/login', { error: 'Sai tên đăng nhập hoặc mật khẩu!' });
    });
});

// Đăng xuất
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).render('auth/login', { error: 'Lỗi khi đăng xuất' });
        }
        res.redirect('/auth/login'); // Chuyển hướng về trang đăng nhập sau khi đăng xuất
    });
});

// Xuất router
module.exports = router;