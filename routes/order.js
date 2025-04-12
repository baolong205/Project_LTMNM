const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const Order = require('../models/order'); // Model Order

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

// Thêm món vào giỏ hàng (MongoDB)
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

        // Tìm đơn hàng của bàn với trạng thái "Pending"
        let order = await Order.findOne({ tableNumber, status: "Pending" });

        // Nếu chưa có đơn hàng, tạo mới
        if (!order) {
            order = new Order({
                tableNumber,
                items: [],
                total: 0,
                status: "Pending"
            });
        }

        // Kiểm tra xem món đã tồn tại chưa
        const existingItem = order.items.find(i => i._id === itemId);
        if (existingItem) {
            existingItem.quantity += parseInt(quantity, 10);
        } else {
            order.items.push({
                _id: item._id,
                name: item.name,
                price: item.price,
                quantity: parseInt(quantity, 10)
            });
        }

        // Cập nhật tổng tiền
        order.total = order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

        await order.save();

        res.json({ success: true, message: `Đã thêm vào giỏ hàng bàn ${tableNumber}!` });
    } catch (err) {
        console.error("❌ Lỗi khi thêm vào giỏ hàng:", err);
        res.status(500).json({ success: false, error: "Lỗi máy chủ!" });
    }
});

// Trang thanh toán
router.get('/order/payment/:tableNumber', async (req, res) => {
    const { tableNumber } = req.params;
    let cart = [];
    let total = 0;

    try {
        // Lấy đơn hàng từ MongoDB
        const order = await Order.findOne({ tableNumber, status: "Pending" });

        if (order && order.items.length > 0) {
            cart = order.items;
            total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        }
    } catch (error) {
        console.error('❌ Lỗi khi lấy đơn hàng:', error);
    }

    res.render('order/payment', {
        cart,
        total,
        tableNumber,
        successMessage: req.session.successMessage || null
    });
});


// Xác nhận thanh toán
router.post('/payment/confirm/:tableNumber', async (req, res) => {
    const { tableNumber } = req.params;

    try {
        // Tìm đơn hàng của bàn theo tableNumber với trạng thái "Pending"
        const order = await Order.findOne({ tableNumber, status: "Pending" });

        if (!order || order.items.length === 0) {
            return res.redirect('/order');
        }

        // Tính tổng tiền
        let total = order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

        // Cập nhật trạng thái đơn hàng thành "Paid"
        order.status = "Paid";
        await order.save();

        // Xóa giỏ hàng sau khi thanh toán
        req.session.carts[tableNumber] = [];

        // Render lại trang thanh toán với thông báo thành công
        res.render('order/payment', {
            cart: order.items,
            total: total,
            tableNumber: tableNumber,
            successMessage: "Thanh toán thành công! Cảm ơn bạn đã sử dụng dịch vụ."
        });
    } catch (err) {
        console.error("❌ Lỗi khi thanh toán:", err);
        res.status(500).send("Lỗi máy chủ!");
    }
});
// Hiển thị danh sách các bàn cần thanh toán
router.get('/pending-orders', async (req, res) => {
    try {
        // Tìm các đơn hàng với trạng thái "Pending"
        const orders = await Order.find({ status: "Pending" });

        // Lấy danh sách các số bàn từ các đơn hàng đang chờ thanh toán
        const tableNumbers = orders.map(order => order.tableNumber);

        // Render trang với danh sách bàn cần thanh toán
        res.render('order/payment_list', { tableNumbers });
    } catch (err) {
        console.error("❌ Lỗi khi lấy danh sách đơn hàng chờ thanh toán:", err);
        res.status(500).send("Lỗi máy chủ!");
    }
});

module.exports = router;
