const express = require('express');
const cors    = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Allow ALL origins — prevents any CORS block from any Vercel URL
app.use(cors({ origin: true, methods: ['GET','POST','PUT','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'], credentials: true }));
app.options('*', cors());
app.use(express.json());

app.get('/', (_req, res) => res.status(200).json({ ok: true, msg: 'CyberMuzik API online 🚀' }));

app.use('/api/tracks', require('./routes/tracks'));
app.use('/api/auth',   require('./routes/auth'));
app.use('/api/gifts',  require('./routes/gifts'));

const dbURI = process.env.MONGO_URI;
if (!dbURI) {
  console.warn('⚠️  MONGO_URI missing — add it in Render → Environment');
} else {
  mongoose.connect(dbURI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB:', err.message));
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`📡 Running on port ${PORT}`));
