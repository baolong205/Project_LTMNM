const express = require('express');
const router = express.Router();
const Order = require('../models/order');

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

// Đánh dấu món đã hoàn thành
router.post('/item-complete', async (req, res) => {
  try {
    const { orderId, itemId } = req.body;

    // Tìm đơn hàng
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    // Tìm món trong đơn hàng
    const item = order.items.find(i => String(i._id) === String(itemId));
    if (!item) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy món trong đơn hàng' });
    }

    // Cập nhật trạng thái món
    item.status = 'completed';

    // Kiểm tra xem tất cả món đã hoàn thành chưa
    const allItemsCompleted = order.items.every(item => item.status === 'completed');
    if (allItemsCompleted) {
      order.status = 'completed';
      await order.save();
    }

    await order.save();

    res.status(200).json({ success: true, message: 'Món đã được đánh dấu hoàn thành' });
  } catch (error) {
    console.error('❌ Lỗi khi đánh dấu món đã hoàn thành:', error.message, error.stack);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Các route khác
router.get('/pending-orders', getPendingOrders);
router.post('/start-preparing/:orderId', startPreparing);
router.post('/complete/:orderId', completeOrder);
router.post('/done/:itemId', markItemAsComplete);
router.get('/completed-orders', getCompletedOrders);

module.exports = router;