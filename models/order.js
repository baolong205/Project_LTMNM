const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customerName: String,
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Menu" }],
  total: Number,
  status: { type: String, default: "Pending" }
});

module.exports = mongoose.model("Order", orderSchema);
