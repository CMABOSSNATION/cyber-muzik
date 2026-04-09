const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const supabase = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'cybermuzik_secret_2026_fallback';

// Helper - format artist for response (never expose password)
function safeArtist(a) {
  return {
    _id: a.id, id: a.id,
    username: a.username, email: a.email,
    bio: a.bio || '', profilePhoto: a.profile_photo || '',
    coverPhoto: a.cover_photo || '', mobileNumber: a.mobile_number || ''
  };
}

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, bio, profilePhoto, coverPhoto, mobileNumber } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ success: false, error: 'Username, email and password are required.' });

    // Check existing
    const { data: existing } = await supabase
      .from('artists')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existing)
      return res.status(400).json({ success: false, error: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 10);

    const { data: artist, error } = await supabase
      .from('artists')
      .insert([{
        username: username.trim(),
        email: email.toLowerCase().trim(),
        password: hashed,
        bio: bio || '',
        profile_photo: profilePhoto || '',
        cover_photo: coverPhoto || '',
        mobile_number: mobileNumber || ''
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });

    const token = jwt.sign({ id: artist.id }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ success: true, token, artist: safeArtist(artist) });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ success: false, error: 'Registration failed: ' + err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, error: 'Email and password are required.' });

    const { data: artist, error } = await supabase
      .from('artists')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !artist)
      return res.status(400).json({ success: false, error: 'No account found with this email.' });

    const match = await bcrypt.compare(password, artist.password);
    if (!match)
      return res.status(400).json({ success: false, error: 'Wrong password. Please try again.' });

    const token = jwt.sign({ id: artist.id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, artist: safeArtist(artist) });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, error: 'Login failed: ' + err.message });
  }
});

// GET PROFILE
router.get('/profile/:id', async (req, res) => {
  try {
    const { data: artist, error } = await supabase
      .from('artists')
      .select('id, username, email, bio, profile_photo, cover_photo, mobile_number, created_at')
      .eq('id', req.params.id)
      .single();
    if (error || !artist) return res.status(404).json({ success: false, error: 'Artist not found.' });
    res.json({ success: true, data: safeArtist(artist) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CHECK EMAIL
router.post('/check-email', async (req, res) => {
  try {
    const { data: artist } = await supabase
      .from('artists')
      .select('id')
      .eq('email', (req.body.email || '').toLowerCase().trim())
      .single();
    if (!artist) return res.status(400).json({ success: false, error: 'No account found with this email.' });
    res.json({ success: true, message: 'Email found.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const { data: artist } = await supabase
      .from('artists')
      .select('id')
      .eq('email', (email || '').toLowerCase().trim())
      .single();
    if (!artist) return res.status(400).json({ success: false, error: 'No account found with this email.' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await supabase.from('artists').update({ password: hashed }).eq('id', artist.id);
    res.json({ success: true, message: 'Password reset successfully! You can now log in.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
