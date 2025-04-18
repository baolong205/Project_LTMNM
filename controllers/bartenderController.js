const Order = require('../models/order');
const MenuItem = require('../models/MenuItem');
const Inventory = require('../models/Inventory');
const moment = require('moment');

// Lấy các đơn hàng đang chờ
const getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: { $in: ['Pending', 'InProgress'] } })
      .populate('items.menuId') // Tải thông tin món ăn từ MenuItem
      .sort({ createdAt: 1 }); // Sắp xếp theo thời gian tạo

    const formattedOrders = orders.map(order => {
      const time = Math.floor((Date.now() - new Date(order.createdAt)) / 60000); // Tính thời gian chờ
      return {
        _id: order._id,
        table: order.table,
        floor: order.floor,
        waiter: order.waiter,
        time,
        status: order.status,
        orderCode: order.orderCode,
        items: order.items.map(item => ({
          _id: item._id,
          name: item.menuId?.name || 'Unknown',
          qty: item.quantity,
          status: item.status || 'pending',
        })),
      };
    });

    res.render('bartender/bartender', {
      orders: formattedOrders,
      user: req.user || { name: 'Nhân viên pha chế' },
    });
  } catch (error) {
    console.error('Lỗi getPendingOrders:', error);
    res.status(500).send('Lỗi server: ' + error.message);
  }
};

// Bắt đầu chế biến đơn hàng
const startPreparing = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findOneAndUpdate(
      { _id: orderId, status: 'Pending' }, // Chắc chắn tìm đơn hàng đúng
      { status: 'InProgress', updatedAt: new Date() },
      { new: true }
    );
    if (!order) return res.status(404).send('Đơn hàng không tồn tại hoặc không ở trạng thái chờ');
    res.redirect('/bartender');
  } catch (error) {
    console.error('Lỗi startPreparing:', error);
    res.status(500).send('Lỗi server: ' + error.message);
  }
};

// Hoàn thành đơn hàng
const completeOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findOneAndUpdate(
      { _id: orderId, status: 'InProgress' },
      { status: 'Completed', updatedAt: new Date() },
      { new: true }
    );
    if (!order) return res.status(404).send('Đơn hàng không tồn tại hoặc không ở trạng thái đang pha chế');
    res.redirect('/bartender');
  } catch (error) {
    console.error('Lỗi completeOrder:', error);
    res.status(500).send('Lỗi server: ' + error.message);
  }
};
// Đánh dấu món đã hoàn thành
const markItemAsComplete = async (req, res) => {
  try {
    const { orderId, itemId } = req.body;
    const order = await Order.findById(orderId); // Lấy đơn hàng

    if (!order) return res.status(404).send('Không tìm thấy đơn hàng');

    const item = order.items.id(itemId); // Lấy món trong đơn hàng

    if (!item) return res.status(404).send('Không tìm thấy món trong đơn hàng');

    if (item.status === 'completed') return res.status(200).json({ message: 'Món đã hoàn thành trước đó' });

    item.status = 'completed'; // Đánh dấu món là hoàn thành
    await order.save(); // Lưu lại đơn hàng

    // Cập nhật số lượng nguyên liệu nếu có
    const menuItem = await MenuItem.findById(item.menuId);
    if (menuItem && menuItem.ingredient) {
      await Inventory.updateOne(
        { name: menuItem.ingredient },
        { $inc: { quantity: -(menuItem.usage || 1) } }
      );
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Lỗi markItemAsComplete:', error);
    res.status(500).json({ error: 'Lỗi khi đánh dấu món đã pha' });
  }
};

// Lấy các món đã hoàn thành
const getCompletedOrders = async (req, res) => {
  try {
    // Lấy tất cả các món đã hoàn thành trong các đơn hàng
    const completedOrders = await Order.find({ 'items.status': 'completed' })
      .populate('items.menuId')  // Tải thông tin món ăn từ MenuItem
      .sort({ createdAt: -1 });

    const formattedOrders = completedOrders.map(order => ({
      orderId: order._id,
      tableNumber: order.tableNumber,
      items: order.items.filter(item => item.status === 'completed'),
    }));

    res.render('completedOrders', { completedOrders: formattedOrders });
  } catch (error) {
    console.error('Lỗi khi lấy các món đã hoàn thành:', error);
    res.status(500).send('Lỗi server');
  }
};

const getBartenderPage = async (req, res) => {
  try {
    // Tìm các đơn hàng với status là pending hoặc inprogress
    const orders = await Order.find({ 
      status: { $in: ["pending", "inprogress"] } 
    }).sort({ createdAt: -1 });
    
    console.log('Số lượng đơn hàng đang chờ:', orders.length);
    
    // Định dạng đơn hàng theo đúng cấu trúc
    const formattedOrders = orders.map(order => {
      return {
        _id: order._id,
        tableNumber: order.tableNumber || order.table || 'Không xác định',
        time: Math.floor((Date.now() - new Date(order.createdAt || Date.now())) / 60000),
        status: order.status,
        items: (order.items || []).map(item => ({
          _id: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          status: item.status || 'pending'
        }))
      };
    });
    
    res.render('bartender/bartender', {
      orders: formattedOrders,
      user: req.session?.user || { name: 'Nhân viên pha chế' },
    });
  } catch (err) {
    console.error('Lỗi lấy dữ liệu order:', err);
    res.status(500).send('Lỗi server');
  }
};

// Thêm hàm xử lý đánh dấu món đã hoàn thành
const markItemComplete = async (req, res) => {
  try {
    const { orderId, itemId } = req.body;
    
    // Tìm đơn hàng và cập nhật trạng thái món
    const result = await Order.updateOne(
      { "_id": orderId, "items._id": itemId },
      { $set: { "items.$.status": "completed" } }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy món hoặc đơn hàng' });
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Lỗi khi đánh dấu món đã hoàn thành:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = {
  getPendingOrders,
  startPreparing,
  completeOrder,
  getBartenderPage,
  markItemComplete, // Thêm hàm mới vào exports
  markItemAsComplete,
  getCompletedOrders,
};