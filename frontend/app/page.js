"use client"; // This tells Next.js this page uses interactive components

import { useState, useEffect } from "react";
import Audioplayer from "../components/Audioplayer";

// 1. The Fetcher (remains the same)
async function getTracks() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
}

export default function Home() {
  const [tracks, setTracks] = useState([]);
  const [isClient, setIsClient] = useState(false);

  // 2. The Safety Guard
  useEffect(() => {
    setIsClient(true); // Tell the app we are now in a browser
    getTracks().then((data) => setTracks(data));
  }, []);

  // 3. Prevent the "Application Error" crash
  if (!isClient) {
    return <div className="p-8 text-white">Loading Cyber-Muzik...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Explore Tracks</h1>
      
      {/* 4. Track Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tracks.length > 0 ? (
          tracks.map((track) => (
            <div key={track._id || track.id} className="bg-zinc-900 p-4 rounded-lg">
              <img src={track.coverImage} alt={track.title} className="rounded mb-2" />
              <h2 className="font-semibold">{track.title}</h2>
              <p className="text-zinc-400 text-sm">{track.artist?.name}</p>
            </div>
          ))
        ) : (
          <p>No tracks found or backend is offline.</p>
        )}
      </div>

      {/* 5. The Component that was causing the crash */}
      <Audioplayer />
    </div>
  );
              }
  
