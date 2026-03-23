"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [artist, setArtist] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("artist");
    if (stored) setArtist(JSON.parse(stored));

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else {
      alert('To install: tap ⋮ menu in Chrome → Add to Home Screen');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-zinc-900">
      {/* Top row */}
      <div className="max-w-2xl mx-auto px-4 flex items-center gap-0">
        <Link href="/" className="font-black text-lg text-cyan-400 py-3 mr-auto tracking-tight">
          CYBER<span className="text-white">MUZIK</span>
        </Link>
        <Link href="/" className="px-3 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-white transition">Home</Link>
        <Link href="/charts" className="px-3 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-white transition">Charts</Link>
        <Link href="/news" className="px-3 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-white transition">News</Link>
        {artist ? (
          <Link href="/artist/dashboard" className="ml-2 flex items-center gap-2 bg-zinc-900 border border-zinc-700 px-3 py-2 rounded-full text-xs font-bold hover:border-cyan-400 transition">
            {artist.profilePhoto ? (
              <img src={artist.profilePhoto} alt={artist.username} style={{width:"22px", height:"22px", borderRadius:"50%", objectFit:"cover"}}/>
            ) : (
              <span>🎵</span>
            )}
            <span className="text-white">{artist.username}</span>
          </Link>
        ) : (
          <Link href="/login" className="ml-2 bg-cyan-400 text-black px-4 py-2 rounded-full text-xs font-bold hover:scale-105 transition">
            SIGN IN
          </Link>
        )}
      </div>

      {/* Install button row — sits under CYBERMUZIK */}
      <div className="max-w-2xl mx-auto px-4 pb-2">
        <button
          onClick={handleInstall}
          style={{
            display:"flex", alignItems:"center", gap:"6px",
            background:"linear-gradient(135deg,#E8640A,#D4006A)",
            color:"#fff", padding:"5px 14px", borderRadius:"99px",
            fontSize:"0.7rem", fontWeight:"800", border:"none",
            cursor:"pointer"
          }}
        >
          ⬇ Download App
        </button>
      </div>
    </nav>
  );
    }
