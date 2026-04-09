-- ============================================================
-- CyberMuzik Supabase Schema
-- Run this in Supabase → SQL Editor → New Query → Run
-- ============================================================

-- Artists table
CREATE TABLE IF NOT EXISTS artists (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username       TEXT NOT NULL UNIQUE,
  email          TEXT NOT NULL UNIQUE,
  password       TEXT NOT NULL,
  bio            TEXT DEFAULT '',
  profile_photo  TEXT DEFAULT '',
  cover_photo    TEXT DEFAULT '',
  mobile_number  TEXT DEFAULT '',
  total_plays    INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Tracks table
CREATE TABLE IF NOT EXISTS tracks (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  artist         TEXT NOT NULL,
  artist_id      UUID REFERENCES artists(id) ON DELETE SET NULL,
  audio_url      TEXT NOT NULL,
  cover_image    TEXT DEFAULT '',
  album          TEXT DEFAULT '',
  duration       TEXT DEFAULT '',
  artist_photo   TEXT DEFAULT '',
  artist_cover   TEXT DEFAULT '',
  genre          TEXT DEFAULT 'Other',
  country        TEXT DEFAULT '',
  promoted       BOOLEAN DEFAULT FALSE,
  promoted_until TIMESTAMPTZ,
  gifters        JSONB DEFAULT '[]',
  plays          INTEGER DEFAULT 0,
  downloads      INTEGER DEFAULT 0,
  likes          INTEGER DEFAULT 0,
  dislikes       INTEGER DEFAULT 0,
  rating         NUMERIC DEFAULT 0,
  rating_count   INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Gifts table
CREATE TABLE IF NOT EXISTS gifts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_name      TEXT DEFAULT 'Anonymous',
  to_artist_id   UUID REFERENCES artists(id) ON DELETE SET NULL,
  to_artist_name TEXT NOT NULL,
  amount         INTEGER NOT NULL,
  platform_fee   INTEGER NOT NULL,
  artist_amount  INTEGER NOT NULL,
  sender_phone   TEXT NOT NULL,
  artist_phone   TEXT DEFAULT '',
  message        TEXT DEFAULT '',
  gift_card      TEXT DEFAULT '',
  tx_ref         TEXT DEFAULT '',
  order_ref      TEXT DEFAULT '',
  status         TEXT DEFAULT 'pending',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Allow public read on tracks (no login needed to stream music)
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tracks" ON tracks FOR SELECT USING (true);
CREATE POLICY "Service full access tracks" ON tracks USING (true) WITH CHECK (true);

-- Artists - service key only
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service full access artists" ON artists USING (true) WITH CHECK (true);

-- Gifts - service key only
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service full access gifts" ON gifts USING (true) WITH CHECK (true);
