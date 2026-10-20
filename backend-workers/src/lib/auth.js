import { sign, verify } from 'hono/jwt';

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export function signToken(env, artistId) {
  const exp = Math.floor(Date.now() / 1000) + THIRTY_DAYS;
  return sign({ id: artistId, exp }, env.JWT_SECRET, 'HS256');
}

export async function requireAuth(c, next) {
  const token = (c.req.header('Authorization') || '').split(' ')[1];
  if (!token) return c.json({ success: false, error: 'Sign in required.' }, 401);
  try {
    const payload = await verify(token, c.env.JWT_SECRET, 'HS256');
    c.set('artistId', payload.id);
  } catch {
    return c.json({ success: false, error: 'Session expired. Sign in again.' }, 401);
  }
  await next();
}
