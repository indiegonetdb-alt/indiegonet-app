const mongoose = require("mongoose");

const PengirimanSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }, 
  pelanggan: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Pelanggan" 
  }, 
  tanggal: { 
    type: Date, 
    required: true, 
    default: Date.now 
  },
  namaPelanggan: { 
    type: String, 
    required: true 
  },
  v2000: { 
    type: Number, 
    default: 0 
  },
  v5000: { 
    type: Number, 
    default: 0 
  },
  status: { 
    type: String, 
    default: "Belum Ditagih" 
  }
});

module.exports = mongoose.model("Pengiriman", PengirimanSchema);
