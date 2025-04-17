const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const PaymentHistory = require('../models/paymentHistory');
const QRCode = require('qrcode'); // Thêm thư viện qrcode

// Middleware kiểm tra quyền thu ngân
function isCashier(req, res, next) {
  if (req.session.user && req.session.user.staffRole === 'Thu ngân') {
    return next();
  }
  req.flash('error', 'Vui lòng đăng nhập với tài khoản Thu ngân.');
  return res.redirect('/auth/login');
}

// Hiển thị danh sách các bàn cần thanh toán
router.get('/', isCashier, async (req, res) => {
  try {
    const orders = await Order.find({ status: 'completed' });
    const tableNumbers = [
      ...new Set(
        orders
          .filter(order => order.items.length > 0)
          .map(order => order.tableNumber)
      )
    ];

    res.render('payment/payment_list', {
      tableNumbers,
      successMessage: req.flash('success')[0] || null,
      errorMessage: req.flash('error')[0] || null,
      session: req.session
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy đơn hàng:', error);
    req.flash('error', 'Lỗi máy chủ khi tải danh sách bàn.');
    res.render('payment/payment_list', {
      tableNumbers: [],
      successMessage: null,
      errorMessage: req.flash('error')[0],
      session: req.session
    });
  }
});

// Hiển thị trang thanh toán cho từng bàn
router.get('/:tableNumber', isCashier, async (req, res) => {
  const { tableNumber } = req.params;

  try {
    const order = await Order.findOne({ tableNumber, status: 'completed' });

    if (!order || !order.items || order.items.length === 0) {
      req.flash('error', 'Không tìm thấy đơn hàng cho bàn này.');
      return res.redirect('/payment');
    }

    const cart = order.items.map(item => ({
      name: item.name || 'Chưa có tên món',
      price: typeof item.price === 'number' ? item.price : 0,
      quantity: item.quantity || 1
    }));

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const paymentHistory = await PaymentHistory.find({ tableNumber })
      .sort({ createdAt: -1 })
      .lean();

    res.render('payment/payment', {
      tableNumber,
      cart,
      total,
      paymentHistory,
      successMessage: req.flash('success')[0] || null,
      errorMessage: req.flash('error')[0] || null,
      session: req.session
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy đơn hàng:', error);
    req.flash('error', 'Lỗi máy chủ khi tải trang thanh toán.');
    res.redirect('/payment');
  }
});

// Tạo mã QR cho thanh toán
router.post('/generate-qr/:tableNumber', isCashier, async (req, res) => {
  const { tableNumber } = req.params;
  const { paymentMethod, total } = req.body;

  try {
    if (!['transfer', 'ewallet'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Phương thức không hỗ trợ QR.' });
    }

    let qrData;
    if (paymentMethod === 'transfer') {
      // Thông tin tài khoản ngân hàng
      qrData = `Bank: Vietcombank, Account: 1234567890, Amount: ${total} VND, Table: ${tableNumber}`;
    } else if (paymentMethod === 'ewallet') {
      // URL thanh toán giả lập cho MoMo/ZaloPay
      qrData = `https://payment.example.com/pay?amount=${total}&table=${tableNumber}`;
    }

    // Tạo mã QR dưới dạng base64
    const qrCode = await QRCode.toDataURL(qrData);
    res.json({ success: true, qrCode });
  } catch (error) {
    console.error('❌ Lỗi khi tạo mã QR:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tạo mã QR.' });
  }
});

// Xác nhận thanh toán
router.post('/confirm/:tableNumber', isCashier, async (req, res) => {
  const { tableNumber } = req.params;
  const { paymentMethod } = req.body;

  try {
    if (!['cash', 'transfer', 'card', 'ewallet'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Phương thức thanh toán không hợp lệ.' });
    }

    const order = await Order.findOne({ tableNumber, status: 'completed' });

    if (!order || !order.items || order.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng không tồn tại hoặc đã được thanh toán.' });
    }

    const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    await PaymentHistory.create({
      tableNumber: order.tableNumber,
      items: order.items,
      total,
      paymentMethod,
      createdAt: new Date()
    });

    await Order.deleteOne({ _id: order._id });

    return res.json({ success: true, message: 'Thanh toán thành công!' });
  } catch (error) {
    console.error('❌ Lỗi khi xác nhận thanh toán:', error);
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống. Vui lòng thử lại.' });
  }
});

module.exports = router;