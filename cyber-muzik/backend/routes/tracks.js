const express = require('express');
const router = express.Router();
const multer = require('multer');
const nodeID3 = require('node-id3');
const db = require('../db');
const upload = multer({ dest: 'uploads/' });

// GET all tracks
router.get('/', async (req, res) => {
    const { rows } = await db.query('SELECT tracks.*, artists.name as artist_name FROM tracks JOIN artists ON tracks.artist_id = artists.id ORDER BY created_at DESC');
    res.json(rows);
});

// UPLOAD and BRAND track
router.post('/upload', upload.single('song'), async (req, res) => {
    const { artistId, title } = req.body;
    const tempPath = req.file.path;

    const tags = { title, comment: "CyberMuzik.com", publisher: "CyberMuzik" };
    nodeID3.write(tags, tempPath);

    // Placeholder URL - In production, upload tempPath to S3/Cloudflare R2 here
    const fileUrl = `https://your-storage.com/${req.file.filename}.mp3`;

    const { rows } = await db.query(
        'INSERT INTO tracks (artist_id, title, file_url) VALUES ($1, $2, $3) RETURNING *',
        [artistId, title, fileUrl]
    );
    res.json(rows[0]);
});

module.exports = router;
