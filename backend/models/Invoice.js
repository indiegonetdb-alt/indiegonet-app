const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
  toko_id: { type: mongoose.Schema.Types.ObjectId, ref: "Pelanggan", required: true },
  tanggal: { type: Date, required: true },
  jumlah_voucher_2000: { type: Number, default: 0 },
  jumlah_voucher_5000: { type: Number, default: 0 },
  sisa_voucher_2000: { type: Number, default: 0 },
  sisa_voucher_5000: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
});

module.exports = mongoose.model("Invoice", InvoiceSchema);
