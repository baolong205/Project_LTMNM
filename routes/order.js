const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const Order = require('../models/order');

const dbFilePath = path.join(__dirname, '../db.json');

// Lấy danh sách món ăn theo số bàn
router.get('/menu/:tableNumber', async (req, res) => {
  try {
    const data = await fs.readFile(dbFilePath, 'utf8');
    const db = JSON.parse(data);
    const menuItems = db.menuItems || [];

    if (menuItems.length === 0) {
      return res.status(404).json({ error: 'Không có món nào trong menu.' });
    }

    res.json(menuItems);
  } catch (err) {
    console.error('❌ Lỗi khi đọc dữ liệu menu:', err.message, err.stack);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

router.get('/order/:table', (req, res) => {
  const table = req.params.table;
  res.render('order', { table });
});

// Lấy danh sách món ăn theo type
router.get('/menu/type/:type', async (req, res) => {
  try {
    const data = await fs.readFile(dbFilePath, 'utf8');
    const db = JSON.parse(data);
    const menuItems = db.menuItems || [];

    const filteredItems = menuItems.filter(item => item.type === req.params.type);

    res.json(filteredItems);
  } catch (err) {
    console.error('❌ Lỗi khi đọc dữ liệu menu:', err.message, err.stack);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Thêm sản phẩm vào giỏ hàng
router.post('/add', async (req, res) => {
  const { itemId, quantity, tableNumber } = req.body;

  if (!itemId || !quantity || !tableNumber) {
    return res.status(400).json({ success: false, error: 'Thiếu thông tin món ăn, số lượng hoặc số bàn.' });
  }

  if (isNaN(quantity) || parseInt(quantity) <= 0) {
    return res.status(400).json({ success: false, error: 'Số lượng phải là số dương.' });
  }

  try {
    const data = await fs.readFile(dbFilePath, 'utf8');
    const db = JSON.parse(data);
    const menuItems = db.menuItems || [];

    const item = menuItems.find(i => String(i.id) === String(itemId));
    if (!item) {
      return res.status(404).json({ success: false, error: 'Món không tồn tại.' });
    }

    let order = await Order.findOne({ tableNumber, status: 'draft' });
    if (!order) {
      order = new Order({
        tableNumber,
        items: [],
        total: 0,
        createdAt: new Date(),
        status: 'draft'
      });
    }

    const parsedQuantity = parseInt(quantity, 10);
    const existingItemIndex = order.items.findIndex(i => String(i.menuId) === String(itemId));

    if (existingItemIndex !== -1) {
      order.items[existingItemIndex].quantity += parsedQuantity;
    } else {
      order.items.push({
        menuId: item.id,
        name: item.name,
        price: item.price,
        quantity: parsedQuantity,
        image: item.image || '',
        status: 'pending'
      });
    }

    order.total = order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    await order.save();

    res.json({
      success: true,
      message: `Đã thêm ${quantity} ${item.name} vào giỏ hàng bàn ${tableNumber}!`,
      order: {
        tableNumber,
        items: order.items,
        total: order.total
      }
    });
  } catch (err) {
    console.error('❌ Lỗi khi thêm món vào giỏ hàng:', err.message, err.stack);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ!' });
  }
});

// Lấy đơn hàng theo bàn
router.get('/:tableNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ tableNumber: req.params.tableNumber, status: 'draft' });
    if (!order) {
      return res.status(404).json({ items: [], total: 0 });
    }
    res.json(order);
  } catch (err) {
    console.error('❌ Lỗi khi lấy đơn hàng:', err.message, err.stack);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Hoàn tất đơn hàng
router.post('/submit/:tableNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ tableNumber: req.params.tableNumber, status: 'draft' });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy đơn hàng!' });
    }
    order.status = 'pending';
    await order.save();

    res.json({ success: true, message: 'Đặt món thành công!' });
  } catch (err) {
    console.error('❌ Lỗi khi hoàn tất đơn hàng:', err.message, err.stack);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ!' });
  }
});

// Lấy danh sách đơn hàng pending cho bartender
router.get('/pending-orders', async (req, res) => {
  try {
    const orders = await Order.find({ status: 'pending' });
    res.json(orders);
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách đơn hàng pending:', err.message, err.stack);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({});
    res.render('order/order', { orders });
  } catch (err) {
    console.error('❌ Lỗi khi tải trang order:', err.message, err.stack);
    res.status(500).send('Lỗi máy chủ!');
  }
});

router.get('/:table', (req, res) => {
  const table = req.params.table;
  res.render('orderDetail', { table });
});

module.exports = router;