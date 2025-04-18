const Inventory = require('../models/Inventory');
const InventoryTransaction = require('../models/InventoryTransaction');
const ImportReceipt = require('../models/ImportReceipt');
const ExportReceipt = require('../models/ExportReceipt');


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

// Hiển thị form nhập kho
const showImportForm = async (req, res) => {
  try {
    // Lấy danh sách nguyên liệu từ database
    const inventories = await Inventory.find().sort({ name: 1 });
    
    res.render('inventory/import', {
      user: req.session?.user || { name: 'Nhân viên' },
      inventories: inventories
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nguyên liệu:', error);
    res.status(500).send('Lỗi khi tải trang nhập kho');
  }
};

// Xử lý nhập kho
const processImport = async (req, res) => {
  try {
    console.log('Dữ liệu nhập kho:', req.body); // Thêm log để kiểm tra dữ liệu nhận được
    
    const { inventoryId, quantity, price, note } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!inventoryId || !quantity || !price) {
      const inventories = await Inventory.find().sort({ name: 1 });
      return res.render('inventory/import', {
        user: req.session?.user || { name: 'Nhân viên' },
        inventories: inventories,
        errorMessage: 'Vui lòng điền đầy đủ thông tin'
      });
    }
    
    // Chuyển đổi sang số
    const numQuantity = parseFloat(quantity);
    const numPrice = parseFloat(price);
    
    // Tìm nguyên liệu trong database
    console.log('Tìm nguyên liệu với ID:', inventoryId);
    const inventory = await Inventory.findById(inventoryId);
    
    if (!inventory) {
      console.error('Không tìm thấy nguyên liệu với ID:', inventoryId);
      const inventories = await Inventory.find().sort({ name: 1 });
      return res.render('inventory/import', {
        user: req.session?.user || { name: 'Nhân viên' },
        inventories: inventories,
        errorMessage: 'Không tìm thấy nguyên liệu'
      });
    }
    
    console.log('Nguyên liệu trước khi cập nhật:', inventory);
    
    // Cập nhật số lượng và giá
    const oldQuantity = inventory.quantity || 0;
    inventory.quantity = oldQuantity + numQuantity;
    inventory.price = numPrice;
    inventory.updatedAt = new Date();
    
    // Các field khác nếu cần
    if (inventory.amount !== undefined) {
      inventory.amount = inventory.quantity * numPrice;
    }
    
    console.log('Nguyên liệu sau khi cập nhật:', inventory);
    
    // Lưu vào database
    try {
      const savedInventory = await inventory.save();
      console.log('Đã lưu thành công:', savedInventory);
    } catch (saveError) {
      console.error('Lỗi khi lưu vào database:', saveError);
      throw saveError;
    }
    
    // Redirect về trang chính
    res.redirect('/inventory');
  } catch (error) {
    console.error('Lỗi xử lý nhập kho:', error);
    
    try {
      const inventories = await Inventory.find().sort({ name: 1 });
      res.render('inventory/import', {
        user: req.session?.user || { name: 'Nhân viên' },
        inventories: inventories,
        errorMessage: 'Lỗi khi xử lý nhập kho: ' + error.message
      });
    } catch (err) {
      res.status(500).send('Lỗi khi xử lý nhập kho');
    }
  }
};

//hàm xuất kho
const showExportForm = async (req, res) => {
  try {
    console.log('Hiển thị form xuất kho');
    
    // Chỉ lấy những nguyên liệu có số lượng > 0
    const inventories = await Inventory.find({ quantity: { $gt: 0 } }).sort({ name: 1 });
    
    console.log(`Tìm thấy ${inventories.length} nguyên liệu có thể xuất kho`);
    
    // Render trang xuất kho với dữ liệu
    res.render('inventory/export', {
      user: req.session?.user || { name: 'Nhân viên' },
      inventories: inventories,
      errorMessage: null
    });
  } catch (error) {
    console.error('Lỗi khi hiển thị form xuất kho:', error);
    res.status(500).send('Lỗi khi tải trang xuất kho: ' + error.message);
  }
};

//- Hàm processExport
const processExport = async (req, res) => {
  try {
    console.log('Dữ liệu form xuất kho:', req.body);
    
    const { exportCode, creator, exportDate, receiverPerson, department, items } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!exportCode || !creator || !exportDate || !receiverPerson || !department) {
      return res.render('inventory/export', {
        user: req.session?.user || { name: 'Nhân viên' },
        inventories: await Inventory.find({ quantity: { $gt: 0 } }).sort({ name: 1 }),
        errorMessage: 'Thiếu thông tin phiếu xuất kho'
      });
    }
    
    // Kiểm tra items
    if (!items) {
      return res.render('inventory/export', {
        user: req.session?.user || { name: 'Nhân viên' },
        inventories: await Inventory.find({ quantity: { $gt: 0 } }).sort({ name: 1 }),
        errorMessage: 'Không có nguyên liệu nào được chọn'
      });
    }
    
    // Xử lý items (có thể là array hoặc object)
    const itemArray = Array.isArray(items) ? items : Object.values(items);
    let validItems = 0;
    
    // Xử lý từng mặt hàng
    for (const index in itemArray) {
      const item = itemArray[index];
      
      if (!item.inventoryId || !item.quantity) continue;
      
      const exportQuantity = parseFloat(item.quantity);
      if (isNaN(exportQuantity) || exportQuantity <= 0) continue;
      
      // Tìm nguyên liệu
      const inventory = await Inventory.findById(item.inventoryId);
      if (!inventory) continue;
      
      // Kiểm tra số lượng
      if (inventory.quantity < exportQuantity) {
        return res.render('inventory/export', {
          user: req.session?.user || { name: 'Nhân viên' },
          inventories: await Inventory.find({ quantity: { $gt: 0 } }).sort({ name: 1 }),
          errorMessage: `Nguyên liệu ${inventory.name} không đủ số lượng (Còn ${inventory.quantity} ${inventory.unit}, cần xuất ${exportQuantity} ${inventory.unit})`
        });
      }
      
      // Cập nhật số lượng
      inventory.quantity -= exportQuantity;
      if ('amount' in inventory) {
        inventory.amount = inventory.quantity * inventory.price;
      }
      inventory.updatedAt = new Date();
      
      await inventory.save();
      validItems++;
    }
    
    if (validItems === 0) {
      return res.render('inventory/export', {
        user: req.session?.user || { name: 'Nhân viên' },
        inventories: await Inventory.find({ quantity: { $gt: 0 } }).sort({ name: 1 }),
        errorMessage: 'Không có nguyên liệu nào hợp lệ để xuất kho'
      });
    }
    
    // Chuyển hướng về trang chính
    res.redirect('/inventory');
  } catch (error) {
    console.error('Lỗi khi xử lý xuất kho:', error);
    
    res.render('inventory/export', {
      user: req.session?.user || { name: 'Nhân viên' },
      inventories: await Inventory.find({ quantity: { $gt: 0 } }).sort({ name: 1 }),
      errorMessage: 'Lỗi khi xử lý xuất kho: ' + error.message
    });
  }
};

exports.getExportHistory = async (req, res) => {
  try {
    const exportReceipts = await ExportReceipt.find()
      .sort({ exportDate: -1 }) // Mới nhất lên đầu
      .limit(50); // Giới hạn 50 phiếu gần nhất
    
    res.render('inventory/export-history', {
      user: req.session.user || { name: 'Nhân viên' },
      exportReceipts: exportReceipts
    });
  } catch (error) {
    console.error('Lỗi khi lấy lịch sử xuất kho:', error);
    res.status(500).send('Lỗi khi tải trang lịch sử xuất kho: ' + error.message);
  }
};

//lịch sử phiếu xuất kho
exports.getExportDetail = async (req, res) => {
  try {
    const exportId = req.params.id;
    
    // Tìm phiếu xuất kho theo ID
    const exportReceipt = await ExportReceipt.findById(exportId);
    
    if (!exportReceipt) {
      return res.status(404).send('Không tìm thấy phiếu xuất kho');
    }
    
    res.render('inventory/export-detail', {
      user: req.session?.user || { name: 'Nhân viên' },
      receipt: exportReceipt
    });
  } catch (error) {
    console.error('Lỗi khi tải chi tiết phiếu xuất kho:', error);
    res.status(500).send('Đã xảy ra lỗi: ' + error.message);
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
  getInventory,
  showImportForm,
  processImport,
  showExportForm,
  processExport,
};