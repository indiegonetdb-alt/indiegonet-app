const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const requireAuth = require('../middleware/auth');
const router = express.Router();

// Seed admin if not exists
router.post('/seed-admin', async (req,res)=>{
  try {
    const exists = await User.findOne({ username: 'indiego' });
    if (exists) return res.json({ ok:true, msg:'Admin already exists' });
    const hash = await bcrypt.hash('net', 10);
    await User.create({ name:'Admin Indiegonet', username:'indiego', passwordHash:hash, role:'admin' });
    res.json({ ok:true, msg:'Admin seeded' });
  } catch(err){ res.status(500).json({msg: err.message}); }
});

router.post('/register', async (req, res) => {
  const { name, username, password, role, linkedCustomerId } = req.body;
  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ msg: 'Username sudah dipakai' });
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
      name, username, passwordHash, role,
      linkedCustomerId: role === 'pelanggan' ? linkedCustomerId : null
    });
    await newUser.save();
    res.json({ msg: 'User berhasil dibuat' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'User tidak ditemukan' });
    const validPass = await bcrypt.compare(password, user.passwordHash);
    if (!validPass) return res.status(400).json({ msg: 'Password salah' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, role: user.role, username: user.username, name: user.name, linkedCustomerId: user.linkedCustomerId });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

router.get('/me', requireAuth, async (req,res)=>{
  res.json({ userId: req.user.id, role: req.user.role });
});

module.exports = router;
