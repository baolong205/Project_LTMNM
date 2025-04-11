const express = require('express');
const router = express.Router();
const flash = require('connect-flash'); // Thêm thư viện flash để quản lý thông báo

// ✅ Middleware kiểm tra quyền thu ngân
function isCashier(req, res, next) {
    if (req.session.user && req.session.user.staffRole === 'Thu ngân') {
        return next();
    }
    return res.redirect('/auth/login');
}

// 🧾 Hiển thị danh sách các bàn có món đã đặt
router.get('/', isCashier, (req, res) => {
    const carts = req.session.carts || {}; // Lấy giỏ hàng từ session
    const tableNumbers = Object.keys(carts).filter(table => carts[table].length > 0);

    res.render('order/payment_list', {
        tableNumbers,
        session: req.session
    });
});

// 💳 Hiển thị trang thanh toán cho bàn cụ thể
router.get('/:tableNumber', isCashier, (req, res) => {
    const { tableNumber } = req.params;
    const carts = req.session.carts || {}; // Lấy giỏ hàng từ session

    if (!carts[tableNumber] || carts[tableNumber].length === 0) {
        return res.redirect('/payment');
    }

    const cart = carts[tableNumber];
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    res.render('order/payment', {
        tableNumber,
        cart,
        total,
        successMessage: '',
        session: req.session
    });
});

// ✅ Xác nhận thanh toán
router.post('/confirm/:tableNumber', isCashier, (req, res) => {
    const { tableNumber } = req.params;
    const carts = req.session.carts || {}; // Lấy giỏ hàng từ session

    if (!carts[tableNumber] || carts[tableNumber].length === 0) {
        req.flash('error', 'Giỏ hàng không tồn tại hoặc đã bị xóa.');
        return res.redirect('/payment');
    }

    const total = carts[tableNumber].reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Lấy phương thức thanh toán từ yêu cầu
    const { paymentMethod } = req.body;
    if (!paymentMethod) {
        req.flash('error', 'Phương thức thanh toán không hợp lệ.');
        return res.redirect(`/payment/${tableNumber}`);
    }

    // Xóa giỏ hàng của bàn sau khi thanh toán
    delete carts[tableNumber];

    // Thêm thông báo thành công
    req.flash('success', '💸 Thanh toán thành công!');
    res.render('order/payment', {
        tableNumber,
        cart: [],
        total,
        successMessage: req.flash('success'),
        session: req.session
    });
});

module.exports = router;
