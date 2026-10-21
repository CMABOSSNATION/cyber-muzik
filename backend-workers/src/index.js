import { Hono } from 'hono';
import { cors } from 'hono/cors';
import auth from './routes/auth.js';
import tracks from './routes/tracks.js';
import artists from './routes/artists.js';
import { upload, media } from './routes/media.js';
import { MEDIA_PREFIX } from './lib/media.js';

const REQUIRED = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'JWT_SECRET'];

const app = new Hono();

app.use(
  '*',
  cors({
    origin: (origin, c) => {
      const allowed = (c.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim());
      return allowed.includes(origin) ? origin : null;
    },
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })
);

app.use('/api/*', async (c, next) => {
  if (c.req.path.startsWith(MEDIA_PREFIX)) return next();
  const missing = REQUIRED.filter((name) => !c.env[name]);
  if (missing.length) {
    console.error('Missing configuration:', missing.join(', '));
    return c.json({ success: false, error: 'Server is not configured. Missing: ' + missing.join(', ') }, 500);
  }
  await next();
});

app.get('/', (c) => c.json({ ok: true }));

app.route('/api/auth', auth);
app.route('/api/tracks', tracks);
app.route('/api/artists', artists);
app.route('/api/upload', upload);
app.route('/api/media', media);

app.notFound((c) => c.json({ success: false, error: 'Not found.' }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ success: false, error: 'Something went wrong. Try again.' }, 500);
});

export default app;
