// routes/order.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/order');
const Menu = require('../models/MenuItem');

// ✅ Lấy tất cả menuItems từ toàn bộ documents trong 'menus'
async function getAllMenuItems() {
  const rawMenus = await mongoose.connection.collection('menus').find({}).toArray();
  let allItems = [];

  rawMenus.forEach(doc => {
    if (Array.isArray(doc.menuItems)) {
      allItems = allItems.concat(doc.menuItems);
    } else if (doc.name && doc.price) {
      doc.id = doc._id.toString(); // Gán id cho món đơn lẻ
      allItems.push(doc);
    }
  });

  return allItems;
}

// Trang order mặc định
router.get('/', async (req, res) => {
  try {
    const menuItems = await getAllMenuItems();
    res.render('order/order', { menuItems });
  } catch (err) {
    console.error('❌ Lỗi khi tải menu:', err);
    res.status(500).send('Lỗi máy chủ!');
  }
});

// ✅ API: Lấy menu theo bàn
router.get('/menu/:tableNumber', async (req, res) => {
  try {
    const menuItems = await getAllMenuItems();
    res.json(menuItems);
  } catch (err) {
    console.error('❌ Lỗi khi lấy menu:', err);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// ✅ API: Lọc menu theo loại
router.get('/menu/type/:type', async (req, res) => {
  try {
    const type = req.params.type.toLowerCase();
    const allItems = await getAllMenuItems();
    const filtered = allItems.filter(i => i.type?.toLowerCase() === type);
    res.json(filtered);
  } catch (err) {
    console.error('❌ Lỗi lọc menu:', err);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// ✅ API: Lấy giỏ hàng của bàn
router.get('/:tableNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ tableNumber: req.params.tableNumber, status: 'draft' });
    if (!order) return res.json({ items: [], total: 0 });
    res.json(order);
  } catch (err) {
    console.error('❌ Lỗi lấy giỏ hàng:', err);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// ✅ API: Thêm món vào giỏ hàng
router.post('/add', async (req, res) => {
  const { itemId, quantity, tableNumber } = req.body;

  if (!itemId || !quantity || !tableNumber) {
    return res.status(400).json({ success: false, error: 'Thiếu dữ liệu!' });
  }

  try {
    const allItems = await getAllMenuItems();
    const product = allItems.find(i => String(i.id) === String(itemId) || String(i._id) === String(itemId));

    if (!product) {
      return res.status(404).json({ success: false, error: 'Món không tồn tại!' });
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

    const qty = parseInt(quantity);
    const existing = order.items.find(i => i.menuId === itemId);
    if (existing) {
      existing.quantity += qty;
    } else {
      order.items.push({
        menuId: itemId,
        name: product.name,
        price: product.price,
        quantity: qty,
        image: product.image,
        status: 'pending'
      });
    }

    order.total = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await order.save();

    res.json({ success: true, message: '✅ Đã thêm vào giỏ!', order });
  } catch (err) {
    console.error('❌ Lỗi khi thêm món:', err);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ!' });
  }
});

// ✅ API: Gửi đơn hàng
router.post('/submit/:tableNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ tableNumber: req.params.tableNumber, status: 'draft' });
    if (!order) return res.status(404).json({ success: false, error: 'Không có đơn hàng!' });

    order.status = 'pending';
    await order.save();
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Lỗi khi xác nhận đơn:', err);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ!' });
  }
});

// ✅ API: Đơn hàng chờ xử lý (cho bartender)
router.get('/pending-orders', async (req, res) => {
  try {
    const orders = await Order.find({ status: 'pending' });
    res.json(orders);
  } catch (err) {
    console.error('❌ Lỗi khi lấy đơn hàng chờ:', err);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

module.exports = router;
