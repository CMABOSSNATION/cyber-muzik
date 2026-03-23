"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function ArtistDashboard() {
  const router = useRouter();
  const [artist, setArtist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [message, setMessage] = useState("");
  const [lastRefresh, setLastRefresh] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("artist");
    const token = localStorage.getItem("token");
    if (!stored || !token) { router.push("/login"); return; }
    setArtist(JSON.parse(stored));
    fetchMyTracks(token);
  }, []);

  const fetchMyTracks = useCallback(async (tokenArg) => {
    const token = tokenArg || localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tracks/artist/mytracks`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setTracks(Array.isArray(data.data) ? data.data : []);
      setLastRefresh(new Date().toLocaleTimeString());
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => fetchMyTracks(), 30000);
    return () => clearInterval(interval);
  }, [fetchMyTracks]);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTracks(t => t.filter(tr => tr._id !== id));
        setMessage("Track deleted ✅");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.message || "Delete failed.");
      }
    } catch (err) { setMessage("Something went wrong."); }
    setDeleteId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("artist");
    router.push("/");
  };

  const totalPlays = tracks.reduce((sum, t) => sum + (t.plays || 0), 0);
  const totalDownloads = tracks.reduce((sum, t) => sum + (t.downloads || 0), 0);
  const totalLikes = tracks.reduce((sum, t) => sum + (t.likes || 0), 0);

  return (
    <main style={{padding:"20px", color:"white", background:"linear-gradient(160deg,#1a0810 0%,#0d0520 50%,#1a0810 100%)", minHeight:"100vh", maxWidth:"680px", margin:"0 auto", paddingBottom:"40px"}}>

      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"24px"}}>
        <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
          {artist?.profilePhoto ? (
            <img src={artist.profilePhoto} alt="Profile" style={{width:"52px", height:"52px", borderRadius:"50%", objectFit:"cover", border:"2px solid #E8640A"}}/>
          ) : (
            <div style={{width:"52px", height:"52px", borderRadius:"50%", background:"linear-gradient(135deg,#E8640A,#D4006A)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem"}}>🎵</div>
          )}
          <div>
            <h1 style={{fontWeight:"900", fontSize:"1.2rem", background:"linear-gradient(90deg,#E8640A,#D4006A)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>{artist?.username || "Artist"}</h1>
            <p style={{color:"#aa7788", fontSize:"0.75rem"}}>{artist?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} style={{padding:"8px 16px", borderRadius:"99px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"#888", fontSize:"0.75rem", cursor:"pointer"}}>Sign Out</button>
      </div>

      {artist?.coverPhoto && (
        <div style={{width:"100%", height:"140px", borderRadius:"14px", overflow:"hidden", marginBottom:"24px", border:"1px solid rgba(232,100,10,0.3)"}}>
          <img src={artist.coverPhoto} alt="Cover" style={{width:"100%", height:"100%", objectFit:"cover"}}/>
        </div>
      )}

      {artist?.bio && (
        <div style={{background:"rgba(255,255,255,0.04)", border:"1px solid rgba(232,100,10,0.15)", borderRadius:"12px", padding:"14px", marginBottom:"24px"}}>
          <p style={{color:"#cc9aaa", fontSize:"0.82rem", lineHeight:"1.6"}}>{artist.bio}</p>
        </div>
      )}

      <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px", marginBottom:"8px"}}>
        <div style={{background:"rgba(232,100,10,0.1)", border:"1px solid rgba(232,100,10,0.25)", borderRadius:"12px", padding:"16px", textAlign:"center"}}>
          <div style={{fontWeight:"900", fontSize:"1.4rem", color:"#E8640A"}}>{totalPlays.toLocaleString()}</div>
          <div style={{fontSize:"0.65rem", color:"#aa7788", textTransform:"uppercase", letterSpacing:"0.08em", marginTop:"4px"}}>▶ Plays</div>
        </div>
        <div style={{background:"rgba(0,201,177,0.1)", border:"1px solid rgba(0,201,177,0.25)", borderRadius:"12px", padding:"16px", textAlign:"center"}}>
          <div style={{fontWeight:"900", fontSize:"1.4rem", color:"#00C9B1"}}>{totalDownloads.toLocaleString()}</div>
          <div style={{fontSize:"0.65rem", color:"#aa7788", textTransform:"uppercase", letterSpacing:"0.08em", marginTop:"4px"}}>⬇ Downloads</div>
        </div>
        <div style={{background:"rgba(212,0,106,0.1)", border:"1px solid rgba(212,0,106,0.25)", borderRadius:"12px", padding:"16px", textAlign:"center"}}>
          <div style={{fontWeight:"900", fontSize:"1.4rem", color:"#D4006A"}}>{totalLikes.toLocaleString()}</div>
          <div style={{fontSize:"0.65rem", color:"#aa7788", textTransform:"uppercase", letterSpacing:"0.08em", marginTop:"4px"}}>❤️ Likes</div>
        </div>
      </div>

      {lastRefresh && (
        <p style={{color:"#555", fontSize:"0.68rem", textAlign:"right", marginBottom:"20px"}}>
          Updated: {lastRefresh} · auto-refreshes every 30s
        </p>
      )}

      <div style={{display:"flex", gap:"10px", marginBottom:"24px"}}>
        <button onClick={() => router.push("/upload")} style={{flex:1, padding:"14px", borderRadius:"12px", background:"linear-gradient(135deg,#E8640A,#D4006A)", color:"#fff", fontWeight:"800", fontSize:"1rem", border:"none", cursor:"pointer"}}>
          + Upload New Track
        </button>
        <button onClick={() => fetchMyTracks()} style={{padding:"14px 16px", borderRadius:"12px", background:"rgba(255,255,255,0.05)", color:"#E8640A", fontWeight:"700", fontSize:"0.9rem", border:"1px solid rgba(232,100,10,0.3)", cursor:"pointer"}} title="Refresh now">
          🔄
        </button>
      </div>

      {message && (
        <div style={{padding:"12px", borderRadius:"10px", background: message.includes("✅") ? "rgba(0,201,177,0.1)" : "rgba(212,0,106,0.1)", border:`1px solid ${message.includes("✅") ? "#00C9B1" : "#D4006A"}`, color: message.includes("✅") ? "#00C9B1" : "#D4006A", fontSize:"0.85rem", textAlign:"center", marginBottom:"16px"}}>
          {message}
        </div>
      )}

      <h2 style={{fontSize:"0.78rem", fontWeight:"700", color:"#E8640A", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:"14px"}}>
        🎵 Your Tracks ({tracks.length})
      </h2>

      {loading ? (
        <p style={{color:"#aa7788"}}>Loading your tracks...</p>
      ) : tracks.length === 0 ? (
        <div style={{textAlign:"center", padding:"40px 0"}}>
          <div style={{fontSize:"3rem", marginBottom:"12px"}}>🎵</div>
          <p style={{fontWeight:"700", marginBottom:"6px"}}>No tracks yet</p>
          <p style={{color:"#aa7788", fontSize:"0.82rem"}}>Upload your first track to get started</p>
        </div>
      ) : (
        tracks.map((track) => (
          <div key={track._id} style={{background:"rgba(255,255,255,0.04)", border:"1px solid rgba(232,100,10,0.12)", borderRadius:"14px", padding:"14px 16px", marginBottom:"10px"}}>
            <div style={{display:"flex", alignItems:"center", gap:"12px", marginBottom:"12px"}}>
              <div style={{width:"52px", height:"52px", borderRadius:"8px", overflow:"hidden", flexShrink:0, background:"rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center"}}>
                {(track.artistCover||track.artistPhoto||track.coverImage) ? (
                  <img src={track.artistCover||track.artistPhoto||track.coverImage} alt={track.title} style={{width:"100%", height:"100%", objectFit:"cover"}}/>
                ) : "🎵"}
              </div>
              <div style={{flex:1, minWidth:0}}>
                <p style={{fontWeight:"700", fontSize:"0.92rem", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{track.title}</p>
                <p style={{color:"#aa7788", fontSize:"0.75rem", marginTop:"2px"}}>{new Date(track.createdAt).toLocaleDateString()}</p>
              </div>
              <button onClick={() => setDeleteId(track._id)} style={{width:"36px", height:"36px", borderRadius:"50%", background:"rgba(212,0,106,0.1)", border:"1px solid rgba(212,0,106,0.3)", color:"#D4006A", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.9rem", flexShrink:0}}>
                🗑
              </button>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px"}}>
              <div style={{background:"rgba(232,100,10,0.08)", border:"1px solid rgba(232,100,10,0.15)", borderRadius:"8px", padding:"10px", textAlign:"center"}}>
                <div style={{fontWeight:"700", fontSize:"1rem", color:"#E8640A"}}>{(track.plays||0).toLocaleString()}</div>
                <div style={{fontSize:"0.6rem", color:"#aa7788", textTransform:"uppercase", letterSpacing:"0.06em", marginTop:"2px"}}>▶ Plays</div>
              </div>
              <div style={{background:"rgba(0,201,177,0.08)", border:"1px solid rgba(0,201,177,0.15)", borderRadius:"8px", padding:"10px", textAlign:"center"}}>
                <div style={{fontWeight:"700", fontSize:"1rem", color:"#00C9B1"}}>{(track.downloads||0).toLocaleString()}</div>
                <div style={{fontSize:"0.6rem", color:"#aa7788", textTransform:"uppercase", letterSpacing:"0.06em", marginTop:"2px"}}>⬇ Downloads</div>
              </div>
              <div style={{background:"rgba(212,0,106,0.08)", border:"1px solid rgba(212,0,106,0.15)", borderRadius:"8px", padding:"10px", textAlign:"center"}}>
                <div style={{fontWeight:"700", fontSize:"1rem", color:"#D4006A"}}>{(track.likes||0).toLocaleString()}</div>
                <div style={{fontSize:"0.6rem", color:"#aa7788", textTransform:"uppercase", letterSpacing:"0.06em", marginTop:"2px"}}>❤️ Likes</div>
              </div>
            </div>
          </div>
        ))
      )}

      {deleteId && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, padding:"20px"}}>
          <div style={{background:"#1a0810", border:"1px solid rgba(212,0,106,0.3)", borderRadius:"16px", padding:"24px", maxWidth:"320px", width:"100%", textAlign:"center"}}>
            <div style={{fontSize:"2.5rem", marginBottom:"12px"}}>🗑️</div>
            <h3 style={{fontWeight:"800", fontSize:"1.1rem", marginBottom:"8px"}}>Delete Track?</h3>
            <p style={{color:"#aa7788", fontSize:"0.82rem", marginBottom:"24px"}}>This cannot be undone.</p>
            <div style={{display:"flex", gap:"10px"}}>
              <button onClick={() => setDeleteId(null)} style={{flex:1, padding:"12px", borderRadius:"10px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"#fff", fontWeight:"700", cursor:"pointer"}}>Cancel</button>
              <button onClick={() => handleDelete(deleteId)} style={{flex:1, padding:"12px", borderRadius:"10px", background:"linear-gradient(135deg,#D4006A,#6B0F3A)", border:"none", color:"#fff", fontWeight:"800", cursor:"pointer"}}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
        }
