const express = require('express');
const router = express.Router();
const track = require('../models/tracks'); // Matches your file: models/tracks.js

// 1. GET all tracks from database
router.get('/', async (req, res) => {
    try {
        const tracks = await track.find(); // Use lowercase 'track'
        res.status(200).json({
            success: true,
            count: tracks.length,
            data: tracks
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. POST a new track
router.post('/add', async (req, res) => {
    try {
        const newTrack = await track.create(req.body); // Use lowercase 'track'
        res.status(201).json({ success: true, data: newTrack });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// 3. SEED ROUTE
router.get('/seed', async (req, res) => {
    try {
        const sampleTrack = await track.create({ // Use lowercase 'track'
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

module.exports = router;
