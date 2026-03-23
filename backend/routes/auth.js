const express = require('express');
const router = express.Router();
const Artist = require('../models/Artist');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ── REGISTER ──
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, bio, profilePhoto, coverPhoto } = req.body;
    const existing = await Artist.findOne({ email });
    if (existing) return res.status(400).json({ success: false, error: "Email already registered." });
    const hashed = await bcrypt.hash(password, 10);
    const artist = await Artist.create({ username, email, password: hashed, bio, profilePhoto, coverPhoto });
    const token = jwt.sign({ id: artist._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ success: true, token, artist: { _id: artist._id, username: artist.username, email: artist.email, bio: artist.bio, profilePhoto: artist.profilePhoto, coverPhoto: artist.coverPhoto }});
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── LOGIN ──
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const artist = await Artist.findOne({ email });
    if (!artist) return res.status(400).json({ success: false, error: "No account found with this email." });
    const match = await bcrypt.compare(password, artist.password);
    if (!match) return res.status(400).json({ success: false, error: "Wrong password. Please try again." });
    const token = jwt.sign({ id: artist._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, artist: { _id: artist._id, username: artist.username, email: artist.email, bio: artist.bio, profilePhoto: artist.profilePhoto, coverPhoto: artist.coverPhoto }});
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET PROFILE ──
router.get('/profile/:id', async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id).select('-password');
    if (!artist) return res.status(404).json({ success: false, error: "Artist not found." });
    res.json({ success: true, data: artist });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── RESET PASSWORD ──
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const artist = await Artist.findOne({ email });
    if (!artist) return res.status(400).json({ success: false, error: "No account found with this email." });
    const hashed = await bcrypt.hash(newPassword, 10);
    artist.password = hashed;
    await artist.save();
    res.json({ success: true, message: "Password reset successfully! You can now log in." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
