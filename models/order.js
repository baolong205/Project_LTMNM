// models/order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    tableNumber: String,
    items: [
        {
            name: String,
            price: Number,
            quantity: Number
        }
    ],
    total: Number,
    createdAt: { type: Date, default: Date.now },
    cashier: String,
});

module.exports = mongoose.model('Order', orderSchema);
