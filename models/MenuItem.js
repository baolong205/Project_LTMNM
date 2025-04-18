// models/MenuItem.js
const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
    category: String,
    code: String,
    name: String,
    group: String,
    unit: String,
    price: Number, 
    type: String
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
