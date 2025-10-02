const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: ['http://localhost:5173','http://127.0.0.1:5173'],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.options('*', cors());
app.use(express.json());
app.use(morgan('dev'));

// health
app.get('/api/health', (req,res)=>res.json({ok:true, ts:Date.now()}));

// routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/voucher-shipments', require('./routes/voucherRoutes'));
app.use('/api/billings', require('./routes/billingRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/banners', require('./routes/bannerRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

mongoose.connect(process.env.MONGO_URI).then(()=>{
  console.log('✅ MongoDB Connected');
  const port = process.env.PORT || 5000;
  app.listen(port, ()=> console.log(`🚀 Server running on port ${port}`));
}).catch(err=>{
  console.error('MongoDB Error:', err);
});
