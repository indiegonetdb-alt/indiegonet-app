const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // ✅ relasi ke User (bukan Pelanggan)
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toAdmin: { type: Boolean, default: true },
  subject: { type: String, trim: true },
  body: { type: String, trim: true, alias: 'isi' }, // alias biar frontend bisa kirim 'isi'
  status: { type: String, enum: ['unread', 'read'], default: 'unread' },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Pastikan saat kirim response, field "isi" ikut terbawa
messageSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    if (ret.body && !ret.isi) ret.isi = ret.body;
    delete ret.__v;
    return ret;
  }
});
messageSchema.set('toObject', {
  virtuals: true,
  transform: (_doc, ret) => {
    if (ret.body && !ret.isi) ret.isi = ret.body;
    delete ret.__v;
    return ret;
  }
});

// Index untuk urutan terbaru
messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
