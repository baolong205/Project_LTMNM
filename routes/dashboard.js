const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/dashboard', async (req, res) => {
  try {
    const doc = await mongoose.connection.collection('menus').findOne({ menuItems: { $exists: true } });
    const menuItems = doc?.menuItems || [];

    res.render('admin/dashboard', {
      user: req.session.user || null,
      menuItems,
      editItem: null
    });
  } catch (err) {
    console.error('❌ Lỗi khi lấy menu:', err);
    res.status(500).send('Lỗi máy chủ!');
  }
});

module.exports = router;
