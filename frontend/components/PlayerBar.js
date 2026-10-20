'use client';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import Cover from './Cover';
import { usePlayer } from './PlayerProvider';

export default function PlayerBar() {
  const { current, playing, progress, play, step, seek } = usePlayer();
  if (!current) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-700 bg-ink-900/95 backdrop-blur">
      <div
        className="h-1 w-full cursor-pointer bg-ink-700"
        onClick={(e) => {
          const box = e.currentTarget.getBoundingClientRect();
          seek((e.clientX - box.left) / box.width);
        }}
      >
        <div className="h-full bg-brand" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
        <Cover src={current.coverImage || current.artistPhoto} label={current.title} className="h-11 w-11 shrink-0 rounded-md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{current.title}</p>
          <p className="truncate text-xs text-zinc-400">{current.artist}</p>
        </div>
        <button aria-label="Previous track" onClick={() => step(-1)} className="p-2 text-zinc-300 hover:text-white">
          <SkipBack size={20} />
        </button>
        <button
          aria-label={playing ? 'Pause' : 'Play'}
          onClick={() => play(current)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black"
        >
          {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>
        <button aria-label="Next track" onClick={() => step(1)} className="p-2 text-zinc-300 hover:text-white">
          <SkipForward size={20} />
        </button>
      </div>
    </div>
  );
}
