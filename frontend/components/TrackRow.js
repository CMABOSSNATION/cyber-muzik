'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Download, Heart, Pause, Play, Share2 } from 'lucide-react';
import Cover from './Cover';
import { usePlayer } from './PlayerProvider';
import { api, downloadTrack } from '../lib/api';

const LIKED_KEY = 'cm_liked';

function readLiked() {
  try {
    return JSON.parse(localStorage.getItem(LIKED_KEY) || '[]');
  } catch {
    return [];
  }
}

export default function TrackRow({ track, list, rank }) {
  const { current, playing, play } = usePlayer();
  const [liked, setLiked] = useState(() => typeof window !== 'undefined' && readLiked().includes(track.id));
  const [likes, setLikes] = useState(track.likes || 0);
  const [busy, setBusy] = useState(false);

  const active = current?.id === track.id;
  const canShare = typeof navigator !== 'undefined' && Boolean(navigator.share);

  const like = () => {
    if (liked) return;
    setLiked(true);
    setLikes((n) => n + 1);
    localStorage.setItem(LIKED_KEY, JSON.stringify([...readLiked(), track.id]));
    api(`/api/tracks/${track.id}/like`, { method: 'POST' }).catch(() => {});
  };

  const download = async () => {
    setBusy(true);
    try {
      await downloadTrack(track);
    } catch {}
    setBusy(false);
  };

  const share = () => navigator.share({ title: `${track.title} by ${track.artist}`, url: window.location.origin }).catch(() => {});

  return (
    <div className={`flex items-center gap-3 rounded-xl border p-3 ${active ? 'border-brand/60 bg-ink-800' : 'border-ink-700 bg-ink-900'}`}>
      {rank && <span className="w-6 shrink-0 text-center text-sm font-semibold text-zinc-500">{rank}</span>}
      <button
        aria-label={active && playing ? `Pause ${track.title}` : `Play ${track.title}`}
        onClick={() => play(track, list)}
        className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg"
      >
        <Cover src={track.coverImage || track.artistPhoto} label={track.title} className="h-full w-full" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
          {active && playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </span>
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{track.title}</p>
        <p className="truncate text-xs text-zinc-400">
          {track.artistId ? (
            <Link href={`/artist?id=${track.artistId}`} className="hover:text-white">
              {track.artist}
            </Link>
          ) : (
            track.artist
          )}
          {track.genre ? ` · ${track.genre}` : ''}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">
          {(track.plays || 0).toLocaleString()} plays
          {track.promoted ? ' · Featured' : ''}
        </p>
      </div>
      <div className="flex shrink-0 items-center">
        <button aria-label="Like" onClick={like} className={`flex items-center gap-1 p-2 text-xs ${liked ? 'text-brand' : 'text-zinc-400 hover:text-white'}`}>
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
          {likes > 0 && likes}
        </button>
        <button aria-label="Download" onClick={download} disabled={busy} className="p-2 text-zinc-400 hover:text-white disabled:opacity-50">
          <Download size={18} />
        </button>
        {canShare && (
          <button aria-label="Share" onClick={share} className="p-2 text-zinc-400 hover:text-white">
            <Share2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
