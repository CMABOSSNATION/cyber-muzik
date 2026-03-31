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
  const [giftCard, setGiftCard] = useState("");
  const [useGiftCard, setUseGiftCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const artistGets = Math.round(amount * 0.75);

  const handleSend = async () => {
    setError("");
    if (!phone) { setError("Please enter your phone number"); return; }
    if (phone.length < 10) { setError("Enter a valid phone number"); return; }
    if (useGiftCard && !giftCard) { setError("Please enter your gift card code"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gifts/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromName: name || "Anonymous",
          toArtistId: track.artistId,
          toArtistName: track.artist,
          trackId: track._id,
          amount: useGiftCard ? 0 : amount,
          senderPhone: phone,
          message,
          giftCard: useGiftCard ? giftCard.toUpperCase() : ""
        })
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Failed to send gift"); setLoading(false); return; }
      setSuccess(`🎁 Gift sent to ${track.artist}! Your name will appear on their music. Thank you!`);
    } catch (err) { setError("Something went wrong. Try again."); }
    setLoading(false);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:1000}}>
      <div style={{background:"linear-gradient(180deg,#1a0810,#0d0520)",border:"1px solid rgba(232,100,10,0.3)",borderRadius:"24px 24px 0 0",padding:"24px 20px",width:"100%",maxWidth:"480px",maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"18px"}}>
          <div>
            <h2 style={{fontWeight:"900",fontSize:"1.2rem",background:"linear-gradient(90deg,#E8640A,#D4006A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>🎁 Gift {track.artist}</h2>
            <p style={{color:"#aa7788",fontSize:"0.72rem",marginTop:"2px"}}>Your name appears on their music after gifting ✨</p>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"#fff",width:"32px",height:"32px",borderRadius:"50%",cursor:"pointer",fontSize:"1rem"}}>✕</button>
        </div>

        <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
          <button onClick={()=>setUseGiftCard(false)} style={{flex:1,padding:"10px",borderRadius:"10px",border:`2px solid ${!useGiftCard?"#E8640A":"rgba(255,255,255,0.1)"}`,background:!useGiftCard?"rgba(232,100,10,0.15)":"rgba(255,255,255,0.05)",color:!useGiftCard?"#E8640A":"#888",fontWeight:"700",fontSize:"0.8rem",cursor:"pointer"}}>💰 Mobile Money</button>
          <button onClick={()=>setUseGiftCard(true)} style={{flex:1,padding:"10px",borderRadius:"10px",border:`2px solid ${useGiftCard?"#FFD700":"rgba(255,255,255,0.1)"}`,background:useGiftCard?"rgba(255,215,0,0.15)":"rgba(255,255,255,0.05)",color:useGiftCard?"#FFD700":"#888",fontWeight:"700",fontSize:"0.8rem",cursor:"pointer"}}>🎫 Gift Card</button>
        </div>

        {!useGiftCard ? (
          <>
            <div style={{background:"rgba(0,201,177,0.08)",border:"1px solid rgba(0,201,177,0.2)",borderRadius:"12px",padding:"14px",marginBottom:"16px",textAlign:"center"}}>
              <p style={{color:"#aa7788",fontSize:"0.75rem",marginBottom:"4px"}}>Artist receives</p>
              <p style={{color:"#00C9B1",fontWeight:"900",fontSize:"1.4rem"}}>UGX {artistGets.toLocaleString()}</p>
              <p style={{color:"#aa7788",fontSize:"0.68rem",marginTop:"4px"}}>from UGX {amount.toLocaleString()} gift</p>
            </div>
            <p style={{fontSize:"0.72rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"8px"}}>Select Amount (UGX)</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px",marginBottom:"16px"}}>
              {GIFT_AMOUNTS.map(a => (
                <button key={a} onClick={()=>setAmount(a)} style={{padding:"10px",borderRadius:"10px",border:`2px solid ${amount===a?"#E8640A":"rgba(255,255,255,0.1)"}`,background:amount===a?"rgba(232,100,10,0.2)":"rgba(255,255,255,0.05)",color:amount===a?"#E8640A":"#888",fontWeight:"700",fontSize:"0.78rem",cursor:"pointer"}}>
                  {a>=1000?`${a/1000}K`:`${a}`}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div style={{marginBottom:"16px"}}>
            <div style={{background:"rgba(255,215,0,0.08)",border:"1px solid rgba(255,215,0,0.2)",borderRadius:"12px",padding:"14px",marginBottom:"12px"}}>
              <p style={{color:"#FFD700",fontWeight:"700",fontSize:"0.85rem",marginBottom:"8px"}}>🎫 Gift Cards Available:</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"6px"}}>
                {[{code:"CYBER100",val:"1K UGX"},{code:"CYBER500",val:"5K UGX"},{code:"CYBER1K",val:"10K UGX"},{code:"CYBERVIP",val:"50K UGX"}].map(c=>(
                  <div key={c.code} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,215,0,0.2)",borderRadius:"8px",padding:"8px",textAlign:"center"}}>
                    <p style={{color:"#FFD700",fontWeight:"800",fontSize:"0.72rem"}}>{c.code}</p>
                    <p style={{color:"#aa7788",fontSize:"0.65rem"}}>{c.val}</p>
                  </div>
                ))}
              </div>
            </div>
            <label style={{fontSize:"0.72rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:"6px"}}>Enter Gift Card Code</label>
            <input type="text" placeholder="e.g. CYBER500" value={giftCard} onChange={e=>setGiftCard(e.target.value.toUpperCase())} style={{padding:"12px 14px",borderRadius:"10px",border:"1px solid rgba(255,215,0,0.3)",background:"rgba(255,255,255,0.05)",color:"#FFD700",fontSize:"0.88rem",width:"100%",outline:"none",fontWeight:"700",letterSpacing:"0.1em"}}/>
          </div>
        )}

        <div style={{display:"flex",flexDirection:"column",gap:"10px",marginBottom:"16px"}}>
          <div>
            <label style={{fontSize:"0.7rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:"5px"}}>Your Name (shows on artist music)</label>
            <input type="text" placeholder="Anonymous" value={name} onChange={e=>setName(e.target.value)} style={{padding:"12px 14px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",color:"#fff",fontSize:"0.88rem",width:"100%",outline:"none"}}/>
          </div>
          <div>
            <label style={{fontSize:"0.7rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:"5px"}}>Your Mobile Money Number *</label>
            <input type="tel" placeholder="e.g. 0772000000" value={phone} onChange={e=>setPhone(e.target.value)} style={{padding:"12px 14px",borderRadius:"10px",border:`1px solid ${error&&!phone?"#D4006A":"rgba(255,255,255,0.1)"}`,background:"rgba(255,255,255,0.05)",color:"#fff",fontSize:"0.88rem",width:"100%",outline:"none"}}/>
          </div>
          <div>
            <label style={{fontSize:"0.7rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:"5px"}}>Message (optional)</label>
            <input type="text" placeholder="Keep making great music! 🔥" value={message} onChange={e=>setMessage(e.target.value)} style={{padding:"12px 14px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",color:"#fff",fontSize:"0.88rem",width:"100%",outline:"none"}}/>
          </div>
        </div>

        {error && <div style={{background:"rgba(212,0,106,0.1)",border:"1px solid rgba(212,0,106,0.3)",borderRadius:"10px",padding:"10px 14px",marginBottom:"12px",color:"#ff6b9d",fontSize:"0.82rem"}}>⚠️ {error}</div>}
        {success && <div style={{background:"rgba(0,201,177,0.1)",border:"1px solid rgba(0,201,177,0.3)",borderRadius:"10px",padding:"10px 14px",marginBottom:"12px",color:"#00C9B1",fontSize:"0.82rem"}}>{success}</div>}

        {!success ? (
          <button onClick={handleSend} disabled={loading} style={{width:"100%",padding:"16px",borderRadius:"12px",background:loading?"#333":"linear-gradient(135deg,#E8640A,#D4006A)",color:loading?"#666":"#fff",fontWeight:"800",fontSize:"1rem",border:"none",cursor:loading?"not-allowed":"pointer"}}>
            {loading?"Processing...":"🎁 Send Gift via Mobile Money"}
          </button>
        ) : (
          <button onClick={onClose} style={{width:"100%",padding:"16px",borderRadius:"12px",background:"linear-gradient(135deg,#00C9B1,#006a5a)",color:"#fff",fontWeight:"800",fontSize:"1rem",border:"none",cursor:"pointer"}}>✅ Done</button>
        )}
      </div>
    </div>
  );
}

function PromoteModal({ track, onClose }) {
  const [days, setDays] = useState(7);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const prices = { 1:1000, 3:2500, 7:5000, 14:8000, 30:15000 };

  const handlePromote = async () => {
    setError("");
    if (!phone) { setError("Please enter your mobile money number"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gifts/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId: track._id, phone, days })
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Promotion failed"); setLoading(false); return; }
      setSuccess(`⭐ Track featured for ${days} days! Expires ${new Date(data.promotedUntil).toLocaleDateString()}`);
    } catch (err) { setError("Something went wrong."); }
    setLoading(false);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:1000}}>
      <div style={{background:"linear-gradient(180deg,#1a0810,#0d0520)",border:"1px solid rgba(255,215,0,0.3)",borderRadius:"24px 24px 0 0",padding:"24px 20px",width:"100%",maxWidth:"480px",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"18px"}}>
          <div>
            <h2 style={{fontWeight:"900",fontSize:"1.2rem",background:"linear-gradient(90deg,#FFD700,#E8640A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>⭐ Promote My Music</h2>
            <p style={{color:"#aa7788",fontSize:"0.72rem",marginTop:"2px"}}>Get featured at the top and reach more fans</p>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"#fff",width:"32px",height:"32px",borderRadius:"50%",cursor:"pointer",fontSize:"1rem"}}>✕</button>
        </div>

        <div style={{background:"rgba(255,215,0,0.08)",border:"1px solid rgba(255,215,0,0.2)",borderRadius:"12px",padding:"14px",marginBottom:"16px"}}>
          <p style={{color:"#FFD700",fontWeight:"700",fontSize:"0.85rem",marginBottom:"6px"}}>⭐ Benefits:</p>
          <div style={{color:"#aa7788",fontSize:"0.78rem",lineHeight:"2"}}>
              <div>• Appears at top of home feed</div>
              <div>• Gold ⭐ Featured Artist badge</div>
              <div>• More plays, likes and gifts</div>
              <div>• From UGX 1,000 only</div>
            </div>
        </div>

        <p style={{fontSize:"0.72rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"8px"}}>Choose Duration</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px",marginBottom:"16px"}}>
          {Object.entries(prices).map(([d,p]) => (
            <button key={d} onClick={()=>setDays(Number(d))} style={{padding:"12px 6px",borderRadius:"10px",border:`2px solid ${days===Number(d)?"#FFD700":"rgba(255,255,255,0.1)"}`,background:days===Number(d)?"rgba(255,215,0,0.15)":"rgba(255,255,255,0.05)",cursor:"pointer",textAlign:"center"}}>
              <p style={{color:days===Number(d)?"#FFD700":"#888",fontWeight:"800",fontSize:"0.85rem"}}>{d} day{Number(d)>1?"s":""}</p>
              <p style={{color:"#aa7788",fontSize:"0.65rem",marginTop:"2px"}}>UGX {p.toLocaleString()}</p>
            </button>
          ))}
        </div>

        <div style={{background:"rgba(255,215,0,0.06)",border:"1px solid rgba(255,215,0,0.15)",borderRadius:"10px",padding:"12px",marginBottom:"16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:"#aa7788",fontSize:"0.82rem"}}>Total to pay</span>
          <span style={{color:"#FFD700",fontWeight:"900",fontSize:"1.1rem"}}>UGX {prices[days].toLocaleString()}</span>
        </div>

        <div style={{marginBottom:"16px"}}>
          <label style={{fontSize:"0.7rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:"6px"}}>Mobile Money Number *</label>
          <input type="tel" placeholder="e.g. 0772000000" value={phone} onChange={e=>setPhone(e.target.value)} style={{padding:"12px 14px",borderRadius:"10px",border:`1px solid ${error&&!phone?"#D4006A":"rgba(255,255,255,0.1)"}`,background:"rgba(255,255,255,0.05)",color:"#fff",fontSize:"0.88rem",width:"100%",outline:"none"}}/>
        </div>

        {error && <div style={{background:"rgba(212,0,106,0.1)",border:"1px solid rgba(212,0,106,0.3)",borderRadius:"10px",padding:"10px 14px",marginBottom:"12px",color:"#ff6b9d",fontSize:"0.82rem"}}>⚠️ {error}</div>}
        {success && <div style={{background:"rgba(255,215,0,0.1)",border:"1px solid rgba(255,215,0,0.3)",borderRadius:"10px",padding:"10px 14px",marginBottom:"12px",color:"#FFD700",fontSize:"0.82rem"}}>{success}</div>}

        {!success ? (
          <button onClick={handlePromote} disabled={loading} style={{width:"100%",padding:"16px",borderRadius:"12px",background:loading?"#333":"linear-gradient(135deg,#FFD700,#E8640A)",color:loading?"#666":"#000",fontWeight:"800",fontSize:"1rem",border:"none",cursor:loading?"not-allowed":"pointer"}}>
            {loading?"Processing...":"⭐ Pay & Promote Now"}
          </button>
        ) : (
          <button onClick={onClose} style={{width:"100%",padding:"16px",borderRadius:"12px",background:"linear-gradient(135deg,#FFD700,#E8640A)",color:"#000",fontWeight:"800",fontSize:"1rem",border:"none",cursor:"pointer"}}>🎉 Done</button>
        )}
      </div>
    </div>
  );
}

function ArtistCard({ track, isActive, onPlay, index, onRefresh }) {
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const [showPromote, setShowPromote] = useState(false);
  const playRecorded = useRef(false);

  const isPromoted = track.promoted && track.promotedUntil && new Date(track.promotedUntil) > new Date();
  const gifters = track.gifters || [];
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
      {showPromote && <PromoteModal track={track} onClose={()=>setShowPromote(false)}/>}
      <div onClick={onPlay} style={{position:"relative",borderRadius:"18px",overflow:"hidden",marginBottom:"14px",cursor:"pointer",background:gradients[index%gradients.length],border:`2px solid ${isPromoted?"#FFD700":isActive?"#E8640A":"rgba(255,255,255,0.07)"}`,transition:"all 0.2s",boxShadow:isPromoted?"0 0 20px rgba(255,215,0,0.2)":isActive?"0 0 24px rgba(232,100,10,0.25)":"none"}}>

        {isPromoted && (
          <div style={{background:"linear-gradient(90deg,#FFD700,#E8640A)",padding:"5px 14px",display:"flex",alignItems:"center",gap:"6px",zIndex:10}}>
            <span style={{fontSize:"0.65rem"}}>⭐</span>
            <span style={{fontSize:"0.65rem",fontWeight:"800",color:"#000",textTransform:"uppercase",letterSpacing:"0.08em"}}>Featured Artist</span>
          </div>
        )}

        {(track.artistCover||track.artistPhoto||track.coverImage) ? (
          <img src={track.artistCover||track.artistPhoto||track.coverImage} alt={track.artist} style={{width:"100%",height:"220px",objectFit:"cover",display:"block"}}/>
        ) : (
          <div style={{width:"100%",height:"220px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"5rem"}}>🎤</div>
        )}

        <div style={{position:"absolute",top:isPromoted?"46px":"12px",left:"12px",display:"flex",gap:"5px",flexWrap:"wrap"}}>
          {track.genre && track.genre !== "Other" && (
            <span style={{background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)",padding:"3px 8px",borderRadius:"99px",fontSize:"0.6rem",fontWeight:"700",color:"#00C9B1",border:"1px solid rgba(0,201,177,0.3)"}}>{track.genre}</span>
          )}
          {track.country && (
            <span style={{background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)",padding:"3px 8px",borderRadius:"99px",fontSize:"0.6rem",fontWeight:"700",color:"#FFD700",border:"1px solid rgba(255,215,0,0.3)"}}>🌍 {track.country}</span>
          )}
        </div>

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
            {gifters.length > 0 && (
            <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"8px",flexWrap:"wrap"}}>
              <span style={{fontSize:"0.6rem",color:"#FFD700"}}>🎁 Gifted by:</span>
              {gifters.slice(-4).map((g,i) => (
                <span key={i} style={{background:"rgba(255,215,0,0.15)",border:"1px solid rgba(255,215,0,0.3)",padding:"2px 8px",borderRadius:"99px",fontSize:"0.6rem",color:"#FFD700",fontWeight:"600"}}>{g.name}</span>
              ))}
            </div>
          )}
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
            <button onClick={e=>{e.stopPropagation();setShowGift(true);}} style={{width:"44px",height:"44px",borderRadius:"12px",border:"1px solid rgba(255,215,0,0.4)",background:"rgba(255,215,0,0.1)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem"}} title="Gift artist">
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
    const matchSearch = !searchQuery || t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || t.artist?.toLowerCase().includes(searchQuery.toLowerCase()) || t.genre?.toLowerCase().includes(searchQuery.toLowerCase()) || t.country?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchGenre = activeGenre === "All" || t.genre === activeGenre;
    const matchCountry = activeCountry === "All" || t.country === activeCountry;
    return matchSearch && matchGenre && matchCountry;
  });

  const top10 = tracks ? [...tracks].sort((a,b) => (b.plays||0)-(a.plays||0)).slice(0,10) : [];
  const trendingArtists = tracks ? [...new Map(tracks.map(t => [t.artist, t])).values()].slice(0,8) : [];

  return (
    <main style={{padding:"0",color:"white",background:"linear-gradient(160deg,#0a0a0f 0%,#0d0520 50%,#0a0a0f 100%)",minHeight:"100vh",maxWidth:"480px",margin:"0 auto",paddingBottom:"80px"}}>
      <style>{`@keyframes eq{from{transform:scaleY(0.3);}to{transform:scaleY(1);}} body{background:#0a0a0f;} *::-webkit-scrollbar{display:none;}`}</style>

      <div style={{padding:"20px 20px 0"}}>
        <h1 style={{fontSize:"1.6rem",fontWeight:"900",letterSpacing:"-0.02em",background:"linear-gradient(90deg,#E8640A,#D4006A,#7B2FBE)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:"4px"}}>Top Trending Artists</h1>
        <p style={{color:"#aa7788",fontSize:"0.8rem",marginBottom:"16px"}}>Stream · 🎁 Gift · Download · Free for Everyone</p>

        {trendingArtists.length > 0 && (
          <div style={{display:"flex",gap:"12px",overflowX:"auto",paddingBottom:"16px"}}>
            {trendingArtists.map((track, i) => (
              <div key={i} onClick={()=>setActiveTrack(track._id)} style={{flexShrink:0,width:"90px",cursor:"pointer",textAlign:"center"}}>
                <div style={{width:"90px",height:"90px",borderRadius:"14px",overflow:"hidden",marginBottom:"7px",border:activeTrack===track._id?"2px solid #E8640A":track.promoted&&track.promotedUntil&&new Date(track.promotedUntil)>new Date()?"2px solid #FFD700":"2px solid rgba(255,255,255,0.1)",position:"relative",background:"linear-gradient(135deg,#E8640A,#7B2FBE)"}}>
                  {(track.artistCover||track.artistPhoto||track.coverImage) ? (
                    <img src={track.artistCover||track.artistPhoto||track.coverImage} alt={track.artist} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  ) : (
                    <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2.2rem"}}>🎤</div>
                  )}
                  {track.promoted && track.promotedUntil && new Date(track.promotedUntil)>new Date() && (
                    <div style={{position:"absolute",top:"4px",right:"4px",background:"#FFD700",borderRadius:"99px",padding:"1px 5px",fontSize:"0.5rem",fontWeight:"800",color:"#000"}}>⭐</div>
                  )}
                  <div style={{position:"absolute",bottom:"4px",left:"4px",background:"rgba(0,201,177,0.9)",borderRadius:"99px",width:"14px",height:"14px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.5rem",fontWeight:"900",color:"#000"}}>✓</div>
                </div>
                <p style={{fontSize:"0.65rem",fontWeight:"700",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{track.artist}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{marginBottom:"14px"}}>
          <div style={{display:"flex",alignItems:"center",background:"rgba(255,255,255,0.07)",borderRadius:"99px",border:`1px solid ${searchFocused?"#E8640A":"rgba(255,255,255,0.1)"}`,overflow:"hidden",padding:"0 16px",height:"48px",transition:"all 0.3s"}}>
            <span style={{fontSize:"1rem",marginRight:"10px",color:"#555"}}>🔍</span>
            <input type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} onFocus={()=>setSearchFocused(true)} onBlur={()=>setSearchFocused(false)} placeholder="Search tracks, artists, genres, countries..." style={{flex:1,height:"100%",background:"transparent",border:"none",outline:"none",color:"#fff",fontSize:"0.85rem"}}/>
            {searchQuery && <button onClick={()=>setSearchQuery("")} style={{background:"none",border:"none",color:"#888",fontSize:"0.9rem",cursor:"pointer"}}>✕</button>}
          </div>
        </div>
      </div>

      <div style={{paddingLeft:"20px",marginBottom:"8px"}}>
        <div style={{display:"flex",gap:"8px",overflowX:"auto",paddingBottom:"8px",paddingRight:"20px"}}>
          {GENRES.map(g => (
            <button key={g} onClick={()=>setActiveGenre(g)} style={{flexShrink:0,padding:"6px 14px",borderRadius:"99px",border:"none",cursor:"pointer",fontSize:"0.72rem",fontWeight:"700",background:activeGenre===g?"linear-gradient(135deg,#E8640A,#D4006A)":"rgba(255,255,255,0.07)",color:activeGenre===g?"#fff":"#888",transition:"all 0.2s"}}>
              {g}
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:"0 20px",marginBottom:"16px"}}>
        <button onClick={()=>setShowCountries(!showCountries)} style={{display:"flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"99px",background:activeCountry!=="All"?"linear-gradient(135deg,#FFD700,#E8640A)":"rgba(255,255,255,0.07)",color:activeCountry!=="All"?"#000":"#888",border:"none",cursor:"pointer",fontSize:"0.72rem",fontWeight:"700"}}>
          🌍 {activeCountry==="All"?"Filter by Country":activeCountry} {showCountries?"▲":"▼"}
        </button>
        {showCountries && (
          <div style={{display:"flex",gap:"7px",flexWrap:"wrap",marginTop:"10px"}}>
            {COUNTRIES.map(c => (
              <button key={c} onClick={()=>{setActiveCountry(c);setShowCountries(false);}} style={{padding:"5px 12px",borderRadius:"99px",border:"none",cursor:"pointer",fontSize:"0.7rem",fontWeight:"700",background:activeCountry===c?"linear-gradient(135deg,#FFD700,#E8640A)":"rgba(255,255,255,0.07)",color:activeCountry===c?"#000":"#888"}}>
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{padding:"0 20px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"14px"}}>
          <h2 style={{fontSize:"0.75rem",fontWeight:"700",color:"#E8640A",letterSpacing:"0.12em",textTransform:"uppercase"}}>🎤 Artists & Music</h2>
          <div style={{display:"flex",gap:"8px"}}>
            {(activeGenre!=="All"||activeCountry!=="All") && (
              <button onClick={()=>{setActiveGenre("All");setActiveCountry("All");}} style={{padding:"5px 10px",borderRadius:"99px",background:"rgba(255,71,87,0.15)",color:"#ff4757",border:"1px solid rgba(255,71,87,0.3)",cursor:"pointer",fontSize:"0.65rem",fontWeight:"700"}}>✕ Clear</button>
            )}
            <button onClick={handleShuffle} style={{display:"flex",alignItems:"center",gap:"6px",padding:"7px 14px",borderRadius:"99px",background:shuffled?"linear-gradient(135deg,#E8640A,#D4006A)":"rgba(255,255,255,0.07)",color:shuffled?"#fff":"#888",border:`1px solid ${shuffled?"transparent":"rgba(255,255,255,0.1)"}`,cursor:"pointer",fontSize:"0.72rem",fontWeight:"700"}}>
              🔀 {shuffled?"Shuffled":"Shuffle"}
            </button>
          </div>
        </div>

        {tracks === null ? (
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <p style={{color:"#aa7788"}}>Loading tracks...</p>
          </div>
        ) : filteredTracks.length > 0 ? (
          <>
            {filteredTracks.map((track, i) => (
              <ArtistCard key={track._id} track={track} index={i} isActive={activeTrack===track._id} onPlay={()=>setActiveTrack(activeTrack===track._id?null:track._id)} onRefresh={loadTracks}/>
            ))}

            {!searchQuery && activeGenre==="All" && activeCountry==="All" && top10.length > 0 && (
              <div style={{marginTop:"24px",marginBottom:"24px"}}>
                <h2 style={{fontSize:"0.75rem",fontWeight:"700",color:"#FFD700",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"14px"}}>🏆 Top 10</h2>
                {top10.map((track, i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 14px",borderRadius:"10px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",marginBottom:"8px",cursor:"pointer"}} onClick={()=>setActiveTrack(track._id)}>
                    <span style={{fontWeight:"900",fontSize:"1.1rem",width:"28px",textAlign:"center",flexShrink:0,color:i===0?"#FFD700":i===1?"#aaa":i===2?"#cd7f32":"#555"}}>{i+1}</span>
                    <div style={{width:"42px",height:"42px",borderRadius:"8px",overflow:"hidden",flexShrink:0,background:"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {(track.artistCover||track.artistPhoto||track.coverImage)?<img src={track.artistCover||track.artistPhoto||track.coverImage} alt={track.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"🎵"}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontWeight:"700",fontSize:"0.88rem",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{track.title}</p>
                      <p style={{color:"#aa7788",fontSize:"0.72rem"}}>{track.artist}{track.genre&&<span style={{color:"#00C9B1"}}> · {track.genre}</span>}{track.country&&<span style={{color:"#FFD700"}}> · {track.country}</span>}</p>
                    </div>
                    <span style={{color:"#E8640A",fontSize:"0.72rem",flexShrink:0,fontWeight:"700"}}>{(track.plays||0).toLocaleString()} plays</span>
                  </div>
                ))}
              </div>
            )}

            {!searchQuery && activeGenre==="All" && (
              <div style={{marginBottom:"24px"}}>
                <h2 style={{fontSize:"0.75rem",fontWeight:"700",color:"#7B2FBE",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"14px"}}>🎸 Featured Genres</h2>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px"}}>
                  {[{name:"Hip Hop",icon:"🎤",color:"#E8640A"},{name:"Afrobeats",icon:"🌍",color:"#D4006A"},{name:"Electronic",icon:"🎛️",color:"#7B2FBE"},{name:"K-Pop",icon:"🎵",color:"#00C9B1"},{name:"Dancehall",icon:"🎶",color:"#FFD700"},{name:"R&B",icon:"💜",color:"#D4006A"},{name:"Gospel",icon:"✝️",color:"#E8640A"},{name:"Reggae",icon:"🌿",color:"#00C9B1"}].map(g => (
                    <button key={g.name} onClick={()=>setActiveGenre(g.name)} style={{padding:"14px 8px",borderRadius:"12px",background:"rgba(255,255,255,0.05)",border:`1px solid ${activeGenre===g.name?g.color:"rgba(255,255,255,0.08)"}`,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"6px"}}>
                      <span style={{fontSize:"1.4rem"}}>{g.icon}</span>
                      <span style={{fontSize:"0.6rem",fontWeight:"700",color:activeGenre===g.name?g.color:"#888",textAlign:"center"}}>{g.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{fontSize:"2.5rem",marginBottom:"10px"}}>🔍</div>
            <p style={{fontWeight:"700",marginBottom:"4px"}}>No tracks found</p>
            <p style={{color:"#aa7788",fontSize:"0.82rem"}}>Try a different search or filter</p>
            <button onClick={()=>{setSearchQuery("");setActiveGenre("All");setActiveCountry("All");}} style={{marginTop:"14px",padding:"8px 20px",borderRadius:"99px",background:"linear-gradient(135deg,#E8640A,#D4006A)",color:"#fff",border:"none",cursor:"pointer",fontSize:"0.8rem",fontWeight:"700"}}>Clear Filters</button>
          </div>
        )}

        <div style={{marginTop:"24px",padding:"20px",borderRadius:"16px",background:"linear-gradient(135deg,rgba(255,215,0,0.08),rgba(232,100,10,0.08))",border:"1px solid rgba(255,215,0,0.2)",textAlign:"center",marginBottom:"14px"}}>
          <p style={{fontSize:"1rem",fontWeight:"800",marginBottom:"6px"}}>⭐ Get Featured!</p>
          <p style={{color:"#aa7788",fontSize:"0.78rem",marginBottom:"14px"}}>Promote your music to the top and reach more fans</p>
          <a href="/artist/dashboard" style={{padding:"10px 20px",borderRadius:"99px",background:"linear-gradient(135deg,#FFD700,#E8640A)",color:"#000",fontWeight:"800",fontSize:"0.82rem",textDecoration:"none"}}>Promote My Music ⭐</a>
        </div>

        <div style={{padding:"20px",borderRadius:"16px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(232,100,10,0.2)",textAlign:"center",marginBottom:"16px"}}>
          <p style={{fontSize:"1.1rem",fontWeight:"800",marginBottom:"6px"}}>Are you an artist? 🎤</p>
          <p style={{color:"#aa7788",fontSize:"0.82rem",marginBottom:"16px"}}>Upload free · Receive gifts · Get featured</p>
          <div style={{display:"flex",gap:"10px",justifyContent:"center"}}>
            <a href="/register" style={{padding:"10px 20px",borderRadius:"99px",background:"linear-gradient(135deg,#E8640A,#D4006A)",color:"#fff",fontWeight:"800",fontSize:"0.82rem",textDecoration:"none"}}>Create Account</a>
            <a href="/login" style={{padding:"10px 20px",borderRadius:"99px",background:"transparent",color:"#fff",fontWeight:"700",fontSize:"0.82rem",textDecoration:"none",border:"1px solid rgba(255,255,255,0.2)"}}>Sign In</a>
          </div>
        </div>
      </div>
    </main>
  );
}
