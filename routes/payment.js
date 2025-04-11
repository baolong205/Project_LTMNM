const express = require('express');
const router = express.Router();

// 🧾 Hiển thị danh sách các bàn có món đã đặt
router.get('/', (req, res) => {
    const carts = req.session.carts || {};
    const tableNumbers = Object.keys(carts).filter(table => carts[table].length > 0);

    res.render('order/payment_list', {
        tableNumbers,
        session: req.session // truyền session để dùng trong header
    });
});

// 💳 Hiển thị trang thanh toán cho bàn cụ thể
router.get('/:tableNumber', (req, res) => {
    const { tableNumber } = req.params;

    if (!req.session.carts || !req.session.carts[tableNumber] || req.session.carts[tableNumber].length === 0) {
        return res.redirect('/payment'); // Nếu không có món -> quay lại danh sách bàn
    }

    const cart = req.session.carts[tableNumber];
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Truyền `successMessage` mặc định là rỗng nếu không có thông báo
    res.render('order/payment', {
        tableNumber,
        cart,
        total,
        successMessage: '', // Đảm bảo truyền giá trị successMessage mặc định là rỗng
        session: req.session
    });
});

// ✅ Xác nhận thanh toán cho bàn cụ thể
router.post('/confirm/:tableNumber', (req, res) => {
    const { tableNumber } = req.params;

    if (!req.session.carts || !req.session.carts[tableNumber] || req.session.carts[tableNumber].length === 0) {
        return res.redirect('/payment');
    }

    const total = req.session.carts[tableNumber].reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Xóa giỏ hàng sau khi thanh toán
    delete req.session.carts[tableNumber];

    // Gửi thông báo thành công khi thanh toán hoàn tất
    const successMessage = "💸 Thanh toán thành công!";

    res.render('order/payment', {
        tableNumber,
        cart: [], // Giỏ hàng trống sau khi thanh toán
        total,
        successMessage, // Truyền thông báo thành công vào view
        session: req.session
    });
});

module.exports = router;
