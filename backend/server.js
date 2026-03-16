const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// 1. Middleware
app.use(cors());
app.use(express.json());

// 2. Health Check (This tells Render your app is "Alive")
app.get('/', (req, res) => {
    res.status(200).send('CyberMuzik API is officially online 🚀');
});

// 3. Import Routes
// NOTE: Ensure your folder is named "routes" (lowercase) and file is "tracks.js"
const trackRoutes = require('./routes/tracks');
app.use('/api/tracks', trackRoutes);

// 4. Database Connection (Safe Mode)
const dbURI = process.env.MONGO_URI;

if (!dbURI) {
    console.warn('⚠️ WARNING: MONGO_URI is missing in Render Environment Variables.');
} else {
    mongoose.connect(dbURI)
        .then(() => console.log('✅ Connected to MongoDB Atlas'))
        .catch(err => {
            console.error('❌ MongoDB Connection Error:', err.message);
            // We DON'T use process.exit(1) here so the server stays up 
            // and you can fix the URI in Render settings.
        });
}

// 5. Start Port
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`📡 Server listening on port ${PORT}`);
});

