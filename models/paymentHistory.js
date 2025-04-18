const mongoose = require('mongoose');

const paymentHistorySchema = new mongoose.Schema({
  tableNumber: { type: String, required: true },
  items: [
    {
      menuId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      image: { type: String },
      status: { type: String, enum: ['pending', 'completed'], default: 'completed' }
    }
  ],
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['pending', 'cash', 'transfer', 'card', 'ewallet'], required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PaymentHistory', paymentHistorySchema);