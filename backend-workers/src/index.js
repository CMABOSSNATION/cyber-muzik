import { Hono } from 'hono';
import { cors } from 'hono/cors';
import tracks from './routes/tracks.js';
import auth from './routes/auth.js';
import gifts from './routes/gifts.js';
import artists from './routes/artists.js';

const app = new Hono();

app.use('*', cors({
  origin: '*', // matches the old `origin: true` — allows any origin
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/', (c) => c.json({ ok: true, msg: 'CyberMuzik API online 🚀' }));

app.route('/api/tracks', tracks);
app.route('/api/auth', auth);
app.route('/api/gifts', gifts);
app.route('/api/artists', artists); // was missing entirely before — now mounted and fixed

export default app;
