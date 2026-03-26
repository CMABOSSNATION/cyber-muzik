const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: [
    'https://cyber-muzik.vercel.app',
    'https://avenue-muzik.vercel.app',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.options('*', cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send('CyberMuzik API is officially online 🚀');
});

const trackRoutes = require('./routes/tracks');
const authRoutes = require('./routes/auth');
const giftRoutes = require('./routes/gifts');

app.use('/api/tracks', trackRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gifts', giftRoutes);

const dbURI = process.env.MONGO_URI;
if (!dbURI) {
  console.warn('⚠️ WARNING: MONGO_URI is missing.');
} else {
  mongoose.connect(dbURI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err.message));
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`📡 Server listening on port ${PORT}`);
});
