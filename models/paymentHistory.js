const mongoose = require('mongoose');

const PaymentHistorySchema = new mongoose.Schema({
  tableNumber: { type: String, required: true },
  items: [{
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 }
  }],
  total: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Export model đúng cách
module.exports = mongoose.model('PaymentHistory', PaymentHistorySchema);