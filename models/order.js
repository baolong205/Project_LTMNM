const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  tableNumber: { type: String, required: true },
  items: [
    {
      menuId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      image: { type: String },
      status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
    }
  ],
  total: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['draft', 'pending', 'completed', 'cancelled'], default: 'draft' }
});

module.exports = mongoose.model('Order', orderSchema);