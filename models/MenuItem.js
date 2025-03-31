const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
    category: String,
    code: String,
    name: String,
    group: String,
    unit: String,
    price: Number
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
