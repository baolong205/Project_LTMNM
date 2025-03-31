const express = require('express');
const router = express.Router();

// Hiển thị trang thanh toán theo bàn
router.get('/:tableNumber', (req, res) => {
    const { tableNumber } = req.params;

    if (!req.session.carts || !req.session.carts[tableNumber] || req.session.carts[tableNumber].length === 0) {
        return res.redirect('/order'); // Nếu bàn chưa có đơn hàng, quay lại trang order
    }

    // Tính tổng tiền giỏ hàng của bàn
    let total = req.session.carts[tableNumber].reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Render trang thanh toán
    res.render('order/checkout', { tableNumber, cart: req.session.carts[tableNumber], total });
});

// Xác nhận thanh toán cho bàn cụ thể
router.post('/confirm/:tableNumber', (req, res) => {
    const { tableNumber } = req.params;

    if (!req.session.carts || !req.session.carts[tableNumber] || req.session.carts[tableNumber].length === 0) {
        return res.redirect('/order');
    }

    // Tính tổng tiền giỏ hàng của bàn
    let total = req.session.carts[tableNumber].reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Xóa giỏ hàng của bàn sau khi thanh toán
    delete req.session.carts[tableNumber];

    // Render trang xác nhận thanh toán
    res.render('order/confirmation', { tableNumber, total });
});

module.exports = router;
