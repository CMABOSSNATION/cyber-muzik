const express  = require('express');
const router   = express.Router();
const axios    = require('axios');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../db');

const GIFT_CARDS = { "CYBER100":1000, "CYBER500":5000, "CYBER1K":10000, "CYBERVIP":50000 };
const PLATFORM_PCT = 0.25;

// ── EasyPay / PesaPal Uganda ─────────────────────────────────────
async function getEasyPayToken() {
  const base = process.env.EASYPAY_ENV === 'live'
    ? 'https://pay.pesapal.com/v3'
    : 'https://cybqa.pesapal.com/pesapalv3';
  const res = await axios.post(`${base}/api/Auth/RequestToken`, {
    consumer_key: process.env.EASYPAY_CONSUMER_KEY,
    consumer_secret: process.env.EASYPAY_CONSUMER_SECRET
  }, { headers: { Accept: 'application/json', 'Content-Type': 'application/json' } });
  return { token: res.data.token, base };
}

async function submitOrder({ amount, phone, description, reference }) {
  const { token, base } = await getEasyPayToken();
  const clean = phone.replace(/\D/g, '');
  const e164  = clean.startsWith('256') ? `+${clean}` : `+256${clean.replace(/^0/, '')}`;
  const res = await axios.post(`${base}/api/Transactions/SubmitOrderRequest`, {
    id: reference, currency: 'UGX', amount, description,
    callback_url: process.env.EASYPAY_CALLBACK_URL || 'https://cyber-muzik.vercel.app',
    notification_id: process.env.EASYPAY_IPN_ID || '',
    billing_address: { phone_number: e164, email_address: 'pay@cybermuzik.app', first_name: 'CyberMuzik', last_name: 'User' }
  }, { headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
  return res.data;
}

async function getTransactionStatus(orderTrackingId) {
  const { token, base } = await getEasyPayToken();
  const res = await axios.get(`${base}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
    { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } });
  return res.data;
}

function isMockMode() {
  return !process.env.EASYPAY_CONSUMER_KEY || process.env.EASYPAY_ENV === 'mock';
}

// POST /api/gifts/send
router.post('/send', async (req, res) => {
  try {
    const { fromName, toArtistId, toArtistName, amount, senderPhone, message, giftCard, trackId } = req.body;
    let finalAmount = Number(amount) || 0;
    if (giftCard) {
      const cv = GIFT_CARDS[(giftCard || '').toUpperCase().trim()];
      if (!cv) return res.status(400).json({ success: false, error: 'Invalid gift card code.' });
      finalAmount = cv;
    }
    if (!finalAmount || finalAmount < 1000) return res.status(400).json({ success: false, error: 'Minimum gift is UGX 1,000' });
    const cleanPhone = (senderPhone || '').replace(/\D/g, '');
    if (cleanPhone.length < 9) return res.status(400).json({ success: false, error: 'Enter a valid MTN or Airtel mobile money number' });

    const { data: artist } = await supabase.from('artists').select('mobile_number').eq('id', toArtistId).single();
    const platformFee  = Math.round(finalAmount * PLATFORM_PCT);
    const artistAmount = finalAmount - platformFee;
    const reference    = `gift-${uuidv4()}`;

    let orderTrackingId = '';
    if (isMockMode()) {
      orderTrackingId = `mock-${reference}`;
    } else {
      try {
        const order = await submitOrder({ amount: finalAmount, phone: cleanPhone, description: `Gift to ${toArtistName} on CyberMuzik`, reference });
        orderTrackingId = order.order_tracking_id || '';
        if (!orderTrackingId) return res.status(502).json({ success: false, error: order.error || 'Payment initiation failed.' });
      } catch (payErr) {
        return res.status(502).json({ success: false, error: 'Payment failed. Check your number and try again.', detail: payErr.response?.data?.message || payErr.message });
      }
    }

    const { data: gift } = await supabase.from('gifts').insert([{
      from_name: (fromName || 'Anonymous').trim(),
      to_artist_id: toArtistId, to_artist_name: toArtistName,
      amount: finalAmount, platform_fee: platformFee, artist_amount: artistAmount,
      sender_phone: cleanPhone, artist_phone: artist?.mobile_number || '',
      message: (message || '').trim(), gift_card: giftCard ? giftCard.toUpperCase().trim() : '',
      tx_ref: reference, order_ref: orderTrackingId, status: 'pending'
    }]).select().single();

    // Add gifter to track
    if (trackId) {
      const { data: track } = await supabase.from('tracks').select('gifters').eq('id', trackId).single();
      const gifters = Array.isArray(track?.gifters) ? track.gifters : [];
      gifters.push({ name: (fromName || 'Anonymous').trim(), amount: finalAmount, createdAt: new Date().toISOString() });
      await supabase.from('tracks').update({ gifters }).eq('id', trackId);
    }

    res.status(201).json({
      success: true, orderTrackingId, txRef: reference, mock: isMockMode(),
      message: isMockMode()
        ? `🎁 Demo mode: gift to ${toArtistName} recorded.`
        : `📱 Payment initiated! Complete on your phone then tap Confirm.`,
      gift: { fromName: gift?.from_name, toArtistName: gift?.to_artist_name, message: gift?.message, createdAt: gift?.created_at }
    });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// POST /api/gifts/verify
router.post('/verify', async (req, res) => {
  try {
    const { orderTrackingId, txRef } = req.body;
    if (isMockMode()) {
      await supabase.from('gifts').update({ status: 'completed' }).eq('tx_ref', txRef);
      return res.json({ success: true, paid: true, status: 'COMPLETED', message: '✅ Demo payment confirmed!' });
    }
    if (!orderTrackingId) return res.status(400).json({ success: false, error: 'orderTrackingId required' });
    const statusData = await getTransactionStatus(orderTrackingId);
    const isPaid = statusData.payment_status_description === 'Completed';
    await supabase.from('gifts').update({ status: isPaid ? 'completed' : (statusData.payment_status_description || 'pending').toLowerCase() }).eq('order_ref', orderTrackingId);
    res.json({ success: true, paid: isPaid, status: statusData.payment_status_description, message: isPaid ? '✅ Payment confirmed! Gift sent.' : '⏳ Still pending. Approve on phone then try again.' });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// GET /api/gifts/artist/:artistId
router.get('/artist/:artistId', async (req, res) => {
  try {
    const { data: gifts, error } = await supabase
      .from('gifts')
      .select('from_name, to_artist_name, artist_amount, message, gift_card, created_at')
      .eq('to_artist_id', req.params.artistId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) return res.status(500).json({ success: false, error: error.message });
    const totalEarned = gifts.reduce((s, g) => s + (g.artist_amount || 0), 0);
    const mapped = gifts.map(g => ({ fromName: g.from_name, toArtistName: g.to_artist_name, artistAmount: g.artist_amount, message: g.message, giftCard: g.gift_card, createdAt: g.created_at }));
    res.json({ success: true, gifts: mapped, totalEarned });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// POST /api/gifts/promote
router.post('/promote', async (req, res) => {
  try {
    const { trackId, phone, days } = req.body;
    if (!trackId) return res.status(400).json({ success: false, error: 'Track ID required' });
    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (cleanPhone.length < 9) return res.status(400).json({ success: false, error: 'Enter a valid mobile money number' });
    const prices = { 1:1000, 3:2500, 7:5000, 14:8000, 30:15000 };
    const selectedDays = Number(days) || 7;
    const price = prices[selectedDays] || 5000;
    const { data: track } = await supabase.from('tracks').select('title, promoted_until').eq('id', trackId).single();
    if (!track) return res.status(404).json({ success: false, error: 'Track not found.' });
    const reference = `promo-${uuidv4()}`;
    let orderTrackingId = '';
    if (!isMockMode()) {
      try {
        const order = await submitOrder({ amount: price, phone: cleanPhone, description: `Promote "${track.title}" on CyberMuzik for ${selectedDays} day(s)`, reference });
        orderTrackingId = order.order_tracking_id || '';
        if (!orderTrackingId) return res.status(502).json({ success: false, error: order.error || 'Payment failed.' });
      } catch (payErr) {
        return res.status(502).json({ success: false, error: 'Payment failed. Check your number.', detail: payErr.message });
      }
    } else { orderTrackingId = `mock-${reference}`; }

    const now = new Date();
    const base = track.promoted_until && new Date(track.promoted_until) > now ? new Date(track.promoted_until) : now;
    base.setDate(base.getDate() + selectedDays);

    if (isMockMode()) {
      await supabase.from('tracks').update({ promoted: true, promoted_until: base.toISOString() }).eq('id', trackId);
    }

    res.json({ success: true, orderTrackingId, txRef: reference, mock: isMockMode(), promotedUntil: base, days: selectedDays, price, message: isMockMode() ? `⭐ Demo: track promoted for ${selectedDays} day(s).` : `📱 Pay UGX ${price.toLocaleString()} on your phone then tap Confirm.` });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// POST /api/gifts/promote/verify
router.post('/promote/verify', async (req, res) => {
  try {
    const { orderTrackingId, trackId, days } = req.body;
    if (isMockMode()) return res.json({ success: true, paid: true, status: 'COMPLETED', message: '✅ Demo promotion confirmed!' });
    if (!orderTrackingId) return res.status(400).json({ success: false, error: 'orderTrackingId required' });
    const statusData = await getTransactionStatus(orderTrackingId);
    const isPaid = statusData.payment_status_description === 'Completed';
    if (isPaid && trackId) {
      const selectedDays = Number(days) || 7;
      const { data: track } = await supabase.from('tracks').select('promoted_until').eq('id', trackId).single();
      const now = new Date();
      const base = track?.promoted_until && new Date(track.promoted_until) > now ? new Date(track.promoted_until) : now;
      base.setDate(base.getDate() + selectedDays);
      await supabase.from('tracks').update({ promoted: true, promoted_until: base.toISOString() }).eq('id', trackId);
    }
    res.json({ success: true, paid: isPaid, status: statusData.payment_status_description, message: isPaid ? '✅ Payment confirmed! Track is now featured.' : '⏳ Still pending — approve on phone then try again.' });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

module.exports = router;
