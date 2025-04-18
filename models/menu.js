const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  type: String,
  image: String,

});

module.exports = mongoose.model("menu", menuSchema);
