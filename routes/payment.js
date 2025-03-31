const express = require('express');
const router = express.Router();

// Hiển thị trang thanh toán
router.get('/', (req, res) => {
    // Nếu không có người dùng đăng nhập hoặc giỏ hàng trống, điều hướng đến trang chủ
    if (!req.session.user || !req.session.cart || req.session.cart.length === 0) {
        return res.redirect('/order');  // Điều hướng về trang chủ
    }

    // Tính tổng tiền giỏ hàng
    let total = req.session.cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Render trang thanh toán
    res.render('order/checkout', { cart: req.session.cart, total: total, error: null });
});

// Xử lý xác nhận thanh toán
router.post('/confirm', (req, res) => {
    // Nếu không có người dùng đăng nhập hoặc giỏ hàng trống, điều hướng đến trang chủ
    if (!req.session.user || !req.session.cart || req.session.cart.length === 0) {
        return res.redirect('/');
    }

    // Tính tổng tiền giỏ hàng
    let total = req.session.cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Xử lý thanh toán (giả sử thanh toán thành công)
    // Sau khi thanh toán thành công, xóa giỏ hàng
    req.session.cart = [];

    // Hiển thị thông báo thanh toán thành công
    res.render('order/confirmation', { total: total });
});

module.exports = router;
