// models/ExportReceipt.js
const mongoose = require('mongoose');

const exportReceiptSchema = new mongoose.Schema({
  exportCode: {
    type: String,
    required: true,
    unique: true
  },
  creator: {
    type: String,
    required: true
  },
  exportDate: {
    type: Date,
    default: Date.now
  },
  receiverPerson: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  items: [{
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory'
    },
    code: String,
    name: String,
    unit: String,
    quantity: Number,
    price: Number,
    amount: Number
  }],
  totalAmount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ExportReceipt', exportReceiptSchema);