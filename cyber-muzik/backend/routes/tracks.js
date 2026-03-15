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
app.get('/', (req, res) => res.send('Cybconst express = require('express');
const router = express.Router();

// 1. This handles requests to /api/tracks
router.get('/', (req, res) => {
    res.json({ message: "Tracks route is active and working!" });
});

// 2. Add more routes here later (e.g., router.post for adding songs)

// 3. CRITICAL: Export the router so server.js can use it
module.exports = router;
