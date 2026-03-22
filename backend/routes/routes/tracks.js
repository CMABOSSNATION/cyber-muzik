const express = require('express');
const router = express.Router();
const Track = require('../models/tracks');
const jwt = require('jsonwebtoken');

// ── AUTH MIDDLEWARE ──
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: "No token provided." });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.artist = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid token." });
  }
};

// ── GET ALL TRACKS ──
router.get('/', async (req, res) => {
  try {
    const tracks = await Track.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tracks.length, data: tracks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── ADD TRACK ──
router.post('/add', protect, async (req, res) => {
  try {
    const Artist = require('../models/Artist');
    const artistDoc = await Artist.findById(req.artist.id);
    const newTrack = await Track.create({
      ...req.body,
      artistId: req.artist.id,
      artistPhoto: artistDoc?.profilePhoto || "",
      artistCover: artistDoc?.coverPhoto || ""
    });
    res.status(201).json({ success: true, data: newTrack });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ── GET ARTIST'S OWN TRACKS ──
router.get('/artist/mytracks', protect, async (req, res) => {
  try {
    const tracks = await Track.find({ artistId: req.artist.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: tracks.length, data: tracks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── HOT 100 ──
router.get('/charts/hot100', async (req, res) => {
  try {
    const tracks = await Track.find().sort({ plays: -1 }).limit(100);
    res.json({ success: true, data: tracks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── SEED ROUTE ──
router.get('/seed', async (req, res) => {
  try {
    const sampleTrack = await Track.create({
      title: "Cyber Dream",
      artist: "Digital Ghost",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      coverImage: "",
      duration: "3:45"
    });
    res.status(201).json({ message: "Success!", data: sampleTrack });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── RECORD A PLAY ──
router.post('/:id/play', async (req, res) => {
  try {
    const track = await Track.findByIdAndUpdate(
      req.params.id,
      { $inc: { plays: 1 } },
      { new: true }
    );
    if (!track) return res.status(404).json({ success: false, message: "Track not found." });
    res.json({ success: true, plays: track.plays });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── RECORD A DOWNLOAD ──
router.post('/:id/download', async (req, res) => {
  try {
    const track = await Track.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );
    if (!track) return res.status(404).json({ success: false, message: "Track not found." });
    res.json({ success: true, downloads: track.downloads });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── LIKE A TRACK ──
router.post('/:id/like', async (req, res) => {
  try {
    const track = await Track.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!track) return res.status(404).json({ success: false, message: "Track not found." });
    res.json({ success: true, likes: track.likes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── DELETE TRACK ──
router.delete('/:id', protect, async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) return res.status(404).json({ success: false, message: "Track not found." });
    if (track.artistId?.toString() !== req.artist.id) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this track." });
    }
    await track.deleteOne();
    res.json({ success: true, message: "Track deleted successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET SINGLE TRACK — must be LAST ──
router.get('/:id', async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) return res.status(404).json({ success: false, message: "Track not found." });
    res.json({ success: true, data: track });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
