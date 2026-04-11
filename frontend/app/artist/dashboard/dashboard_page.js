"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const PRICES = { 1:1000, 3:2500, 7:5000, 14:8000, 30:15000 };

// ─── Promote Modal ─── COMING SOON ───────────────────────────────
function PromoteModal({ track, onClose, onSuccess }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.93)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:9999}}>
      <div style={{background:"linear-gradient(180deg,#1a0810,#0d0520)",border:"1px solid rgba(255,215,0,0.25)",borderRadius:"24px 24px 0 0",padding:"22px 20px",width:"100%",maxWidth:"480px",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"20px"}}>
          <div>
            <h2 style={{fontWeight:"900",fontSize:"1.1rem",background:"linear-gradient(90deg,#FFD700,#E8640A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>⭐ Promote Track</h2>
            <p style={{color:"#aa7788",fontSize:"0.7rem",marginTop:"2px"}}>{track.title || "Your track"}</p>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.08)",border:"none",color:"#fff",width:"30px",height:"30px",borderRadius:"50%",cursor:"pointer",fontSize:"0.9rem"}}>✕</button>
        </div>
        <div style={{textAlign:"center",padding:"20px 0 16px"}}>
          <div style={{fontSize:"4rem",marginBottom:"14px"}}>🚧</div>
          <h3 style={{fontWeight:"900",fontSize:"1.2rem",marginBottom:"10px",background:"linear-gradient(90deg,#FFD700,#E8640A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Coming Soon!</h3>
          <p style={{color:"#aa7788",fontSize:"0.85rem",lineHeight:"1.7",marginBottom:"22px"}}>
            Online promotion payment is being set up. To promote your track right now, contact us directly!
          </p>
          <div style={{background:"rgba(255,215,0,0.06)",border:"1px solid rgba(255,215,0,0.18)",borderRadius:"12px",padding:"14px",marginBottom:"16px",textAlign:"left"}}>
            <p style={{color:"#FFD700",fontWeight:"700",fontSize:"0.8rem",marginBottom:"8px"}}>📞 Contact to Promote:</p>
            <a href="tel:+256701910974" style={{display:"flex",alignItems:"center",gap:"6px",color:"#fff",textDecoration:"none",fontSize:"0.82rem",marginBottom:"8px",fontWeight:"600"}}>
              📱 Call: +256 701 910 974
            </a>
            <a href="https://wa.me/256701910974" target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:"6px",color:"#25D366",textDecoration:"none",fontSize:"0.82rem",marginBottom:"8px",fontWeight:"600"}}>
              💬 WhatsApp: +256701910974
            </a>
            <a href="https://wa.me/256785393540" target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:"6px",color:"#25D366",textDecoration:"none",fontSize:"0.82rem",fontWeight:"600"}}>
              💬 WhatsApp: +256785393540
            </a>
          </div>
          <button onClick={onClose} style={{width:"100%",padding:"14px",borderRadius:"12px",background:"linear-gradient(135deg,#FFD700,#E8640A)",color:"#000",fontWeight:"800",fontSize:"0.95rem",border:"none",cursor:"pointer"}}>
            Got It 👍
          </button>
        </div>
      </div>
    </div>
  );
}
// ─── Dashboard ─────────────────────────────────────────────────────
export default function ArtistDashboard() {
  const router = useRouter();
  const [artist,      setArtist]      = useState(null);
  const [tracks,      setTracks]      = useState([]);
  const [gifts,       setGifts]       = useState([]);
  const [totalEarned, setEarned]      = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [deleteId,    setDeleteId]    = useState(null);
  const [message,     setMessage]     = useState("");
  const [lastRefresh, setRefresh]     = useState(null);
  const [promoteTrack,setPromote]     = useState(null);
  const [tab,         setTab]         = useState("tracks");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("artist");
      const token  = localStorage.getItem("token");
      if (!stored || !token) { router.push("/login"); return; }
      const a = JSON.parse(stored);
      setArtist(a);
      // Run both fetches in parallel for faster load
      Promise.all([fetchTracks(token), fetchGifts(a._id)]);
    } catch { router.push("/login"); }
  }, []);

  const fetchTracks = useCallback(async (t) => {
    const token = t || localStorage.getItem("token");
    if (!token) return;
    // Wake backend silently first (Render free tier cold start)
    const api = process.env.NEXT_PUBLIC_API_URL;
    fetch(api + "/").catch(() => {});
    try {
      const res  = await fetch(`${api}/api/tracks/artist/mytracks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTracks(Array.isArray(data.data) ? data.data : []);
      setRefresh(new Date().toLocaleTimeString());
    } catch {}
    setLoading(false);
  }, []);

  const fetchGifts = async (id) => {
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gifts/artist/${id}`);
      const data = await res.json();
      if (data.success) { setGifts(data.gifts || []); setEarned(data.totalEarned || 0); }
    } catch {}
  };

  useEffect(() => {
    const iv = setInterval(() => {
      fetchTracks();
      if (artist) fetchGifts(artist._id);
    }, 30000);
    return () => clearInterval(iv);
  }, [fetchTracks, artist]);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTracks(t => t.filter(x => x._id !== id));
        setMessage("Track deleted ✅");
        setTimeout(() => setMessage(""), 3000);
      } else setMessage(data.message || "Delete failed.");
    } catch { setMessage("Something went wrong."); }
    setDeleteId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("artist");
    router.push("/");
  };

  const totalPlays     = tracks.reduce((s, t) => s + (t.plays     || 0), 0);
  const totalDownloads = tracks.reduce((s, t) => s + (t.downloads || 0), 0);
  const totalLikes     = tracks.reduce((s, t) => s + (t.likes     || 0), 0);

  return (
    <main style={{padding:"18px",color:"white",background:"linear-gradient(160deg,#0a0a0f,#0d0520,#0a0a0f)",minHeight:"100vh",maxWidth:"680px",margin:"0 auto",paddingBottom:"40px"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"11px"}}>
          {artist?.profilePhoto
            ? <img src={artist.profilePhoto} style={{width:"48px",height:"48px",borderRadius:"50%",objectFit:"cover",border:"2px solid #E8640A"}}/>
            : <div style={{width:"48px",height:"48px",borderRadius:"50%",background:"linear-gradient(135deg,#E8640A,#D4006A)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem"}}>🎵</div>}
          <div>
            <h1 style={{fontWeight:"900",fontSize:"1.1rem",background:"linear-gradient(90deg,#E8640A,#D4006A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{artist?.username || "Artist"}</h1>
            <p style={{color:"#aa7788",fontSize:"0.7rem"}}>{artist?.email || ""}</p>
          </div>
        </div>
        <button onClick={handleLogout} style={{padding:"7px 13px",borderRadius:"99px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#888",fontSize:"0.7rem",cursor:"pointer"}}>Sign Out</button>
      </div>

      {artist?.coverPhoto && (
        <div style={{width:"100%",height:"100px",borderRadius:"11px",overflow:"hidden",marginBottom:"14px",border:"1px solid rgba(232,100,10,0.25)"}}>
          <img src={artist.coverPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        </div>
      )}

      {/* Stats grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px",marginBottom:"9px"}}>
        {[
          {v:totalPlays,    l:"▶ Plays",    c:"#E8640A",bg:"rgba(232,100,10,0.1)", bd:"rgba(232,100,10,0.25)"},
          {v:totalDownloads,l:"⬇ Downloads",c:"#00C9B1",bg:"rgba(0,201,177,0.1)", bd:"rgba(0,201,177,0.25)"},
          {v:totalLikes,    l:"❤️ Likes",   c:"#D4006A",bg:"rgba(212,0,106,0.1)", bd:"rgba(212,0,106,0.25)"},
        ].map(s => (
          <div key={s.l} style={{background:s.bg,border:`1px solid ${s.bd}`,borderRadius:"10px",padding:"12px",textAlign:"center"}}>
            <div style={{fontWeight:"900",fontSize:"1.2rem",color:s.c}}>{s.v.toLocaleString()}</div>
            <div style={{fontSize:"0.58rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.06em",marginTop:"3px"}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Earnings */}
      <div style={{background:"linear-gradient(135deg,rgba(255,215,0,0.07),rgba(232,100,10,0.07))",border:"1px solid rgba(255,215,0,0.18)",borderRadius:"10px",padding:"12px 15px",marginBottom:"12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <p style={{color:"#aa7788",fontSize:"0.67rem",textTransform:"uppercase",letterSpacing:"0.06em"}}>🎁 Gift Earnings</p>
          <p style={{fontWeight:"900",fontSize:"1.25rem",color:"#FFD700",marginTop:"2px"}}>UGX {totalEarned.toLocaleString()}</p>
        </div>
        <div style={{textAlign:"right"}}>
          <p style={{color:"#aa7788",fontSize:"0.62rem"}}>{gifts.length} gift{gifts.length !== 1 ? "s" : ""} received</p>
          {artist?.mobileNumber && <p style={{color:"#FFD700",fontSize:"0.62rem",marginTop:"1px"}}>📱 {artist.mobileNumber}</p>}
        </div>
      </div>

      {lastRefresh && <p style={{color:"#444",fontSize:"0.6rem",textAlign:"right",marginBottom:"12px"}}>Updated {lastRefresh}</p>}

      {/* Action buttons */}
      <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
        <button onClick={() => router.push("/upload")} style={{flex:1,padding:"12px",borderRadius:"10px",background:"linear-gradient(135deg,#E8640A,#D4006A)",color:"#fff",fontWeight:"800",fontSize:"0.88rem",border:"none",cursor:"pointer"}}>+ Upload Track</button>
        <button onClick={() => fetchTracks()} style={{padding:"12px 14px",borderRadius:"10px",background:"rgba(255,255,255,0.05)",color:"#E8640A",fontWeight:"700",fontSize:"0.88rem",border:"1px solid rgba(232,100,10,0.3)",cursor:"pointer"}}>🔄</button>
      </div>

      {message && (
        <div style={{padding:"10px",borderRadius:"8px",background:message.includes("✅")?"rgba(0,201,177,0.1)":"rgba(212,0,106,0.1)",border:`1px solid ${message.includes("✅")?"#00C9B1":"#D4006A"}`,color:message.includes("✅")?"#00C9B1":"#D4006A",fontSize:"0.8rem",textAlign:"center",marginBottom:"12px"}}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div style={{display:"flex",gap:"0",marginBottom:"13px",background:"rgba(255,255,255,0.04)",borderRadius:"9px",padding:"3px"}}>
        {[["tracks",`🎵 Tracks (${tracks.length})`],["gifts",`🎁 Gifts (${gifts.length})`]].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} style={{flex:1,padding:"8px",borderRadius:"7px",background:tab===id?"linear-gradient(135deg,#E8640A,#D4006A)":"transparent",color:tab===id?"#fff":"#888",fontWeight:"700",fontSize:"0.7rem",border:"none",cursor:"pointer",textTransform:"uppercase",letterSpacing:"0.06em"}}>
            {label}
          </button>
        ))}
      </div>

      {/* TRACKS TAB */}
      {tab === "tracks" && (
        loading ? (
          <div style={{textAlign:"center",padding:"30px 0"}}>
            <div style={{width:"28px",height:"28px",border:"3px solid #E8640A",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 10px"}}/>
            <p style={{color:"#aa7788",fontSize:"0.8rem"}}>Loading your tracks...</p>
            <p style={{color:"#555",fontSize:"0.7rem",marginTop:"4px"}}>If this takes long, tap 🔄 above</p>
          </div>
        ) : tracks.length === 0 ? (
          <div style={{textAlign:"center",padding:"34px 0"}}>
            <div style={{fontSize:"2.5rem",marginBottom:"9px"}}>🎵</div>
            <p style={{fontWeight:"700",marginBottom:"5px"}}>No tracks yet</p>
            <p style={{color:"#aa7788",fontSize:"0.78rem"}}>Upload your first track to get started</p>
          </div>
        ) : (
          tracks.map(track => (
            <div key={track._id} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(232,100,10,0.12)",borderRadius:"12px",padding:"12px",marginBottom:"8px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"9px"}}>
                <div style={{width:"46px",height:"46px",borderRadius:"8px",overflow:"hidden",flexShrink:0,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem"}}>
                  {(track.artistCover || track.artistPhoto || track.coverImage)
                    ? <img src={track.artistCover||track.artistPhoto||track.coverImage} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>
                    : "🎵"}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontWeight:"700",fontSize:"0.86rem",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{track.title || "Untitled"}</p>
                  <div style={{display:"flex",gap:"4px",marginTop:"3px",flexWrap:"wrap"}}>
                    {track.genre   && <span style={{background:"rgba(0,201,177,0.12)",color:"#00C9B1",padding:"1px 6px",borderRadius:"99px",fontSize:"0.56rem",fontWeight:"700"}}>{track.genre}</span>}
                    {track.country && <span style={{background:"rgba(255,215,0,0.1)",color:"#FFD700",padding:"1px 6px",borderRadius:"99px",fontSize:"0.56rem"}}>{track.country}</span>}
                    {track.promoted && track.promotedUntil && new Date(track.promotedUntil) > new Date() && <span style={{background:"rgba(255,215,0,0.18)",color:"#FFD700",padding:"1px 6px",borderRadius:"99px",fontSize:"0.56rem",fontWeight:"700"}}>⭐ Featured</span>}
                  </div>
                  <p style={{color:"#444",fontSize:"0.6rem",marginTop:"2px"}}>{new Date(track.createdAt).toLocaleDateString()}</p>
                </div>
                <div style={{display:"flex",gap:"5px",flexShrink:0}}>
                  <button onClick={() => setPromote(track)} style={{padding:"5px 9px",borderRadius:"7px",background:"rgba(255,215,0,0.12)",border:"1px solid rgba(255,215,0,0.28)",color:"#FFD700",fontSize:"0.6rem",fontWeight:"700",cursor:"pointer"}}>⭐ Promote</button>
                  <button onClick={() => setDeleteId(track._id)} style={{width:"30px",height:"30px",borderRadius:"50%",background:"rgba(212,0,106,0.1)",border:"1px solid rgba(212,0,106,0.28)",color:"#D4006A",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.8rem"}}>🗑</button>
                </div>
              </div>
              {/* Per-track stats */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"6px"}}>
                {[
                  {v:track.plays||0,    l:"Plays",    c:"#E8640A",bg:"rgba(232,100,10,0.08)"},
                  {v:track.downloads||0,l:"Downloads",c:"#00C9B1",bg:"rgba(0,201,177,0.08)"},
                  {v:track.likes||0,    l:"Likes",    c:"#D4006A",bg:"rgba(212,0,106,0.08)"},
                ].map(s => (
                  <div key={s.l} style={{background:s.bg,borderRadius:"7px",padding:"7px",textAlign:"center"}}>
                    <div style={{fontWeight:"700",fontSize:"0.88rem",color:s.c}}>{s.v.toLocaleString()}</div>
                    <div style={{fontSize:"0.55rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.05em",marginTop:"1px"}}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )
      )}

      {/* GIFTS TAB */}
      {tab === "gifts" && (
        gifts.length === 0 ? (
          <div style={{textAlign:"center",padding:"34px 0"}}>
            <div style={{fontSize:"2.5rem",marginBottom:"9px"}}>🎁</div>
            <p style={{fontWeight:"700",marginBottom:"5px"}}>No gifts yet</p>
            <p style={{color:"#aa7788",fontSize:"0.78rem",marginBottom:"16px"}}>Fans can gift you from your music cards</p>
            <div style={{background:"rgba(232,100,10,0.07)",border:"1px solid rgba(232,100,10,0.2)",borderRadius:"12px",padding:"13px",textAlign:"left"}}>
              <p style={{color:"#E8640A",fontWeight:"700",fontSize:"0.78rem",marginBottom:"4px"}}>🚧 Gifting — Coming Soon</p>
              <p style={{color:"#aa7788",fontSize:"0.72rem",lineHeight:"1.7"}}>
                Fan gifting via Mobile Money is being set up and will be live very soon!
              </p>
            </div>
          </div>
        ) : (
          gifts.map((g, i) => (
            <div key={i} style={{background:"rgba(255,215,0,0.04)",border:"1px solid rgba(255,215,0,0.13)",borderRadius:"10px",padding:"11px 13px",marginBottom:"7px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <p style={{fontWeight:"700",fontSize:"0.84rem"}}>🎁 {g.fromName || "Anonymous"}</p>
                {g.message && <p style={{color:"#aa7788",fontSize:"0.72rem",marginTop:"2px"}}>"{g.message}"</p>}
                <p style={{color:"#444",fontSize:"0.6rem",marginTop:"3px"}}>{new Date(g.createdAt).toLocaleDateString()}</p>
              </div>
              <p style={{fontWeight:"900",fontSize:"0.95rem",color:"#FFD700",flexShrink:0}}>UGX {(g.artistAmount||0).toLocaleString()}</p>
            </div>
          ))
        )
      )}

      {/* Promote Modal */}
      {promoteTrack && (
        <PromoteModal
          track={promoteTrack}
          onClose={() => setPromote(null)}
          onSuccess={() => {
            setPromote(null);
            fetchTracks();
            setMessage("⭐ Track is now featured!");
            setTimeout(() => setMessage(""), 4000);
          }}
        />
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:"20px"}}>
          <div style={{background:"#1a0810",border:"1px solid rgba(212,0,106,0.3)",borderRadius:"14px",padding:"22px",maxWidth:"290px",width:"100%",textAlign:"center"}}>
            <div style={{fontSize:"2rem",marginBottom:"9px"}}>🗑️</div>
            <h3 style={{fontWeight:"800",fontSize:"0.98rem",marginBottom:"6px"}}>Delete Track?</h3>
            <p style={{color:"#aa7788",fontSize:"0.78rem",marginBottom:"18px"}}>This cannot be undone.</p>
            <div style={{display:"flex",gap:"8px"}}>
              <button onClick={() => setDeleteId(null)} style={{flex:1,padding:"10px",borderRadius:"9px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#fff",fontWeight:"700",cursor:"pointer",fontSize:"0.82rem"}}>Cancel</button>
              <button onClick={() => handleDelete(deleteId)} style={{flex:1,padding:"10px",borderRadius:"9px",background:"linear-gradient(135deg,#D4006A,#6B0F3A)",border:"none",color:"#fff",fontWeight:"800",cursor:"pointer",fontSize:"0.82rem"}}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
