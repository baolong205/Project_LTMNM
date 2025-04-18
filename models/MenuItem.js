// models/MenuItem.js
const mongoose = require('mongoose');

// Chỉ để tương thích và tránh mất dữ liệu, ta bỏ qua schema cụ thể
const MenuSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('Menu', MenuSchema, 'menus');
