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

const importHistorySchema = new mongoose.Schema({
  importCode: String,
  creator: String,
  importDate: {
    type: Date,
    default: Date.now
  },
  deliveryPerson: String,
  supplier: String,
  items: [importItemSchema],
  totalAmount: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ImportHistory = mongoose.model('ImportHistory', importHistorySchema);

module.exports = ImportHistory;