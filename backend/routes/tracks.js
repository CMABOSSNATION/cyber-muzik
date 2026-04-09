const express  = require('express');
const router   = express.Router();
const jwt      = require('jsonwebtoken');
const supabase = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'cybermuzik_secret_2026_fallback';

// Auth middleware
const protect = (req, res, next) => {
  const token = (req.headers.authorization || '').split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided.' });
  try {
    req.artist = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

// Format track - map Supabase snake_case to camelCase for frontend
function fmt(t) {
  if (!t) return null;
  return {
    _id: t.id, id: t.id,
    title: t.title, artist: t.artist,
    artistId: t.artist_id, audioUrl: t.audio_url,
    coverImage: t.cover_image || '', album: t.album || '',
    duration: t.duration || '', artistPhoto: t.artist_photo || '',
    artistCover: t.artist_cover || '', genre: t.genre || 'Other',
    country: t.country || '', promoted: t.promoted || false,
    promotedUntil: t.promoted_until, gifters: t.gifters || [],
    plays: t.plays || 0, downloads: t.downloads || 0,
    likes: t.likes || 0, createdAt: t.created_at
  };
}

// GET ALL TRACKS — promoted first
router.get('/', async (req, res) => {
  try {
    const { genre, country } = req.query;
    let query = supabase.from('tracks').select('*').order('created_at', { ascending: false });
    if (genre && genre !== 'All') query = query.eq('genre', genre);
    if (country && country !== 'All') query = query.eq('country', country);

    const { data: tracks, error } = await query;
    if (error) return res.status(500).json({ success: false, error: error.message });

    const now = new Date();
    const promoted = tracks.filter(t => t.promoted && t.promoted_until && new Date(t.promoted_until) > now);
    const regular  = tracks.filter(t => !t.promoted || !t.promoted_until || new Date(t.promoted_until) <= now);

    res.json({ success: true, count: tracks.length, data: [...promoted, ...regular].map(fmt) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ADD TRACK
router.post('/add', protect, async (req, res) => {
  try {
    const { title, artist, audioUrl, coverImage, genre, country } = req.body;

    // Get artist details for photo
    const { data: artistDoc } = await supabase
      .from('artists')
      .select('profile_photo, cover_photo')
      .eq('id', req.artist.id)
      .single();

    const { data: track, error } = await supabase
      .from('tracks')
      .insert([{
        title, artist,
        artist_id: req.artist.id,
        audio_url: audioUrl,
        cover_image: coverImage || '',
        genre: genre || 'Other',
        country: country || '',
        artist_photo: artistDoc?.profile_photo || '',
        artist_cover: artistDoc?.cover_photo || '',
        gifters: []
      }])
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.status(201).json({ success: true, data: fmt(track) });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET ARTIST OWN TRACKS
router.get('/artist/mytracks', protect, async (req, res) => {
  try {
    const { data: tracks, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('artist_id', req.artist.id)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, count: tracks.length, data: tracks.map(fmt) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// HOT 100
router.get('/charts/hot100', async (req, res) => {
  try {
    const { data: tracks, error } = await supabase
      .from('tracks').select('*').order('plays', { ascending: false }).limit(100);
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data: tracks.map(fmt) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// RECORD PLAY
router.post('/:id/play', async (req, res) => {
  try {
    const { data: track } = await supabase.from('tracks').select('plays').eq('id', req.params.id).single();
    if (!track) return res.status(404).json({ success: false, message: 'Track not found.' });
    const { data: updated } = await supabase.from('tracks').update({ plays: (track.plays || 0) + 1 }).eq('id', req.params.id).select('plays').single();
    res.json({ success: true, plays: updated?.plays });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// RECORD DOWNLOAD
router.post('/:id/download', async (req, res) => {
  try {
    const { data: track } = await supabase.from('tracks').select('downloads').eq('id', req.params.id).single();
    if (!track) return res.status(404).json({ success: false, message: 'Track not found.' });
    const { data: updated } = await supabase.from('tracks').update({ downloads: (track.downloads || 0) + 1 }).eq('id', req.params.id).select('downloads').single();
    res.json({ success: true, downloads: updated?.downloads });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// LIKE TRACK
router.post('/:id/like', async (req, res) => {
  try {
    const { data: track } = await supabase.from('tracks').select('likes').eq('id', req.params.id).single();
    if (!track) return res.status(404).json({ success: false, message: 'Track not found.' });
    const { data: updated } = await supabase.from('tracks').update({ likes: (track.likes || 0) + 1 }).eq('id', req.params.id).select('likes').single();
    res.json({ success: true, likes: updated?.likes });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// DELETE TRACK
router.delete('/:id', protect, async (req, res) => {
  try {
    const { data: track } = await supabase.from('tracks').select('artist_id').eq('id', req.params.id).single();
    if (!track) return res.status(404).json({ success: false, message: 'Track not found.' });
    if (track.artist_id !== req.artist.id) return res.status(403).json({ success: false, message: 'Not authorized.' });
    await supabase.from('tracks').delete().eq('id', req.params.id);
    res.json({ success: true, message: 'Track deleted successfully.' });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// GET SINGLE TRACK — must be last
router.get('/:id', async (req, res) => {
  try {
    const { data: track, error } = await supabase.from('tracks').select('*').eq('id', req.params.id).single();
    if (error || !track) return res.status(404).json({ success: false, message: 'Track not found.' });
    res.json({ success: true, data: fmt(track) });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

module.exports = router;
