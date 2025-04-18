const fs = require('fs').promises;
const path = require('path');
const dbPath = path.join(__dirname, '../db.json');

// Load DB từ file JSON
async function loadDB() {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
}

exports.postLogin = async (req, res) => {
    const { username, password, role } = req.body; // role từ form: tiếng Việt
    const db = await loadDB();

    // Tìm user khớp username, password và role tiếng Việt
    const user = db.users.find(u =>
        u.username === username &&
        u.password === password &&
        u.role === role
        
    );
    if (!user) {
        return res.render('auth/login', { error: 'Sai tên đăng nhập, mật khẩu hoặc vai trò không đúng!' });
    }

    // Lưu session với role tiếng Việt
    req.session.user = {
        username: user.username,
        role: user.role
    };

    // Điều hướng theo role tiếng Việt
    switch (user.role) {
        case 'Admin':
            return res.redirect('/admin/menu');
        case 'Thu ngân':
            return res.redirect('/payment');
        case 'Phục vụ':
            return res.redirect('/order');
        case 'Pha chế':
            return res.redirect('/bartender');
        default:
            return res.redirect('/');
    }
};
