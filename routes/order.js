const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const Order = require('../models/order');

const dbFilePath = path.join(__dirname, '../db.json');

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

// Lấy danh sách món ăn theo type
router.get('/menu/type/:type', async (req, res) => {
    try {
        const data = await fs.readFile(dbFilePath, 'utf8');
        const db = JSON.parse(data);
        const menuItems = db.menuItems || [];

        // Lọc danh sách món theo type
        const filteredItems = menuItems.filter(item => item.type === req.params.type);

        res.json(filteredItems);
    } catch (err) {
        console.error("❌ Lỗi khi đọc dữ liệu menu:", err);
        res.status(500).json({ error: "Lỗi máy chủ!" });
    }
});

// Hiển thị trang order
router.post('/add', async (req, res) => {
    const { itemId, quantity, tableNumber } = req.body;

    try {
        const data = await fs.readFile(dbFilePath, 'utf8');
        const db = JSON.parse(data);
        const menuItems = db.menuItems || [];

        // Tìm món ăn trong menu
        const item = menuItems.find(i => String(i._id) === String(itemId));
        if (!item) {
            return res.status(404).json({ success: false, error: 'Món không tồn tại.' });
        }

        // Tìm đơn hàng theo số bàn
        let order = await Order.findOne({ tableNumber });
        if (!order) {
            // Nếu không tìm thấy đơn hàng, tạo mới
            order = new Order({
                tableNumber,
                items: [],
                total: 0,
            });
        }

        // Kiểm tra món ăn đã có trong giỏ hàng chưa
        const existingItem = order.items.find(i => String(i.menuId) === String(itemId));
        if (existingItem) {
            existingItem.quantity += parseInt(quantity, 10);
        } else {
            order.items.push({
                menuId: item._id,
                name: item.name,
                price: item.price,
                quantity: parseInt(quantity, 10),
            });
        }

        // Cập nhật tổng tiền
        order.total = order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

        // Lưu đơn hàng
        await order.save();

        res.json({ success: true, message: `Đã thêm món vào giỏ hàng bàn ${tableNumber}!` });
    } catch (err) {
        console.error("❌ Lỗi khi thêm món vào giỏ hàng:", err);
        res.status(500).json({ success: false, error: "Lỗi máy chủ!" });
    }
});

// filepath: d:\project_node\Project_LTMNM\routes\order.js
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find({}); // Lấy danh sách đơn hàng từ cơ sở dữ liệu
        res.render('order/order', { orders }); // Truyền biến orders vào file order.ejs
    } catch (err) {
        console.error("❌ Lỗi khi tải trang order:", err);
        res.status(500).send("Lỗi máy chủ!");
    }
});

module.exports = router;


