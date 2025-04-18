const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const PaymentHistory = require('../models/paymentHistory');

// Log để debug
console.log('PaymentHistory in home.js:', PaymentHistory);

// Middleware kiểm tra quyền thu ngân
const isCashier = (req, res, next) => {
  if (req.session.user && req.session.user.staffRole === 'Thu ngân') {
    return next();
  }
  req.flash('error', 'Vui lòng đăng nhập với tài khoản Thu ngân.');
  return res.redirect('/auth/login');
};

// Tuyến hiển thị trang chủ
router.get('/', (req, res) => {
  res.render('home', { session: req.session });
});

// Tuyến hiển thị lịch sử thanh toán
router.get('/history', isCashier, async (req, res) => {
  try {
    // Kiểm tra kết nối MongoDB
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Không thể kết nối đến MongoDB');
    }

    // Kiểm tra nếu PaymentHistory không phải model
    if (typeof PaymentHistory.find !== 'function') {
      throw new Error('PaymentHistory không phải là một Mongoose model hợp lệ');
    }

    const paymentHistory = await PaymentHistory.find({})
      .sort({ createdAt: -1 })
      .lean();

    res.render('payment/history', {
      paymentHistory: Array.isArray(paymentHistory) ? paymentHistory : [],
      successMessage: req.flash('success')[0] || null,
      infoMessage: !paymentHistory.length ? 'Chưa có lịch sử thanh toán.' : null,
      errorMessage: null,
      session: req.session
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy lịch sử thanh toán:', error.message);
    res.status(500).render('payment/history', {
      paymentHistory: [],
      successMessage: null,
      infoMessage: null,
      errorMessage: 'Lỗi máy chủ khi tải lịch sử thanh toán: ' + error.message,
      session: req.session
    });
  }
});

module.exports = router;