// routes/bartender.js
const express = require('express');
const router = express.Router();
const Order = require('../models/order'); // Thêm dòng này để import model Order

const {
  getPendingOrders,
  startPreparing,
  completeOrder,
  getBartenderPage,
  markItemAsComplete,
  getCompletedOrders
} = require('../controllers/bartenderController');

// Trang chính - hiển thị món đang chờ
router.get('/', getBartenderPage);
// Trong route '/item-complete'
router.post('/item-complete', async (req, res) => {
  try {
    const { orderId, itemId } = req.body;
    
    // Tìm đơn hàng
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }
    
    // Tìm món trong đơn hàng
    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy món trong đơn hàng' });
    }
    
    // Cập nhật trạng thái món
    item.status = 'completed';
    
    // Lưu đơn hàng
    await order.save();
    
    // Kiểm tra xem tất cả món đã hoàn thành chưa
    const allItemsCompleted = order.items.every(item => item.status === 'completed');
    if (allItemsCompleted) {
      order.status = 'completed';
      await order.save();
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Lỗi khi đánh dấu món đã hoàn thành:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Các route khác
router.post('/done/:itemId', markItemAsComplete);
router.get('/completed-orders', getCompletedOrders);

module.exports = router;