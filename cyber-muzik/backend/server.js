const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // 1. Added mongoose for DB connection
require('dotenv').config();

// 2. Critical: Ensure these paths match your folders EXACTLY (case-sensitive)
const trackroutes = require('./routes/tracks');
const artistroutes = require('./routes/artists');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Health Check (Render needs this to see the app is "Alive")
app.get('/', (req, res) => res.send('CyberMuzik API is active'));

// Routes
app.use('/api/tracks', trackroutes);
app.use('/api/artists', artistroutes);

// 3. Database Connection with Error Handling
// If this fails, the app will now tell you WHY instead of just "Status 1"
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`🚀 CyberMuzik API running on port ${PORT}`));
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1); // Force exit with info so Render logs show the error
    });

// 4. Global Safety Net for unexpected crashes
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥', err.name, err.message);
    process.exit(1);
});
