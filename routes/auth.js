const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Đường dẫn tới db.json
const dbPath = path.join(__dirname, '../db.json');

// Hiển thị form đăng nhập
router.get('/login', (req, res) => {
  res.render('auth/login', { error: null });
});

// Xử lý đăng nhập
router.post('/login', (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.render('auth/login', { error: 'Vui lòng nhập đủ tên đăng nhập, mật khẩu và vai trò.' });
  }

  fs.readFile(dbPath, 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).render('auth/login', { error: 'Lỗi đọc dữ liệu người dùng.' });
    }

    let users;
    try {
      users = JSON.parse(data).users;
    } catch (parseErr) {
      return res.status(500).render('auth/login', { error: 'Lỗi phân tích dữ liệu người dùng.' });
    }

    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      return res.render('auth/login', { error: 'Sai tên đăng nhập hoặc mật khẩu!' });
    }

    // Nếu là admin
    if (user.role === 'admin' && role === 'admin') {
      req.session.user = user;
      return res.redirect('/dashboard');
    }

    // Nếu là staff, cần khớp staffRole
    if (user.role === 'staff' && user.staffRole === role) {
      req.session.user = user;

      // Redirect theo vai trò
      if (role === 'Thu ngân') return res.redirect('/payment');
      if (role === 'Pha chế') return res.redirect('/kitchen');
      if (role === 'Phục vụ') return res.redirect('/order');

      return res.redirect('/menu'); // fallback
    }

    // Nếu vai trò không khớp
    return res.render('auth/login', { error: 'Vai trò không đúng với tài khoản!' });
  });
});

// Đăng xuất
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).render('auth/login', { error: 'Lỗi khi đăng xuất.' });
    res.redirect('/auth/login');
  });
});

module.exports = router;
