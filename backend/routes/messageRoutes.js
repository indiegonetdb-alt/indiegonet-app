const express = require('express');
const Message = require('../models/Message');
const requireAuth = require('../middleware/auth');
const router = express.Router();

router.post('/', requireAuth, async (req,res)=>{
  try {
    const { subject, body } = req.body;
    const m = await Message.create({ fromUserId: req.user.id, subject, body });
    res.json({ msg:'Pesan terkirim', message:m });
  } catch(err){ res.status(500).json({ msg: err.message }); }
});

router.get('/', requireAuth, async (req,res)=>{
  try {
    const { status } = req.query;
    const q = {};
    if (status) q.status = status;
    const rows = await Message.find(q).sort({createdAt:-1});
    res.json(rows);
  } catch(err){ res.status(500).json({ msg: err.message }); }
});

router.put('/:id/read', requireAuth, async (req,res)=>{
  try {
    const m = await Message.findByIdAndUpdate(req.params.id, { status:'read' }, {new:true});
    res.json(m);
  } catch(err){ res.status(500).json({ msg: err.message }); }
});

router.delete('/:id', requireAuth, async (req,res)=>{
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ msg:'Pesan dihapus' });
  } catch(err){ res.status(500).json({ msg: err.message }); }
});

module.exports = router;
