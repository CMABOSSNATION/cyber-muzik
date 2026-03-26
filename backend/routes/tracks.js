const express = require('express');
const router = express.Router();
const Track = require('../models/tracks');
const jwt = require('jsonwebtoken');

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

// GET ALL TRACKS — promoted first, then by date
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const { genre, country } = req.query;
    let filter = {};
    if (genre && genre !== 'All') filter.genre = genre;
    if (country && country !== 'All') filter.country = country;

    const tracks = await Track.find(filter).sort({ createdAt: -1 });

    // Sort: active promoted first, then rest
    const promoted = tracks.filter(t => t.promoted && t.promotedUntil && new Date(t.promotedUntil) > now);
    const regular = tracks.filter(t => !t.promoted || !t.promotedUntil || new Date(t.promotedUntil) <= now);

    res.status(200).json({ success: true, count: tracks.length, data: [...promoted, ...regular] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ADD TRACK
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

// GET ARTIST OWN TRACKS
router.get('/artist/mytracks', protect, async (req, res) => {
  try {
    const tracks = await Track.find({ artistId: req.artist.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: tracks.length, data: tracks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// HOT 100
router.get('/charts/hot100', async (req, res) => {
  try {
    const tracks = await Track.find().sort({ plays: -1 }).limit(100);
    res.json({ success: true, data: tracks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PROMOTE TRACK
router.post('/:id/promote', protect, async (req, res) => {
  try {
    const { days } = req.body;
    const until = new Date();
    until.setDate(until.getDate() + (days || 7));
    const track = await Track.findByIdAndUpdate(
      req.params.id,
      { promoted: true, promotedUntil: until },
      { new: true }
    );
    if (!track) return res.status(404).json({ success: false, message: "Track not found." });
    res.json({ success: true, message: `Track promoted for ${days || 7} days!`, track });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// RECORD PLAY
router.post('/:id/play', async (req, res) => {
  try {
    const track = await Track.findByIdAndUpdate(req.params.id, { $inc: { plays: 1 } }, { new: true });
    if (!track) return res.status(404).json({ success: false, message: "Track not found." });
    res.json({ success: true, plays: track.plays });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// RECORD DOWNLOAD
router.post('/:id/download', async (req, res) => {
  try {
    const track = await Track.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } }, { new: true });
    if (!track) return res.status(404).json({ success: false, message: "Track not found." });
    res.json({ success: true, downloads: track.downloads });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// LIKE TRACK
router.post('/:id/like', async (req, res) => {
  try {
    const track = await Track.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
    if (!track) return res.status(404).json({ success: false, message: "Track not found." });
    res.json({ success: true, likes: track.likes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE TRACK
router.delete('/:id', protect, async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) return res.status(404).json({ success: false, message: "Track not found." });
    if (track.artistId?.toString() !== req.artist.id) return res.status(403).json({ success: false, message: "Not authorized." });
    await track.deleteOne();
    res.json({ success: true, message: "Track deleted successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET SINGLE TRACK — MUST BE LAST
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
