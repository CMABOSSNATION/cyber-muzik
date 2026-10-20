'use client';
import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import TrackRow from '../components/TrackRow';
import { api } from '../lib/api';
import { COUNTRIES, GENRES } from '../lib/constants';

export default function HomePage() {
  const [tracks, setTracks] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('All');
  const [country, setCountry] = useState('All');

  useEffect(() => {
    api('/api/tracks?limit=100')
      .then((data) => setTracks(data.data))
      .catch((err) => setError(err.message));
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (tracks || []).filter(
      (t) =>
        (genre === 'All' || t.genre === genre) &&
        (country === 'All' || t.country === country) &&
        (!q || [t.title, t.artist, t.genre, t.country].some((v) => v?.toLowerCase().includes(q)))
    );
  }, [tracks, query, genre, country]);

  return (
    <div className="page">
      <h1 className="text-2xl font-bold text-white">Discover</h1>
      <p className="mb-5 mt-1 text-sm text-zinc-400">New music from independent artists.</p>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input className="input pl-10" type="search" placeholder="Search tracks, artists, genres" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {['All', ...GENRES].map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium ${genre === g ? 'bg-brand text-white' : 'bg-ink-800 text-zinc-300 hover:bg-ink-700'}`}
          >
            {g}
          </button>
        ))}
      </div>

      <select className="input mt-3" value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Country">
        <option value="All">All countries</option>
        {COUNTRIES.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>

      <div className="mt-5 space-y-2.5">
        {error && <p className="notice-error">{error}</p>}
        {!error && tracks === null && <p className="py-10 text-center text-sm text-zinc-500">Loading tracks...</p>}
        {tracks && visible.length === 0 && (
          <p className="py-10 text-center text-sm text-zinc-500">{tracks.length ? 'No tracks match your filters.' : 'No tracks yet.'}</p>
        )}
        {visible.map((t) => (
          <TrackRow key={t.id} track={t} list={visible} />
        ))}
      </div>
    </div>
  );
}
