// ==== Indiegonet - Production Server (One File) ====
// Serves API + React build (single port) on PORT (default: 5000)

const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const morgan = require('morgan');
const PDFDocument = require('pdfkit');
const dayjs = require('dayjs');
const path = require('path');
require('dotenv').config();

const app = express();

// ---------- Middleware ----------
app.use(cors({
  origin: ['http://localhost:5173','http://127.0.0.1:5173','http://localhost:5000','http://127.0.0.1:5000'],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.options('*', cors());

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ---------- Env ----------
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// ---------- DB ----------
mongoose.set('strictQuery', true);
mongoose.connect(MONGO_URI).then(()=>{
  console.log('✅ MongoDB Connected');
}).catch(err=>{
  console.error('❌ MongoDB Error:', err.message);
  process.exit(1);
});

// ---------- Schemas & Models ----------
const { Schema, model, Types } = mongoose;

const userSchema = new Schema({
  name: String,
  username: { type: String, unique: true, index: true },
  passwordHash: String,
  role: { type: String, default: 'admin' }
}, { timestamps: true });
const User = model('User', userSchema);

const customerSchema = new Schema({
  name: { type: String, unique: true, index: true },
  type: { type: String, enum: ['toko','bulanan'], required: true },
  percent: Number,           // stored as 0..1 (0.1 => 10%)
  monthlyAmount: Number
}, { timestamps: true });
const Customer = model('Customer', customerSchema);

const shipmentSchema = new Schema({
  customerId: { type: Types.ObjectId, ref: 'Customer', required: true },
  voucherType: { type: Number, enum: [2000, 5000], required: true },
  quantity: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
}, { timestamps: true });
const VoucherShipment = model('VoucherShipment', shipmentSchema);

const billingSchema = new Schema({
  customerId: { type: Types.ObjectId, ref: 'Customer', required: true },
  startDate: Date,
  endDate: Date,
  totalVoucher2000: Number,
  totalVoucher5000: Number,
  remaining2000: Number,
  remaining5000: Number,
  result2000: Number,
  result5000: Number,
  percent: Number,         // 0..1
  penerimaanToko: Number,
  setoran: Number
}, { timestamps: true });
const Billing = model('Billing', billingSchema);

const messageSchema = new Schema({
  subject: String,
  body: String,
  status: { type: String, enum: ['new','read'], default: 'new' }
}, { timestamps: true });
const Message = model('Message', messageSchema);

const bannerSchema = new Schema({
  imageUrl: String,
  title: String,
  active: { type: Boolean, default: true }
}, { timestamps: true });
const Banner = model('Banner', bannerSchema);

// ---------- Helpers ----------
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '2d' });
}
function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ msg: 'Unauthorized' });
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data;
    next();
  } catch (e) {
    return res.status(401).json({ msg: 'Unauthorized' });
  }
}
function normalizePercent(p) {
  if (p === null || p === undefined || p === '') return 0;
  let x = Number(p);
  if (Number.isNaN(x)) x = 0;
  if (x > 1) x = x / 100;  // 10 -> 0.10
  if (x < 0) x = 0;
  if (x > 1) x = 1;
  return x;
}
function rupiah(n){
  n = Math.round(n || 0);
  return 'Rp ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// ---------- Health ----------
app.get('/api/health', (req,res)=> res.json({ ok: true, ts: Date.now() }));

// ---------- Auth ----------
app.post('/api/auth/seed-admin', async (req,res)=>{
  try {
    const exists = await User.findOne({ username: 'indiego' });
    if (exists) return res.json({ ok:true, msg:'Admin already exists' });
    const hash = await bcrypt.hash('net', 10);
    await User.create({ name:'Admin Indiegonet', username:'indiego', passwordHash:hash, role:'admin' });
    res.json({ ok:true, msg:'Admin seeded' });
  } catch(err){ res.status(500).json({msg: err.message}); }
});
app.get('/api/auth/seed-admin', async (req,res)=>{
  try {
    const exists = await User.findOne({ username: 'indiego' });
    if (exists) return res.json({ ok:true, msg:'Admin already exists' });
    const hash = await bcrypt.hash('net', 10);
    await User.create({ name:'Admin Indiegonet', username:'indiego', passwordHash:hash, role:'admin' });
    res.json({ ok:true, msg:'Admin seeded' });
  } catch(err){ res.status(500).json({msg: err.message}); }
});
app.post('/api/auth/login', async (req,res)=>{
  try {
    const { username, password } = req.body;
    const u = await User.findOne({ username });
    if (!u) return res.status(400).json({ msg: 'User tidak ditemukan' });
    const ok = await bcrypt.compare(password, u.passwordHash || '');
    if (!ok) return res.status(400).json({ msg: 'Password salah' });
    const token = signToken({ uid: u._id.toString(), role: u.role });
    res.json({ token });
  } catch(err){ res.status(500).json({msg: err.message}); }
});
app.get('/api/auth/me', auth, (req,res)=> res.json({ userId: req.user.uid, role: req.user.role }));

// ---------- Customers ----------
app.post('/api/customers', auth, async (req,res)=>{
  try {
    const { name, type } = req.body;
    const existing = await Customer.findOne({ name });
    if (existing) return res.status(400).json({ msg: 'Nama pelanggan sudah ada' });
    const payload = { name, type };
    if (type === 'toko') payload.percent = normalizePercent(req.body.percent);
    if (type === 'bulanan') payload.monthlyAmount = Number(req.body.monthlyAmount || 0);
    const c = await Customer.create(payload);
    res.json(c);
  } catch(err){ res.status(500).json({msg: err.message}); }
});
app.get('/api/customers', auth, async (req,res)=>{
  try { res.json(await Customer.find()); }
  catch(err){ res.status(500).json({msg: err.message}); }
});
app.put('/api/customers/:id', auth, async (req,res)=>{
  try {
    const { name, type } = req.body;
    const payload = { name, type };
    if (type === 'toko') { payload.percent = normalizePercent(req.body.percent); payload.monthlyAmount = undefined; }
    if (type === 'bulanan') { payload.monthlyAmount = Number(req.body.monthlyAmount || 0); payload.percent = undefined; }
    const c = await Customer.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!c) return res.status(404).json({ msg: 'Pelanggan tidak ditemukan' });
    res.json(c);
  } catch(err){ res.status(500).json({msg: err.message}); }
});
app.delete('/api/customers/:id', auth, async (req,res)=>{
  try {
    const c = await Customer.findByIdAndDelete(req.params.id);
    if (!c) return res.status(404).json({ msg: 'Pelanggan tidak ditemukan' });
    res.json({ ok:true, msg:'Pelanggan dihapus' });
  } catch(err){ res.status(500).json({msg: err.message}); }
});

// ---------- Voucher Shipments ----------
app.post('/api/voucher-shipments', auth, async (req,res)=>{
  try {
    const { customerId, voucherType, quantity, date } = req.body;
    const s = await VoucherShipment.create({
      customerId, voucherType, quantity: Number(quantity||0), date: date ? new Date(date) : new Date()
    });
    res.json(s);
  } catch(err){ res.status(500).json({msg: err.message}); }
});
app.get('/api/voucher-shipments', auth, async (req,res)=>{
  try {
    const { customerId, from, to } = req.query;
    const q = {};
    if (customerId) q.customerId = customerId;
    if (from || to) {
      q.date = {};
      if (from) q.date.$gte = new Date(from);
      if (to) q.date.$lte = new Date(to);
    }
    const rows = await VoucherShipment.find(q).sort({date: -1}).limit(200);
    res.json(rows);
  } catch(err){ res.status(500).json({msg: err.message}); }
});
app.delete('/api/voucher-shipments/:id', auth, async (req,res)=>{
  try {
    const x = await VoucherShipment.findByIdAndDelete(req.params.id);
    if (!x) return res.status(404).json({ msg: 'Data tidak ditemukan' });
    res.json({ ok:true, msg:'Pengiriman dihapus' });
  } catch(err){ res.status(500).json({msg: err.message}); }
});

// ---------- Billing (+PDF, Delete) ----------
app.post('/api/billings', auth, async (req,res)=>{
  try {
    const { customerId, startDate, endDate, remaining2000 = 0, remaining5000 = 0 } = req.body;
    const c = await Customer.findById(customerId);
    if (!c) return res.status(400).json({ msg: 'Customer tidak ditemukan' });

    let totalVoucher2000 = 0, totalVoucher5000 = 0;
    let percent = 0, result2000 = 0, result5000 = 0, penerimaanToko = 0, setoran = 0;

    if (c.type === 'toko') {
      percent = Number(c.percent || 0);
      if (percent > 1) percent = percent / 100;
      if (percent < 0) percent = 0;
      if (percent > 1) percent = 1;

      const rows = await VoucherShipment.find({
        customerId,
        date: { $gte: new Date(startDate), $lte: new Date(endDate) }
      });

      for (const r of rows) {
        if (r.voucherType === 2000) totalVoucher2000 += r.quantity;
        if (r.voucherType === 5000) totalVoucher5000 += r.quantity;
      }

      const used2000 = Math.max(totalVoucher2000 - Number(remaining2000 || 0), 0);
      const used5000 = Math.max(totalVoucher5000 - Number(remaining5000 || 0), 0);

      result2000 = used2000 * 2000;
      result5000 = used5000 * 5000;
      const totalHasil = result2000 + result5000;

      penerimaanToko = Math.round(totalHasil * percent);
      setoran = Math.max(Math.round(totalHasil - penerimaanToko), 0); // jangan minus
    } else if (c.type === 'bulanan') {
      percent = 0;
      result2000 = 0;
      result5000 = 0;
      penerimaanToko = 0;
      setoran = Number(c.monthlyAmount || 0);
    }

    const bill = await Billing.create({
      customerId, startDate, endDate,
      totalVoucher2000, totalVoucher5000,
      remaining2000, remaining5000,
      result2000, result5000,
      percent, penerimaanToko, setoran
    });

    res.json(bill);
  } catch(err){ res.status(500).json({msg: err.message}); }
});

app.get('/api/billings', auth, async (req,res)=>{
  try {
    const { from, to, type } = req.query;
    const q = {};
    if (from || to) {
      q.createdAt = {};
      if (from) q.createdAt.$gte = new Date(from);
      if (to) q.createdAt.$lte = new Date(to);
    }
    let rows = await Billing.find(q).populate('customerId','name type');
    if (type === 'toko' || type === 'bulanan') {
      rows = rows.filter(r => r.customerId?.type === type);
    }
    res.json(rows);
  } catch(err){ res.status(500).json({msg: err.message}); }
});

app.delete('/api/billings/:id', auth, async (req,res)=>{
  try {
    const bill = await Billing.findByIdAndDelete(req.params.id);
    if (!bill) return res.status(404).json({ msg: 'Tagihan tidak ditemukan' });
    res.json({ ok:true, msg:'Tagihan dihapus' });
  } catch(err){ res.status(500).json({msg: err.message}); }
});

app.get('/api/billings/:id/invoice.pdf', auth, async (req,res)=>{
  try {
    const bill = await Billing.findById(req.params.id)
      .populate('customerId','name type percent monthlyAmount');
    if (!bill) return res.status(404).json({ msg: 'Tagihan tidak ditemukan' });

    res.setHeader('Content-Type','application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="invoice-${bill._id}.pdf"`);

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    doc.pipe(res);

    doc.fontSize(16).text('INVOICE PENAGIHAN', { align: 'center' });
    doc.moveDown(0.5).fontSize(10).text(`Dicetak: ${dayjs().format('YYYY-MM-DD HH:mm')}`, { align: 'center' }).moveDown(1);
    doc.fontSize(12).text('Indiegonet').fontSize(10).text('Manajemen Pelanggan & Penagihan').moveDown(1);
    doc.fontSize(11).text(`Pelanggan: ${bill.customerId?.name || '-'}`);
    doc.text(`Jenis: ${bill.customerId?.type || '-'}`);
    doc.text(`Periode: ${dayjs(bill.startDate).format('YYYY-MM-DD')} s/d ${dayjs(bill.endDate).format('YYYY-MM-DD')}`).moveDown(1);

    if (bill.customerId?.type === 'toko') {
      const total2000 = bill.totalVoucher2000 || 0;
      const total5000 = bill.totalVoucher5000 || 0;
      const sisa2000 = bill.remaining2000 || 0;
      const sisa5000 = bill.remaining5000 || 0;
      const terpakai2000 = Math.max(total2000 - sisa2000, 0);
      const terpakai5000 = Math.max(total5000 - sisa5000, 0);
      const hasil2000 = terpakai2000 * 2000;
      const hasil5000 = terpakai5000 * 5000;
      const persen = (bill.percent>1) ? bill.percent/100 : (bill.percent||0);
      const totalHasil = hasil2000 + hasil5000;
      const penerimaanToko = Math.round(totalHasil * persen);
      const setoran = Math.max(Math.round(totalHasil - penerimaanToko), 0);

      doc.fontSize(12).text('Rincian Toko', { underline: true }).moveDown(0.5);
      doc.fontSize(10)
        .text(`Vocer 2.000 - Total: ${total2000}  |  Sisa: ${sisa2000}  |  Terpakai: ${terpakai2000}  |  Hasil: ${rupiah(hasil2000)}`)
        .text(`Vocer 5.000 - Total: ${total5000}  |  Sisa: ${sisa5000}  |  Terpakai: ${terpakai5000}  |  Hasil: ${rupiah(hasil5000)}`)
        .moveDown(0.5)
        .text(`Persenan Toko: ${(persen*100).toFixed(2)}%`)
        .text(`Penerimaan Toko: ${rupiah(penerimaanToko)}`)
        .text(`Setoran: ${rupiah(setoran)}`);
      doc.moveDown(1).fontSize(12).text('Ringkasan', { underline: true });
      doc.fontSize(11).text(`Total Hasil: ${rupiah(totalHasil)}`);
      doc.fontSize(11).text(`Setoran yang Harus Dibayar: ${rupiah(setoran)}`);
    } else {
      const jumlah = bill.setoran || bill.customerId?.monthlyAmount || 0;
      doc.fontSize(12).text('Rincian Bulanan', { underline: true }).moveDown(0.5);
      doc.fontSize(11).text(`Jumlah Pembayaran Bulanan: ${rupiah(jumlah)}`);
      doc.moveDown(1).fontSize(12).text('Ringkasan', { underline: true });
      doc.fontSize(11).text(`Setoran yang Harus Dibayar: ${rupiah(jumlah)}`);
    }

    doc.moveDown(2).fontSize(10).text('Catatan: Simpan invoice ini sebagai bukti penagihan.', { italics: true });
    doc.end();
  } catch(err){ res.status(500).json({msg: err.message}); }
});

// ---------- Reports CSV ----------
app.get('/api/reports/csv', auth, async (req,res)=>{
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

// ---------- Messages ----------
app.get('/api/messages', auth, async (req,res)=>{
  try { res.json(await Message.find().sort({createdAt:-1})); }
  catch(err){ res.status(500).json({msg: err.message}); }
});
app.post('/api/messages', auth, async (req,res)=>{
  try {
    const { subject, body } = req.body;
    const m = await Message.create({ subject, body });
    res.json(m);
  } catch(err){ res.status(500).json({msg: err.message}); }
});
app.put('/api/messages/:id/read', auth, async (req,res)=>{
  try {
    const m = await Message.findByIdAndUpdate(req.params.id, { status:'read' }, { new: true });
    if (!m) return res.status(404).json({ msg: 'Pesan tidak ditemukan' });
    res.json(m);
  } catch(err){ res.status(500).json({msg: err.message}); }
});
app.delete('/api/messages/:id', auth, async (req,res)=>{
  try {
    const m = await Message.findByIdAndDelete(req.params.id);
    if (!m) return res.status(404).json({ msg: 'Pesan tidak ditemukan' });
    res.json({ ok:true, msg:'Pesan dihapus' });
  } catch(err){ res.status(500).json({msg: err.message}); }
});

// ---------- Banners ----------
app.get('/api/banners', auth, async (req,res)=>{
  try {
    res.json(await Banner.find().sort({createdAt:-1}));
  } catch(err){ res.status(500).json({msg: err.message}); }
});
app.post('/api/banners', auth, async (req,res)=>{
  try {
    const b = await Banner.create({
      imageUrl: req.body.imageUrl,
      title: req.body.title,
      active: !!req.body.active
    });
    res.json(b);
  } catch(err){ res.status(500).json({msg: err.message}); }
});
app.put('/api/banners/:id', auth, async (req,res)=>{
  try {
    const b = await Banner.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!b) return res.status(404).json({ msg: 'Banner tidak ditemukan' });
    res.json(b);
  } catch(err){ res.status(500).json({msg: err.message}); }
});
app.delete('/api/banners/:id', auth, async (req,res)=>{
  try {
    const b = await Banner.findByIdAndDelete(req.params.id);
    if (!b) return res.status(404).json({ msg: 'Banner tidak ditemukan' });
    res.json({ ok:true, msg:'Banner dihapus' });
  } catch(err){ res.status(500).json({msg: err.message}); }
});

// ---------- Static: Serve React build ----------
// Build dulu di: D:/indiegonet-app/frontend  →  npm run build
const clientDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(clientDist));
// Fallback ke index.html untuk route FE (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
