const MenuItem = require('../models/MenuItem');

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
  const { itemId, quantity } = req.body;

  try {
    // Tìm sản phẩm theo ID
    const product = await MenuItem.findById(itemId);

    if (!product) {
      return res.status(404).send('Sản phẩm không tồn tại');
    }

    // Lấy giỏ hàng từ session
    const cart = req.session.cart || [];
    const existingItem = cart.find(item => item._id === itemId);

    if (existingItem) {
      // Nếu sản phẩm đã tồn tại trong giỏ hàng, tăng số lượng
      existingItem.quantity += parseInt(quantity, 10);
    } else {
      // Nếu sản phẩm chưa có trong giỏ hàng, thêm mới
      cart.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        quantity: parseInt(quantity, 10),
      });
    }

    // Lưu giỏ hàng vào session
    req.session.cart = cart;

    // Chuyển hướng về trang menu hoặc giỏ hàng
    res.redirect('/menu');
  } catch (err) {
    console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', err);
    res.status(500).send('Đã có lỗi xảy ra');
  }
};

// Hiển thị giỏ hàng
exports.viewCart = (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  res.render('order/cart', { cart, total });
};

// Xử lý thanh toán
exports.checkout = (req, res) => {
  const cart = req.session.cart || [];

  if (cart.length === 0) {
    return res.status(400).send('Giỏ hàng trống');
  }

  // Xử lý logic thanh toán ở đây (ví dụ: lưu vào cơ sở dữ liệu)
  req.session.cart = []; // Xóa giỏ hàng sau khi thanh toán
  res.send('Đơn hàng của bạn đã được gửi thành công!');
<<<<<<< HEAD
};
const getPendingItems = async (req, res) => {
    try {
      const orders = await Order.find({ "items.status": "pending" })
        .populate("items.menuId");
  
      const pendingItems = [];
  
      orders.forEach(order => {
        order.items.forEach(item => {
          if (item.status === "pending") {
            pendingItems.push({
              orderId: order._id,
              table: order.table,
              menuName: item.menuId.name,
              quantity: item.quantity,
              itemId: item._id // cần để cập nhật trạng thái
            });
          }
        });
      });
  
      res.render('bartender/bartender', { pendingItems });
    } catch (err) {
      console.error(err);
      res.status(500).send("Lỗi server");
    }
  };
 
const markItemDone = async (req, res) => {
    const itemId = req.params.itemId;
  
    try {
      await Order.updateOne(
        { "items._id": itemId },
        { $set: { "items.$.status": "done" } }
      );
      res.redirect('/bartender');
    } catch (err) {
      console.error(err);
      res.status(500).send("Lỗi cập nhật trạng thái món");
    }
  };
  module.exports = {
    getPendingItems,
    markItemDone
=======
>>>>>>> cfed48751bbbc017bca2d2d5560b6587b36794c3
};