const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  unit: { type: String, default: 'Đơn vị' },
  price: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  code: { type: String },
  type: { type: String },
  amount: { type: Number },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;