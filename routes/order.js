const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const dbFilePath = path.join(__dirname, '../db.json');

// Hàm đọc dữ liệu từ db.json
async function getMenuItems() {
    try {
        const data = await fs.readFile(dbFilePath, 'utf8');
        return JSON.parse(data).menuItems || [];
    } catch (err) {
        console.error("Lỗi đọc file db.json:", err);
        return [];
    }
}

// Route hiển thị trang order
router.get('/', async (req, res) => {
    const menuItems = await getMenuItems();
    res.render('order/order', { menuItems, session: req.session });
});

// Route thêm món vào giỏ hàng
router.post('/add', async (req, res) => {
    const { itemId, quantity } = req.body;
    console.log("Dữ liệu nhận được:", req.body);

    const menuItems = await getMenuItems();
    
    // Kiểm tra kiểu dữ liệu
    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        return res.status(400).json({ success: false, error: "Số lượng không hợp lệ." });
    }

    // Tìm món trong menuItems
    const item = menuItems.find(item => item._id.toString() === itemId.toString());

    if (!item) {
        return res.status(404).json({ success: false, error: 'Món không tồn tại.' });
    }

    // Khởi tạo giỏ hàng nếu chưa có
    if (!req.session.cart) {
        req.session.cart = [];
    }

    // Kiểm tra nếu món đã có trong giỏ hàng
    const existingItem = req.session.cart.find(i => i._id.toString() === item._id.toString());
    if (existingItem) {
        existingItem.quantity += parsedQuantity; // Cập nhật số lượng
    } else {
        req.session.cart.push({ ...item, quantity: parsedQuantity }); // Thêm món mới vào giỏ hàng
    }

    console.log("Giỏ hàng sau khi thêm:", req.session.cart);
    res.json({ success: true });
});

// Route hiển thị menu theo số bàn
router.get('/menu/:tableNumber', async (req, res) => {
    const menuItems = await getMenuItems();

    if (!menuItems || menuItems.length === 0) {
        return res.status(404).json({ error: "Không có món nào trong menu." });
    }

    res.json(menuItems);
});

module.exports = router;