const express = require('express');
const cors = require('cors');
require('dotenv').config();

const trackRoutes = require('./routes/tracks');
const artistRoutes = require('./routes/artists');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/tracks', trackRoutes);
app.use('/api/artists', artistRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`CyberMuzik API running on port ${PORT}`));
