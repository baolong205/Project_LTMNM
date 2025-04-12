const Order = require('../models/order'); // Đảm bảo đã import Order model

// Hiển thị trang thanh toán
const getCheckout = (req, res) => {
    const cart = req.session.cart || [];

    // Chuyển đổi và đảm bảo dữ liệu đúng kiểu
    const cleanedCart = cart.map(item => ({
        name: item.name || 'Chưa có tên món',
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 0
    }));

    const total = cleanedCart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    res.render('order/payment', {
        cart: cleanedCart,
        total,
        error: null,
        successMessage: null,
        tableNumber: req.session.tableNumber || 'unknown'
    });
};

// Xử lý thanh toán
const postCheckout = (req, res) => {
    const { name, address, paymentMethod } = req.body;

    if (!name || !address || !paymentMethod) {
        return res.render('order/payment', {
            cart: req.session.cart || [],
            total: req.session.cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
            error: 'Vui lòng điền đầy đủ thông tin!',
            successMessage: null,
            tableNumber: req.session.tableNumber || 'unknown'
        });
    }

    const order = new Order({
        user: req.session.user._id,
        items: req.session.cart,
        total: req.session.cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
        name,
        address,
        paymentMethod,
        status: 'Đang xử lý'
    });

    order.save()
        .then(() => {
            req.session.cart = [];
            res.redirect('/order/confirmation');
        })
        .catch((err) => {
            console.log('Lỗi khi lưu đơn hàng vào MongoDB:', err);
            res.status(500).send('Lỗi máy chủ khi lưu đơn hàng.');
        });
};

module.exports = {
    getCheckout,
    postCheckout
};
