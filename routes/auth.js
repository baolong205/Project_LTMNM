const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../db.json');

// Hiển thị form login
router.get('/login', (req, res) => {
  res.render('auth/login', { error: null });
});

// Xử lý login
router.post('/login', (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.render('auth/login', {
      error: 'Vui lòng nhập đủ tên đăng nhập, mật khẩu và vai trò.'
    });
  }

  fs.readFile(dbPath, 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).render('auth/login', {
        error: 'Lỗi đọc dữ liệu người dùng.'
      });
    }

    let users;
    try {
      users = JSON.parse(data).users;
    } catch (parseErr) {
      return res.status(500).render('auth/login', {
        error: 'Lỗi phân tích dữ liệu người dùng.'
      });
    }

    // ✅ Chuẩn hóa để so sánh
    const inputRole = role.trim().toLowerCase();
    const inputUsername = username.trim();
    const inputPassword = password.trim();

    const user = users.find(u =>
      u.username.trim() === inputUsername &&
      u.password.trim() === inputPassword &&
      u.role.trim().toLowerCase() === inputRole
    );
    console.log('🔍 USER FOUND:', user); // 👉 Thêm dòng này

    if (!user) {
      return res.render('auth/login', {
        error: 'Sai thông tin hoặc vai trò không đúng!'
      });
    }

    // ✅ Lưu session
    req.session.user = {
      username: user.username,
      role: user.role
    };

    // ✅ Điều hướng theo vai trò
    switch (user.role.trim().toLowerCase()) {
      case 'admin':
        return res.redirect('/admin/menu');
      case 'thu ngân':
        return res.redirect('/payment');
      case 'phục vụ':
        return res.redirect('/order');
      case 'pha chế':
        return res.redirect('/bartender');
      default:
        return res.redirect('/menu');
    }
  });
});

// Đăng xuất
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).render('auth/login', {
        error: 'Lỗi khi đăng xuất.'
      });
    }
    res.redirect('/auth/login');
  });
});

module.exports = router;
