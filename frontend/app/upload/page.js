'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, uploadFile } from '../../lib/api';
import { COUNTRIES, GENRES } from '../../lib/constants';
import { useSession } from '../../lib/session';

export default function UploadPage() {
  const router = useRouter();
  const { ready, token, artist } = useSession();
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState(GENRES[0]);
  const [country, setCountry] = useState('Uganda');
  const [audio, setAudio] = useState(null);
  const [cover, setCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [step, setStep] = useState('');
  const [percent, setPercent] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ready && !token) router.replace('/login');
  }, [ready, token, router]);

  const busy = Boolean(step);

  const pickCover = (file) => {
    if (!file) return;
    setCover(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!audio) {
      setError('Choose an audio file.');
      return;
    }
    setError('');
    setPercent(0);
    try {
      let coverImage = '';
      if (cover) {
        setStep('Uploading cover');
        coverImage = await uploadFile('image', cover, token);
      }
      setStep('Uploading audio');
      const audioUrl = await uploadFile('audio', audio, token, setPercent);
      setStep('Saving track');
      await api('/api/tracks/add', { method: 'POST', token, body: { title, audioUrl, coverImage, genre, country } });
      router.push('/artist/dashboard');
    } catch (err) {
      setError(err.message);
      setStep('');
    }
  };

  if (!ready || !artist) return <div className="page"><p className="py-10 text-center text-sm text-zinc-500">Loading...</p></div>;

  return (
    <div className="page max-w-md">
      <h1 className="text-2xl font-bold text-white">Upload a track</h1>
      <p className="mb-6 mt-1 text-sm text-zinc-400">Uploading as {artist.username}.</p>

      <form onSubmit={submit} className="space-y-4">
        <label className="mx-auto block h-36 w-36 cursor-pointer overflow-hidden rounded-xl border border-dashed border-ink-600">
          {coverPreview ? (
            <img src={coverPreview} alt="Cover preview" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center px-3 text-center text-xs text-zinc-500">Add cover art (optional)</span>
          )}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => pickCover(e.target.files[0])} />
        </label>

        <div>
          <label className="label" htmlFor="title">Track title</label>
          <input id="title" className="input" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="genre">Genre</label>
            <select id="genre" className="input" value={genre} onChange={(e) => setGenre(e.target.value)}>
              {GENRES.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="country">Country</label>
            <select id="country" className="input" value={country} onChange={(e) => setCountry(e.target.value)}>
              {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <span className="label">Audio file</span>
          <label className="input flex cursor-pointer items-center justify-between gap-3">
            <span className={`truncate ${audio ? 'text-white' : 'text-zinc-500'}`}>{audio ? audio.name : 'Choose a file'}</span>
            {audio && <span className="shrink-0 text-xs text-zinc-500">{(audio.size / 1024 / 1024).toFixed(1)} MB</span>}
            <input type="file" accept="audio/*" className="hidden" onChange={(e) => setAudio(e.target.files[0] || null)} />
          </label>
          <p className="mt-1 text-xs text-zinc-500">MP3, M4A, AAC, WAV, OGG or FLAC, up to 40 MB.</p>
        </div>

        {busy && (
          <div>
            <div className="mb-1 flex justify-between text-xs text-zinc-400">
              <span>{step}</span>
              {step === 'Uploading audio' && <span>{percent}%</span>}
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-ink-700">
              <div className="h-full bg-brand transition-all" style={{ width: step === 'Uploading audio' ? `${percent}%` : '100%' }} />
            </div>
          </div>
        )}

        {error && <p className="notice-error">{error}</p>}

        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? 'Please wait...' : 'Upload track'}
        </button>
        <Link href="/artist/dashboard" className="btn btn-ghost w-full">
          Back to dashboard
        </Link>
      </form>
    </div>
  );
}
