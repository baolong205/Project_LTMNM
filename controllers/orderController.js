const MenuItem = require('../models/MenuItem');
const Order = require('../models/order');

// Thêm sản phẩm vào giỏ hàng và lưu vào MongoDB
exports.addToCart = async (req, res) => {
  const { itemId, quantity, tableNumber } = req.body;

  try {
    // Kiểm tra tableNumber
    if (!tableNumber) {
      return res.status(400).send('Vui lòng chọn số bàn');
    }

    // Tìm sản phẩm theo ID
    const product = await MenuItem.findById(itemId);
    if (!product) {
      return res.status(404).send('Sản phẩm không tồn tại');
    }

    // Tìm hoặc tạo đơn hàng trong MongoDB
    let order = await Order.findOne({ tableNumber, isPaid: false });

    if (!order) {
      order = new Order({
        tableNumber,
        items: [],
        isPaid: false
      });
    }

    // Kiểm tra xem sản phẩm đã có trong đơn hàng chưa
    const existingItem = order.items.find(item => item.menuItem.toString() === itemId);

    if (existingItem) {
      existingItem.quantity += parseInt(quantity, 10);
    } else {
      order.items.push({
        menuItem: product._id,
        quantity: parseInt(quantity, 10),
        status: 'pending'
      });
    }

    // Lưu đơn hàng vào MongoDB
    await order.save();

    // Đồng bộ giỏ hàng trong session (tùy chọn)
    let cart = req.session.cart || { tableNumber, items: [] };
    const cartItem = cart.items.find(item => item._id === itemId);

    if (cartItem) {
      cartItem.quantity += parseInt(quantity, 10);
    } else {
      cart.items.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        quantity: parseInt(quantity, 10),
      });
    }
    req.session.cart = cart;

    res.redirect('/menu');
  } catch (err) {
    console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', err);
    res.status(500).send('Đã có lỗi xảy ra');
  }
};

// Hiển thị giỏ hàng
exports.viewCart = async (req, res) => {
  const tableNumber = req.query.tableNumber || req.session.cart?.tableNumber || '';

  if (!tableNumber) {
    return res.render('order/order', { cart: [], tableNumber: '', total: 0 });
  }

  try {
    const order = await Order.findOne({ tableNumber, isPaid: false }).populate('items.menuItem');

    if (!order || order.items.length === 0) {
      return res.render('order/order', { cart: [], tableNumber, total: 0 });
    }

    const cart = order.items.map(item => ({
      _id: item.menuItem._id,
      name: item.menuItem.name,
      price: item.menuItem.price,
      quantity: item.quantity
    }));

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    res.render('order/order', { cart, tableNumber, total });
  } catch (err) {
    console.error('Lỗi khi hiển thị giỏ hàng:', err);
    res.status(500).send('Đã có lỗi xảy ra');
  }
};

// Xử lý thanh toán và xóa đơn hàng
exports.checkout = async (req, res) => {
  const tableNumber = req.session.cart?.tableNumber || req.query.tableNumber;

  if (!tableNumber) {
    return res.status(400).send('Chưa chọn bàn để thanh toán');
  }

  try {
    // Xóa đơn hàng khỏi MongoDB
    const result = await Order.deleteOne({ tableNumber, isPaid: false });

    if (result.deletedCount === 0) {
      return res.status(400).send('Không tìm thấy đơn hàng để thanh toán');
    }

    // Xóa giỏ hàng trong session
    req.session.cart = null;

    res.redirect('/payment/list');
  } catch (err) {
    console.error('Lỗi khi xử lý thanh toán:', err);
    res.status(500).send('Đã có lỗi xảy ra');
  }
};

module.exports = {
  addToCart,
  viewCart,
  checkout
};