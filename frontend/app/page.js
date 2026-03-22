"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ── PERSISTENT GLOBAL PLAYER ──
let globalAudio = null;
if (typeof window !== "undefined") {
  globalAudio = new Audio();
}

function AudioPlayer({ track, isActive, onPlay, index }) {
  const [progress, setProgress] = useState(0);
  const [plays, setPlays] = useState(track.plays || 0);

  useEffect(() => {
    if (!globalAudio) return;
    if (isActive) {
      globalAudio.src = track.audioUrl;
      globalAudio.play().catch(() => {});
    }
  }, [isActive]);

  useEffect(() => {
    if (!globalAudio || !isActive) return;
    const update = () => {
      const pct = (globalAudio.currentTime / globalAudio.duration) * 100;
      setProgress(pct || 0);
    };
    globalAudio.addEventListener("timeupdate", update);
    return () => globalAudio.removeEventListener("timeupdate", update);
  }, [isActive]);

  const handlePlay = () => {
    if (isActive) {
      if (globalAudio.paused) {
        globalAudio.play();
      } else {
        globalAudio.pause();
      }
    }
    setPlays(p => p + 1);
    onPlay();
  };

  const handleShare = async () => {
    const shareData = {
      title: track.title,
      text: `🎵 Listen to ${track.title} by ${track.artist} on CyberMuzik!`,
      url: window.location.href
    };
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      alert("Link copied to clipboard!");
    }
  };

  const colors = [
    "linear-gradient(135deg,#00b4d8,#0077b6)",
    "linear-gradient(135deg,#ff6b6b,#ee5a24)",
    "linear-gradient(135deg,#a29bfe,#6c5ce7)",
    "linear-gradient(135deg,#fdcb6e,#e17055)",
    "linear-gradient(135deg,#55efc4,#00b894)",
    "linear-gradient(135deg,#fd79a8,#e84393)",
    "linear-gradient(135deg,#00cec9,#00b894)",
  ];

  return (
    <div style={{borderRadius:"14px", background: isActive ? "#0f2027" : "#111", border:`1px solid ${isActive ? "#00e5ff55" : "#1e1e1e"}`, marginBottom:"10px", overflow:"hidden", transition:"all 0.2s"}}>

      {/* Cover Photo Banner — shows when active */}
      {isActive && track.coverImage && (
        <div style={{width:"100%", height:"180px", position:"relative", overflow:"hidden"}}>
          <img src={track.coverImage} alt={track.title} style={{width:"100%", height:"100%", objectFit:"cover"}}/>
          <div style={{position:"absolute", inset:0, background:"linear-gradient(to bottom, transparent 40%, #0f2027 100%)"}}/>
          <div style={{position:"absolute", bottom:"12px", left:"14px"}}>
            <p style={{fontWeight:"900", fontSize:"1.2rem"}}>{track.title}</p>
            <p style={{color:"#aaa", fontSize:"0.82rem"}}>{track.artist}</p>
          </div>
        </div>
      )}

      <div style={{display:"flex", alignItems:"center", gap:"12px", padding:"14px 16px"}}>

        {/* Artwork */}
        <div style={{width:"48px", height:"48px", borderRadius:"10px", flexShrink:0, overflow:"hidden", background: colors[index % colors.length], display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem"}}>
          {track.coverImage ? (
            <img src={track.coverImage} alt={track.title} style={{width:"100%", height:"100%", objectFit:"cover"}}/>
          ) : (
            isActive ? (
              <div style={{display:"flex", gap:"2px", alignItems:"flex-end", height:"18px"}}>
                {[14,20,10,16].map((h,i) => (
                  <div key={i} style={{width:"3px", height:`${h}px`, background:"#fff", borderRadius:"2px", animation:`eq 0.7s ease-in-out ${i*0.12}s infinite alternate`}}/>
                ))}
              </div>
            ) : "🎵"
          )}
        </div>

        {/* Info */}
        <div style={{flex:1, minWidth:0}}>
          <p style={{fontWeight:"700", fontSize:"0.92rem", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", color: isActive ? "#00e5ff" : "#fff"}}>{track.title}</p>
          <p style={{color:"#888", fontSize:"0.75rem", marginTop:"2px"}}>{track.artist} · {plays.toLocaleString()} plays</p>
          {isActive && (
            <div style={{marginTop:"6px", height:"3px", background:"#1a1a1a", borderRadius:"99px"}}>
              <div style={{width:`${progress}%`, height:"100%", background:"#00e5ff", borderRadius:"99px", transition:"width 0.4s"}}/>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{display:"flex", gap:"6px", flexShrink:0}}>
          {/* Play/Pause */}
          <button
            onClick={handlePlay}
            style={{width:"40px", height:"40px", borderRadius:"50%", background: isActive ? "#00e5ff" : "#fff", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", transition:"all 0.15s", fontWeight:"900"}}
          >
            {isActive ? "⏸" : "▶"}
          </button>

          {/* Download */}
          <a
            href={track.audioUrl}
            download
            style={{width:"40px", height:"40px", borderRadius:"50%", background:"#1a1a1a", border:"1px solid #2a2a2a", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.9rem", textDecoration:"none", color:"#fff"}}
            title="Download"
          >
            ⬇
          </a>

          {/* Share */}
          <button
            onClick={handleShare}
            style={{width:"40px", height:"40px", borderRadius:"50%", background:"#1a1a1a", border:"1px solid #2a2a2a", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.9rem", color:"#fff"}}
            title="Share"
          >
            🔗
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [tracks, setTracks] = useState(null);
  const [activeTrack, setActiveTrack] = useState(null);
  const [shuffled, setShuffled] = useState(false);
  const [displayTracks, setDisplayTracks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks`)
      .then(res => res.json())
      .then(data => {
        const t = Array.isArray(data.data) ? data.data : [];
        setTracks(t);
        setDisplayTracks(t);
      })
      .catch(() => { setTracks([]); setDisplayTracks([]); });
  }, []);

  // Persist audio across navigation
  useEffect(() => {
    if (!globalAudio) return;
    globalAudio.onended = () => {
      if (!displayTracks.length) return;
      const idx = displayTracks.findIndex(t => (t._id || t.title) === activeTrack);
      const next = displayTracks[(idx + 1) % displayTracks.length];
      setActiveTrack(next._id || next.title);
    };
  }, [displayTracks, activeTrack]);

  const handleShuffle = () => {
    if (!tracks) return;
    if (shuffled) {
      setDisplayTracks([...tracks]);
    } else {
      const arr = [...tracks];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      setDisplayTracks(arr);
    }
    setShuffled(!shuffled);
  };

  const filteredTracks = displayTracks.filter(t =>
    !searchQuery ||
    t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.artist?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top10 = tracks ? [...tracks].sort((a,b) => (b.plays||0)-(a.plays||0)).slice(0,10) : [];

  return (
    <main style={{padding:"20px", color:"white", background:"#080808", minHeight:"100vh", maxWidth:"680px", margin:"0 auto", paddingBottom:"80px"}}>

      <style>{`@keyframes eq{from{transform:scaleY(0.3);}to{transform:scaleY(1);}}`}</style>

      {/* Title */}
      <div style={{marginBottom:"20px"}}>
        <h1 style={{fontSize:"1.8rem", fontWeight:"900", letterSpacing:"-0.02em"}}>🎵 Latest Tracks</h1>
        <p style={{color:"#555", fontSize:"0.85rem", marginTop:"4px"}}>Stream, download and discover new music</p>
      </div>

      {/* Search Bar */}
      <div style={{position:"relative", marginBottom:"20px"}}>
        <div style={{display:"flex", alignItems:"center", background:"#0d0d0d", borderRadius:"16px", border:`2px solid ${searchFocused ? "#00e5ff" : "#1e1e1e"}`, overflow:"hidden", transition:"all 0.3s", boxShadow: searchFocused ? "0 0 0 3px rgba(0,229,255,0.1)" : "none"}}>
          <div style={{width:"56px", height:"56px", display:"flex", alignItems:"center", justifyContent:"center", background: searchFocused ? "#0a1f24" : "#111", borderRight:"1px solid #1e1e1e", flexShrink:0, fontSize:"1.2rem", transition:"background 0.3s"}}>🔍</div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="SEARCH TRACKS, ARTISTS..."
            style={{flex:1, height:"56px", background:"transparent", border:"none", outline:"none", color:"#fff", fontWeight:"700", fontSize:"0.95rem", padding:"0 14px"}}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} style={{width:"38px", height:"38px", marginRight:"10px", borderRadius:"50%", background:"#1a1a1a", border:"none", color:"#888", fontSize:"0.9rem", cursor:"pointer"}}>✕</button>
          )}
        </div>
      </div>

      {/* Controls Row */}
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px"}}>
        <h2 style={{fontSize:"0.78rem", fontWeight:"700", color:"#00e5ff", letterSpacing:"0.12em", textTransform:"uppercase"}}>🔥 All Tracks</h2>
        <button
          onClick={handleShuffle}
          style={{display:"flex", alignItems:"center", gap:"6px", padding:"8px 14px", borderRadius:"99px", background: shuffled ? "#00e5ff" : "#111", color: shuffled ? "#000" : "#888", border:`1px solid ${shuffled ? "#00e5ff" : "#222"}`, cursor:"pointer", fontSize:"0.75rem", fontWeight:"700", transition:"all 0.2s"}}
        >
          🔀 {shuffled ? "Shuffled" : "Shuffle"}
        </button>
      </div>

      {/* Track List */}
      {tracks === null ? (
        <p style={{color:"#555"}}>Loading tracks...</p>
      ) : tracks.length > 0 ? (
        <>
          {filteredTracks.length > 0 ? (
            filteredTracks.map((track, i) => (
              <AudioPlayer
                key={track._id || i}
                track={track}
                index={i}
                isActive={activeTrack === (track._id || track.title)}
                onPlay={() => setActiveTrack(activeTrack === (track._id || track.title) ? null : (track._id || track.title))}
              />
            ))
          ) : (
            <div style={{textAlign:"center", padding:"40px 0"}}>
              <div style={{fontSize:"2.5rem", marginBottom:"10px"}}>🔍</div>
              <p style={{fontWeight:"700", marginBottom:"4px"}}>No results found</p>
              <p style={{color:"#555", fontSize:"0.82rem"}}>Try a different search term</p>
            </div>
          )}

          {/* Top 10 */}
          {!searchQuery && top10.length > 0 && (
            <div style={{marginTop:"32px", marginBottom:"28px"}}>
              <h2 style={{fontSize:"0.78rem", fontWeight:"700", color:"#FFD700", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:"14px"}}>🏆 Top 10</h2>
              {top10.map((track, i) => (
                <div key={i} style={{display:"flex", alignItems:"center", gap:"12px", padding:"10px 14px", borderRadius:"10px", background:"#111", border:"1px solid #1e1e1e", marginBottom:"8px"}}>
                  <span style={{fontWeight:"900", fontSize:"1.1rem", width:"28px", textAlign:"center", color: i===0?"#FFD700":i===1?"#aaa":i===2?"#cd7f32":"#444", flexShrink:0}}>{i+1}</span>
                  <div style={{width:"38px", height:"38px", borderRadius:"8px", overflow:"hidden", flexShrink:0, background:"#1a1a1a", display:"flex", alignItems:"center", justifyContent:"center"}}>
                    {track.coverImage ? <img src={track.coverImage} alt={track.title} style={{width:"100%", height:"100%", objectFit:"cover"}}/> : "🎵"}
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <p style={{fontWeight:"700", fontSize:"0.88rem", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{track.title}</p>
                    <p style={{color:"#555", fontSize:"0.73rem"}}>{track.artist}</p>
                  </div>
                  <span style={{color:"#444", fontSize:"0.72rem", flexShrink:0}}>{(track.plays||0).toLocaleString()} plays</span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <p style={{color:"#555"}}>No tracks yet. Be the first to upload!</p>
      )}

      {/* Sign up CTA */}
      <div style={{marginTop:"32px", padding:"20px", borderRadius:"16px", background:"#111", border:"1px solid #1e1e1e", textAlign:"center"}}>
        <p style={{fontSize:"1.1rem", fontWeight:"800", marginBottom:"6px"}}>Are you an artist? 🎤</p>
        <p style={{color:"#555", fontSize:"0.82rem", marginBottom:"16px"}}>Upload your music and reach new fans</p>
        <div style={{display:"flex", gap:"10px", justifyContent:"center"}}>
          <a href="/register" style={{padding:"10px 20px", borderRadius:"99px", background:"#00e5ff", color:"#000", fontWeight:"800", fontSize:"0.82rem", textDecoration:"none"}}>Create Account</a>
          <a href="/login" style={{padding:"10px 20px", borderRadius:"99px", background:"transparent", color:"#fff", fontWeight:"700", fontSize:"0.82rem", textDecoration:"none", border:"1px solid #222"}}>Sign In</a>
        </div>
      </div>

    </main>
  );
    }
