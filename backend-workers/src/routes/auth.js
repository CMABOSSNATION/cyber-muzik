import { Hono } from 'hono';
import { getDb } from '../lib/db.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { requireAuth, signToken } from '../lib/auth.js';
import { isOwnMedia, mediaUrl } from '../lib/media.js';

const auth = new Hono();

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME = /^[A-Za-z0-9._ -]{3,30}$/;

function ownProfile(c, a) {
  return {
    id: a.id,
    username: a.username,
    email: a.email,
    bio: a.bio || '',
    profilePhoto: mediaUrl(c, a.profile_photo),
    coverPhoto: mediaUrl(c, a.cover_photo),
    mobileNumber: a.mobile_number || '',
  };
}

auth.post('/register', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const username = String(body.username || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  if (!USERNAME.test(username)) {
    return c.json({ success: false, error: 'Username must be 3 to 30 characters: letters, numbers, spaces, dots, dashes.' }, 400);
  }
  if (!EMAIL.test(email)) return c.json({ success: false, error: 'Enter a valid email address.' }, 400);
  if (password.length < 8) return c.json({ success: false, error: 'Password must be at least 8 characters.' }, 400);

  const db = getDb(c.env);
  const { data: artist, error } = await db
    .from('artists')
    .insert({ username, email, password: await hashPassword(password) })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      const field = /email/i.test(error.message) ? 'email' : 'username';
      return c.json({ success: false, error: `That ${field} is already taken.` }, 409);
    }
    console.error('register', error);
    return c.json({ success: false, error: 'Could not create the account. Try again.' }, 500);
  }

  const token = await signToken(c.env, artist.id);
  return c.json({ success: true, token, artist: ownProfile(c, artist) }, 201);
});

auth.post('/login', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const invalid = () => c.json({ success: false, error: 'Incorrect email or password.' }, 401);

  if (!email || !password) return invalid();

  const db = getDb(c.env);
  const { data: artist } = await db.from('artists').select('*').eq('email', email).maybeSingle();
  if (!artist || !(await verifyPassword(password, artist.password))) return invalid();

  const token = await signToken(c.env, artist.id);
  return c.json({ success: true, token, artist: ownProfile(c, artist) });
});

auth.get('/me', requireAuth, async (c) => {
  const db = getDb(c.env);
  const { data: artist } = await db.from('artists').select('*').eq('id', c.get('artistId')).maybeSingle();
  if (!artist) return c.json({ success: false, error: 'Account not found.' }, 404);
  return c.json({ success: true, artist: ownProfile(c, artist) });
});

auth.patch('/me', requireAuth, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const update = {};

  if (body.bio !== undefined) update.bio = String(body.bio).slice(0, 500);
  if (body.mobileNumber !== undefined) update.mobile_number = String(body.mobileNumber).replace(/[^\d+]/g, '').slice(0, 15);
  if (body.profilePhoto !== undefined) {
    if (body.profilePhoto && !isOwnMedia(body.profilePhoto, 'images')) return c.json({ success: false, error: 'Invalid profile photo.' }, 400);
    update.profile_photo = body.profilePhoto;
  }
  if (body.coverPhoto !== undefined) {
    if (body.coverPhoto && !isOwnMedia(body.coverPhoto, 'images')) return c.json({ success: false, error: 'Invalid cover photo.' }, 400);
    update.cover_photo = body.coverPhoto;
  }
  if (!Object.keys(update).length) return c.json({ success: false, error: 'Nothing to update.' }, 400);

  const db = getDb(c.env);
  const { data: artist, error } = await db.from('artists').update(update).eq('id', c.get('artistId')).select().single();
  if (error) {
    console.error('update profile', error);
    return c.json({ success: false, error: 'Could not save your profile.' }, 500);
  }
  return c.json({ success: true, artist: ownProfile(c, artist) });
});

auth.post('/change-password', requireAuth, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const current = String(body.currentPassword || '');
  const next = String(body.newPassword || '');
  if (next.length < 8) return c.json({ success: false, error: 'New password must be at least 8 characters.' }, 400);

  const db = getDb(c.env);
  const { data: artist } = await db.from('artists').select('id, password').eq('id', c.get('artistId')).maybeSingle();
  if (!artist || !(await verifyPassword(current, artist.password))) {
    return c.json({ success: false, error: 'Current password is incorrect.' }, 401);
  }

  await db.from('artists').update({ password: await hashPassword(next) }).eq('id', artist.id);
  return c.json({ success: true });
});

export default auth;
