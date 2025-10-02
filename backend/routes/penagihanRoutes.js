// === Penagihan Toko (terhubung ke Pengiriman) ===
app.post("/api/penagihan/toko", async (req, res) => {
  try {
    const { pelangganId, tanggalPenagihan, rentangMulai, rentangSampai, sisaVocer2000, sisaVocer5000 } = req.body;
    const pelanggan = await Pelanggan.findById(pelangganId);
    if (!pelanggan) return res.status(404).json({ ok: false, error: "Pelanggan tidak ditemukan" });

    // Ambil riwayat pengiriman
    const riwayat = await Pengiriman.find({
      namaPelanggan: pelanggan.nama,
      tanggal: { $gte: new Date(rentangMulai), $lte: new Date(rentangSampai) },
    });

    // Hitung akumulasi dari pengiriman
    const total2000 = riwayat.reduce((s, r) => s + (r.v2000 || 0), 0);
    const total5000 = riwayat.reduce((s, r) => s + (r.v5000 || 0), 0);

    // Hitung hasil akhir
    const hasil2000 = (total2000 - (sisaVocer2000 || 0)) * 2000;
    const hasil5000 = (total5000 - (sisaVocer5000 || 0)) * 5000;
    const total = hasil2000 + hasil5000;
    const penerimaanToko = Math.round((total * (pelanggan.persenan || 0)) / 100);
    const setoran = total - penerimaanToko;

    // Simpan ke tabel Penagihan
    const penagihan = new Penagihan({
      jenis: "toko",
      namaPelanggan: pelanggan.nama,
      persenan: pelanggan.persenan,
      tanggalPenagihan,
      mulaiTanggal: rentangMulai,
      sampaiTanggal: rentangSampai,
      jumlahV2000: total2000,
      jumlahV5000: total5000,
      sisaV2000: sisaVocer2000,
      sisaV5000: sisaVocer5000,
      hasilV2000: hasil2000,
      hasilV5000: hasil5000,
      penerimaanToko,
      setoran,
    });
    await penagihan.save();

    // Hapus riwayat pengiriman setelah disimpan
    await Pengiriman.deleteMany({
      namaPelanggan: pelanggan.nama,
      tanggal: { $gte: new Date(rentangMulai), $lte: new Date(rentangSampai) },
    });

    res.json({ ok: true, penagihan });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
