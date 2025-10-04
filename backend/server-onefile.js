// ==== One-file Backend for Indiegonet ====

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: [
      "https://indiegonet.vercel.app", // frontend kamu di Vercel
      "https://indiegonet-backend.vercel.app", // opsional, aman
      "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// ==== MongoDB Connect ====
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error(err));

// ==== Models ====
const User = require("./models/User");
const Pelanggan = require("./models/Pelanggan");
const Pengiriman = require("./models/Pengiriman");
const Banner = require("./models/Banner");
const Message = require("./models/Message");
const Penagihan = require("./models/Penagihan");
const RiwayatUser = require("./models/RiwayatUser");

// ==== Auth Routes ====
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const u = await User.findOne({ username });
    if (!u) return res.json({ ok: false, message: "User tidak ditemukan" });

    const match = await bcrypt.compare(password, u.password);
    if (!match) return res.json({ ok: false, message: "Password salah" });

    const token = jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ ok: true, token, user: u });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ==== User CRUD ====
// Ambil semua user
app.get("/api/users", async (req, res) => {
  const users = await User.find();
  res.json({ ok: true, data: users });
});

// Tambah user baru
app.post("/api/users", async (req, res) => {
  try {
    const { nama, username, password, role, jenis } = req.body; // ✅ tambahkan jenis
    const hash = await bcrypt.hash(password, 10);
    const u = new User({ nama, username, password: hash, role, jenis }); // ✅ simpan jenis
    await u.save();
    res.json({ ok: true, data: u });
  } catch (err) {
    console.error("❌ Error tambah user:", err.message, req.body);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Update user
app.put("/api/users/:id", async (req, res) => {
  try {
    const { nama, username, password, role, jenis } = req.body; // ✅ tambahkan jenis
    const update = { nama, username, role, jenis }; // ✅ simpan jenis
    if (password) {
      update.password = await bcrypt.hash(password, 10);
    }
    const u = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ ok: true, data: u });
  } catch (err) {
    console.error("❌ Error update user:", err.message, req.body);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Hapus user
app.delete("/api/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Update Profil User Sendiri
app.put("/api/user/:id/profil", async (req, res) => {
  try {
    const { username, password } = req.body;
    const update = {};
    if (username) update.username = username;
    if (password) update.password = await bcrypt.hash(password, 10);

    const u = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ ok: true, data: u });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
// ==== Pelanggan CRUD ====
app.get("/api/pelanggan", async (req, res) => {
  const data = await Pelanggan.find();
  res.json({ ok: true, data });
});

app.post("/api/pelanggan", async (req, res) => {
  try {
    const pelanggan = new Pelanggan(req.body);
    await pelanggan.save();
    res.json({ ok: true, data: pelanggan });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.put("/api/pelanggan/:id", async (req, res) => {
  try {
    const pelanggan = await Pelanggan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ ok: true, data: pelanggan });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.delete("/api/pelanggan/:id", async (req, res) => {
  try {
    await Pelanggan.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ==== Alias Customers (Inggris) → Pelanggan (Indonesia) ====

// GET semua pelanggan
app.get("/api/customers", async (req, res) => {
  const data = await Pelanggan.find();
  res.json({ ok: true, data });
});

// POST tambah pelanggan
app.post("/api/customers", async (req, res) => {
  try {
    const pelanggan = new Pelanggan(req.body);
    await pelanggan.save();
    res.json({ ok: true, data: pelanggan });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// PUT update pelanggan
app.put("/api/customers/:id", async (req, res) => {
  try {
    const pelanggan = await Pelanggan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ ok: true, data: pelanggan });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE hapus pelanggan
app.delete("/api/customers/:id", async (req, res) => {
  try {
    await Pelanggan.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ==== Pengiriman CRUD ====
app.get("/api/pengiriman", async (req, res) => {
  const data = await Pengiriman.find();
  res.json({ ok: true, data });
});

app.post("/api/pengiriman", async (req, res) => {
  try {
    const pengiriman = new Pengiriman(req.body);
    await pengiriman.save();
    res.json({ ok: true, data: pengiriman });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

app.put("/api/pengiriman/:id", async (req, res) => {
  try {
    const pengiriman = await Pengiriman.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ ok: true, data: pengiriman });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

app.delete("/api/pengiriman/:id([0-9a-fA-F]{24})", async (req, res) => {
  try {
    await Pengiriman.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// ==== Alias Hapus Pengiriman (untuk kompatibilitas) ====
app.delete("/api/pengiriman/hapus", async (req, res) => {
  try {
    const { namaPelanggan, mulai, sampai } = req.body;
    if (!namaPelanggan || !mulai || !sampai) {
      return res.status(400).json({ ok: false, error: "Data tidak lengkap" });
    }

    const result = await Pengiriman.deleteMany({
      namaPelanggan,
      tanggal: { $gte: new Date(mulai), $lte: new Date(sampai) },
    });

    res.json({ ok: true, deleted: result.deletedCount });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Akumulasi vocer dari pengiriman
app.get("/api/pengiriman/akumulasi", async (req, res) => {
  try {
    const { namaPelanggan, mulai, sampai } = req.query;

    const filter = {};
    if (namaPelanggan) filter.namaPelanggan = namaPelanggan;
    if (mulai && sampai) {
      filter.tanggal = {
        $gte: new Date(mulai),
        $lte: new Date(sampai),
      };
    }

    const pengiriman = await Pengiriman.find(filter);

    const total2000 = pengiriman.reduce((sum, p) => sum + (p.v2000 || 0), 0);
    const total5000 = pengiriman.reduce((sum, p) => sum + (p.v5000 || 0), 0);

    res.json({ ok: true, total2000, total5000 });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// ==== Banner CRUD ====
app.get("/api/banner", async (req, res) => {
  const data = await Banner.find({ aktif: true });
  res.json({ ok: true, data });
});

app.post("/api/banner", async (req, res) => {
  try {
    const { judul, deskripsi, urlGambar, active } = req.body;
    const b = await Banner.create({
      judul,
      deskripsi,
      urlGambar,
      active: active !== undefined ? active : true,
    });
    res.json({ ok: true, data: b });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

app.put("/api/banner/:id", async (req, res) => {
  try {
    const { judul, deskripsi, urlGambar, active } = req.body;
    const b = await Banner.findByIdAndUpdate(
      req.params.id,
      {
        ...(judul !== undefined ? { judul } : {}),
        ...(deskripsi !== undefined ? { deskripsi } : {}),
        ...(urlGambar !== undefined ? { urlGambar } : {}),
        ...(active !== undefined ? { active } : {}),
      },
      { new: true }
    );
    res.json({ ok: true, data: b });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

app.delete("/api/banner/:id", async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// ==== Pesan CRUD ====

// Kirim pesan (versi 1)
app.post("/api/messages", async (req, res) => {
  try {
    const { user, isi } = req.body;
    const pesan = new Message({
      fromUserId: user,
      toAdmin: true,
      subject: "Pesan dari user",
      body: isi,
      status: "unread",
    });
    await pesan.save();
    res.json({ ok: true, data: pesan });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
// Alias untuk user: /api/pesan
app.post("/api/pesan", async (req, res) => {
  try {
    const { user, isi } = req.body;
    const pesan = new Message({
      fromUserId: user,
      toAdmin: true,
      subject: "Pesan dari user",
      body: isi,
      status: "unread",
    });
    await pesan.save();
    res.json({ ok: true, data: pesan });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Ambil semua pesan
app.get("/api/messages", async (req, res) => {
  try {
    const data = await Message.find()
      .populate("fromUserId", "nama username")
      .sort({ createdAt: -1 });

    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
// Alias untuk ambil semua pesan: /api/pesan
app.get("/api/pesan", async (req, res) => {
  try {
    const data = await Message.find()
      .populate("fromUserId", "nama username")
      .sort({ createdAt: -1 });

    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Tandai pesan sudah dibaca
app.put("/api/messages/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Message.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json({ ok: true, data: updated });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.delete("/api/messages/:id", async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
// ==== Tambahan Endpoint untuk User (DashboardUser) ====
app.get("/api/user/:id/summary", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ ok: false, error: "User tidak ditemukan" });

    const pelanggan = await Pelanggan.findOne({ nama: user.nama });
    if (!pelanggan) return res.status(404).json({ ok: false, error: "Pelanggan tidak ditemukan" });

    // total vocer dari Pengiriman
    const riwayat = await Pengiriman.find({ namaPelanggan: pelanggan.nama });
    const totalV2000 = riwayat.reduce((sum, r) => sum + (r.v2000 || 0), 0);
    const totalV5000 = riwayat.reduce((sum, r) => sum + (r.v5000 || 0), 0);

    const persenan = pelanggan.persenan || 0;

    // penerimaan dari laporan (Penagihan)
    const laporan = await Penagihan.find({ namaPelanggan: pelanggan.nama });
    const penerimaan = laporan.reduce((sum, l) => sum + (l.setoran || 0), 0);

    // ranking pelanggan terbaik
    const allPenagihan = await Penagihan.find();
const ranking = {};
for (let p of allPenagihan) {
  ranking[p.namaPelanggan] =
    (ranking[p.namaPelanggan] || 0) +
    (p.setoran || 0) + (p.jumlahPembayaran || 0); 
}
const bestNama = Object.keys(ranking).sort((a, b) => ranking[b] - ranking[a])[0];

    res.json({
      ok: true,
      data: {
        _id: user._id,
        nama: user.nama,
        username: user.username,
        role: user.role,
        jenis: user.jenis,
        persenan,
        totalV2000,
        totalV5000,
        penerimaan,
        jumlahPembayaran: pelanggan.jumlahPembayaran || 0,
        isBest: user.nama === bestNama,
      },
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ==== Pengiriman milik user ====
app.get("/api/pengiriman/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ ok: false, error: "User tidak ditemukan" });

    const riwayat = await Pengiriman.find({ namaPelanggan: user.nama }).sort({ tanggal: -1 });

    const data = riwayat.map((r) => ({
      tanggal: r.tanggal,
      v2000: r.v2000 || 0,
      v5000: r.v5000 || 0,
      status: r.status || "Belum Ditagih",
    }));

    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ==== Riwayat User (sudah ditagih) ====
app.get("/api/riwayat/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ ok: false, error: "User tidak ditemukan" });
    }

    const data = await RiwayatUser.find({ namaPelanggan: user.nama }).sort({ tanggal: -1 });
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ==== Riwayat Penagihan User (Pribadi) ====
app.get("/api/penagihan/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ ok: false, error: "User tidak ditemukan" });

    const data = await Penagihan.find({ namaPelanggan: user.nama }).sort({ tanggalPenagihan: -1 });

    const result = data.map((p) => ({
      tanggal: p.tanggalPenagihan,
      jumlahPembayaran: p.jumlahPembayaran || 0,
      status: p.status || "Belum Ditagih",
    }));

    res.json({ ok: true, data: result });
  } catch (err) {
    console.error("❌ Error ambil penagihan user:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ==== Alias Billing (Inggris) ====
app.get("/api/billing/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ ok: false, error: "User not found" });

    const data = await Penagihan.find({ namaPelanggan: user.nama }).sort({ tanggalPenagihan: -1 });

    const result = data.map((p) => ({
      tanggal: p.tanggalPenagihan,
      jumlahPembayaran: p.jumlahPembayaran || 0,
      status: p.status || "Belum Ditagih",
    }));

    res.json({ ok: true, data: result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ==== Alias History (Inggris) → Riwayat (Indonesia) ====
app.get("/api/history/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    const data = await RiwayatUser.find({ namaPelanggan: user.nama }).sort({ tanggal: -1 });

    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ==== Duplikat Alias Riwayat (tetap dipertahankan) ====
app.get("/api/riwayat/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ ok: false, error: "User tidak ditemukan" });
    }

    const data = await RiwayatUser.find({ namaPelanggan: user.nama }).sort({ tanggal: -1 });
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ==== Duplikat Alias History (tetap dipertahankan) ====
app.get("/api/history/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    const data = await RiwayatUser.find({ namaPelanggan: user.nama }).sort({ tanggal: -1 });

    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
// ==== Penagihan (Laporan) ====

// ✅ SIMPAN (tombol Simpan & Export PDF)
app.post("/api/penagihan", async (req, res) => {
  try {
    const jumlahV2000 = Number(req.body.jumlahV2000 ?? 0);
    const jumlahV5000 = Number(req.body.jumlahV5000 ?? 0);
    const sisaV2000   = Number(req.body.sisaV2000 ?? 0);
    const sisaV5000   = Number(req.body.sisaV5000 ?? 0);

    const hasilV2000 = req.body.hasilV2000 ?? (jumlahV2000 * 2000);
    const hasilV5000 = req.body.hasilV5000 ?? (jumlahV5000 * 5000);
    const totalHasil = req.body.totalHasil ?? (hasilV2000 + hasilV5000);

    const p = new Penagihan({
      ...req.body,
      tanggalPenagihan: req.body.tanggalPenagihan || new Date(),
      jumlahV2000, jumlahV5000, sisaV2000, sisaV5000,
      hasilV2000, hasilV5000, totalHasil,
      status: "Sudah Ditagih",
    });
    await p.save();

    const r = new RiwayatUser({
      namaPelanggan: req.body.namaPelanggan,
      tanggal: req.body.tanggalPenagihan || new Date(),
      jenis: req.body.jenis || "lainnya",
      v2000: jumlahV2000, v5000: jumlahV5000,
      sisaV2000, sisaV5000, hasilV2000, hasilV5000,
      total: totalHasil,
      penerimaanToko: Number(req.body.penerimaanToko ?? 0),
      setoran: Number(req.body.setoran ?? 0),
      jumlahPembayaran: Number(req.body.jumlahPembayaran ?? 0),
      status: "Sudah Ditagih",
    });
    await r.save();

    // opsional: hapus data Pengiriman yang sudah ditagih
    if (req.body.mulaiTanggal && req.body.sampaiTanggal) {
      await Pengiriman.deleteMany({
        namaPelanggan: req.body.namaPelanggan,
        tanggal: {
          $gte: new Date(req.body.mulaiTanggal),
          $lte: new Date(req.body.sampaiTanggal),
        },
      });
    }

    res.json({
      ok: true,
      message: "✅ Penagihan & RiwayatUser berhasil disimpan",
      data: { penagihan: p, riwayat: r },
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ✅ AMBIL semua laporan
app.get("/api/penagihan", async (req, res) => {
  try {
    const data = await Penagihan.find().sort({ tanggalPenagihan: -1 });
    console.log("📊 Data laporan dari Penagihan:", data.length);
    res.json({ ok: true, data });
  } catch (err) {
    console.error("❌ Error ambil laporan:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});
// ==== Alias GET untuk kompatibilitas lama ====
// (alias laporan -> penagihan)
app.get("/api/laporan", async (req, res) => {
  try {
    const data = await Penagihan.find().sort({ tanggalPenagihan: -1 });
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ✅ EDIT laporan by ID (tombol Edit)
app.put("/api/penagihan/:id", async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.jumlahV2000 !== undefined || body.jumlahV5000 !== undefined) {
      const j2000 = body.jumlahV2000 ?? 0;
      const j5000 = body.jumlahV5000 ?? 0;
      body.hasilV2000 = body.hasilV2000 ?? j2000 * 2000;
      body.hasilV5000 = body.hasilV5000 ?? j5000 * 5000;
      body.totalHasil = body.totalHasil ?? (body.hasilV2000 + body.hasilV5000);
    }

    const updated = await Penagihan.findByIdAndUpdate(req.params.id, body, {
      new: true,
    });
    if (!updated) {
      return res.status(404).json({ ok: false, error: "Data tidak ditemukan" });
    }

    // 🔄 Sinkron update ke RiwayatUser
    await RiwayatUser.findOneAndUpdate(
      {
        namaPelanggan: updated.namaPelanggan,
        tanggal: updated.tanggalPenagihan,
      },
      {
        $set: {
          jenis: updated.jenis,
          v2000: updated.jumlahV2000,
          v5000: updated.jumlahV5000,
          sisaV2000: updated.sisaV2000,
          sisaV5000: updated.sisaV5000,
          hasilV2000: updated.hasilV2000,
          hasilV5000: updated.hasilV5000,
          total: updated.totalHasil,
          penerimaanToko: updated.penerimaanToko,
          setoran: updated.setoran,
          jumlahPembayaran: updated.jumlahPembayaran,
          status: updated.status,
        },
      },
      { new: true }
    );

    res.json({ ok: true, data: updated });
  } catch (err) {
    console.error("❌ Error update laporan:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ==== Alias untuk kompatibilitas lama ====
// (alias laporan -> penagihan)
app.put("/api/laporan/:id", async (req, res) => {
  try {
    // Reuse handler penagihan
    req.url = `/api/penagihan/${req.params.id}`;
    app._router.handle(req, res, require("express/lib/router/layer").prototype.handle_request);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ✅ HAPUS laporan by ID (tombol Hapus)
app.delete("/api/penagihan/:id", async (req, res) => {
  try {
    const del = await Penagihan.findByIdAndDelete(req.params.id);
    if (!del) {
      return res.status(404).json({ ok: false, error: "Data tidak ditemukan" });
    }

    // 🔄 Sinkron hapus dari RiwayatUser juga
    await RiwayatUser.deleteOne({
      namaPelanggan: del.namaPelanggan,
      tanggal: del.tanggalPenagihan,
    });

    res.json({ ok: true, message: "Data berhasil dihapus" });
  } catch (err) {
    console.error("❌ Error hapus penagihan:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ==== Alias untuk kompatibilitas lama ====
app.delete("/api/laporan/:id", async (req, res) => {
  try {
    req.url = `/api/penagihan/${req.params.id}`;
    app._router.handle(req, res, require("express/lib/router/layer").prototype.handle_request);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
// ==== Start Server ====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
