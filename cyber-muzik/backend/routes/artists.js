const express = require('express');
const router = express.Router();
const db = require('../db');

// GET artist details and their tracks
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Fetch artist info
        const artistRes = await db.query('SELECT * FROM artists WHERE id = $1', [id]);
        
        // Fetch tracks by this artist
        const tracksRes = await db.query('SELECT * FROM tracks WHERE artist_id = $1 ORDER BY created_at DESC', [id]);

        if (artistRes.rows.length === 0) {
            return res.status(404).json({ error: "Artist not found" });
        }

        res.json({
            artist: artistRes.rows[0],
            tracks: tracksRes.rows
        });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
