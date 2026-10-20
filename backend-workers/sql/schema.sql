-- Run in Supabase: SQL Editor, New query, paste, Run.
-- Safe to run on a fresh database or on top of the existing one.

create table if not exists artists (
  id             uuid primary key default gen_random_uuid(),
  username       text not null unique,
  email          text not null unique,
  password       text not null,
  bio            text default '',
  profile_photo  text default '',
  cover_photo    text default '',
  mobile_number  text default '',
  total_plays    integer default 0,
  created_at     timestamptz default now()
);

create table if not exists tracks (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  artist         text not null,
  artist_id      uuid references artists(id) on delete set null,
  audio_url      text not null,
  cover_image    text default '',
  album          text default '',
  duration       text default '',
  artist_photo   text default '',
  artist_cover   text default '',
  genre          text default 'Other',
  country        text default '',
  promoted       boolean default false,
  promoted_until timestamptz,
  gifters        jsonb default '[]',
  plays          integer default 0,
  downloads      integer default 0,
  likes          integer default 0,
  created_at     timestamptz default now()
);

create table if not exists gifts (
  id             uuid primary key default gen_random_uuid(),
  from_name      text default 'Anonymous',
  to_artist_id   uuid references artists(id) on delete set null,
  to_artist_name text not null,
  amount         integer not null,
  platform_fee   integer not null,
  artist_amount  integer not null,
  sender_phone   text not null,
  artist_phone   text default '',
  message        text default '',
  tx_ref         text default '',
  order_ref      text default '',
  status         text default 'pending',
  created_at     timestamptz default now()
);

create unique index if not exists artists_username_lower_idx on artists (lower(username));
create index if not exists tracks_artist_idx on tracks (artist_id);
create index if not exists tracks_plays_idx on tracks (plays desc);

-- Lock the tables. Row level security with no policies means the public
-- (anon) key can read and write nothing. Only the Worker, which uses the
-- service key, can reach the data.
drop policy if exists "Public read tracks" on tracks;
drop policy if exists "Service full access tracks" on tracks;
drop policy if exists "Service full access artists" on artists;
drop policy if exists "Service full access gifts" on gifts;

alter table artists enable row level security;
alter table tracks  enable row level security;
alter table gifts   enable row level security;

-- Atomic counters for plays, likes and downloads.
create or replace function bump_track(p_id uuid, p_field text)
returns void
language plpgsql
as $$
declare
  affected integer;
begin
  if p_field not in ('plays', 'likes', 'downloads') then
    raise exception 'invalid field';
  end if;
  execute format('update tracks set %I = %I + 1 where id = $1', p_field, p_field) using p_id;
  get diagnostics affected = row_count;
  if affected = 0 then
    raise exception 'track not found';
  end if;
end;
$$;

revoke all on function bump_track(uuid, text) from public, anon, authenticated;
grant execute on function bump_track(uuid, text) to service_role;
