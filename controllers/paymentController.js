const Order = require('../models/order');

// Lấy danh sách bàn chưa thanh toán (dùng cho /payment/list)
exports.getUnpaidTables = async (req, res) => {
  try {
    const unpaidOrders = await Order.find({ isPaid: false });

    // Lọc danh sách bàn không trùng lặp
    const tableNumbers = [...new Set(unpaidOrders.map(order => order.tableNumber))];

    res.render('payment/payment_list', { tableNumbers });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bàn chưa thanh toán:', error);
    res.status(500).send('Lỗi máy chủ');
  }
};

// Trang thanh toán cho 1 bàn cụ thể (dùng cho /payment/:tableNumber)
exports.getPaymentPage = async (req, res) => {
  try {
    const tableNumber = req.params.tableNumber;

    const order = await Order.findOne({ tableNumber, isPaid: false }).populate('items.menuItem');

    if (!order || order.items.length === 0) {
      return res.render('payment/payment', {
        cart: [],
        total: 0,
        tableNumber,
        successMessage: null
      });
    }

    const total = order.items.reduce((sum, item) => {
      return sum + item.menuItem.price * item.quantity;
    }, 0);

    res.render('payment/payment', {
      cart: order.items,
      total,
      tableNumber,
      successMessage: null
    });
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu thanh toán:', error);
    res.status(500).send('Lỗi máy chủ');
  }
};

// Xử lý thanh toán và xóa đơn hàng (dùng cho /payment/confirm/:tableNumber)
exports.confirmPayment = async (req, res) => {
  try {
    const tableNumber = req.params.tableNumber;

    // Xóa đơn hàng chưa thanh toán của bàn này khỏi MongoDB
    const result = await Order.deleteOne({ tableNumber, isPaid: false });

    if (result.deletedCount === 0) {
      return res.render('payment/payment', {
        cart: [],
        total: 0,
        tableNumber,
        successMessage: 'Không tìm thấy đơn hàng để thanh toán.'
      });
    }

    // Chuyển hướng về danh sách bàn chưa thanh toán
    res.redirect('/payment/list');
  } catch (error) {
    console.error('Lỗi khi xác nhận thanh toán:', error);
    res.status(500).send('Lỗi máy chủ');
  }
};

module.exports = {
  getUnpaidTables,
  getPaymentPage,
  confirmPayment
};