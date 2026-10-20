import { Hono } from 'hono';
import { getDb } from '../lib/db.js';
import { requireAuth } from '../lib/auth.js';
import { isOwnMedia, mediaKey, mediaUrl } from '../lib/media.js';

const tracks = new Hono();

function format(c, t) {
  return {
    id: t.id,
    title: t.title,
    artist: t.artist,
    artistId: t.artist_id,
    audioUrl: mediaUrl(c, t.audio_url),
    coverImage: mediaUrl(c, t.cover_image),
    artistPhoto: mediaUrl(c, t.artist_photo),
    artistCover: mediaUrl(c, t.artist_cover),
    album: t.album || '',
    duration: t.duration || '',
    genre: t.genre || 'Other',
    country: t.country || '',
    promoted: isPromoted(t),
    promotedUntil: t.promoted_until,
    gifters: t.gifters || [],
    plays: t.plays || 0,
    downloads: t.downloads || 0,
    likes: t.likes || 0,
    createdAt: t.created_at,
  };
}

function isPromoted(t) {
  return Boolean(t.promoted && t.promoted_until && new Date(t.promoted_until) > new Date());
}

tracks.get('/', async (c) => {
  const { genre, country } = c.req.query();
  const limit = Math.min(Number(c.req.query('limit')) || 50, 100);
  const db = getDb(c.env);

  let query = db.from('tracks').select('*').order('created_at', { ascending: false }).limit(200);
  if (genre && genre !== 'All') query = query.eq('genre', genre);
  if (country && country !== 'All') query = query.eq('country', country);

  const { data, error } = await query;
  if (error) {
    console.error('list tracks', error);
    return c.json({ success: false, error: 'Could not load tracks.' }, 500);
  }

  const featured = data.filter(isPromoted);
  const rest = data.filter((t) => !isPromoted(t));
  const page = [...featured, ...rest].slice(0, limit).map((t) => format(c, t));
  return c.json({ success: true, count: page.length, data: page });
});

tracks.get('/charts/hot100', async (c) => {
  const db = getDb(c.env);
  const { data, error } = await db.from('tracks').select('*').order('plays', { ascending: false }).limit(100);
  if (error) return c.json({ success: false, error: 'Could not load the chart.' }, 500);
  return c.json({ success: true, data: data.map((t) => format(c, t)) });
});

tracks.get('/artist/mytracks', requireAuth, async (c) => {
  const db = getDb(c.env);
  const { data, error } = await db
    .from('tracks')
    .select('*')
    .eq('artist_id', c.get('artistId'))
    .order('created_at', { ascending: false });
  if (error) return c.json({ success: false, error: 'Could not load your tracks.' }, 500);
  return c.json({ success: true, count: data.length, data: data.map((t) => format(c, t)) });
});

tracks.post('/add', requireAuth, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const title = String(body.title || '').trim();
  const genre = String(body.genre || 'Other').slice(0, 40);
  const country = String(body.country || '').slice(0, 60);

  if (!title || title.length > 120) return c.json({ success: false, error: 'Enter a track title (up to 120 characters).' }, 400);
  if (!isOwnMedia(body.audioUrl, 'audio')) return c.json({ success: false, error: 'Upload the audio file first.' }, 400);
  if (body.coverImage && !isOwnMedia(body.coverImage, 'images')) return c.json({ success: false, error: 'Invalid cover image.' }, 400);

  const db = getDb(c.env);
  const { data: artist } = await db
    .from('artists')
    .select('username, profile_photo, cover_photo')
    .eq('id', c.get('artistId'))
    .maybeSingle();
  if (!artist) return c.json({ success: false, error: 'Account not found.' }, 404);

  const { data: track, error } = await db
    .from('tracks')
    .insert({
      title,
      artist: artist.username,
      artist_id: c.get('artistId'),
      audio_url: body.audioUrl,
      cover_image: body.coverImage || '',
      artist_photo: artist.profile_photo || '',
      artist_cover: artist.cover_photo || '',
      genre,
      country,
    })
    .select()
    .single();

  if (error) {
    console.error('add track', error);
    return c.json({ success: false, error: 'Could not save the track.' }, 500);
  }
  return c.json({ success: true, data: format(c, track) }, 201);
});

for (const [action, field] of [['play', 'plays'], ['like', 'likes'], ['download', 'downloads']]) {
  tracks.post(`/:id/${action}`, async (c) => {
    const db = getDb(c.env);
    const { error } = await db.rpc('bump_track', { p_id: c.req.param('id'), p_field: field });
    if (error) return c.json({ success: false, error: 'Track not found.' }, 404);
    return c.json({ success: true });
  });
}

tracks.delete('/:id', requireAuth, async (c) => {
  const db = getDb(c.env);
  const { data: track } = await db
    .from('tracks')
    .select('artist_id, audio_url, cover_image')
    .eq('id', c.req.param('id'))
    .maybeSingle();

  if (!track) return c.json({ success: false, error: 'Track not found.' }, 404);
  if (track.artist_id !== c.get('artistId')) return c.json({ success: false, error: 'This track is not yours.' }, 403);

  const keys = [mediaKey(track.audio_url), mediaKey(track.cover_image)].filter(Boolean);
  if (keys.length) await c.env.MEDIA.delete(keys);
  await db.from('tracks').delete().eq('id', c.req.param('id'));
  return c.json({ success: true });
});

tracks.get('/:id', async (c) => {
  const db = getDb(c.env);
  const { data: track } = await db.from('tracks').select('*').eq('id', c.req.param('id')).maybeSingle();
  if (!track) return c.json({ success: false, error: 'Track not found.' }, 404);
  return c.json({ success: true, data: format(c, track) });
});

export default tracks;
