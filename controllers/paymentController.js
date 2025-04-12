const Order = require('../models/order');

// Lấy danh sách bàn chưa thanh toán (dùng cho /payment/list)
exports.getUnpaidTables = async (req, res) => {
  try {
    const unpaidOrders = await Order.find({ isPaid: false });

    // Lọc danh sách bàn không trùng lặp
    const tableNumbers = [...new Set(unpaidOrders.map(order => order.tableNumber))];

    res.render('order/payment_list', { tableNumbers });
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
      return res.render('order/payment', {
        cart: [],
        total: 0,
        tableNumber,
        successMessage: null
      });
    }

    const total = order.items.reduce((sum, item) => {
      return sum + item.menuItem.price * item.quantity;
    }, 0);

    res.render('order/payment', {
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
