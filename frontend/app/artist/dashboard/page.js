'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Upload } from 'lucide-react';
import Cover from '../../../components/Cover';
import { api } from '../../../lib/api';
import { clearSession, useSession } from '../../../lib/session';

export default function DashboardPage() {
  const router = useRouter();
  const { ready, token, artist } = useSession();
  const [tracks, setTracks] = useState(null);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState(null);

  const load = useCallback(() => {
    api('/api/tracks/artist/mytracks', { token })
      .then((data) => setTracks(data.data))
      .catch((err) => setError(err.message));
  }, [token]);

  useEffect(() => {
    if (!ready) return;
    if (!token) router.replace('/login');
    else load();
  }, [ready, token, router, load]);

  const remove = async (id) => {
    try {
      await api(`/api/tracks/${id}`, { method: 'DELETE', token });
      setTracks((list) => list.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
    setConfirmId(null);
  };

  const signOut = () => {
    clearSession();
    router.push('/');
  };

  if (!ready || !artist) return <div className="page"><p className="py-10 text-center text-sm text-zinc-500">Loading...</p></div>;

  const total = (key) => (tracks || []).reduce((sum, t) => sum + (t[key] || 0), 0);

  return (
    <div className="page">
      <div className="flex items-center gap-4">
        <Cover src={artist.profilePhoto} label={artist.username} className="h-16 w-16 shrink-0 rounded-full text-xl" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-white">{artist.username}</h1>
          <Link href={`/artist?id=${artist.id}`} className="text-sm text-zinc-400 hover:text-white">View public profile</Link>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {[['Plays', 'plays'], ['Likes', 'likes'], ['Downloads', 'downloads']].map(([label, key]) => (
          <div key={key} className="card p-3 text-center">
            <p className="text-xl font-semibold text-white">{total(key).toLocaleString()}</p>
            <p className="text-xs text-zinc-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Link href="/upload" className="btn btn-primary"><Upload size={16} />Upload track</Link>
        <Link href="/artist/edit" className="btn btn-ghost"><Pencil size={16} />Edit profile</Link>
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-zinc-400">Your tracks</h2>
      {error && <p className="notice-error mb-3">{error}</p>}
      {tracks === null && !error && <p className="py-6 text-center text-sm text-zinc-500">Loading tracks...</p>}
      {tracks && tracks.length === 0 && <p className="py-6 text-center text-sm text-zinc-500">You have not uploaded anything yet.</p>}

      <div className="space-y-2.5">
        {(tracks || []).map((t) => (
          <div key={t.id} className="card flex items-center gap-3 p-3">
            <Cover src={t.coverImage || t.artistPhoto} label={t.title} className="h-12 w-12 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{t.title}</p>
              <p className="text-xs text-zinc-500">{t.plays} plays · {t.likes} likes · {t.downloads} downloads</p>
            </div>
            {confirmId === t.id ? (
              <div className="flex gap-2">
                <button className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white" onClick={() => remove(t.id)}>Delete</button>
                <button className="rounded-lg border border-ink-600 px-3 py-1.5 text-xs text-zinc-300" onClick={() => setConfirmId(null)}>Cancel</button>
              </div>
            ) : (
              <button aria-label={`Delete ${t.title}`} className="p-2 text-zinc-500 hover:text-red-400" onClick={() => setConfirmId(t.id)}>
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button onClick={signOut} className="mt-10 w-full text-center text-sm text-zinc-500 hover:text-white">Sign out</button>
    </div>
  );
}
