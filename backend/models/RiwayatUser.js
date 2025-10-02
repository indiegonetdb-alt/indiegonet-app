const mongoose = require("mongoose");

const RiwayatUserSchema = new mongoose.Schema(
  {
    namaPelanggan: { type: String, required: true },
    tanggal: { type: Date, default: Date.now },

    // ✅ field baru untuk jenis pelanggan
    jenis: {
      type: String,
      enum: ["toko", "pribadi", "lainnya"],
      default: "lainnya",
    },

    // ✅ data vocer
    v2000: { type: Number, default: 0 },
    v5000: { type: Number, default: 0 },

    // ✅ sisa vocer
    sisaV2000: { type: Number, default: 0 },
    sisaV5000: { type: Number, default: 0 },

    // ✅ hasil perhitungan
    hasilV2000: { type: Number, default: 0 },
    hasilV5000: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    // ✅ tambahan
    penerimaanToko: { type: Number, default: 0 },
    setoran: { type: Number, default: 0 },
    jumlahPembayaran: { type: Number, default: 0 },

    // ✅ info lain
    status: { type: String, default: "Sudah Ditagih" },
    keterangan: { type: String, default: "" },
  },
  { timestamps: true }
);

// ✅ Export model dengan pengecekan agar tidak OverwriteModelError
module.exports =
  mongoose.models.RiwayatUser ||
  mongoose.model("RiwayatUser", RiwayatUserSchema);
