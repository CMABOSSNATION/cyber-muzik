"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const PRICES = { 1:1000, 3:2500, 7:5000, 14:8000, 30:15000 };

function PromoteModal({ track, onClose, onSuccess }) {
  const [days, setDays]         = useState(7);
  const [phone, setPhone]       = useState("");
  const [step, setStep]         = useState("form"); // form|pending|success
  const [loading, setLoading]   = useState(false);
  const [verifying, setVerify]  = useState(false);
  const [error, setError]       = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [txRef, setTxRef]       = useState("");
  const [isMock, setIsMock]     = useState(false);
  const [msg, setMsg]           = useState("");

  const handlePay = async () => {
    setError("");
    const clean = phone.replace(/\D/g,"");
    if (clean.length < 9) { setError("Enter a valid MTN or Airtel number (min 9 digits)"); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gifts/promote`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({trackId:track._id,phone:clean,days})});
      const data = await res.json();
      if (!data.success) { setError(data.error||"Payment failed. Try again."); setLoading(false); return; }
      setOrderRef(data.orderTrackingId||"");
      setTxRef(data.txRef||"");
      setIsMock(!!data.mock);
      setMsg(data.message||"");
      setStep("pending");
    } catch { setError("Network error. Check connection."); }
    setLoading(false);
  };

  const handleVerify = async () => {
    setVerify(true); setError("");
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gifts/promote/verify`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({orderTrackingId:orderRef,txRef,trackId:track._id,days})});
      const data = await res.json();
      if (data.paid) { setStep("success"); }
      else { setError(data.message||"Not confirmed yet. Complete payment on phone then try again."); }
    } catch { setError("Verification failed. Try again."); }
    setVerify(false);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.93)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:1000}}>
      <div style={{background:"linear-gradient(180deg,#1a0810,#0d0520)",border:"1px solid rgba(255,215,0,0.25)",borderRadius:"24px 24px 0 0",padding:"24px 20px",width:"100%",maxWidth:"480px",maxHeight:"88vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}>
          <div>
            <h2 style={{fontWeight:"900",fontSize:"1.1rem",background:"linear-gradient(90deg,#FFD700,#E8640A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>⭐ Promote Track</h2>
            <p style={{color:"#aa7788",fontSize:"0.7rem",marginTop:"2px"}}>{track.title}</p>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.08)",border:"none",color:"#fff",width:"30px",height:"30px",borderRadius:"50%",cursor:"pointer",fontSize:"0.9rem"}}>✕</button>
        </div>

        {step==="form" && (
          <>
            <div style={{background:"rgba(255,215,0,0.06)",border:"1px solid rgba(255,215,0,0.15)",borderRadius:"11px",padding:"12px",marginBottom:"14px"}}>
              {["Pinned at top of home feed","Gold ⭐ Featured Artist badge","More plays, likes and gifts","From just UGX 1,000"].map(b=>(
                <div key={b} style={{display:"flex",gap:"6px",marginBottom:"5px",alignItems:"flex-start"}}>
                  <span style={{color:"#FFD700",fontSize:"0.68rem",marginTop:"2px"}}>✓</span>
                  <span style={{color:"#ddd",fontSize:"0.75rem"}}>{b}</span>
                </div>
              ))}
            </div>

            <p style={{fontSize:"0.68rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"8px"}}>Choose Duration</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"7px",marginBottom:"12px"}}>
              {Object.entries(PRICES).map(([d,p])=>(
                <button key={d} onClick={()=>setDays(Number(d))} style={{padding:"9px 4px",borderRadius:"9px",border:`2px solid ${days===Number(d)?"#FFD700":"rgba(255,255,255,0.1)"}`,background:days===Number(d)?"rgba(255,215,0,0.14)":"rgba(255,255,255,0.04)",cursor:"pointer",textAlign:"center"}}>
                  <p style={{color:days===Number(d)?"#FFD700":"#888",fontWeight:"800",fontSize:"0.78rem"}}>{d}d</p>
                  <p style={{color:"#aa7788",fontSize:"0.6rem",marginTop:"1px"}}>{(p/1000)}K</p>
                </button>
              ))}
            </div>

            <div style={{background:"rgba(255,215,0,0.05)",border:"1px solid rgba(255,215,0,0.12)",borderRadius:"9px",padding:"11px 13px",marginBottom:"13px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:"#aa7788",fontSize:"0.8rem"}}>Total</span>
              <span style={{color:"#FFD700",fontWeight:"900",fontSize:"1.05rem"}}>UGX {PRICES[days].toLocaleString()}</span>
            </div>

            <label style={{fontSize:"0.68rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:"5px"}}>MTN / Airtel Number *</label>
            <input type="tel" placeholder="e.g. 0772000000" value={phone} onChange={e=>{setPhone(e.target.value);setError("");}} style={{padding:"12px 14px",borderRadius:"10px",border:`1px solid ${error?"#D4006A":"rgba(255,255,255,0.1)"}`,background:"rgba(255,255,255,0.05)",color:"#fff",fontSize:"0.88rem",width:"100%",outline:"none",marginBottom:"5px"}}/>
            <p style={{color:"#555",fontSize:"0.63rem",marginBottom:"13px"}}>A mobile money prompt will be sent to this number</p>

            {error && <div style={{background:"rgba(212,0,106,0.1)",border:"1px solid rgba(212,0,106,0.3)",borderRadius:"9px",padding:"9px 13px",marginBottom:"11px",color:"#ff6b9d",fontSize:"0.78rem"}}>⚠️ {error}</div>}

            <button onClick={handlePay} disabled={loading} style={{width:"100%",padding:"15px",borderRadius:"12px",background:loading?"#333":"linear-gradient(135deg,#FFD700,#E8640A)",color:loading?"#666":"#000",fontWeight:"800",fontSize:"0.95rem",border:"none",cursor:loading?"not-allowed":"pointer"}}>
              {loading?"Sending payment prompt...":"⭐ Pay & Promote Now"}
            </button>
          </>
        )}

        {step==="pending" && (
          <div style={{textAlign:"center",padding:"8px 0"}}>
            <div style={{fontSize:"2.8rem",marginBottom:"14px"}}>📱</div>
            <h3 style={{fontWeight:"900",fontSize:"1rem",marginBottom:"8px"}}>Check Your Phone!</h3>
            <p style={{color:"#aa7788",fontSize:"0.78rem",marginBottom:"16px",lineHeight:"1.6"}}>{msg}</p>
            {!isMock && (
              <div style={{background:"rgba(255,215,0,0.06)",border:"1px solid rgba(255,215,0,0.15)",borderRadius:"11px",padding:"13px",marginBottom:"16px",textAlign:"left"}}>
                {["1. A USSD / payment prompt appears on your phone","2. Enter your mobile money PIN to approve","3. Come back and tap Confirm below"].map(s=>(
                  <div key={s} style={{display:"flex",gap:"6px",marginBottom:"5px",alignItems:"flex-start"}}>
                    <span style={{color:"#FFD700",fontSize:"0.68rem",marginTop:"2px"}}>→</span>
                    <span style={{color:"#ddd",fontSize:"0.75rem"}}>{s}</span>
                  </div>
                ))}
              </div>
            )}
            {error && <div style={{background:"rgba(212,0,106,0.1)",border:"1px solid rgba(212,0,106,0.3)",borderRadius:"9px",padding:"9px 13px",marginBottom:"11px",color:"#ff6b9d",fontSize:"0.78rem",textAlign:"left"}}>⚠️ {error}</div>}
            <button onClick={handleVerify} disabled={verifying} style={{width:"100%",padding:"15px",borderRadius:"12px",background:verifying?"#333":"linear-gradient(135deg,#FFD700,#E8640A)",color:verifying?"#666":"#000",fontWeight:"800",fontSize:"0.95rem",border:"none",cursor:verifying?"not-allowed":"pointer",marginBottom:"9px"}}>
              {verifying?"Checking...":"✅ I Approved — Confirm"}
            </button>
            <button onClick={()=>setStep("form")} style={{width:"100%",padding:"11px",borderRadius:"12px",background:"transparent",color:"#888",fontWeight:"600",fontSize:"0.82rem",border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer"}}>← Go Back</button>
          </div>
        )}

        {step==="success" && (
          <div style={{textAlign:"center",padding:"16px 0"}}>
            <div style={{fontSize:"3.5rem",marginBottom:"14px"}}>⭐</div>
            <h3 style={{fontWeight:"900",fontSize:"1.1rem",marginBottom:"8px",color:"#FFD700"}}>Track Is Now Featured!</h3>
            <p style={{color:"#aa7788",fontSize:"0.8rem",marginBottom:"22px",lineHeight:"1.6"}}>
              <strong style={{color:"#fff"}}>{track.title}</strong> will appear at the top of the home feed.
            </p>
            <button onClick={onSuccess} style={{width:"100%",padding:"15px",borderRadius:"12px",background:"linear-gradient(135deg,#FFD700,#E8640A)",color:"#000",fontWeight:"800",fontSize:"0.95rem",border:"none",cursor:"pointer"}}>Done 🎉</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ArtistDashboard() {
  const router = useRouter();
  const [artist, setArtist]         = useState(null);
  const [tracks, setTracks]         = useState([]);
  const [gifts, setGifts]           = useState([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [deleteId, setDeleteId]     = useState(null);
  const [message, setMessage]       = useState("");
  const [lastRefresh, setLastRefresh] = useState(null);
  const [promoteTrack, setPromoteTrack] = useState(null);
  const [tab, setTab]               = useState("tracks"); // tracks|gifts

  useEffect(() => {
    try {
      const stored = localStorage.getItem("artist");
      const token  = localStorage.getItem("token");
      if (!stored || !token) { router.push("/login"); return; }
      const a = JSON.parse(stored);
      setArtist(a);
      fetchTracks(token);
      fetchGifts(a._id);
    } catch { router.push("/login"); }
  }, []);

  const fetchTracks = useCallback(async (t) => {
    const token = t || localStorage.getItem("token");
    if (!token) return;
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/artist/mytracks`,{ headers:{ Authorization:`Bearer ${token}` }});
      const data = await res.json();
      setTracks(Array.isArray(data.data) ? data.data : []);
      setLastRefresh(new Date().toLocaleTimeString());
    } catch {}
    setLoading(false);
  }, []);

  const fetchGifts = async (id) => {
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gifts/artist/${id}`);
      const data = await res.json();
      if (data.success) { setGifts(data.gifts||[]); setTotalEarned(data.totalEarned||0); }
    } catch {}
  };

  useEffect(() => {
    const iv = setInterval(() => { fetchTracks(); if (artist) fetchGifts(artist._id); }, 30000);
    return () => clearInterval(iv);
  }, [fetchTracks, artist]);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${id}`,{ method:"DELETE", headers:{ Authorization:`Bearer ${token}` }});
      const data = await res.json();
      if (data.success) { setTracks(t => t.filter(x => x._id !== id)); setMessage("Track deleted ✅"); setTimeout(()=>setMessage(""),3000); }
      else setMessage(data.message||"Delete failed.");
    } catch { setMessage("Something went wrong."); }
    setDeleteId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("artist");
    router.push("/");
  };

  const totalPlays     = tracks.reduce((s,t) => s+(t.plays||0), 0);
  const totalDownloads = tracks.reduce((s,t) => s+(t.downloads||0), 0);
  const totalLikes     = tracks.reduce((s,t) => s+(t.likes||0), 0);

  return (
    <main style={{padding:"20px",color:"white",background:"linear-gradient(160deg,#0a0a0f,#0d0520,#0a0a0f)",minHeight:"100vh",maxWidth:"680px",margin:"0 auto",paddingBottom:"40px"}}>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"18px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          {artist?.profilePhoto
            ? <img src={artist.profilePhoto} style={{width:"50px",height:"50px",borderRadius:"50%",objectFit:"cover",border:"2px solid #E8640A"}}/>
            : <div style={{width:"50px",height:"50px",borderRadius:"50%",background:"linear-gradient(135deg,#E8640A,#D4006A)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem"}}>🎵</div>}
          <div>
            <h1 style={{fontWeight:"900",fontSize:"1.15rem",background:"linear-gradient(90deg,#E8640A,#D4006A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{artist?.username||"Artist"}</h1>
            <p style={{color:"#aa7788",fontSize:"0.7rem"}}>{artist?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} style={{padding:"7px 14px",borderRadius:"99px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#888",fontSize:"0.7rem",cursor:"pointer"}}>Sign Out</button>
      </div>

      {artist?.coverPhoto && (
        <div style={{width:"100%",height:"110px",borderRadius:"12px",overflow:"hidden",marginBottom:"16px",border:"1px solid rgba(232,100,10,0.25)"}}>
          <img src={artist.coverPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        </div>
      )}

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"9px",marginBottom:"10px"}}>
        {[
          {v:totalPlays,     l:"▶ Plays",     c:"#E8640A", bg:"rgba(232,100,10,0.1)",  bd:"rgba(232,100,10,0.25)"},
          {v:totalDownloads, l:"⬇ Downloads", c:"#00C9B1", bg:"rgba(0,201,177,0.1)",  bd:"rgba(0,201,177,0.25)"},
          {v:totalLikes,     l:"❤️ Likes",    c:"#D4006A", bg:"rgba(212,0,106,0.1)",  bd:"rgba(212,0,106,0.25)"},
        ].map(s=>(
          <div key={s.l} style={{background:s.bg,border:`1px solid ${s.bd}`,borderRadius:"11px",padding:"13px",textAlign:"center"}}>
            <div style={{fontWeight:"900",fontSize:"1.25rem",color:s.c}}>{s.v.toLocaleString()}</div>
            <div style={{fontSize:"0.6rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.06em",marginTop:"3px"}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Earnings card */}
      <div style={{background:"linear-gradient(135deg,rgba(255,215,0,0.07),rgba(232,100,10,0.07))",border:"1px solid rgba(255,215,0,0.18)",borderRadius:"11px",padding:"13px 16px",marginBottom:"14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <p style={{color:"#aa7788",fontSize:"0.68rem",textTransform:"uppercase",letterSpacing:"0.06em"}}>🎁 Gift Earnings</p>
          <p style={{fontWeight:"900",fontSize:"1.3rem",color:"#FFD700",marginTop:"2px"}}>UGX {totalEarned.toLocaleString()}</p>
        </div>
        <div style={{textAlign:"right"}}>
          <p style={{color:"#aa7788",fontSize:"0.62rem"}}>{gifts.length} gift{gifts.length!==1?"s":""} received</p>
          {artist?.mobileNumber && <p style={{color:"#FFD700",fontSize:"0.62rem",marginTop:"2px"}}>📱 {artist.mobileNumber}</p>}
        </div>
      </div>

      {lastRefresh && <p style={{color:"#444",fontSize:"0.62rem",textAlign:"right",marginBottom:"14px"}}>Updated {lastRefresh}</p>}

      {/* Actions */}
      <div style={{display:"flex",gap:"9px",marginBottom:"18px"}}>
        <button onClick={()=>router.push("/upload")} style={{flex:1,padding:"13px",borderRadius:"11px",background:"linear-gradient(135deg,#E8640A,#D4006A)",color:"#fff",fontWeight:"800",fontSize:"0.9rem",border:"none",cursor:"pointer"}}>
          + Upload Track
        </button>
        <button onClick={()=>fetchTracks()} style={{padding:"13px 15px",borderRadius:"11px",background:"rgba(255,255,255,0.05)",color:"#E8640A",fontWeight:"700",fontSize:"0.88rem",border:"1px solid rgba(232,100,10,0.3)",cursor:"pointer"}} title="Refresh">🔄</button>
      </div>

      {message && (
        <div style={{padding:"11px",borderRadius:"9px",background:message.includes("✅")?"rgba(0,201,177,0.1)":"rgba(212,0,106,0.1)",border:`1px solid ${message.includes("✅")?"#00C9B1":"#D4006A"}`,color:message.includes("✅")?"#00C9B1":"#D4006A",fontSize:"0.8rem",textAlign:"center",marginBottom:"13px"}}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div style={{display:"flex",gap:"0",marginBottom:"14px",background:"rgba(255,255,255,0.04)",borderRadius:"10px",padding:"4px"}}>
        {[["tracks",`🎵 Tracks (${tracks.length})`],["gifts",`🎁 Gifts (${gifts.length})`]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"9px",borderRadius:"7px",background:tab===id?"linear-gradient(135deg,#E8640A,#D4006A)":"transparent",color:tab===id?"#fff":"#888",fontWeight:"700",fontSize:"0.72rem",border:"none",cursor:"pointer",textTransform:"uppercase",letterSpacing:"0.06em"}}>
            {label}
          </button>
        ))}
      </div>

      {/* TRACKS TAB */}
      {tab==="tracks" && (
        loading ? <p style={{color:"#aa7788",textAlign:"center",padding:"30px 0"}}>Loading tracks...</p>
        : tracks.length===0 ? (
          <div style={{textAlign:"center",padding:"36px 0"}}>
            <div style={{fontSize:"2.8rem",marginBottom:"10px"}}>🎵</div>
            <p style={{fontWeight:"700",marginBottom:"5px"}}>No tracks yet</p>
            <p style={{color:"#aa7788",fontSize:"0.8rem"}}>Upload your first track to get started</p>
          </div>
        ) : tracks.map(track=>(
          <div key={track._id} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(232,100,10,0.12)",borderRadius:"13px",padding:"13px",marginBottom:"9px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"11px",marginBottom:"10px"}}>
              <div style={{width:"46px",height:"46px",borderRadius:"8px",overflow:"hidden",flexShrink:0,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem"}}>
                {(track.artistCover||track.artistPhoto||track.coverImage)
                  ? <img src={track.artistCover||track.artistPhoto||track.coverImage} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  : "🎵"}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontWeight:"700",fontSize:"0.88rem",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{track.title}</p>
                <div style={{display:"flex",gap:"5px",marginTop:"3px",flexWrap:"wrap"}}>
                  {track.genre&&<span style={{background:"rgba(0,201,177,0.12)",color:"#00C9B1",padding:"1px 6px",borderRadius:"99px",fontSize:"0.58rem",fontWeight:"700"}}>{track.genre}</span>}
                  {track.country&&<span style={{background:"rgba(255,215,0,0.1)",color:"#FFD700",padding:"1px 6px",borderRadius:"99px",fontSize:"0.58rem"}}>{track.country}</span>}
                  {track.promoted&&track.promotedUntil&&new Date(track.promotedUntil)>new Date()&&<span style={{background:"rgba(255,215,0,0.18)",color:"#FFD700",padding:"1px 6px",borderRadius:"99px",fontSize:"0.58rem",fontWeight:"700"}}>⭐ Featured</span>}
                </div>
                <p style={{color:"#444",fontSize:"0.62rem",marginTop:"2px"}}>{new Date(track.createdAt).toLocaleDateString()}</p>
              </div>
              <div style={{display:"flex",gap:"5px",flex
