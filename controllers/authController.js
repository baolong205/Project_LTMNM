const fs = require('fs').promises;
const path = require('path');
const dbPath = path.join(__dirname, '../db.json');

// Load DB từ file JSON
async function loadDB() {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
}

exports.postLogin = async (req, res) => {
    const { username, password, role } = req.body; // role gửi từ form (ví dụ: thu ngân, phục vụ, pha chế)
    const db = await loadDB();

    const user = db.users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.render('auth/login', { error: 'Sai tên đăng nhập hoặc mật khẩu' });
    }

    req.session.user = {
        username: user.username,
        role: user.role,
        staffRole: user.staffRole || role || null // nếu chưa có trong db thì lấy từ form
    };

    // Điều hướng theo vai trò
    if (user.role === 'admin') {
        return res.redirect('/admin/dashboard');
    } else {
        return res.redirect('/menu');
    }
};
