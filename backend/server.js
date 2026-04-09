const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: true, methods: ['GET','POST','PUT','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'], credentials: true }));
app.options('*', cors());
app.use(express.json());

// Health check
app.get('/', (_req, res) => res.status(200).json({ ok: true, msg: 'CyberMuzik API online 🚀' }));

app.use('/api/tracks', require('./routes/tracks'));
app.use('/api/auth',   require('./routes/auth'));
app.use('/api/gifts',  require('./routes/gifts'));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('📡 CyberMuzik running on port ' + PORT));
