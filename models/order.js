// models/order.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  tableNumber: String,
  items: [
    {
      menuId: { type: Schema.Types.ObjectId, ref: 'MenuItem' }, // Đảm bảo menuId là ObjectId tham chiếu đến MenuItem
      name: String,
      price: Number,
      quantity: Number,
      status: { type: String, default: 'pending' }
    }
  ],
  total: Number,
  createdAt: { type: Date, default: Date.now },
  cashier: String,
});

module.exports = mongoose.model('Order', orderSchema);
