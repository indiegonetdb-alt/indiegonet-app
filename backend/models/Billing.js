const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  startDate: Date,
  endDate: Date,
  totalVoucher2000: Number,
  totalVoucher5000: Number,
  remaining2000: Number,
  remaining5000: Number,
  result2000: Number,
  result5000: Number,
  percent: Number,
  penerimaanToko: Number,
  setoran: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Billing', billingSchema);
