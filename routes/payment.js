const express = require('express');
const router = express.Router();
const Order = require('../models/order');

// Middleware kiểm tra quyền thu ngân
function isCashier(req, res, next) {
  if (req.session.user && req.session.user.staffRole === 'Thu ngân') {
    return next();
  }
  return res.redirect('/auth/login');
}

// 📋 Hiển thị danh sách các bàn cần thanh toán
router.get('/', isCashier, async (req, res) => {
  try {
    // Lấy danh sách đơn hàng chưa hoàn tất của người dùng hiện tại
    const orders = await Order.find({ userId: req.session.user._id, status: { $ne: 'completed' } });
    const tableNumbers = [
      ...new Set(
        orders
          .filter(order => order.items.length > 0)
          .map(order => order.tableNumber)
      )
    ];

    res.render('payment/payment_list', {
      tableNumbers,
      successMessage: req.flash('success')[0],
      session: req.session
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy đơn hàng:', error);
    res.status(500).send('Lỗi máy chủ');
  }
});

// 💳 Hiển thị trang thanh toán cho từng bàn
router.get('/:tableNumber', isCashier, async (req, res) => {
  const { tableNumber } = req.params;

  try {
    const order = await Order.findOne({ tableNumber, userId: req.session.user._id, status: { $ne: 'completed' } });

    if (!order || !order.items || order.items.length === 0) {
      return res.redirect('/payment');
    }

    const cart = order.items.map(item => ({
      name: item.name || 'Chưa có tên món',
      price: typeof item.price === 'number' ? item.price : 0,
      quantity: item.quantity || 1
    }));

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Lấy lịch sử thanh toán (nếu cần giữ lịch sử, cần lưu vào collection khác trước khi xóa)
    const paymentHistory = await Order.find({ 
      tableNumber, 
      status: 'completed',
      userId: req.session.user._id 
    }).sort({ createdAt: -1 });

    res.render('payment/payment', {
      tableNumber,
      cart,
      total,
      paymentHistory,
      successMessage: req.flash('success')[0],
      session: req.session
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy đơn hàng:', error);
    res.status(500).send('Lỗi máy chủ');
  }
});

// ✅ Xác nhận thanh toán và xóa đơn hàng
router.post('/confirm/:tableNumber', isCashier, async (req, res) => {
  const { tableNumber } = req.params;

  try {
    const order = await Order.findOne({ tableNumber, userId: req.session.user._id, status: { $ne: 'completed' } });

    if (!order || !order.items || order.items.length === 0) {
      req.flash('error', 'Giỏ hàng không tồn tại hoặc đã bị xóa.');
      return res.redirect(`/payment/${tableNumber}`);
    }

    // Xóa đơn hàng khỏi MongoDB
    const result = await Order.deleteOne({ tableNumber, userId: req.session.user._id, status: { $ne: 'completed' } });

    if (result.deletedCount === 0) {
      req.flash('error', 'Không tìm thấy đơn hàng để thanh toán.');
      return res.redirect(`/payment/${tableNumber}`);
    }

    req.flash('success', '💸 Thanh toán thành công!');
    return res.redirect('/payment');
  } catch (error) {
    console.error('❌ Lỗi khi xác nhận thanh toán:', error);
    res.status(500).send('Lỗi máy chủ');
  }
});

module.exports = router;