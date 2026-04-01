const express = require('express');
const router = express.Router();
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const Gift = require('../models/Gift');
const Artist = require('../models/Artist');
const Track = require('../models/tracks');

// ── Gift card codes ─────────────────────────────────────────────
const GIFT_CARDS = {
  "CYBER100": 1000,
  "CYBER500": 5000,
  "CYBER1K":  10000,
  "CYBERVIP": 50000
};

// ── Platform fee — NEVER exposed in public responses ─────────────
const PLATFORM_PCT = 0.25;

// ── EasyPay Uganda helpers ──────────────────────────────────────
// EasyPay (pesapal.com) Uganda: supports MTN MoMo + Airtel Money
// Docs: https://developer.pesapal.com
// Set these in Render env vars:
//   EASYPAY_CONSUMER_KEY    — from PesaPal dashboard
//   EASYPAY_CONSUMER_SECRET — from PesaPal dashboard
//   EASYPAY_IPN_ID          — register IPN URL in dashboard first
//   EASYPAY_ENV             — "sandbox" or "live"

async function getEasyPayToken() {
  const base = process.env.EASYPAY_ENV === 'live'
    ? 'https://pay.pesapal.com/v3'
    : 'https://cybqa.pesapal.com/pesapalv3';

  const res = await axios.post(`${base}/api/Auth/RequestToken`, {
    consumer_key:    process.env.EASYPAY_CONSUMER_KEY,
    consumer_secret: process.env.EASYPAY_CONSUMER_SECRET
  }, { headers: { Accept: 'application/json', 'Content-Type': 'application/json' } });

  return { token: res.data.token, base };
}

async function submitOrder({ amount, phone, description, reference }) {
  const { token, base } = await getEasyPayToken();

  const cleanPhone = phone.replace(/\D/g, '');
  const e164 = cleanPhone.startsWith('256')
    ? `+${cleanPhone}`
    : `+256${cleanPhone.replace(/^0/, '')}`;

  const payload = {
    id:                 reference,
    currency:           'UGX',
    amount,
    description,
    callback_url:       process.env.EASYPAY_CALLBACK_URL || 'https://cyber-muzik.vercel.app',
    notification_id:    process.env.EASYPAY_IPN_ID || '',
    billing_address: {
      phone_number: e164,
      email_address: 'pay@cybermuzik.app',
      first_name: 'CyberMuzik',
      last_name:  'User'
    }
  };

  const res = await axios.post(`${base}/api/Transactions/SubmitOrderRequest`, payload, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  return res.data; // { order_tracking_id, redirect_url, merchant_reference, status }
}

async function getTransactionStatus(orderTrackingId) {
  const { token, base } = await getEasyPayToken();
  const res = await axios.get(
    `${base}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
    { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

// ── Fallback: simulate payment in sandbox when keys not set ──────
function isMockMode() {
  return !process.env.EASYPAY_CONSUMER_KEY || process.env.EASYPAY_ENV === 'mock';
}

// ────────────────────────────────────────────────────────────────
// POST /api/gifts/send  — fan gifts an artist
// ────────────────────────────────────────────────────────────────
router.post('/send', async (req, res) => {
  try {
    const { fromName, toArtistId, toArtistName, amount, senderPhone, message, giftCard, trackId } = req.body;

    let finalAmount = Number(amount) || 0;
    if (giftCard) {
      const cv = GIFT_CARDS[(giftCard || '').toUpperCase().trim()];
      if (!cv) return res.status(400).json({ success: false, error: 'Invalid gift card code.' });
      finalAmount = cv;
    }

    if (!finalAmount || finalAmount < 1000)
      return res.status(400).json({ success: false, error: 'Minimum gift is UGX 1,000' });

    const cleanPhone = (senderPhone || '').replace(/\D/g, '');
    if (cleanPhone.length < 9)
      return res.status(400).json({ success: false, error: 'Enter a valid MTN or Airtel mobile money number' });

    const artist = await Artist.findById(toArtistId);
    if (!artist) return res.status(404).json({ success: false, error: 'Artist not found.' });

    const platformFee  = Math.round(finalAmount * PLATFORM_PCT);
    const artistAmount = finalAmount - platformFee;
    const reference    = `gift-${uuidv4()}`;

    // ── EasyPay / PesaPal charge ─────────────────────────────────
    let orderTrackingId = '';
    let redirectUrl     = '';

    if (isMockMode()) {
      // Sandbox / demo mode — skip real charge, mark pending
      orderTrackingId = `mock-${reference}`;
    } else {
      try {
        const order = await submitOrder({
          amount: finalAmount,
          phone:  cleanPhone,
          description: `Gift to ${toArtistName} on CyberMuzik`,
          reference
        });
        orderTrackingId = order.order_tracking_id || '';
        redirectUrl     = order.redirect_url || '';
        if (!orderTrackingId)
          return res.status(502).json({ success: false, error: order.error || 'Payment initiation failed.' });
      } catch (payErr) {
        return res.status(502).json({
          success: false,
          error: 'Payment initiation failed. Check your number and try again.',
          detail: payErr.response?.data?.message || payErr.message
        });
      }
    }

    // ── Save record (pending until verified) ─────────────────────
    const gift = await Gift.create({
      fromName:     (fromName || 'Anonymous').trim(),
      toArtistId,   toArtistName,
      amount:       finalAmount,
      platformFee,  artistAmount,
      senderPhone:  cleanPhone,
      artistPhone:  artist.mobileNumber || '',
      message:      (message || '').trim(),
      giftCard:     giftCard ? giftCard.toUpperCase().trim() : '',
      txRef:        reference,
      orderRef:     orderTrackingId,
      status:       'pending'
    });

    if (trackId) {
      await Track.findByIdAndUpdate(trackId, {
        $push: { gifters: { name: (fromName || 'Anonymous').trim(), amount: finalAmount, createdAt: new Date() } }
      });
    }

    res.status(201).json({
      success:        true,
      orderTrackingId,
      redirectUrl,
      mock:           isMockMode(),
      txRef:          reference,
      message:        isMockMode()
        ? `🎁 Demo mode: gift to ${toArtistName} recorded. Add EasyPay keys for live payments.`
        : `📱 Payment initiated! Complete on your phone then tap Confirm.`,
      gift: { fromName: gift.fromName, toArtistName: gift.toArtistName, message: gift.message, createdAt: gift.createdAt }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ────────────────────────────────────────────────────────────────
// POST /api/gifts/verify  — confirm payment after user pays
// ────────────────────────────────────────────────────────────────
router.post('/verify', async (req, res) => {
  try {
    const { orderTrackingId, txRef } = req.body;

    if (isMockMode()) {
      // Demo mode — auto-approve
      await Gift.findOneAndUpdate({ txRef }, { status: 'completed' });
      return res.json({ success: true, paid: true, status: 'COMPLETED', message: '✅ Demo payment confirmed!' });
    }

    if (!orderTrackingId)
      return res.status(400).json({ success: false, error: 'orderTrackingId required' });

    const statusData = await getTransactionStatus(orderTrackingId);
    const isPaid = statusData.payment_status_description === 'Completed';

    await Gift.findOneAndUpdate(
      { orderRef: orderTrackingId },
      { status: isPaid ? 'completed' : (statusData.payment_status_description || 'pending').toLowerCase() }
    );

    res.json({
      success: true,
      paid:    isPaid,
      status:  statusData.payment_status_description,
      message: isPaid
        ? '✅ Payment confirmed! Gift sent successfully.'
        : statusData.payment_status_description === 'Pending'
          ? '⏳ Payment still pending. Complete on your phone then try again.'
          : '❌ Payment not completed. Try again.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ────────────────────────────────────────────────────────────────
// GET /api/gifts/artist/:artistId — dashboard (no fees/phones)
// ────────────────────────────────────────────────────────────────
router.get('/artist/:artistId', async (req, res) => {
  try {
    const gifts = await Gift.find({ toArtistId: req.params.artistId, status: 'completed' })
      .select('fromName toArtistName artistAmount message giftCard createdAt')
      .sort({ createdAt: -1 })
      .limit(50);
    const totalEarned = gifts.reduce((s, g) => s + (g.artistAmount || 0), 0);
    res.json({ success: true, gifts, totalEarned });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ────────────────────────────────────────────────────────────────
// POST /api/gifts/promote  — artist pays to promote track
// ────────────────────────────────────────────────────────────────
router.post('/promote', async (req, res) => {
  try {
    const { trackId, phone, days } = req.body;

    if (!trackId) return res.status(400).json({ success: false, error: 'Track ID required' });
    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (cleanPhone.length < 9)
      return res.status(400).json({ success: false, error: 'Enter a valid mobile money number' });

    const prices      = { 1:1000, 3:2500, 7:5000, 14:8000, 30:15000 };
    const selectedDays = Number(days) || 7;
    const price        = prices[selectedDays] || 5000;

    const track = await Track.findById(trackId);
    if (!track) return res.status(404).json({ success: false, error: 'Track not found.' });

    const reference = `promo-${uuidv4()}`;
    let orderTrackingId = '';

    if (!isMockMode()) {
      try {
        const order = await submitOrder({
          amount: price, phone: cleanPhone,
          description: `Promote "${track.title}" on CyberMuzik for ${selectedDays} day(s)`,
          reference
        });
        orderTrackingId = order.order_tracking_id || '';
        if (!orderTrackingId)
          return res.status(502).json({ success: false, error: order.error || 'Payment initiation failed.' });
      } catch (payErr) {
        return res.status(502).json({
          success: false,
          error: 'Payment failed. Check your number and try again.',
          detail: payErr.response?.data?.message || payErr.message
        });
      }
    } else {
      orderTrackingId = `mock-${reference}`;
    }

    // Extend from current expiry if already promoted
    const now = new Date();
    const base = track.promotedUntil && new Date(track.promotedUntil) > now
      ? new Date(track.promotedUntil) : now;
    base.setDate(base.getDate() + selectedDays);

    // In mock mode, activate immediately. In live, activate after verify.
    if (isMockMode()) {
      await Track.findByIdAndUpdate(trackId, { promoted: true, promotedUntil: base });
    }

    res.json({
      success: true, orderTrackingId, txRef: reference, mock: isMockMode(),
      promotedUntil: base, days: selectedDays, price,
      message: isMockMode()
        ? `⭐ Demo: track promoted for ${selectedDays} day(s). Add EasyPay keys for live payments.`
        : `📱 Pay UGX ${price.toLocaleString()} on your phone then tap Confirm.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ────────────────────────────────────────────────────────────────
// POST /api/gifts/promote/verify — confirm promotion payment
// ────────────────────────────────────────────────────────────────
router.post('/promote/verify', async (req, res) => {
  try {
    const { orderTrackingId, trackId, days } = req.body;

    if (isMockMode()) {
      // Already activated in /promote for mock mode
      return res.json({ success: true, paid: true, status: 'COMPLETED', message: '✅ Demo promotion confirmed!' });
    }

    if (!orderTrackingId) return res.status(400).json({ success: false, error: 'orderTrackingId required' });

    const statusData = await getTransactionStatus(orderTrackingId);
    const isPaid = statusData.payment_status_description === 'Completed';

    if (isPaid && trackId) {
      const prices = { 1:1000, 3:2500, 7:5000, 14:8000, 30:15000 };
      const selectedDays = Number(days) || 7;
      const track = await Track.findById(trackId);
      const now = new Date();
      const base = track?.promotedUntil && new Date(track.promotedUntil) > now
        ? new Date(track.promotedUntil) : now;
      base.setDate(base.getDate() + selectedDays);
      await Track.findByIdAndUpdate(trackId, { promoted: true, promotedUntil: base });
    }

    res.json({
      success: true, paid: isPaid,
      status:  statusData.payment_status_description,
      message: isPaid
        ? '✅ Payment confirmed! Track is now featured.'
        : '⏳ Still pending — complete payment on your phone then try again.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ────────────────────────────────────────────────────────────────
// POST /api/gifts/ipn  — EasyPay webhook (optional)
// ────────────────────────────────────────────────────────────────
router.post('/ipn', async (req, res) => {
  try {
    const { OrderTrackingId, OrderMerchantReference, OrderNotificationType } = req.body;
    if (OrderNotificationType === 'IPNCHANGE') {
      const statusData = await getTransactionStatus(OrderTrackingId);
      const isPaid = statusData.payment_status_description === 'Completed';
      if (isPaid) {
        await Gift.findOneAndUpdate({ orderRef: OrderTrackingId }, { status: 'completed' });
      }
    }
    res.status(200).json({ orderNotificationType: 'IPNCHANGE', orderTrackingId: OrderTrackingId, orderMerchantReference: OrderMerchantReference });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
