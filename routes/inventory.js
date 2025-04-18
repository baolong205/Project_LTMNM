const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Hiển thị trang quản lý kho
router.get('/', inventoryController.getInventoryPage);

// Form thêm nguyên liệu
router.get('/add', inventoryController.showAddItemForm);

// Thêm nguyên liệu mới
router.post('/add', inventoryController.addItem);

// Form sửa nguyên liệu
router.get('/edit/:id', inventoryController.showEditItemForm);

// Cập nhật nguyên liệu
router.post('/edit/:id', inventoryController.updateItem);

// Xóa nguyên liệu
router.get('/delete/:id', inventoryController.deleteItem);

// Hiển thị thống kê tồn kho
router.get('/statistics', inventoryController.showStatistics);

// Hệ thống nhập kho
router.post('/import', inventoryController.processImport);
// Route import
router.get('/import', inventoryController.showImportForm);

// Thêm vào routes/inventory.js
router.get('/test-create', async (req, res) => {
    try {
      // Tạo một item test
      const testItem = new Inventory({
        name: 'Test Item ' + Date.now(),
        quantity: 10,
        unit: 'Cái',
        price: 1000
      });
      
      const savedItem = await testItem.save();
      res.json({
        success: true,
        message: 'Đã tạo item test thành công',
        data: savedItem
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo item test',
        error: error.message
      });
    }
  });

  router.get('/test-update/:id', async (req, res) => {
    try {
      const inventoryId = req.params.id;
      const inventory = await Inventory.findById(inventoryId);
      
      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nguyên liệu'
        });
      }
      
      // Giảm số lượng thử nghiệm
      const originalQuantity = inventory.quantity;
      inventory.quantity = Math.max(0, originalQuantity - 1);
      inventory.updatedAt = new Date();
      
      if ('amount' in inventory) {
        inventory.amount = inventory.quantity * inventory.price;
      }
      
      await inventory.save();
      
      res.json({
        success: true,
        message: 'Đã cập nhật thành công',
        before: {
          quantity: originalQuantity
        },
        after: {
          quantity: inventory.quantity
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật',
        error: error.message
      });
    }
  });
  // Route xuất kho
router.get('/export', inventoryController.showExportForm);
router.post('/export', inventoryController.processExport);

module.exports = router;