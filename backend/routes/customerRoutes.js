const express = require('express');
const Customer = require('../models/Customer');
const requireAuth = require('../middleware/auth');

const router = express.Router();

/** Normalisasi persen:
 *  - Terima 10 (10%) atau 0.1 → simpan sebagai 0.10
 *  - Clamp ke 0..1
 */
function normalizePercent(p) {
  if (p === null || p === undefined || p === '') return 0;
  let x = Number(p);
  if (Number.isNaN(x)) x = 0;
  if (x > 1) x = x / 100;     // 10 -> 0.10
  if (x < 0) x = 0;
  if (x > 1) x = 1;
  return x;
}

// CREATE
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, type } = req.body;

    // Cek nama unik
    const existing = await Customer.findOne({ name });
    if (existing) return res.status(400).json({ msg: 'Nama pelanggan sudah ada' });

    // Siapkan payload sesuai jenis
    const payload = { name, type };
    if (type === 'toko') {
      payload.percent = normalizePercent(req.body.percent);
    } else if (type === 'bulanan') {
      payload.monthlyAmount = Number(req.body.monthlyAmount || 0);
    }

    const customer = await Customer.create(payload);
    res.json({ msg: 'Pelanggan berhasil ditambahkan', customer });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// READ ALL
router.get('/', requireAuth, async (_req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// UPDATE
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, type } = req.body;

    const payload = { name, type };
    if (type === 'toko') {
      payload.percent = normalizePercent(req.body.percent);
      payload.monthlyAmount = undefined;
    } else if (type === 'bulanan') {
      payload.monthlyAmount = Number(req.body.monthlyAmount || 0);
      payload.percent = undefined;
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true }
    );
    if (!customer) return res.status(404).json({ msg: 'Pelanggan tidak ditemukan' });
    res.json({ msg: 'Pelanggan berhasil diperbarui', customer });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// DELETE
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ msg: 'Pelanggan tidak ditemukan' });
    res.json({ msg: 'Pelanggan berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
