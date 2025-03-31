const fs = require('fs');

// Hiển thị trang thanh toán
const getCheckout = (req, res) => {
    if (!req.session.cart || req.session.cart.length === 0) {
        return res.render('order/checkout', { error: 'Giỏ hàng của bạn hiện tại đang trống!' });
    }

    // Tính tổng tiền của giỏ hàng
    let total = req.session.cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    res.render('order/checkout', { cart: req.session.cart, total: total, error: null });
};

// Xử lý thanh toán
const postCheckout = (req, res) => {
    const { name, address, paymentMethod } = req.body;

    if (!name || !address || !paymentMethod) {
        return res.render('order/checkout', { error: 'Vui lòng điền đầy đủ thông tin!' });
    }

    // Giả lập việc thanh toán và tạo đơn hàng
    const order = {
        user: req.session.user,
        items: req.session.cart,
        total: req.session.cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
        name,
        address,
        paymentMethod,
        status: 'Đang xử lý'
    };

    // Lưu đơn hàng vào file db.json (hoặc cơ sở dữ liệu)
    fs.readFile('./db.json', 'utf8', (err, data) => {
        if (err) {
            console.log('Lỗi khi đọc file db.json:', err);
            return res.status(500).send('Lỗi máy chủ');
        }

        const db = JSON.parse(data);
        db.orders.push(order);

        fs.writeFile('./db.json', JSON.stringify(db, null, 2), 'utf8', (err) => {
            if (err) {
                console.log('Lỗi khi ghi vào db.json:', err);
                return res.status(500).send('Lỗi máy chủ');
            }

            // Xóa giỏ hàng sau khi thanh toán thành công
            req.session.cart = [];

            res.redirect('/order/confirmation'); // Chuyển hướng đến trang xác nhận
        });
    });
};

module.exports = {
    getCheckout,
    postCheckout
};
