import { Hono } from 'hono';
import { requireAuth } from '../lib/auth.js';
import { MEDIA_PREFIX } from '../lib/media.js';

const MB = 1024 * 1024;

const RULES = {
  image: {
    folder: 'images',
    maxBytes: 5 * MB,
    types: { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' },
  },
  audio: {
    folder: 'audio',
    maxBytes: 40 * MB,
    types: {
      'audio/mpeg': 'mp3',
      'audio/mp3': 'mp3',
      'audio/mp4': 'm4a',
      'audio/x-m4a': 'm4a',
      'audio/aac': 'aac',
      'audio/wav': 'wav',
      'audio/x-wav': 'wav',
      'audio/ogg': 'ogg',
      'audio/flac': 'flac',
      'audio/x-flac': 'flac',
    },
  },
};

export const upload = new Hono();

upload.post('/', requireAuth, async (c) => {
  const rule = RULES[c.req.query('kind')];
  if (!rule) return c.json({ success: false, error: 'Upload kind must be image or audio.' }, 400);

  const type = (c.req.header('Content-Type') || '').split(';')[0].trim().toLowerCase();
  const ext = rule.types[type];
  if (!ext) return c.json({ success: false, error: `This file type is not supported (${type || 'unknown'}).` }, 415);

  const length = Number(c.req.header('Content-Length'));
  if (!length) return c.json({ success: false, error: 'Missing file size.' }, 411);
  if (length > rule.maxBytes) {
    return c.json({ success: false, error: `File is too large. The limit is ${rule.maxBytes / MB} MB.` }, 413);
  }

  const key = `${rule.folder}/${c.get('artistId')}/${crypto.randomUUID()}.${ext}`;
  await c.env.MEDIA.put(key, c.req.raw.body, { httpMetadata: { contentType: type } });
  return c.json({ success: true, url: MEDIA_PREFIX + key }, 201);
});

export const media = new Hono();

media.get('/*', async (c) => {
  const key = decodeURIComponent(c.req.path.slice(MEDIA_PREFIX.length));
  const wantsRange = Boolean(c.req.header('Range'));
  const object = await c.env.MEDIA.get(key, wantsRange ? { range: c.req.raw.headers } : undefined);
  if (!object) return c.json({ success: false, error: 'Not found.' }, 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  if (wantsRange && object.range) {
    const r = object.range;
    const offset = r.suffix !== undefined ? object.size - r.suffix : r.offset ?? 0;
    const length = r.suffix !== undefined ? r.suffix : r.length ?? object.size - offset;
    headers.set('Content-Range', `bytes ${offset}-${offset + length - 1}/${object.size}`);
    headers.set('Content-Length', String(length));
    return new Response(object.body, { status: 206, headers });
  }

  headers.set('Content-Length', String(object.size));
  return new Response(object.body, { headers });
});
