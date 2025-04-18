// models/MenuItem.js
const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
    category: { type: String, required: true },
    code: { type: String, default: '' },
    name: { type: String, required: true },
    group: { type: String, default: '' },
    unit: { type: String, default: 'ly' }, // ví dụ: ly, phần, chai
    price: { type: Number, required: true },
    image: { type: String } // ảnh link hoặc upload
}, {
    timestamps: true // ✅ tự động tạo createdAt & updatedAt
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
