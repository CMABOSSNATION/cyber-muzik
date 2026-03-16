const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all statistics for the dashboard
router.get('/stats', async (req, res) => {
    const totalTracks = await db.query('SELECT COUNT(*) FROM tracks');
    const totalArtists = await db.query('SELECT COUNT(*) FROM artists');
    const totalDownloads = await db.query('SELECT SUM(download_count) FROM tracks');
    
    res.json({
        tracks: totalTracks.rows[0].count,
        artists: totalArtists.rows[0].count,
        downloads: totalDownloads.rows[0].sum || 0
    });
});

// VERIFY an artist (gives them the blue checkmark)
router.post('/verify-artist/:id', async (req, res) => {
    await db.query('UPDATE artists SET is_verified = true WHERE id = $1', [req.params.id]);
    res.json({ message: "Artist verified" });
});

// DELETE a track (for copyright or bad quality)
router.delete('/track/:id', async (req, res) => {
    await db.query('DELETE FROM tracks WHERE id = $1', [req.params.id]);
    res.json({ message: "Track deleted" });
});

module.exports = router;
