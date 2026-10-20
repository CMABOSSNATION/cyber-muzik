'use client';
import { useEffect, useState } from 'react';

const KEY = 'cm_session';
const EVENT = 'cm-session';

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
}

export function saveSession(token, artist) {
  localStorage.setItem(KEY, JSON.stringify({ token, artist }));
  window.dispatchEvent(new Event(EVENT));
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function useSession() {
  const [state, setState] = useState({ ready: false, token: null, artist: null });

  useEffect(() => {
    const sync = () => {
      const s = read();
      setState({ ready: true, token: s?.token || null, artist: s?.artist || null });
    };
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return state;
}
