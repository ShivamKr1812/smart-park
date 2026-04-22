const mongoose = require("mongoose");

const parkingSchema = new mongoose.Schema({
  title: String,
  location: String,
  price: Number,
  phone: String,
});

module.exports = mongoose.model("Parking", parkingSchema);