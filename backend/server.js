const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: function(origin, callback) {
    // Allow all vercel.app domains + localhost
    const allowed = [
      'https://cyber-muzik.vercel.app',
      'https://avenue-muzik.vercel.app',
      'https://avenue-muziks-projects.vercel.app',
      'http://localhost:3000'
    ];
    // Also allow any vercel preview URL and no-origin requests (mobile apps)
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now to prevent CORS blocking
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.options('*', cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send('CyberMuzik API is online 🚀');
});

const trackRoutes = require('./routes/tracks');
const authRoutes  = require('./routes/auth');
const giftRoutes  = require('./routes/gifts');

app.use('/api/tracks', trackRoutes);
app.use('/api/auth',   authRoutes);
app.use('/api/gifts',  giftRoutes);

const dbURI = process.env.MONGO_URI;
if (!dbURI) {
  console.warn('⚠️ MONGO_URI missing');
} else {
  mongoose.connect(dbURI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB error:', err.message));
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`📡 Server on port ${PORT}`));

