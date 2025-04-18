const fs = require('fs');
const fsAsync = require('fs').promises;
const path = require('path');
const dbPath = path.join(__dirname, '../db.json');
const mongoose = require('mongoose');

const Menu = require('../models/MenuItem'); // Model cho collection 'menus'

// ======= MENU sử dụng MongoDB =======
exports.getDashboard = async (req, res) => {
    try {
        const doc = await mongoose.connection.collection('menus').findOne({ menuItems: { $exists: true } });
        const menuItems = doc?.menuItems || [];

        res.render('admin/dashboard', {
            user: req.session.user,
            menuItems,
            editItem: null
        });
    } catch (err) {
        console.error('❌ Lỗi khi lấy menu:', err);
        res.status(500).send('Lỗi khi tải menu');
    }
};

exports.addMenuItem = async (req, res) => {
    try {
        const newItem = {
            id: Date.now(),
            name: req.body.name,
            price: parseFloat(req.body.price),
            type: req.body.type,
            category: req.body.category,
            image: req.body.image,
            unit: req.body.unit,
            group: req.body.group,
            code: req.body.code,
        };

        await mongoose.connection.collection('menus').updateOne(
            { menuItems: { $exists: true } },
            { $push: { menuItems: newItem } },
            { upsert: true }
        );

        res.redirect('/admin/menu');
    } catch (err) {
        console.error('❌ Lỗi khi thêm món:', err);
        res.status(500).send('Lỗi máy chủ!');
    }
};

exports.getEditForm = async (req, res) => {
    try {
        const doc = await mongoose.connection.collection('menus').findOne({ menuItems: { $exists: true } });
        const menuItems = doc?.menuItems || [];
        const itemId = parseInt(req.params.id);
        const editItem = menuItems.find(i => i.id === itemId);

        if (!editItem) return res.status(404).send('Không tìm thấy món');

        res.render('admin/dashboard', { 
            menuItems,
            user: req.session.user,
            editItem
        });
    } catch (err) {
        console.error('❌ Lỗi khi tải form sửa:', err);
        res.status(500).send('Lỗi khi tải form sửa');
    }
};

exports.updateMenuItem = async (req, res) => {
    try {
        const itemId = parseInt(req.params.id);
        const updated = {
            name: req.body.name,
            price: parseFloat(req.body.price),
            category: req.body.category,
            type: req.body.type,
            image: req.body.image,
            unit: req.body.unit,
            group: req.body.group,
            code: req.body.code,
        };

        await mongoose.connection.collection('menus').updateOne(
            { menuItems: { $elemMatch: { id: itemId } } },
            { $set: { "menuItems.$": { id: itemId, ...updated } } }
        );

        res.redirect('/admin/menu');
    } catch (err) {
        console.error('❌ Lỗi khi cập nhật món:', err);
        res.status(500).send('Lỗi khi cập nhật món');
    }
};

exports.deleteMenuItem = async (req, res) => {
    try {
        const itemId = parseInt(req.params.id);
        await mongoose.connection.collection('menus').updateOne(
            { menuItems: { $exists: true } },
            { $pull: { menuItems: { id: itemId } } }
        );

        res.redirect('/admin/menu');
    } catch (err) {
        console.error('❌ Lỗi khi xoá món:', err);
        res.status(500).send('Lỗi khi xoá món');
    }
};

// ======= USERS (dùng db.json cho người dùng) =======
function loadData() {
    if (!fs.existsSync(dbPath)) {
        return { users: [] };
    }
    const jsonData = fs.readFileSync(dbPath);
    return JSON.parse(jsonData);
}

function saveData(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

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

    if (!Array.isArray(data.users)) {
        data.users = [];
    }

    const exists = data.users.find(u => u.username === req.body.username);
    if (exists) return res.send("Tên người dùng đã tồn tại!");

    const roleMap = {
        waiter: "Phục vụ",
        cashier: "Thu ngân",
        bartender: "Pha chế",
        admin: "Admin"
    };

    const newUser = {
        username: req.body.username,
        password: req.body.password,
        role: roleMap[req.body.role] || req.body.role,
        createdAt: new Date().toISOString()
    };

    data.users.push(newUser);
    saveData(data);
    console.log('✅ Người dùng mới đã được thêm:', newUser);
    res.redirect('/admin/users');
};

exports.updateUserByUsername = (req, res) => {
    const username = req.params.username;
    const data = loadData();
    const user = data.users.find(u => u.username === username);
    if (!user) return res.redirect('/admin/users');

    const roleMap = {
        waiter: "Phục vụ",
        cashier: "Thu ngân",
        bartender: "Pha chế",
        admin: "Admin"
    };

    user.username = req.body.username;
    user.role = roleMap[req.body.role] || req.body.role;
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