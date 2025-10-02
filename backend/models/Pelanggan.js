const mongoose = require("mongoose");

const PelangganSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true, unique: true },
    jenis: { type: String, enum: ["toko", "pribadi"], required: true },
    persenan: { type: Number, default: null },
    jumlahPembayaran: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pelanggan", PelangganSchema);
