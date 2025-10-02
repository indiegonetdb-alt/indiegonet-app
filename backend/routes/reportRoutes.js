const express = require('express');
const Billing = require('../models/Billing');
const requireAuth = require('../middleware/auth');
const router = express.Router();

// JSON summary
router.get('/summary', requireAuth, async (req,res)=>{
  try {
    const { from, to, type } = req.query;
    const q = {};
    if (from || to) {
      q.createdAt = {};
      if (from) q.createdAt.$gte = new Date(from);
      if (to) q.createdAt.$lte = new Date(to);
    }
    const rows = await Billing.find(q).populate('customerId','name type');
    const filtered = type ? rows.filter(r => r.customerId?.type === type) : rows;
    const totalPenerimaan = filtered.reduce((a,b)=> a + (b.penerimaanToko||0), 0);
    const totalSetoran = filtered.reduce((a,b)=> a + (b.setoran||0), 0);
    res.json({ count: filtered.length, totalPenerimaan, totalSetoran });
  } catch(err){ res.status(500).json({ msg: err.message }); }
});

// CSV export
router.get('/csv', requireAuth, async (req,res)=>{
  try {
    const { from, to, type } = req.query;
    const q = {};
    if (from || to) {
      q.createdAt = {};
      if (from) q.createdAt.$gte = new Date(from);
      if (to) q.createdAt.$lte = new Date(to);
    }
    let rows = await Billing.find(q).populate('customerId','name type');
    if (type === 'toko' || type === 'bulanan') rows = rows.filter(r => r.customerId?.type === type);

    const header = ['Tanggal','Nama','Jenis','TotalVoucher2000','TotalVoucher5000','Sisa2000','Sisa5000','Hasil2000','Hasil5000','Persen','PenerimaanToko','Setoran'];
    const lines = [header.join(',')];
    for (const r of rows) {
      const d = new Date(r.createdAt).toISOString().slice(0,10);
      const name = r.customerId?.name || '-';
      const jenis = r.customerId?.type || '-';
      const arr = [
        d, name, jenis,
        r.totalVoucher2000||0, r.totalVoucher5000||0,
        r.remaining2000||0, r.remaining5000||0,
        r.result2000||0, r.result5000||0,
        r.percent||0, r.penerimaanToko||0, r.setoran||0
      ];
      lines.push(arr.join(','));
    }
    const csv = lines.join('\n');
    res.setHeader('Content-Type','text/csv');
    res.setHeader('Content-Disposition','attachment; filename="laporan.csv"');
    res.send(csv);
  } catch(err){ res.status(500).json({ msg: err.message }); }
});

module.exports = router;
