'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Cover from '../../components/Cover';
import { api } from '../../lib/api';

export default function ArtistsPage() {
  const [artists, setArtists] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/artists')
      .then((data) => setArtists(data.data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="page">
      <h1 className="text-2xl font-bold text-white">Artists</h1>
      <p className="mb-6 mt-1 text-sm text-zinc-400">The people behind the music.</p>

      {error && <p className="notice-error">{error}</p>}
      {!error && artists === null && <p className="py-10 text-center text-sm text-zinc-500">Loading artists...</p>}
      {artists && artists.length === 0 && <p className="py-10 text-center text-sm text-zinc-500">No artists yet.</p>}

      <div className="space-y-2.5">
        {(artists || []).map((a) => (
          <Link key={a.id} href={`/artist?id=${a.id}`} className="card flex items-center gap-4 p-3 hover:bg-ink-800">
            <Cover src={a.profilePhoto} label={a.username} className="h-14 w-14 shrink-0 rounded-full text-lg" />
            <div className="min-w-0">
              <p className="truncate font-medium text-white">{a.username}</p>
              <p className="text-xs text-zinc-400">
                {a.trackCount} {a.trackCount === 1 ? 'track' : 'tracks'}
              </p>
              {a.bio && <p className="mt-1 line-clamp-1 text-xs text-zinc-500">{a.bio}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
