'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Cover from '../../components/Cover';
import TrackRow from '../../components/TrackRow';
import { api } from '../../lib/api';

function ArtistProfile() {
  const id = useSearchParams().get('id');
  const [artist, setArtist] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Artist not found.');
      return;
    }
    api(`/api/artists/${id}`)
      .then((data) => setArtist(data.data))
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="page"><p className="notice-error">{error}</p></div>;
  if (!artist) return <div className="page"><p className="py-10 text-center text-sm text-zinc-500">Loading artist...</p></div>;

  const tracks = artist.tracks.map((t) => ({ ...t, artist: artist.username, artistPhoto: artist.profilePhoto }));

  return (
    <div className="mx-auto max-w-2xl">
      <Cover src={artist.coverPhoto} label="" className="h-36 w-full" />
      <div className="px-4">
        <div className="-mt-10 flex items-end gap-4">
          <Cover src={artist.profilePhoto} label={artist.username} className="h-20 w-20 shrink-0 rounded-full border-4 border-ink-950 text-2xl" />
          <h1 className="pb-1 text-xl font-bold text-white">{artist.username}</h1>
        </div>
        {artist.bio && <p className="mt-4 text-sm leading-relaxed text-zinc-400">{artist.bio}</p>}

        <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-zinc-400">Tracks</h2>
        {tracks.length === 0 && <p className="text-sm text-zinc-500">No tracks uploaded yet.</p>}
        <div className="space-y-2.5">
          {tracks.map((t) => (
            <TrackRow key={t.id} track={t} list={tracks} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ArtistPage() {
  return (
    <Suspense fallback={<div className="page"><p className="py-10 text-center text-sm text-zinc-500">Loading...</p></div>}>
      <ArtistProfile />
    </Suspense>
  );
}
