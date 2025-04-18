const express = require('express');
const router = express.Router();
const PaymentHistory = require('../models/paymentHistory');
const QRCode = require('qrcode');

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
    const paymentRecords = await PaymentHistory.find({ paymentMethod: 'pending' });
    console.log('✅ Payment records found:', paymentRecords.length, paymentRecords.map(r => ({ tableNumber: r.tableNumber, items: r.items.length })));

    const tableNumbers = [
      ...new Set(
        paymentRecords
          .filter(record => Array.isArray(record.items) && record.items.length > 0)
          .map(record => record.tableNumber)
      )
    ];
    console.log('✅ Table numbers for payment:', tableNumbers);

    res.render('payment/payment_list', {
      tableNumbers,
      successMessage: req.flash('success')[0] || null,
      errorMessage: req.flash('error')[0] || null,
      session: req.session
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách bàn:', error.message, error.stack);
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
    // Lấy tất cả bản ghi pending cho bàn
    const paymentRecords = await PaymentHistory.find({ tableNumber, paymentMethod: 'pending' });
    console.log('✅ Payment records for table:', tableNumber, paymentRecords.length);

    if (!paymentRecords || paymentRecords.length === 0) {
      console.warn('⚠ Không tìm thấy đơn hàng hợp lệ cho bàn:', tableNumber);
      req.flash('error', 'Không tìm thấy đơn hàng hợp lệ cho bàn này.');
      return res.redirect('/payment');
    }

    // Tổng hợp tất cả sản phẩm từ các bản ghi
    const cart = [];
    paymentRecords.forEach(record => {
      if (Array.isArray(record.items) && record.items.length > 0) {
        record.items.forEach(item => {
          cart.push({
            name: item.name || 'Chưa có tên món',
            price: typeof item.price === 'number' ? item.price : 0,
            quantity: typeof item.quantity === 'number' ? item.quantity : 1
          });
        });
      }
    });

    if (cart.length === 0) {
      console.warn('⚠ Không có sản phẩm hợp lệ trong đơn hàng của bàn:', tableNumber);
      req.flash('error', 'Không có sản phẩm hợp lệ để thanh toán.');
      return res.redirect('/payment');
    }

    // Tính tổng tiền
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Lấy lịch sử thanh toán
    const paymentHistory = await PaymentHistory.find({ tableNumber })
      .sort({ createdAt: -1 })
      .lean();
    console.log('✅ Payment history for table:', tableNumber, paymentHistory.length);

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
    console.error('❌ Lỗi khi lấy đơn hàng cho thanh toán:', error.message, error.stack);
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
      qrData = `Bank: Vietcombank, Account: 1234567890, Amount: ${total} VND, Table: ${tableNumber}`;
    } else if (paymentMethod === 'ewallet') {
      qrData = `https://payment.example.com/pay?amount=${total}&table=${tableNumber}`;
    }

    const qrCode = await QRCode.toDataURL(qrData);
    res.json({ success: true, qrCode });
  } catch (error) {
    console.error('❌ Lỗi khi tạo mã QR:', error.message, error.stack);
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

    // Lấy tất cả bản ghi pending cho bàn
    const paymentRecords = await PaymentHistory.find({ tableNumber, paymentMethod: 'pending' });
    if (!paymentRecords || paymentRecords.length === 0) {
      console.warn('⚠ Không tìm thấy đơn hàng hợp lệ để thanh toán:', tableNumber);
      return res.status(400).json({ success: false, message: 'Không tìm thấy đơn hàng hợp lệ hoặc đã thanh toán.' });
    }

    // Kiểm tra dữ liệu sản phẩm
    let hasValidItems = false;
    for (const record of paymentRecords) {
      if (Array.isArray(record.items) && record.items.length > 0) {
        hasValidItems = true;
        break;
      }
    }
    if (!hasValidItems) {
      console.warn('⚠ Không có sản phẩm hợp lệ trong đơn hàng của bàn:', tableNumber);
      return res.status(400).json({ success: false, message: 'Không có sản phẩm hợp lệ để thanh toán.' });
    }

    // Cập nhật tất cả bản ghi pending
    for (const record of paymentRecords) {
      record.paymentMethod = paymentMethod;
      record.createdAt = new Date();
      await record.save();
      console.log('✅ Đã cập nhật thanh toán cho bản ghi:', record._id, paymentMethod);
    }

    res.json({ success: true, message: 'Thanh toán tất cả sản phẩm thành công!' });
  } catch (error) {
    console.error('❌ Lỗi khi xác nhận thanh toán:', error.message, error.stack);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống. Vui lòng thử lại.' });
  }
});

module.exports = router;