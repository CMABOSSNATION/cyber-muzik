'use client';
import { useEffect, useMemo, useState } from 'react';
import TrackRow from '../../components/TrackRow';
import { api } from '../../lib/api';

export default function ChartsPage() {
  const [tracks, setTracks] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/tracks/charts/hot100')
      .then((data) => setTracks(data.data))
      .catch((err) => setError(err.message));
  }, []);

  const mostDownloaded = useMemo(
    () => [...(tracks || [])].filter((t) => t.downloads > 0).sort((a, b) => b.downloads - a.downloads).slice(0, 10),
    [tracks]
  );

  return (
    <div className="page">
      <h1 className="text-2xl font-bold text-white">Charts</h1>
      <p className="mb-6 mt-1 text-sm text-zinc-400">Ranked by plays and downloads.</p>

      {error && <p className="notice-error">{error}</p>}
      {!error && tracks === null && <p className="py-10 text-center text-sm text-zinc-500">Loading charts...</p>}
      {tracks && tracks.length === 0 && <p className="py-10 text-center text-sm text-zinc-500">No tracks yet.</p>}

      {tracks && tracks.length > 0 && (
        <>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">Top played</h2>
          <div className="space-y-2.5">
            {tracks.map((t, i) => (
              <TrackRow key={t.id} track={t} list={tracks} rank={i + 1} />
            ))}
          </div>

          {mostDownloaded.length > 0 && (
            <>
              <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-zinc-400">Most downloaded</h2>
              <div className="space-y-2.5">
                {mostDownloaded.map((t, i) => (
                  <TrackRow key={t.id} track={t} list={mostDownloaded} rank={i + 1} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
