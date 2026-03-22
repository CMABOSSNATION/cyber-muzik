"use client";
import { useState, useEffect, useRef, useCallback } from "react";

let globalAudio = null;
if (typeof window !== "undefined") {
  globalAudio = new Audio();
}

function ArtistCard({ track, isActive, onPlay, index, onRefresh }) {
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const playRecorded = useRef(false);

  const plays = track.plays || 0;
  const likes = track.likes || 0;
  const downloads = track.downloads || 0;

  useEffect(() => {
    const likedTracks = JSON.parse(localStorage.getItem("likedTracks") || "[]");
    if (likedTracks.includes(track._id)) setLiked(true);
  }, [track._id]);

  useEffect(() => {
    if (!globalAudio) return;
    if (isActive) {
      globalAudio.src = track.audioUrl;
      globalAudio.play().catch(() => {});
      playRecorded.current = false;
      if (!playRecorded.current) {
        playRecorded.current = true;
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${track._id}/play`,
          { method: "POST" }
        ).then(() => onRefresh()).catch(() => {});
      }
    } else {
      globalAudio.pause();
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

  const handleLike = async (e) => {
    e.stopPropagation();
    if (liked) return;
    setLiked(true);
    const likedTracks = JSON.parse(localStorage.getItem("likedTracks") || "[]");
    localStorage.setItem("likedTracks", JSON.stringify([...likedTracks, track._id]));
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${track._id}/like`,
        { method: "POST" }
      );
      onRefresh();
    } catch (err) {}
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${track._id}/download`,
        { method: "POST" }
      );
      onRefresh();
    } catch (err) {}
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const text = `🎵 Listen to ${track.title} by ${track.artist} on CyberMuzik!`;
    if (navigator.share) {
      await navigator.share({ title: track.title, text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(`${text} ${window.location.href}`);
      alert("Link copied!");
    }
  };

  const gradients = [
    "linear-gradient(135deg,#6B0F3A,#3a0820)",
    "linear-gradient(135deg,#7B2FBE,#3a1060)",
    "linear-gradient(135deg,#E8640A,#7a300a)",
    "linear-gradient(135deg,#D4006A,#6a0030)",
    "linear-gradient(135deg,#00C9B1,#006a5a)",
    "linear-gradient(135deg,#6B0F3A,#7B2FBE)",
    "linear-gradient(135deg,#E8640A,#D4006A)",
  ];

  return (
    <div
      onClick={onPlay}
      style={{
        position:"relative", borderRadius:"18px", overflow:"hidden",
        marginBottom:"14px", cursor:"pointer",
        background: gradients[index % gradients.length],
        border:`2px solid ${isActive ? "#E8640A" : "rgba(255,255,255,0.07)"}`,
        transition:"all 0.2s",
        boxShadow: isActive ? "0 0 24px rgba(232,100,10,0.25)" : "none"
      }}
    >
      {(track.artistCover || track.artistPhoto || track.coverImage) ? (
        <img
          src={track.artistCover || track.artistPhoto || track.coverImage}
          alt={track.artist}
          style={{width:"100%", height:"220px", objectFit:"cover", display:"block"}}
        />
      ) : (
        <div style={{width:"100%", height:"220px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"5rem", background: gradients[index % gradients.length]}}>🎤</div>
      )}

      <div style={{position:"absolute", top:"12px", right:"12px", display:"flex", gap:"5px", flexWrap:"wrap", justifyContent:"flex-end"}}>
        {isActive && (
          <div style={{background:"rgba(232,100,10,0.85)", backdropFilter:"blur(8px)", padding:"4px 10px", borderRadius:"99px", fontSize:"0.65rem", fontWeight:"700", display:"flex", alignItems:"center", gap:"4px"}}>
            <div style={{display:"flex", gap:"2px", alignItems:"flex-end", height:"14px"}}>
              {[10,14,8,12].map((h,i) => (
                <div key={i} style={{width:"2px", height:`${h}px`, background:"#fff", borderRadius:"2px", animation:`eq 0.65s ease-in-out ${i*0.12}s infinite alternate`}}/>
              ))}
            </div>
            LIVE
          </div>
        )}
        <div style={{background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)", border:"1px solid rgba(232,100,10,0.4)", padding:"4px 10px", borderRadius:"99px", fontSize:"0.65rem", fontWeight:"700"}}>
          ▶ {plays.toLocaleString()}
        </div>
        <div style={{background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)", border:"1px solid rgba(212,0,106,0.4)", padding:"4px 10px", borderRadius:"99px", fontSize:"0.65rem", fontWeight:"700"}}>
          ❤️ {likes.toLocaleString()}
        </div>
        <div style={{background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)", border:"1px solid rgba(0,201,177,0.4)", padding:"4px 10px", borderRadius:"99px", fontSize:"0.65rem", fontWeight:"700"}}>
          ⬇ {downloads.toLocaleString()}
        </div>
      </div>

      <div style={{position:"absolute", inset:0, background: isActive ? "linear-gradient(to bottom, rgba(232,100,10,0.06) 0%, rgba(0,0,0,0.92) 100%)" : "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.92) 100%)"}}/>

      <div style={{position:"absolute", bottom:0, left:0, right:0, padding:"16px"}}>
        <p style={{fontWeight:"900", fontSize:"1.1rem", marginBottom:"2px"}}>{track.artist}</p>
        <p style={{color:"#ddd", fontSize:"0.8rem", marginBottom:"10px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>🎵 {track.title}</p>

        {isActive && (
          <div style={{height:"3px", background:"rgba(255,255,255,0.2)", borderRadius:"99px", marginBottom:"12px", overflow:"hidden"}}>
            <div style={{width:`${progress}%`, height:"100%", background:"linear-gradient(90deg,#E8640A,#D4006A)", borderRadius:"99px", transition:"width 0.4s"}}/>
          </div>
        )}

        <div style={{display:"flex", alignItems:"center", gap:"8px"}} onClick={e => e.stopPropagation()}>
          <button
            onClick={onPlay}
            style={{flex:1, height:"44px", borderRadius:"12px", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", fontWeight:"800", fontSize:"0.88rem", background: isActive ? "linear-gradient(135deg,#E8640A,#D4006A)" : "#fff", color:"#000", transition:"all 0.2s"}}
          >
            <div style={{width:"24px", height:"24px", borderRadius:"50%", background:"rgba(0,0,0,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.75rem"}}>
              {isActive ? "⏸" : "▶"}
            </div>
            {isActive ? "PAUSE" : "PLAY"}
          </button>
          <button
            onClick={handleLike}
            style={{width:"44px", height:"44px", borderRadius:"12px", border:`1px solid ${liked ? "rgba(212,0,106,0.6)" : "rgba(255,255,255,0.15)"}`, background: liked ? "rgba(212,0,106,0.25)" : "rgba(255,255,255,0.1)", cursor: liked ? "default" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", color:"#fff"}}
          >
            {liked ? "❤️" : "🤍"}
          </button>
          <a
            href={track.audioUrl}
            download
            onClick={handleDownload}
            style={{width:"44px", height:"44px", borderRadius:"12px", border:"1px solid rgba(0,201,177,0.3)", background:"rgba(0,201,177,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", color:"#fff", textDecoration:"none"}}
          >⬇</a>
          <button
            onClick={handleShare}
            style={{width:"44px", height:"44px", borderRadius:"12px", border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.08)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", color:"#fff"}}
          >🔗</button>
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

  const loadTracks = useCallback(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks`)
      .then(res => res.json())
      .then(data => {
        const t = Array.isArray(data.data) ? data.data : [];
        setTracks(t);
        setDisplayTracks(prev => {
          if (prev.length === 0 || !shuffled) return t;
          return prev.map(p => t.find(n => n._id === p._id) || p);
        });
      })
      .catch(() => { setTracks([]); setDisplayTracks([]); });
  }, [shuffled]);

  useEffect(() => {
    loadTracks();
    const interval = setInterval(loadTracks, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!globalAudio) return;
    globalAudio.onended = () => {
      if (!displayTracks.length) return;
      const idx = displayTracks.findIndex(t => t._id === activeTrack);
      const next = displayTracks[(idx + 1) % displayTracks.length];
      setActiveTrack(next._id);
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

  const top10 = tracks
    ? [...tracks].sort((a,b) => (b.plays||0)-(a.plays||0)).slice(0,10)
    : [];

  return (
    <main style={{padding:"20px", color:"white", background:"linear-gradient(160deg,#1a0810 0%,#0d0520 50%,#1a0810 100%)", minHeight:"100vh", maxWidth:"480px", margin:"0 auto", paddingBottom:"80px"}}>

      <style>{`@keyframes eq{from{transform:scaleY(0.3);}to{transform:scaleY(1);}} body{background:#1a0810;}`}</style>

      <div style={{marginBottom:"20px"}}>
        <h1 style={{fontSize:"1.8rem", fontWeight:"900", letterSpacing:"-0.02em", background:"linear-gradient(90deg,#E8640A,#D4006A,#7B2FBE)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>🎵 Latest Tracks</h1>
        <p style={{color:"#aa7788", fontSize:"0.85rem", marginTop:"4px"}}>Stream · Download · Discover</p>
      </div>

      <div style={{marginBottom:"20px"}}>
        <div style={{display:"flex", alignItems:"center", background:"rgba(255,255,255,0.05)", borderRadius:"16px", border:`2px solid ${searchFocused ? "#E8640A" : "rgba(255,255,255,0.1)"}`, overflow:"hidden", transition:"all 0.3s", boxShadow: searchFocused ? "0 0 0 3px rgba(232,100,10,0.12)" : "none"}}>
          <div style={{width:"56px", height:"56px", display:"flex", alignItems:"center", justifyContent:"center", background: searchFocused ? "rgba(232,100,10,0.12)" : "rgba(255,255,255,0.05)", borderRight:"1px solid rgba(255,255,255,0.08)", flexShrink:0, fontSize:"1.2rem"}}>🔍</div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="SEARCH TRACKS, ARTISTS..."
            style={{flex:1, height:"56px", background:"transparent", border:"none", outline:"none", color:"#fff", fontWeight:"700", fontSize:"0.92rem", padding:"0 14px"}}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} style={{width:"38px", height:"38px", marginRight:"10px", borderRadius:"50%", background:"rgba(255,255,255,0.1)", border:"none", color:"#aaa", fontSize:"0.9rem", cursor:"pointer"}}>✕</button>
          )}
        </div>
      </div>

      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px"}}>
        <h2 style={{fontSize:"0.75rem", fontWeight:"700", color:"#E8640A", letterSpacing:"0.12em", textTransform:"uppercase"}}>🎤 Artists & Music</h2>
        <button
          onClick={handleShuffle}
          style={{display:"flex", alignItems:"center", gap:"6px", padding:"7px 14px", borderRadius:"99px", background: shuffled ? "linear-gradient(135deg,#E8640A,#D4006A)" : "rgba(255,255,255,0.07)", color: shuffled ? "#fff" : "#888", border:`1px solid ${shuffled ? "transparent" : "rgba(255,255,255,0.1)"}`, cursor:"pointer", fontSize:"0.72rem", fontWeight:"700", transition:"all 0.2s"}}
        >
          🔀 {shuffled ? "Shuffled" : "Shuffle"}
        </button>
      </div>

      {tracks === null ? (
        <p style={{color:"#aa7788"}}>Loading tracks...</p>
      ) : tracks.length > 0 ? (
        <>
          {filteredTracks.length > 0 ? (
            filteredTracks.map((track, i) => (
              <ArtistCard
                key={track._id}
                track={track}
                index={i}
                isActive={activeTrack === track._id}
                onPlay={() => setActiveTrack(activeTrack === track._id ? null : track._id)}
                onRefresh={loadTracks}
              />
            ))
          ) : (
            <div style={{textAlign:"center", padding:"40px 0"}}>
              <div style={{fontSize:"2.5rem", marginBottom:"10px"}}>🔍</div>
              <p style={{fontWeight:"700", marginBottom:"4px"}}>No results found</p>
              <p style={{color:"#aa7788", fontSize:"0.82rem"}}>Try a different search term</p>
            </div>
          )}

          {!searchQuery && top10.length > 0 && (
            <div style={{marginTop:"32px", marginBottom:"28px"}}>
              <h2 style={{fontSize:"0.75rem", fontWeight:"700", color:"#FFD700", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:"14px"}}>🏆 Top 10</h2>
              {top10.map((track, i) => (
                <div key={i}
                  style={{display:"flex", alignItems:"center", gap:"12px", padding:"10px 14px", borderRadius:"10px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", marginBottom:"8px", cursor:"pointer"}}
                  onClick={() => setActiveTrack(track._id)}
                >
                  <span style={{fontWeight:"900", fontSize:"1.1rem", width:"28px", textAlign:"center", flexShrink:0, color: i===0?"#FFD700":i===1?"#aaa":i===2?"#cd7f32":"#555"}}>{i+1}</span>
                  <div style={{width:"42px", height:"42px", borderRadius:"8px", overflow:"hidden", flexShrink:0, background:"rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center"}}>
                    {(track.artistCover||track.artistPhoto||track.coverImage) ? <img src={track.artistCover||track.artistPhoto||track.coverImage} alt={track.title} style={{width:"100%", height:"100%", objectFit:"cover"}}/> : "🎵"}
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <p style={{fontWeight:"700", fontSize:"0.88rem", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{track.title}</p>
                    <p style={{color:"#aa7788", fontSize:"0.72rem"}}>{track.artist}</p>
                  </div>
                  <span style={{color:"#E8640A", fontSize:"0.72rem", flexShrink:0, fontWeight:"700"}}>{(track.plays||0).toLocaleString()} plays</span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <p style={{color:"#aa7788"}}>No tracks yet. Be the first to upload!</p>
      )}

      <div style={{marginTop:"32px", padding:"20px", borderRadius:"16px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(232,100,10,0.2)", textAlign:"center"}}>
        <p style={{fontSize:"1.1rem", fontWeight:"800", marginBottom:"6px"}}>Are you an artist? 🎤</p>
        <p style={{color:"#aa7788", fontSize:"0.82rem", marginBottom:"16px"}}>Upload your music and reach new fans</p>
        <div style={{display:"flex", gap:"10px", justifyContent:"center"}}>
          <a href="/register" style={{padding:"10px 20px", borderRadius:"99px", background:"linear-gradient(135deg,#E8640A,#D4006A)", color:"#fff", fontWeight:"800", fontSize:"0.82rem", textDecoration:"none"}}>Create Account</a>
          <a href="/login" style={{padding:"10px 20px", borderRadius:"99px", background:"transparent", color:"#fff", fontWeight:"700", fontSize:"0.82rem", textDecoration:"none", border:"1px solid rgba(255,255,255,0.2)"}}>Sign In</a>
        </div>
      </div>

    </main>
  );
  }
