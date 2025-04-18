const mongoose = require('mongoose');

const importItemSchema = new mongoose.Schema({
  code: String,
  name: String,
  unit: String,
  quantity: Number,
  expiryDate: Date,
  price: Number,
  total: Number
});

const importReceiptSchema = new mongoose.Schema({
  importCode: String,
  creator: String,
  importDate: { type: Date, default: Date.now },
  supplier: String,
  deliveryPerson: String,
  items: [importItemSchema],
  grandTotal: Number,
  createdAt: { type: Date, default: Date.now }
});

const ImportReceipt = mongoose.model('ImportReceipt', importReceiptSchema);

module.exports = ImportReceipt;