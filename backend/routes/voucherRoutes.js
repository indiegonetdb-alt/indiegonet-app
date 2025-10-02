const express = require('express');
const VoucherShipment = require('../models/VoucherShipment');
const Customer = require('../models/Customer');
const requireAuth = require('../middleware/auth');
const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const { customerId, voucherType, quantity } = req.body;
    const c = await Customer.findById(customerId);
    if (!c) return res.status(400).json({ msg: 'Customer tidak ditemukan' });
    if (c.type !== 'toko') return res.status(400).json({ msg: 'Pengiriman vocer hanya untuk pelanggan Toko' });
    const voucher = await VoucherShipment.create({
      customerId, voucherType, quantity, createdBy: req.user.id
    });
    res.json({ msg: 'Pengiriman vocer tersimpan', voucher });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const { customerId, from, to } = req.query;
    const q = {};
    if (customerId) q.customerId = customerId;
    if (from || to) {
      q.date = {};
      if (from) q.date.$gte = new Date(from);
      if (to) q.date.$lte = new Date(to);
    }
    const rows = await VoucherShipment.find(q).populate('customerId','name type');
    res.json(rows);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await VoucherShipment.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Pengiriman vocer dihapus' });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

module.exports = router;
