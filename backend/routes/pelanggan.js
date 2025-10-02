const express = require("express");
const router = express.Router();
const Pelanggan = require("../models/Pelanggan"); // pastikan model ada

// ✅ GET semua pelanggan
router.get("/", async (req, res) => {
  try {
    const data = await Pelanggan.find().sort({ createdAt: -1 });
    res.json({ ok: true, data });
  } catch (err) {
    console.error("Error GET pelanggan:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

// ✅ POST tambah pelanggan
router.post("/", async (req, res) => {
  try {
    const { nama, jenis, persenan, jumlahPembayaran } = req.body;

    // Validasi nama unik
    const existing = await Pelanggan.findOne({ nama });
    if (existing) {
      return res.status(400).json({ ok: false, error: "Nama pelanggan sudah ada" });
    }

    const pelanggan = new Pelanggan({
      nama,
      jenis,
      persenan: jenis === "toko" ? persenan : null,
      jumlahPembayaran: jenis === "pribadi" ? jumlahPembayaran : null,
    });

    await pelanggan.save();
    res.json({ ok: true, data: pelanggan });
  } catch (err) {
    console.error("Error POST pelanggan:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

// ✅ PUT update pelanggan
router.put("/:id", async (req, res) => {
  try {
    const { nama, jenis, persenan, jumlahPembayaran } = req.body;

    // Validasi nama unik (kecuali dirinya sendiri)
    const existing = await Pelanggan.findOne({ nama, _id: { $ne: req.params.id } });
    if (existing) {
      return res.status(400).json({ ok: false, error: "Nama pelanggan sudah ada" });
    }

    const pelanggan = await Pelanggan.findByIdAndUpdate(
      req.params.id,
      {
        nama,
        jenis,
        persenan: jenis === "toko" ? persenan : null,
        jumlahPembayaran: jenis === "pribadi" ? jumlahPembayaran : null,
      },
      { new: true }
    );

    res.json({ ok: true, data: pelanggan });
  } catch (err) {
    console.error("Error PUT pelanggan:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

// ✅ DELETE pelanggan
router.delete("/:id", async (req, res) => {
  try {
    await Pelanggan.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error("Error DELETE pelanggan:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

module.exports = router;
