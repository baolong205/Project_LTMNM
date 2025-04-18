const fs = require('fs');
const fsAsync = require('fs').promises;
const path = require('path');
const dbPath = path.join(__dirname, '../db.json');

// ======= Helper: Load / Save DB =======
function loadData() {
    const jsonData = fs.readFileSync(dbPath);
    return JSON.parse(jsonData);
}
function saveData(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}
async function loadDB() {
    const data = await fsAsync.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
}
async function saveDB(db) {
    await fsAsync.writeFile(dbPath, JSON.stringify(db, null, 2));
}

// ======= MENU (dùng async) =======
exports.getDashboard = async (req, res) => {
    const db = await loadDB();
    const menuItems = db.menuItems || [];
    res.render('admin/dashboard', {
        menuItems,
        user: req.session.user,
        editItem: null
    });
};

exports.addMenuItem = async (req, res) => {
    const { name, category, price } = req.body;
    const image = req.file ? '/uploads/' + req.file.filename : null;
    const db = await loadDB();
    const newItem = {
        id: Date.now().toString(),
        name,
        category,
        price: parseFloat(price),
        image
    };
    db.menuItems = db.menuItems || [];
    db.menuItems.push(newItem);
    await saveDB(db);
    res.redirect('/dashboard');
};

exports.getEditForm = async (req, res) => {
    const db = await loadDB();
    const menuItems = db.menuItems || [];
    const item = menuItems.find(i => i.id === req.params.id);
    if (!item) return res.status(404).send('Không tìm thấy món');
    res.render('admin/dashboard', {
        editItem: item,
        menuItems,
        user: req.session.user
    });
};

exports.updateMenuItem = async (req, res) => {
    const { name, category, price } = req.body;
    const db = await loadDB();
    const menuItems = db.menuItems || [];
    const item = menuItems.find(i => i.id === req.params.id);
    if (item) {
        item.name = name;
        item.category = category;
        item.price = parseFloat(price);
        if (req.file) {
            item.image = '/uploads/' + req.file.filename;
        }
        await saveDB(db);
    }
    res.redirect('/dashboard');
};

exports.deleteMenuItem = async (req, res) => {
    const db = await loadDB();
    db.menuItems = db.menuItems.filter(i => i.id !== req.params.id);
    await saveDB(db);
    res.redirect('/dashboard');
};

// ======= USERS (dùng username thay id) =======

exports.getUsers = (req, res) => {
    const data = loadData();
    res.render('admin/users', {
        users: data.users || [],
        editUser: null
    });
};

exports.getEditUserByUsername = (req, res) => {
    const username = req.params.username;
    const data = loadData();
    const userToEdit = data.users.find(u => u.username === username);
    if (!userToEdit) return res.redirect('/admin/users');
    res.render('admin/users', {
        users: data.users || [],
        editUser: userToEdit
    });
};

exports.addUser = (req, res) => {
    const data = loadData();
    if (!data.users) data.users = [];

    // Kiểm tra trùng username
    const exists = data.users.find(u => u.username === req.body.username);
    if (exists) return res.send("Tên người dùng đã tồn tại!");

    const newUser = {
        username: req.body.username,
        password: req.body.password,
        role: req.body.role,
        createdAt: new Date().toISOString()
    };
    data.users.push(newUser);
    saveData(data);
    res.redirect('/admin/users');
};

exports.updateUserByUsername = (req, res) => {
    const username = req.params.username;
    const data = loadData();
    const user = data.users.find(u => u.username === username);
    if (!user) return res.redirect('/admin/users');

    user.username = req.body.username;
    user.role = req.body.role;
    if (req.body.password && req.body.password.trim() !== '') {
        user.password = req.body.password;
    }
    saveData(data);
    res.redirect('/admin/users');
};

exports.deleteUserByUsername = (req, res) => {
    const username = req.params.username;
    const data = loadData();
    data.users = data.users.filter(u => u.username !== username);
    saveData(data);
    res.redirect('/admin/users');
};
