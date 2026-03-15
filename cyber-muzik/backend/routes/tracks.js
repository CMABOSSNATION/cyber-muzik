const express = require('express');
const router = express.Router();
const Track = require('../models/track'); // Import the Model

// 1. GET all tracks from database
router.get('/', async (req, res) => {
    try {
        const tracks = await Track.find();
        res.status(200).json({
            success: true,
            count: tracks.length,
            data: tracks
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. POST a new track (To add a song)
router.post('/add', async (req, res) => {
    try {
        const newTrack = await Track.create(req.body);
        res.status(201).json({ success: true, data: newTrack });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

module.exports = router;
// 3. SEED ROUTE: Visit your-url.onrender.com/api/tracks/seed to add a song
router.get('/seed', async (req, res) => {
    try {
        const sampleTrack = await Track.create({
            title: "Cyber Dream",
            artist: "Digital Ghost",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            coverImage: "https://via.placeholder.com/300",
            duration: "3:45"
        });
        res.status(201).json({ 
            message: "Success! First song added to CyberMuzik", 
            data: sampleTrack 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


