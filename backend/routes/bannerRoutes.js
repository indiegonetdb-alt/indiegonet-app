const express = require('express');
const Banner = require('../models/Banner');
const requireAuth = require('../middleware/auth');
const router = express.Router();

router.post('/', requireAuth, async (req,res)=>{
  try {
    const { imageUrl, title, active=true } = req.body;
    const b = await Banner.create({ imageUrl, title, active });
    res.json({ msg:'Banner ditambahkan', banner:b });
  } catch(err){ res.status(500).json({ msg: err.message }); }
});

router.get('/', async (req,res)=>{
  const rows = await Banner.find({ active:true });
  res.json(rows);
});

router.put('/:id', requireAuth, async (req,res)=>{
  const updated = await Banner.findByIdAndUpdate(req.params.id, req.body, {new:true});
  res.json(updated);
});

router.delete('/:id', requireAuth, async (req,res)=>{
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ msg:'Banner dihapus' });
});

module.exports = router;
