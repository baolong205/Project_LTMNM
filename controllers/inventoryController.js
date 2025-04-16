const Inventory = require('../models/Inventory');
const InventoryTransaction = require('../models/InventoryTransaction');
// Trang quản lý kho
const getInventoryPage = async (req, res) => {
  try {
    const items = await Inventory.find();
    res.render('inventory/index', { 
      items,
      user: req.session?.user || { name: 'Người dùng' }
    });
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu kho hàng:', error);
    res.status(500).send('Lỗi khi lấy dữ liệu kho hàng');
  }
};

// Hiển thị form thêm nguyên liệu
const showAddItemForm = (req, res) => {
  res.render('inventory/add-item', {
    user: req.session?.user || { name: 'Người dùng' }
  });
};

// Xử lý thêm nguyên liệu
const addItem = async (req, res) => {
  try {
    const { name, quantity, unit, price } = req.body;
    
    // Tạo nguyên liệu mới
    await Inventory.create({
      name,
      quantity: Number(quantity),
      unit,
      price: Number(price),
      date: new Date(),
      code: 'NL' + Date.now().toString().slice(-6),
      type: 'Nhập kho',
      amount: Number(price) * Number(quantity),
      createdBy: req.session?.user?.name || 'Người dùng'
    });
    
    // Chuyển hướng về trang danh sách
    res.redirect('/inventory');
  } catch (error) {
    console.error('Lỗi khi thêm nguyên liệu:', error);
    res.status(500).send('Lỗi khi thêm nguyên liệu');
  }
};

// Hiển thị form sửa nguyên liệu
const showEditItemForm = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).send('Không tìm thấy nguyên liệu');
    }
    
    res.render('inventory/edit-item', {
      item,
      user: req.session?.user || { name: 'Người dùng' }
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin nguyên liệu:', error);
    res.status(500).send('Lỗi khi lấy thông tin nguyên liệu');
  }
};

// Xử lý cập nhật nguyên liệu
const updateItem = async (req, res) => {
  try {
    const { name, quantity, unit, price } = req.body;
    
    await Inventory.findByIdAndUpdate(req.params.id, {
      name,
      quantity: Number(quantity),
      unit,
      price: Number(price),
      amount: Number(price) * Number(quantity),
      updatedAt: new Date()
    });
    
    res.redirect('/inventory');
  } catch (error) {
    console.error('Lỗi khi cập nhật nguyên liệu:', error);
    res.status(500).send('Lỗi khi cập nhật nguyên liệu');
  }
};

// Xử lý xóa nguyên liệu
const deleteItem = async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.redirect('/inventory');
  } catch (error) {
    console.error('Lỗi khi xóa nguyên liệu:', error);
    res.status(500).send('Lỗi khi xóa nguyên liệu');
  }
};

// Hiển thị thống kê tồn kho
const showStatistics = async (req, res) => {
  try {
    const items = await Inventory.find();
    
    // Tính tổng giá trị tồn kho
    const totalValue = items.reduce((sum, item) => {
      return sum + (item.quantity * item.price);
    }, 0);
    
    res.render('inventory/statistics', {
      items,
      totalValue,
      user: req.session?.user || { name: 'Người dùng' }
    });
  } catch (error) {
    console.error('Lỗi khi lấy thống kê tồn kho:', error);
    res.status(500).send('Lỗi khi lấy thống kê tồn kho');
  }
};

// Hiển thị trang quản lý kho cho bartender
const getInventory = async (req, res) => {
  try {
    // Lấy danh sách phiếu nhập/xuất kho từ database
    const inventoryRecords = await Inventory.find()
      .sort({ date: -1 })
      .exec();
    
    // Render trang inventory
    res.render('bartender/inventory', { 
      inventoryRecords: inventoryRecords,
      user: req.session?.user || { name: 'Người dùng' }
    });
  } catch (err) {
    console.error('Lỗi khi lấy dữ liệu kho:', err);
    res.status(500).send('Lỗi server');
  }
};



module.exports = {
  getInventoryPage,
  showAddItemForm,
  addItem,
  showEditItemForm,
  updateItem,
  deleteItem,
  showStatistics,
  getInventory
};