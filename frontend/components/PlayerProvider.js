'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';

const PlayerContext = createContext(null);
export const usePlayer = () => useContext(PlayerContext);

export default function PlayerProvider({ children }) {
  const audio = useRef(null);
  const queue = useRef([]);
  const counted = useRef(new Set());
  const [current, setCurrent] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const start = useCallback((track) => {
    const el = audio.current;
    setCurrent(track);
    el.src = track.audioUrl;
    el.play().catch(() => setPlaying(false));
    if (!counted.current.has(track.id)) {
      counted.current.add(track.id);
      api(`/api/tracks/${track.id}/play`, { method: 'POST' }).catch(() => {});
    }
  }, []);

  const play = useCallback(
    (track, list = [track]) => {
      const el = audio.current;
      if (current?.id === track.id) {
        if (el.paused) el.play().catch(() => {});
        else el.pause();
        return;
      }
      queue.current = list;
      start(track);
    },
    [current, start]
  );

  const step = useCallback(
    (direction) => {
      const list = queue.current;
      if (!current || !list.length) return;
      const index = list.findIndex((t) => t.id === current.id);
      start(list[(index + direction + list.length) % list.length]);
    },
    [current, start]
  );

  const seek = useCallback((ratio) => {
    const el = audio.current;
    if (el && Number.isFinite(el.duration)) el.currentTime = ratio * el.duration;
  }, []);

  useEffect(() => {
    audio.current.onended = () => step(1);
  }, [step]);

  useEffect(() => {
    if (!current || !('mediaSession' in navigator)) return;
    const art = current.coverImage || current.artistPhoto;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.title,
      artist: current.artist,
      artwork: art ? [{ src: art }] : [],
    });
    navigator.mediaSession.setActionHandler('play', () => audio.current.play());
    navigator.mediaSession.setActionHandler('pause', () => audio.current.pause());
    navigator.mediaSession.setActionHandler('nexttrack', () => step(1));
    navigator.mediaSession.setActionHandler('previoustrack', () => step(-1));
  }, [current, step]);

  return (
    <PlayerContext.Provider value={{ current, playing, progress, play, step, seek }}>
      {children}
      <audio
        ref={audio}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setProgress(e.currentTarget.duration ? e.currentTarget.currentTime / e.currentTarget.duration : 0)}
      />
    </PlayerContext.Provider>
  );
}
