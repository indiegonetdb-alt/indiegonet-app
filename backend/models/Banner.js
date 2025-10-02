const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  judul: String,
  deskripsi: String,
  urlGambar: String,
  aktif: { type: Boolean, default: true },  // ✅ ganti ke "aktif"
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Banner", bannerSchema);
