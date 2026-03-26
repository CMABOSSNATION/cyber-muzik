"use client";
import { useState, useEffect, useRef, useCallback } from "react";

let globalAudio = null;
if (typeof window !== "undefined") {
  globalAudio = new Audio();
}

const GENRES = ["All","Afrobeats","Dancehall","Hip Hop","R&B","Pop","Gospel","Reggae","Electronic","K-Pop","Latin","Jazz","Other"];
const COUNTRIES = ["All","Uganda","Nigeria","Ghana","Kenya","South Africa","Tanzania","Rwanda","USA","UK","Jamaica","South Korea","Brazil","Other"];
const GIFT_AMOUNTS = [1000,2000,5000,10000,20000,50000];

function GiftModal({ track, onClose }) {
  const [amount, setAmount] = useState(5000);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const platformFee = Math.round(amount * 0.25);
  const artistGets = amount - platformFee;

  const handleSend = async () => {
    setError("");
    if (!phone) { setError("Please enter your phone number"); return; }
    if (phone.length < 10) { setError("Enter a valid phone number"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gifts/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromName: name || "Anonymous",
          toArtistId: track.artistId,
          toArtistName: track.artist,
          amount, phone, message
        })
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Failed to send gift"); setLoading(false); return; }
      setSuccess(`🎁 Gift sent! ${track.artist} receives UGX ${artistGets.toLocaleString()}`);
    } catch (err) { setError("Something went wrong. Try again."); }
    setLoading(false);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:1000,padding:"0"}}>
      <div style={{background:"linear-gradient(180deg,#1a0810,#0d0520)",border:"1px solid rgba(232,100,10,0.3)",borderRadius:"24px 24px 0 0",padding:"24px 20px",width:"100%",maxWidth:"480px",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"20px"}}>
          <div>
            <h2 style={{fontWeight:"900",fontSize:"1.2rem",background:"linear-gradient(90deg,#E8640A,#D4006A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>🎁 Gift {track.artist}</h2>
            <p style={{color:"#aa7788",fontSize:"0.75rem",marginTop:"2px"}}>Support your favourite artist directly</p>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"#fff",width:"32px",height:"32px",borderRadius:"50%",cursor:"pointer",fontSize:"1rem"}}>✕</button>
        </div>

        {/* Fee breakdown */}
        <div style={{background:"rgba(232,100,10,0.08)",border:"1px solid rgba(232,100,10,0.2)",borderRadius:"12px",padding:"14px",marginBottom:"18px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
            <span style={{color:"#aa7788",fontSize:"0.78rem"}}>Gift amount</span>
            <span style={{fontWeight:"700",fontSize:"0.88rem"}}>UGX {amount.toLocaleString()}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
            <span style={{color:"#aa7788",fontSize:"0.78rem"}}>Platform fee (25%)</span>
            <span style={{color:"#D4006A",fontWeight:"700",fontSize:"0.88rem"}}>- UGX {platformFee.toLocaleString()}</span>
          </div>
          <div style={{height:"1px",background:"rgba(255,255,255,0.08)",margin:"8px 0"}}/>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span style={{color:"#00C9B1",fontWeight:"700",fontSize:"0.82rem"}}>Artist receives</span>
            <span style={{color:"#00C9B1",fontWeight:"900",fontSize:"1rem"}}>UGX {artistGets.toLocaleString()}</span>
          </div>
        </div>

        {/* Amount selection */}
        <p style={{fontSize:"0.72rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"8px"}}>Select Amount (UGX)</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px",marginBottom:"16px"}}>
          {GIFT_AMOUNTS.map(a => (
            <button key={a} onClick={()=>setAmount(a)} style={{padding:"10px",borderRadius:"10px",border:`2px solid ${amount===a?"#E8640A":"rgba(255,255,255,0.1)"}`,background:amount===a?"rgba(232,100,10,0.2)":"rgba(255,255,255,0.05)",color:amount===a?"#E8640A":"#888",fontWeight:"700",fontSize:"0.78rem",cursor:"pointer",transition:"all 0.2s"}}>
              {(a/1000)}K
            </button>
          ))}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:"12px",marginBottom:"18px"}}>
          <div>
            <label style={{fontSize:"0.7rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:"5px"}}>Your Name (optional)</label>
            <input type="text" placeholder="Anonymous" value={name} onChange={e=>setName(e.target.value)} style={{padding:"12px 14px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",color:"#fff",fontSize:"0.88rem",width:"100%",outline:"none"}}/>
          </div>
          <div>
            <label style={{fontSize:"0.7rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:"5px"}}>Mobile Money Number *</label>
            <input type="tel" placeholder="e.g. 0772000000" value={phone} onChange={e=>setPhone(e.target.value)} style={{padding:"12px 14px",borderRadius:"10px",border:`1px solid ${error&&!phone?"#D4006A":"rgba(255,255,255,0.1)"}`,background:"rgba(255,255,255,0.05)",color:"#fff",fontSize:"0.88rem",width:"100%",outline:"none"}}/>
          </div>
          <div>
            <label style={{fontSize:"0.7rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:"5px"}}>Message (optional)</label>
            <input type="text" placeholder="Keep making great music! 🔥" value={message} onChange={e=>setMessage(e.target.value)} style={{padding:"12px 14px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",color:"#fff",fontSize:"0.88rem",width:"100%",outline:"none"}}/>
          </div>
        </div>

        {error && <div style={{background:"rgba(212,0,106,0.1)",border:"1px solid rgba(212,0,106,0.3)",borderRadius:"10px",padding:"10px 14px",marginBottom:"12px",color:"#ff6b9d",fontSize:"0.82rem"}}>⚠️ {error}</div>}
        {success && <div style={{background:"rgba(0,201,177,0.1)",border:"1px solid rgba(0,201,177,0.3)",borderRadius:"10px",padding:"10px 14px",marginBottom:"12px",color:"#00C9B1",fontSize:"0.82rem"}}>{success}</div>}

        {!success && (
          <button onClick={handleSend} disabled={loading} style={{width:"100%",padding:"16px",borderRadius:"12px",background:loading?"#333":"linear-gradient(135deg,#E8640A,#D4006A)",color:loading?"#666":"#fff",fontWeight:"800",fontSize:"1rem",border:"none",cursor:loading?"not-allowed":"pointer"}}>
            {loading?"Processing...`":"🎁 Send Gift via Mobile Money"}
          </button>
        )}
        {success && (
          <button onClick={onClose} style={{width:"100%",padding:"16px",borderRadius:"12px",background:"linear-gradient(135deg,#00C9B1,#006a5a)",color:"#fff",fontWeight:"800",fontSize:"1rem",border:"none",cursor:"pointer"}}>
            ✅ Done
          </button>
        )}
      </div>
    </div>
  );
}

function ArtistCard({ track, isActive, onPlay, index, onRefresh }) {
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const playRecorded = useRef(false);

  const plays = track.plays || 0;
  const likes = track.likes || 0;
  const downloads = track.downloads || 0;
  const isPromoted = track.promoted && track.promotedUntil && new Date(track.promotedUntil) > new Date();

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
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${track._id}/play`, { method: "POST" })
          .then(() => onRefresh()).catch(() => {});
      }
    } else {
      globalAudio.pause();
    }
  }, [isActive]);

  useEffect(() => {
    if (!globalAudio || !isActive) return;
    const update = () => setProgress((globalAudio.currentTime / globalAudio.duration) * 100 || 0);
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
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${track._id}/like`, { method: "POST" });
      onRefresh();
    } catch (err) {}
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${track._id}/download`, { method: "POST" });
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
    <>
      {showGift && <GiftModal track={track} onClose={()=>setShowGift(false)}/>}
      <div onClick={onPlay} style={{position:"relative",borderRadius:"18px",overflow:"hidden",marginBottom:"14px",cursor:"pointer",background:gradients[index%gradients.length],border:`2px solid ${isPromoted?"#FFD700":isActive?"#E8640A":"rgba(255,255,255,0.07)"}`,transition:"all 0.2s",boxShadow:isPromoted?"0 0 20px rgba(255,215,0,0.2)":isActive?"0 0 24px rgba(232,100,10,0.25)":"none"}}>

        {/* Promoted banner */}
        {isPromoted && (
          <div style={{position:"absolute",top:0,left:0,right:0,background:"linear-gradient(90deg,#FFD700,#E8640A)",padding:"5px 14px",display:"flex",alignItems:"center",gap:"6px",zIndex:10}}>
            <span style={{fontSize:"0.65rem"}}>⭐</span>
            <span style={{fontSize:"0.65rem",fontWeight:"800",color:"#000",textTransform:"uppercase",letterSpacing:"0.08em"}}>Featured Artist</span>
          </div>
        )}

        {(track.artistCover||track.artistPhoto||track.coverImage) ? (
          <img src={track.artistCover||track.artistPhoto||track.coverImage} alt={track.artist} style={{width:"100%",height:isPromoted?"240px":"220px",objectFit:"cover",display:"block",marginTop:isPromoted?"26px":"0"}}/>
        ) : (
          <div style={{width:"100%",height:isPromoted?"240px":"220px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"5rem",marginTop:isPromoted?"26px":"0"}}>🎤</div>
        )}

        {/* Genre + Country badges */}
        <div style={{position:"absolute",top:isPromoted?"46px":"12px",left:"12px",display:"flex",gap:"5px",flexWrap:"wrap"}}>
          {track.genre && track.genre !== "Other" && (
            <span style={{background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)",padding:"3px 8px",borderRadius:"99px",fontSize:"0.6rem",fontWeight:"700",color:"#00C9B1",border:"1px solid rgba(0,201,177,0.3)"}}>{track.genre}</span>
          )}
          {track.country && (
            <span style={{background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)",padding:"3px 8px",borderRadius:"99px",fontSize:"0.6rem",fontWeight:"700",color:"#FFD700",border:"1px solid rgba(255,215,0,0.3)"}}>🌍 {track.country}</span>
          )}
        </div>

        {/* Stats */}
        <div style={{position:"absolute",top:isPromoted?"46px":"12px",right:"12px",display:"flex",gap:"5px",flexWrap:"wrap",justifyContent:"flex-end"}}>
          {isActive && (
            <div style={{background:"rgba(232,100,10,0.85)",backdropFilter:"blur(8px)",padding:"4px 10px",borderRadius:"99px",fontSize:"0.65rem",fontWeight:"700",display:"flex",alignItems:"center",gap:"4px"}}>
              <div style={{display:"flex",gap:"2px",alignItems:"flex-end",height:"14px"}}>
                {[10,14,8,12].map((h,i)=><div key={i} style={{width:"2px",height:`${h}px`,background:"#fff",borderRadius:"2px",animation:`eq 0.65s ease-in-out ${i*0.12}s infinite alternate`}}/>)}
              </div>
              LIVE
            </div>
          )}
          <div style={{background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)",border:"1px solid rgba(232,100,10,0.4)",padding:"4px 10px",borderRadius:"99px",fontSize:"0.65rem",fontWeight:"700"}}>👁 {plays.toLocaleString()}</div>
          <div style={{background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)",border:"1px solid rgba(212,0,106,0.4)",padding:"4px 10px",borderRadius:"99px",fontSize:"0.65rem",fontWeight:"700"}}>❤️ {likes.toLocaleString()}</div>
          <div style={{background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)",border:"1px solid rgba(0,201,177,0.4)",padding:"4px 10px",borderRadius:"99px",fontSize:"0.65rem",fontWeight:"700"}}>⬇ {downloads.toLocaleString()}</div>
        </div>

        <div style={{position:"absolute",inset:0,background:isActive?"linear-gradient(to bottom,rgba(232,100,10,0.06) 0%,rgba(0,0,0,0.92) 100%)":"linear-gradient(to bottom,transparent 30%,rgba(0,0,0,0.92) 100%)"}}/>

        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"3px"}}>
            <p style={{fontWeight:"900",fontSize:"1.1rem"}}>{track.artist}</p>
            <div style={{display:"flex",alignItems:"center",gap:"3px",background:"rgba(0,201,177,0.15)",padding:"2px 8px",borderRadius:"99px",border:"1px solid rgba(0,201,177,0.3)"}}>
              <span style={{color:"#00C9B1",fontSize:"0.6rem"}}>✓</span>
              <span style={{color:"#00C9B1",fontSize:"0.6rem",fontWeight:"700"}}>Verified Artist</span>
            </div>
          </div>
          <p style={{color:"#ddd",fontSize:"0.8rem",marginBottom:"10px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>🎵 {track.title}</p>

          {isActive && (
            <div style={{height:"3px",background:"rgba(255,255,255,0.2)",borderRadius:"99px",marginBottom:"12px",overflow:"hidden"}}>
              <div style={{width:`${progress}%`,height:"100%",background:"linear-gradient(90deg,#E8640A,#D4006A)",borderRadius:"99px",transition:"width 0.4s"}}/>
            </div>
          )}

          <div style={{display:"flex",alignItems:"center",gap:"7px"}} onClick={e=>e.stopPropagation()}>
            <button onClick={onPlay} style={{flex:1,height:"44px",borderRadius:"12px",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",fontWeight:"800",fontSize:"0.88rem",background:isActive?"linear-gradient(135deg,#E8640A,#D4006A)":"#fff",color:"#000",transition:"all 0.2s"}}>
              <div style={{width:"24px",height:"24px",borderRadius:"50%",background:"rgba(0,0,0,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.75rem"}}>{isActive?"⏸":"▶"}</div>
              {isActive?"PAUSE":"PLAY"}
            </button>
            <button onClick={handleLike} style={{width:"44px",height:"44px",borderRadius:"12px",border:`1px solid ${liked?"rgba(212,0,106,0.6)":"rgba(255,255,255,0.15)"}`,background:liked?"rgba(212,0,106,0.25)":"rgba(255,255,255,0.1)",cursor:liked?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",color:"#fff"}}>
              {liked?"❤️":"🤍"}
            </button>
            {/* Gift button */}
            <button onClick={()=>setShowGift(true)} style={{width:"44px",height:"44px",borderRadius:"12px",border:"1px solid rgba(255,215,0,0.4)",background:"rgba(255,215,0,0.1)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",color:"#FFD700"}} title="Gift artist">
              🎁
            </button>
            <a href={track.audioUrl} download onClick={handleDownload} style={{width:"44px",height:"44px",borderRadius:"12px",border:"1px solid rgba(0,201,177,0.3)",background:"rgba(0,201,177,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",color:"#fff",textDecoration:"none"}}>⬇</a>
            <button onClick={handleShare} style={{width:"44px",height:"44px",borderRadius:"12px",border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",color:"#fff"}}>🔗</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Home() {
  const [tracks, setTracks] = useState(null);
  const [activeTrack, setActiveTrack] = useState(null);
  const [shuffled, setShuffled] = useState(false);
  const [displayTracks, setDisplayTracks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeGenre, setActiveGenre] = useState("All");
  const [activeCountry, setActiveCountry] = useState("All");
  const [showCountries, setShowCountries] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/`).catch(() => {});
  }, []);

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
      setActiveTrack(displayTracks[(idx + 1) % displayTracks.length]._id);
    };
  }, [displayTracks, activeTrack]);

  const handleShuffle = () => {
    if (!tracks) return;
    if (shuffled) { setDisplayTracks([...tracks]); }
    else {
      const arr = [...tracks];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      setDisplayTracks(arr);
    }
    setShuffled(!shuffled);
  };

  const filteredTracks = displayTracks.filter(t => {
    const matchSearch = !searchQuery || t.title?.toLowerCase().i
