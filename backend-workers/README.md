# Cyber-Muzik API

Cloudflare Worker (Hono) with Supabase Postgres for data and Cloudflare R2 for audio and images.

## Setup

1. Run `sql/schema.sql` in the Supabase SQL editor.
2. Create an R2 bucket named `cyber-muzik-media` (Cloudflare dashboard, R2).
3. Set these as Worker secrets:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `JWT_SECRET` (a long random string)
   - `ALLOWED_ORIGINS` (comma-separated frontend URLs, for example `https://cyber-muzik.example.workers.dev`)
4. `npm install` then `npm run deploy`.

## Endpoints

| Method | Path | Auth |
| --- | --- | --- |
| POST | /api/auth/register | no |
| POST | /api/auth/login | no |
| GET, PATCH | /api/auth/me | yes |
| POST | /api/auth/change-password | yes |
| GET | /api/tracks, /api/tracks/charts/hot100, /api/tracks/:id | no |
| GET | /api/tracks/artist/mytracks | yes |
| POST | /api/tracks/add | yes |
| POST | /api/tracks/:id/play, /like, /download | no |
| DELETE | /api/tracks/:id | yes |
| GET | /api/artists/:id | no |
| POST | /api/upload?kind=image or audio | yes |
| GET | /api/media/* | no |
