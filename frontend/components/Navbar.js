"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [artist, setArtist] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("artist");
    if (stored) setArtist(JSON.parse(stored));
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-zinc-900">
      <div className="max-w-2xl mx-auto px-4 flex items-center gap-0">
        <Link href="/" className="font-black text-lg text-cyan-400 py-4 mr-auto tracking-tight">
          CYBER<span className="text-white">MUZIK</span>
        </Link>
        <Link href="/" className="px-3 py-4 text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-white transition">Home</Link>
        <Link href="/charts" className="px-3 py-4 text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-white transition">Charts</Link>
        <Link href="/news" className="px-3 py-4 text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-white transition">News</Link>
        {artist ? (
          <Link href="/artist/dashboard" className="ml-3 flex items-center gap-2 bg-zinc-900 border border-zinc-700 px-3 py-2 rounded-full text-xs font-bold hover:border-cyan-400 transition">
            {artist.profilePhoto ? (
              <img src={artist.profilePhoto} alt={artist.username} style={{width:"22px", height:"22px", borderRadius:"50%", objectFit:"cover"}}/>
            ) : (
              <span>🎵</span>
            )}
            <span className="text-white">{artist.username}</span>
          </Link>
        ) : (
          <Link href="/login" className="ml-3 bg-cyan-400 text-black px-4 py-2 rounded-full text-xs font-bold hover:scale-105 transition">
            SIGN IN
          </Link>
        )}
      </div>
    </nav>
  );
}
