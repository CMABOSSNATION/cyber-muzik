const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ 
  origin: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'] 
}));
app.options('*', cors());
app.use(express.json());

// Routes
app.get('/', (_, res) => res.status(200).json({ ok: true, msg: 'CyberMuzik API online 🚀' }));

app.use('/api/tracks', require('./routes/tracks'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/gifts', require('./routes/gifts'));

// Database Connection Logic
const dbURI = process.env.MONGO_URI;

if (!dbURI) {
  console.warn('⚠️ MONGO_URI missing - add it in Render -> Environment');
} else {
  // Option 3: Added connection options for stability
  mongoose.connect(dbURI)
    .then(() => {
      console.log('✅ MongoDB connected');
      
      // CRITICAL: Only start the server AFTER the database is connected
      const PORT = process.env.PORT || 10000;
      app.listen(PORT, () => console.log(`🛰️ Running on port ${PORT}`));
    })
    .catch(err => {
      console.error('❌ MongoDB Connection Error:', err.message);
      // This will show exactly why it's failing in your Render logs
    });
}
