// controllers/menuController.js
const MenuItem = require('../models/MenuItem');

// Lấy tên sản phẩm từ ID
exports.getProductNameById = async (req, res) => {
  const productId = req.params.id;  // Lấy ID sản phẩm từ URL
  
  try {
    // Truy vấn sản phẩm trong MongoDB theo ID
    const product = await MenuItem.findById(productId);

    if (!product) {
      return res.status(404).send('Sản phẩm không tìm thấy');
    }

    // Gửi tên sản phẩm về client
    res.render('menu/menu', { productName: product.name });
  } catch (err) {
    console.error('Lỗi khi truy vấn sản phẩm:', err);
    res.status(500).send('Đã có lỗi xảy ra');
  }
};
