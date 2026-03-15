const router = require('express').Router();
const Playlist = require('../models/Playlist');
const auth = require('../middleware/auth'); // Your new security middleware

// Create a new playlist
router.post('/', auth, async (req, res) => {
  try {
    const newPlaylist = new Playlist({
      name: req.body.name,
      creator: req.user.id, // Pulled from the JWT token
      tracks: []
    });
    const saved = await newPlaylist.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Add a track to a playlist
router.post('/:id/add', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (playlist.creator.toString() !== req.user.id) return res.status(403).send("Not your playlist");

    playlist.tracks.push(req.body.trackId);
    await playlist.save();
    res.json({ message: "Track added successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
