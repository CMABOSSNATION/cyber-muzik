const express = require('express');
const router = express.Router();
const Gift = require('../models/Gift');
const Artist = require('../models/Artist');

// Send a gift
router.post('/send', async (req, res) => {
  try {
    const { fromName, toArtistId, toArtistName, amount, phone, message } = req.body;
    if (!amount || amount < 1000) return res.status(400).json({ success: false, error: "Minimum gift is UGX 1,000" });
    if (!phone) return res.status(400).json({ success: false, error: "Phone number required" });

    const platformFee = Math.round(amount * 0.25);
    const artistAmount = amount - platformFee;

    const gift = await Gift.create({
      fromName: fromName || "Anonymous",
      toArtistId,
      toArtistName,
      amount,
      platformFee,
      artistAmount,
      phone,
      message,
      status: "pending"
    });

    res.status(201).json({
      success: true,
      message: `Gift of UGX ${amount.toLocaleString()} sent! Artist receives UGX ${artistAmount.toLocaleString()} after 25% platform fee.`,
      gift
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get gifts for an artist
router.get('/artist/:artistId', async (req, res) => {
  try {
    const gifts = await Gift.find({ toArtistId: req.params.artistId }).sort({ createdAt: -1 });
    const total = gifts.reduce((sum, g) => sum + g.artistAmount, 0);
    res.json({ success: true, gifts, totalEarned: total });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
