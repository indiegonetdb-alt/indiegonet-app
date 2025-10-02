const mongoose = require("mongoose");

const PenagihanSchema = new mongoose.Schema(
  {
    tanggalPenagihan: { type: Date, required: true },
    jenis: { type: String, enum: ["toko", "pribadi"], required: true },
    namaPelanggan: { type: String, required: true },

    // untuk toko
    jumlahV2000: { type: Number, default: 0 },
    jumlahV5000: { type: Number, default: 0 },
    sisaV2000: { type: Number, default: 0 },
    sisaV5000: { type: Number, default: 0 },
    hasilV2000: { type: Number, default: 0 },
    hasilV5000: { type: Number, default: 0 },
    totalHasil: { type: Number, default: 0 }, // ✅ tambahan opsional
    penerimaanToko: { type: Number, default: 0 },
    setoran: { type: Number, default: 0 },

    // untuk pribadi
    jumlahPembayaran: { type: Number, default: 0 },

    // status default sudah ditagih
    status: { type: String, default: "Sudah Ditagih" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Penagihan", PenagihanSchema);
