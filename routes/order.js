const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const dbFilePath = path.join(__dirname, '../db.json'); // Đường dẫn tới file dữ liệu

// Lấy danh sách món ăn theo số bàn
router.get('/menu/:tableNumber', async (req, res) => {
    try {
        const data = await fs.readFile(dbFilePath, 'utf8');
        const db = JSON.parse(data);
        const menuItems = db.menuItems || [];

        if (menuItems.length === 0) {
            return res.status(404).json({ error: "Không có món nào trong menu." });
        }
        
        res.json(menuItems);
    } catch (err) {
        console.error("❌ Lỗi khi đọc dữ liệu menu:", err);
        res.status(500).json({ error: "Lỗi máy chủ!" });
    }
});
// Hiển thị trang order
router.get('/', async (req, res) => {
    try {
        const data = await fs.readFile(dbFilePath, 'utf8');
        const db = JSON.parse(data);
        const menuItems = db.menuItems || [];

        res.render('order/order', { menuItems, session: req.session });
    } catch (err) {
        console.error("❌ Lỗi khi tải trang order:", err);
        res.status(500).send("Lỗi máy chủ!");
    }
});
router.get('/payment', (req, res) => {
    if (!req.session.cart || req.session.cart.length === 0) {
        return res.redirect('/order');
    }
    let total = req.session.cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    res.render('order/checkout', { cart: req.session.cart, total: total });
});

// Thêm món vào giỏ hàng
router.post('/add', async (req, res) => {
    const { itemId, quantity, tableNumber } = req.body;

    try {
        const data = await fs.readFile(dbFilePath, 'utf8');
        const db = JSON.parse(data);
        const menuItems = db.menuItems || [];

        const item = menuItems.find(i => String(i._id) === String(itemId));

        if (!item) {
            return res.status(404).json({ success: false, error: 'Món không tồn tại.' });
        }

        // Khởi tạo giỏ hàng theo bàn
        if (!req.session.carts) {
            req.session.carts = {};
        }
        if (!req.session.carts[tableNumber]) {
            req.session.carts[tableNumber] = [];
        }

        // Kiểm tra món đã tồn tại chưa
        const existingItem = req.session.carts[tableNumber].find(i => i._id === itemId);
        if (existingItem) {
            existingItem.quantity += parseInt(quantity, 10);
        } else {
            req.session.carts[tableNumber].push({ ...item, quantity: parseInt(quantity, 10) });
        }

        res.json({ success: true, message: `Đã thêm vào giỏ hàng bàn ${tableNumber}!` });
    } catch (err) {
        console.error("❌ Lỗi khi thêm món vào giỏ hàng:", err);
        res.status(500).json({ success: false, error: "Lỗi máy chủ!" });
    }
});
router.get('/payment', (req, res) => {
    if (!req.session.user || !req.session.cart || req.session.cart.length === 0) {
        return res.redirect('/order');
    }

    let total = req.session.cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    res.render('order/payment', { cart: req.session.cart, total: total });
});

// Xác nhận thanh toán
router.post('/payment/confirm', (req, res) => {
    if (!req.session.user || !req.session.cart || req.session.cart.length === 0) {
        return res.redirect('/order');
    }

    let total = req.session.cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    req.session.cart = []; // Xóa giỏ hàng sau khi thanh toán

    res.render('order/confirmation', { total: total });
});

module.exports = router;