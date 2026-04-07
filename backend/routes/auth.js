const express = require('express');
const router  = express.Router();
const Artist  = require('../models/Artist');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');

// Use env var or a hard fallback so JWT never crashes
const JWT_SECRET = process.env.JWT_SECRET || 'cybermuzik_secret_2026_fallback';

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, bio, profilePhoto, coverPhoto, mobileNumber } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ success: false, error: 'Username, email and password are required.' });

    const existing = await Artist.findOne({ email: email.toLowerCase().trim() });
    if (existing)
      return res.status(400).json({ success: false, error: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 10);
    const artist = await Artist.create({
      username: username.trim(),
      email:    email.toLowerCase().trim(),
      password: hashed,
      bio:      bio || '',
      profilePhoto: profilePhoto || '',
      coverPhoto:   coverPhoto   || '',
      mobileNumber: mobileNumber || ''
    });

    const token = jwt.sign({ id: artist._id }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({
      success: true, token,
      artist: { _id: artist._id, username: artist.username, email: artist.email, bio: artist.bio, profilePhoto: artist.profilePhoto, coverPhoto: artist.coverPhoto, mobileNumber: artist.mobileNumber }
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ success: false, error: 'Registration failed: ' + err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, error: 'Email and password are required.' });

    const artist = await Artist.findOne({ email: email.toLowerCase().trim() });
    if (!artist)
      return res.status(400).json({ success: false, error: 'No account found with this email.' });

    const match = await bcrypt.compare(password, artist.password);
    if (!match)
      return res.status(400).json({ success: false, error: 'Wrong password. Please try again.' });

    const token = jwt.sign({ id: artist._id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({
      success: true, token,
      artist: { _id: artist._id, username: artist.username, email: artist.email, bio: artist.bio, profilePhoto: artist.profilePhoto, coverPhoto: artist.coverPhoto, mobileNumber: artist.mobileNumber }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, error: 'Login failed: ' + err.message });
  }
});

router.get('/profile/:id', async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id).select('-password');
    if (!artist) return res.status(404).json({ success: false, error: 'Artist not found.' });
    res.json({ success: true, data: artist });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/check-email', async (req, res) => {
  try {
    const artist = await Artist.findOne({ email: (req.body.email || '').toLowerCase().trim() });
    if (!artist) return res.status(400).json({ success: false, error: 'No account found with this email.' });
    res.json({ success: true, message: 'Email found.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const artist = await Artist.findOne({ email: (email || '').toLowerCase().trim() });
    if (!artist) return res.status(400).json({ success: false, error: 'No account found with this email.' });
    artist.password = await bcrypt.hash(newPassword, 10);
    await artist.save();
    res.json({ success: true, message: 'Password reset successfully! You can now log in.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
