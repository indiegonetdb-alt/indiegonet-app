const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, enum: ['toko', 'bulanan'], required: true },
  percent: { type: Number },       // toko
  monthlyAmount: { type: Number }, // bulanan
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Customer', customerSchema);
