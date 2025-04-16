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

module.exports = router;