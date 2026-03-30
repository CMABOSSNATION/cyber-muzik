const express = require('express');
const router = express.Router();
const Gift = require('../models/Gift');
const Artist = require('../models/Artist');
const Track = require('../models/tracks');

const GIFT_CARDS = {
  "CYBER100": 1000,
  "CYBER500": 5000,
  "CYBER1K": 10000,
  "CYBERVIP": 50000
};

router.post('/send', async (req, res) => {
  try {
    const { fromName, toArtistId, toArtistName, amount, senderPhone, message, giftCard, trackId } = req.body;

    let finalAmount = amount;
    if (giftCard) {
      const cardValue = GIFT_CARDS[giftCard.toUpperCase()];
      if (!cardValue) return res.status(400).json({ success: false, error: "Invalid gift card code." });
      finalAmount = cardValue;
    }

    if (!finalAmount || finalAmount < 1000) return res.status(400).json({ success: false, error: "Minimum gift is UGX 1,000" });
    if (!senderPhone) return res.status(400).json({ success: false, error: "Your phone number is required" });

    const artist = await Artist.findById(toArtistId);
    const artistPhone = artist?.mobileNumber || "";
    const platformFee = Math.round(finalAmount * 0.25);
    const artistAmount = finalAmount - platformFee;

    const gift = await Gift.create({
      fromName: fromName || "Anonymous",
      toArtistId, toArtistName,
      amount: finalAmount,
      platformFee, artistAmount,
      senderPhone, artistPhone,
      message, giftCard: giftCard || "",
      status: "pending"
    });

    if (trackId) {
      await Track.findByIdAndUpdate(trackId, {
        $push: { gifters: { name: fromName || "Anonymous", amount: finalAmount } }
      });
    }

    res.status(201).json({
      success: true,
      message: `🎁 Gift sent to ${toArtistName}! Thank you for your support.`,
      artistAmount,
      gift: {
        fromName: gift.fromName,
        toArtistName: gift.toArtistName,
        amount: gift.amount,
        artistAmount: gift.artistAmount,
        message: gift.message,
        createdAt: gift.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/artist/:artistId', async (req, res) => {
  try {
    const gifts = await Gift.find({ toArtistId: req.params.artistId })
      .select('fromName toArtistName amount artistAmount message giftCard createdAt')
      .sort({ createdAt: -1 });
    const totalEarned = gifts.reduce((sum, g) => sum + g.artistAmount, 0);
    res.json({ success: true, gifts, totalEarned });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/promote', async (req, res) => {
  try {
    const { trackId, phone, days } = req.body;
    if (!phone) return res.status(400).json({ success: false, error: "Phone number required" });
    const prices = { 1: 1000, 3: 2500, 7: 5000, 14: 8000, 30: 15000 };
    const price = prices[days] || 5000;
    const selectedDays = days || 7;
    const until = new Date();
    until.setDate(until.getDate() + selectedDays);
    await Track.findByIdAndUpdate(trackId, { promoted: true, promotedUntil: until });
    res.json({ success: true, message: `⭐ Track promoted for ${selectedDays} days!`, price, days: selectedDays, promotedUntil: until });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
