const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Artist = require('../models/Artist');

// ── REGISTER ──
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, bio, coverPhoto, profilePhoto } = req.body;

    // Check if email already exists
    const existing = await Artist.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered." });
    }

    // Check if username already exists
    const existingUsername = await Artist.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ success: false, message: "Username already taken." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create artist
    const artist = new Artist({
      username,
      email,
      password: hashedPassword,
      bio: bio || "",
      coverPhoto: coverPhoto || "",
      profilePhoto: profilePhoto || ""
    });

    await artist.save();

    // Generate token
    const token = jwt.sign(
      { id: artist._id, email: artist.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: "Artist registered successfully!",
      token,
      artist: {
        id: artist._id,
        username: artist.username,
        email: artist.email,
        bio: artist.bio,
        coverPhoto: artist.coverPhoto,
        profilePhoto: artist.profilePhoto
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── LOGIN ──
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find artist
    const artist = await Artist.findOne({ email });
    if (!artist) {
      return res.status(400).json({ success: false, message: "Invalid email or password." });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, artist.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password." });
    }

    // Generate token
    const token = jwt.sign(
      { id: artist._id, email: artist.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: "Login successful!",
      token,
      artist: {
        id: artist._id,
        username: artist.username,
        email: artist.email,
        bio: artist.bio,
        coverPhoto: artist.coverPhoto,
        profilePhoto: artist.profilePhoto
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET PROFILE ──
router.get('/profile/:id', async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id)
      .select('-password')
      .populate('tracks');
    if (!artist) {
      return res.status(404).json({ success: false, message: "Artist not found." });
    }
    res.json({ success: true, data: artist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
module.exports = router;

