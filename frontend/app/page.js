"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [tracks, setTracks] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks`)
      .then(res => res.json())
      .then(data => setTracks(Array.isArray(data.data) ? data.data : []))
      .catch(err => {
        console.error(err);
        setTracks([]);
      });
  }, []);

  return (
    <main style={{padding:"20px", color:"white", background:"black", minHeight:"100vh"}}>
      <h1 style={{fontSize:"2rem", marginBottom:"20px"}}>Cyber Muzik 🎵</h1>
      {tracks === null ? (
        <p style={{color:"#666"}}>Loading tracks...</p>
      ) : tracks.length > 0 ? (
        tracks.map((track, i) => (
          <div key={i} style={{padding:"10px", marginBottom:"10px", border:"1px solid #333", borderRadius:"8px"}}>
            <p style={{fontWeight:"bold"}}>{track.title}</p>
            <p style={{color:"#999"}}>{track.artist?.name}</p>
          </div>
        ))
      ) : (
        <p style={{color:"#666"}}>No tracks yet. Be the first to upload!</p>
      )}
    </main>
  );
}
