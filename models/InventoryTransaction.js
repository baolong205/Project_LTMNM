// models/InventoryTransaction.js
const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['import', 'export'],
    required: true
  },
  inventoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  note: {
    type: String
  },
  createdBy: {
    type: String,
    default: 'Admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);