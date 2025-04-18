const mongoose = require('mongoose');

const PaymentHistorySchema = new mongoose.Schema({
  tableNumber: { type: String, required: true },
  items: [{
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 }
  }],
  total: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, required: true, enum: ['cash', 'transfer', 'card', 'ewallet'] }, // Thêm trường này
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PaymentHistory', PaymentHistorySchema);