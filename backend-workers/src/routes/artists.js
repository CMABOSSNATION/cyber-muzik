import { Hono } from 'hono';
import { getDb } from '../lib/db.js';
import { mediaUrl } from '../lib/media.js';

const artists = new Hono();

artists.get('/', async (c) => {
  const db = getDb(c.env);
  const { data, error } = await db
    .from('artists')
    .select('id, username, bio, profile_photo, tracks(count)')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) {
    console.error('list artists', error);
    return c.json({ success: false, error: 'Could not load artists.' }, 500);
  }
  return c.json({
    success: true,
    data: data.map((a) => ({
      id: a.id,
      username: a.username,
      bio: a.bio || '',
      profilePhoto: mediaUrl(c, a.profile_photo),
      trackCount: a.tracks?.[0]?.count ?? 0,
    })),
  });
});

artists.get('/:id', async (c) => {
  const db = getDb(c.env);
  const id = c.req.param('id');

  const { data: artist } = await db
    .from('artists')
    .select('id, username, bio, profile_photo, cover_photo')
    .eq('id', id)
    .maybeSingle();
  if (!artist) return c.json({ success: false, error: 'Artist not found.' }, 404);

  const { data: tracks } = await db
    .from('tracks')
    .select('id, title, artist, audio_url, cover_image, genre, plays, likes, created_at')
    .eq('artist_id', id)
    .order('created_at', { ascending: false });

  return c.json({
    success: true,
    data: {
      id: artist.id,
      username: artist.username,
      bio: artist.bio || '',
      profilePhoto: mediaUrl(c, artist.profile_photo),
      coverPhoto: mediaUrl(c, artist.cover_photo),
      tracks: (tracks || []).map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        audioUrl: mediaUrl(c, t.audio_url),
        coverImage: mediaUrl(c, t.cover_image),
        genre: t.genre,
        plays: t.plays,
        likes: t.likes,
        createdAt: t.created_at,
      })),
    },
  });
});

export default artists;
