// controllers/paymentController.js

exports.confirmPayment = (req, res) => {
    const tableNumber = req.params.tableNumber;

    // Xử lý thanh toán tại đây (cập nhật DB, xoá cart, v.v.)

    // Hiển thị lại trang payment với thông báo
    res.render('order/payment', {
        cart: [],
        total: 0,
        tableNumber,
        successMessage: "💸 Thanh toán thành công!"
    });
};
