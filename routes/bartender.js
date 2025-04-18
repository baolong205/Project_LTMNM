const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const PaymentHistory = require('../models/paymentHistory');

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

    // Kiểm tra dữ liệu đầu vào
    if (!orderId || !itemId) {
      console.error('❌ Thiếu orderId hoặc itemId:', { orderId, itemId });
      return res.status(400).json({ success: false, message: 'Thiếu orderId hoặc itemId' });
    }

    // Tìm đơn hàng
    const order = await Order.findById(orderId);
    if (!order) {
      console.error('❌ Không tìm thấy đơn hàng:', orderId);
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    // Kiểm tra trạng thái đơn hàng
    if (order.status !== 'pending') {
      console.error('❌ Đơn hàng không ở trạng thái pending:', order.status);
      return res.status(400).json({ success: false, message: 'Đơn hàng không ở trạng thái chờ xử lý' });
    }

    // Tìm món trong đơn hàng
    const item = order.items.find(i => String(i._id) === String(itemId));
    if (!item) {
      console.error('❌ Không tìm thấy món trong đơn hàng:', itemId);
      return res.status(404).json({ success: false, message: 'Không tìm thấy món trong đơn hàng' });
    }

    // Kiểm tra trạng thái món
    if (item.status === 'completed') {
      console.warn('⚠ Món đã hoàn thành trước đó:', itemId);
      return res.status(400).json({ success: false, message: 'Món đã được hoàn thành trước đó' });
    }

    // Cập nhật trạng thái món
    item.status = 'completed';
    console.log('✅ Đã cập nhật trạng thái món:', { itemId, status: item.status });

    // Kiểm tra xem tất cả món đã hoàn thành chưa
    const allItemsCompleted = order.items.every(item => item.status === 'completed');
    if (allItemsCompleted) {
      console.log('✅ Tất cả món đã hoàn thành, xử lý chuyển thanh toán:', order._id);

      // Tính tổng tiền
      const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Lưu vào PaymentHistory
      const paymentRecord = await PaymentHistory.create({
        tableNumber: order.tableNumber,
        items: order.items,
        total,
        paymentMethod: 'pending',
        createdAt: new Date()
      });
      console.log('✅ Đã lưu bản ghi PaymentHistory:', paymentRecord._id);

      // Xóa đơn hàng khỏi Order
      await Order.deleteOne({ _id: order._id });
      console.log('✅ Đã xóa đơn hàng khỏi Order:', order._id);

      return res.status(200).json({
        success: true,
        message: 'Tất cả món đã hoàn thành, đơn hàng đã được chuyển để thanh toán'
      });
    }

    await order.save();
    console.log('✅ Đã lưu đơn hàng sau cập nhật món:', order._id);

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