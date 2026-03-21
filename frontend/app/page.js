"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

function AudioPlayer({ track, isActive, onPlay }) {
  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [plays, setPlays] = useState(track.plays || 0);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isActive) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isActive]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(pct || 0);
  };

  const handlePlay = () => {
    setPlays(p => p + 1);
    onPlay();
  };

  return (
    <div style={{display:"flex", alignItems:"center", gap:"14px", padding:"14px 16px", borderRadius:"12px", background: isActive ? "#0f2027" : "#111", border:`1px solid ${isActive ? "#00e5ff" : "#222"}`, marginBottom:"10px", transition:"all 0.2s"}}>
      <div style={{width:"42px", height:"42px", borderRadius:"50%", background:"linear-gradient(135deg,#00e5ff,#0077ff)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:"1.1rem"}}>
        🎵
      </div>
      <div style={{flex:1, minWidth:0}}>
        <p style={{fontWeight:"700", fontSize:"0.95rem", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{track.title}</p>
        <p style={{color:"#888", fontSize:"0.78rem", marginTop:"2px"}}>{track.artist} · {plays.toLocaleString()} plays</p>
        {isActive && (
          <div style={{marginTop:"6px", height:"3px", background:"#222", borderRadius:"99px"}}>
            <div style={{width:`${progress}%`, height:"100%", background:"#00e5ff", borderRadius:"99px", transition:"width 0.5s"}} />
          </div>
        )}
      </div>
      <div style={{display:"flex", gap:"8px", flexShrink:0}}>
        <button onClick={handlePlay} style={{width:"36px", height:"36px", borderRadius:"50%", background: isActive ? "#00e5ff" : "#fff", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.9rem"}}>
          {isActive ? "II" : "▶️"}
        </button>
        <a href={track.audioUrl} download style={{width:"36px", height:"36px", borderRadius:"50%", background:"#1a1a1a", border:"1px solid #333", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.85rem", textDecoration:"none"}}>
          ⬇
        </a>
      </div>
      <audio ref={audioRef} src={track.audioUrl} onTimeUpdate={handleTimeUpdate} onEnded={() => onPlay(null)} />
    </div>
  );
}

export default function Home() {
  const [tracks, setTracks] = useState(null);
  const [activeTrack, setActiveTrack] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks`)
      .then(res => res.json())
      .then(data => setTracks(Array.isArray(data.data) ? data.data : []))
      .catch(() => setTracks([]));
  }, []);

  const top10 = tracks ? [...tracks].slice(0, 10) : [];
  const top100 = tracks ? [...tracks].slice(0, 100) : [];

  return (
    <main style={{padding:"20px", color:"white", background:"#080808", minHeight:"100vh", maxWidth:"680px", margin:"0 auto"}}>

      {/* Hero */}
      <div style={{marginBottom:"28px"}}>
        <h1 style={{fontSize:"1.8rem", fontWeight:"900", letterSpacing:"-0.02em"}}>🎵 Latest Tracks</h1>
        <p style={{color:"#555", fontSize:"0.85rem", marginTop:"4px"}}>Stream, download and discover new music</p>
      </div>

      {/* All Tracks */}
      {tracks === null ? (
        <p style={{color:"#555"}}>Loading tracks...</p>
      ) : tracks.length > 0 ? (
        <>
          <div style={{marginBottom:"28px"}}>
            <h2 style={{fontSize:"1rem", fontWeight:"700", color:"#00e5ff", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"14px"}}>🔥 All Tracks</h2>
            {tracks.map((track, i) => (
              <AudioPlayer
                key={track._id || i}
                track={track}
                isActive={activeTrack === (track._id || i)}
                onPlay={() => setActiveTrack(activeTrack === (track._id || i) ? null : (track._id || i))}
              />
            ))}
          </div>

          {/* Top 10 */}
          {top10.length > 0 && (
            <div style={{marginBottom:"28px"}}>
              <h2 style={{fontSize:"1rem", fontWeight:"700", color:"#FFD700", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"14px"}}>🏆 Top 10</h2>
              {top10.map((track, i) => (
                <div key={i} style={{display:"flex", alignItems:"center", gap:"12px", padding:"10px 14px", borderRadius:"10px", background:"#111", border:"1px solid #222", marginBottom:"8px"}}>
                  <span style={{fontWeight:"900", fontSize:"1.2rem", color:"#FFD700", width:"28px"}}>{i + 1}</span>
                  <div style={{flex:1}}>
                    <p style={{fontWeight:"700", fontSize:"0.9rem"}}>{track.title}</p>
                    <p style={{color:"#666", fontSize:"0.78rem"}}>{track.artist}</p>
                  </div>
                  <span style={{color:"#555", fontSize:"0.75rem"}}>{(track.plays || 0).toLocaleString()} plays</span>
                </div>
              ))}
            </div>
          )}

          {/* Top 100 */}
          {top100.length > 10 && (
            <div style={{marginBottom:"28px"}}>
              <h2 style={{fontSize:"1rem", fontWeight:"700", color:"#ff6b6b", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"14px"}}>💯 Top 100</h2>
              {top100.slice(10).map((track, i) => (
                <div key={i} style={{display:"flex", alignItems:"center", gap:"12px", padding:"8px 14px", borderRadius:"10px", background:"#0d0d0d", border:"1px solid #1a1a1a", marginBottom:"6px"}}>
                  <span style={{fontWeight:"700", fontSize:"0.9rem", color:"#ff6b6b", width:"32px"}}>{i + 11}</span>
                  <div style={{flex:1}}>
                    <p style={{fontSize:"0.88rem", fontWeight:"600"}}>{track.title}</p>
                    <p style={{color:"#555", fontSize:"0.75rem"}}>{track.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <p style={{color:"#555"}}>No tracks yet. Be the first to upload!</p>
      )}
    </main>
  );
}
