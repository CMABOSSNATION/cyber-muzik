# Cyber-Muzik

A music platform for independent artists. Listeners stream, like and download tracks. Artists sign up, upload music and manage a profile.

- `frontend/` Next.js static site, deployed on Cloudflare
- `backend-workers/` Cloudflare Worker API (Hono), Supabase Postgres for data, Cloudflare R2 for audio and images

## Frontend

Set `NEXT_PUBLIC_API_URL` to the Worker URL as a build variable, then `npm install` and `npm run build`. The static site is written to `out/`.

## Backend

See `backend-workers/README.md`.
