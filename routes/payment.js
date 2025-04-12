const express = require('express');
const router = express.Router();
const flash = require('connect-flash');
const Order = require('../models/order');

// ✅ Middleware kiểm tra quyền thu ngân
function isCashier(req, res, next) {
    if (req.session.user && req.session.user.staffRole === 'Thu ngân') {
        return next();
    }
    return res.redirect('/auth/login');
}

// 🧾 Hiển thị danh sách các bàn có món đã đặt
router.get('/', isCashier, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.session.userId });

        const tableNumbers = orders
            .filter(order => order.items.length > 0)
            .map(order => order.tableNumber);

        res.render('order/payment_list', {
            tableNumbers,
            session: req.session
        });
    } catch (error) {
        console.error('Lỗi khi lấy đơn hàng:', error);
        res.status(500).send('Lỗi khi lấy đơn hàng');
    }
});

// 💳 Hiển thị trang thanh toán cho bàn cụ thể
router.get('/:tableNumber', isCashier, async (req, res) => {
    const { tableNumber } = req.params;

    try {
        const order = await Order.findOne({ tableNumber: tableNumber, userId: req.session.userId });

        if (!order || !order.items || order.items.length === 0) {
            return res.redirect('/payment');
        }

        const cart = order.items.map(item => ({
            name: item.name || 'Chưa có tên món',
            price: typeof item.price === 'number' ? item.price : 0,
            quantity: item.quantity || 1
        }));

        const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

        res.render('order/payment', {
            tableNumber,
            cart,
            total,
            successMessage: req.flash('success')[0],
            session: req.session
        });
    } catch (error) {
        console.error('Lỗi khi lấy đơn hàng:', error);
        res.status(500).send('Lỗi khi lấy đơn hàng');
    }
});

// ✅ Xác nhận thanh toán
router.post('/confirm/:tableNumber', isCashier, async (req, res) => {
    const { tableNumber } = req.params;

    try {
        const order = await Order.findOne({ tableNumber: tableNumber, userId: req.session.userId });

        if (!order || !order.items || order.items.length === 0) {
            req.flash('error', 'Giỏ hàng không tồn tại hoặc đã bị xóa.');
            return res.redirect('/payment');
        }

        const total = order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

        const paymentMethod = req.body.paymentMethod || 'Tiền mặt';

        await Order.deleteOne({ tableNumber: tableNumber, userId: req.session.userId });

        req.flash('success', '💸 Thanh toán thành công!');
        res.redirect(`/payment/${tableNumber}`);
    } catch (error) {
        console.error('Lỗi khi xác nhận thanh toán:', error);
        res.status(500).send('Lỗi khi xác nhận thanh toán');
    }
});

module.exports = router;
