"use client";
import { useState, useEffect, useRef, useCallback } from "react";

let globalAudio = null;
if (typeof window !== "undefined") globalAudio = new Audio();

const GENRES    = ["All","Afrobeats","Dancehall","Hip Hop","R&B","Pop","Gospel","Reggae","Electronic","K-Pop","Latin","Jazz","Other"];
const COUNTRIES = ["All","Uganda","Nigeria","Ghana","Kenya","South Africa","Tanzania","Rwanda","USA","UK","Jamaica","South Korea","Brazil","Other"];
const AMOUNTS   = [1000,2000,5000,10000,20000,50000];

// ─── Gift Modal ────────────────────────────────────────────────────
function GiftModal({ track, onClose }) {
  const [amount,   setAmount]  = useState(5000);
  const [phone,    setPhone]   = useState("");
  const [name,     setName]    = useState("");
  const [message,  setMsg]     = useState("");
  const [giftCard, setCard]    = useState("");
  const [useCard,  setUseCard] = useState(false);
  const [loading,  setLoad]    = useState(false);
  const [verifying,setVerify]  = useState(false);
  const [step,     setStep]    = useState("form"); // form|pending|success
  const [orderRef, setOrder]   = useState("");
  const [txRef,    setTx]      = useState("");
  const [isMock,   setMock]    = useState(false);
  const [prompt,   setPrompt]  = useState("");
  const [error,    setError]   = useState("");

  const artistName = track?.artist || "this artist";
  const trackId    = track?._id || "";
  const artistId   = track?.artistId || track?._id || "";

  const send = async () => {
    setError("");
    const clean = phone.replace(/\D/g, "");
    if (clean.length < 9) { setError("Enter a valid MTN or Airtel mobile money number"); return; }
    if (useCard && !giftCard.trim()) { setError("Enter your gift card code"); return; }
    setLoad(true);
    try {
      const body = { fromName: name || "Anonymous", toArtistId: artistId, toArtistName: artistName, trackId, amount: useCard ? 0 : amount, senderPhone: clean, message, giftCard: useCard ? giftCard.toUpperCase().trim() : "" };
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gifts/send`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Payment failed. Try again."); setLoad(false); return; }
      setOrder(data.orderTrackingId || "");
      setTx(data.txRef || "");
      setMock(!!data.mock);
      setPrompt(data.message || "Payment initiated. Check your phone.");
      setStep("pending");
    } catch { setError("Network error. Check your connection and try again."); }
    setLoad(false);
  };

  const verify = async () => {
    setVerify(true); setError("");
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gifts/verify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderTrackingId: orderRef, txRef }) });
      const data = await res.json();
      if (data.paid) setStep("success");
      else setError(data.message || "Not confirmed. Complete payment on phone then try again.");
    } catch { setError("Verification failed. Try again."); }
    setVerify(false);
  };

  const inp = { padding:"11px 13px", borderRadius:"9px", border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.06)", color:"#fff", fontSize:"0.85rem", width:"100%", outline:"none" };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.93)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:9999}}>
      <div style={{background:"linear-gradient(180deg,#1a0810,#0d0520)",border:"1px solid rgba(232,100,10,0.3)",borderRadius:"24px 24px 0 0",padding:"22px 20px",width:"100%",maxWidth:"480px",maxHeight:"92vh",overflowY:"auto"}}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"16px"}}>
          <div>
            <h2 style={{fontWeight:"900",fontSize:"1.1rem",background:"linear-gradient(90deg,#E8640A,#D4006A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>🎁 Gift {artistName}</h2>
            <p style={{color:"#aa7788",fontSize:"0.7rem",marginTop:"2px"}}>Your name appears on their music ✨</p>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.08)",border:"none",color:"#fff",width:"30px",height:"30px",borderRadius:"50%",cursor:"pointer",fontSize:"0.9rem",flexShrink:0}}>✕</button>
        </div>

        {step === "form" && (
          <>
            <div style={{display:"flex",gap:"8px",marginBottom:"14px"}}>
              <button onClick={()=>setUseCard(false)} style={{flex:1,padding:"9px",borderRadius:"9px",border:`2px solid ${!useCard?"#E8640A":"rgba(255,255,255,0.1)"}`,background:!useCard?"rgba(232,100,10,0.14)":"rgba(255,255,255,0.04)",color:!useCard?"#E8640A":"#888",fontWeight:"700",fontSize:"0.78rem",cursor:"pointer"}}>💰 Mobile Money</button>
              <button onClick={()=>setUseCard(true)}  style={{flex:1,padding:"9px",borderRadius:"9px",border:`2px solid ${useCard?"#FFD700":"rgba(255,255,255,0.1)"}`,background:useCard?"rgba(255,215,0,0.14)":"rgba(255,255,255,0.04)",color:useCard?"#FFD700":"#888",fontWeight:"700",fontSize:"0.78rem",cursor:"pointer"}}>🎫 Gift Card</button>
            </div>

            {!useCard ? (
              <>
                <div style={{background:"rgba(0,201,177,0.08)",border:"1px solid rgba(0,201,177,0.18)",borderRadius:"11px",padding:"12px",marginBottom:"13px",textAlign:"center"}}>
                  <p style={{color:"#00C9B1",fontWeight:"800",fontSize:"0.85rem"}}>🎁 Gift goes directly to the artist</p>
                  <p style={{color:"#aa7788",fontSize:"0.68rem",marginTop:"4px"}}>UGX {amount.toLocaleString()} · Paid via Mobile Money</p>
                </div>
                <p style={{fontSize:"0.67rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"7px"}}>Select Amount (UGX)</p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"7px",marginBottom:"13px"}}>
                  {AMOUNTS.map(a => (
                    <button key={a} onClick={()=>setAmount(a)} style={{padding:"9px",borderRadius:"9px",border:`2px solid ${amount===a?"#E8640A":"rgba(255,255,255,0.1)"}`,background:amount===a?"rgba(232,100,10,0.18)":"rgba(255,255,255,0.04)",color:amount===a?"#E8640A":"#888",fontWeight:"700",fontSize:"0.75rem",cursor:"pointer"}}>
                      {a>=1000?`${a/1000}K`:a}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div style={{marginBottom:"13px"}}>
                <div style={{background:"rgba(255,215,0,0.07)",border:"1px solid rgba(255,215,0,0.18)",borderRadius:"10px",padding:"12px",marginBottom:"10px"}}>
                  <p style={{color:"#FFD700",fontWeight:"700",fontSize:"0.78rem",marginBottom:"7px"}}>🎫 Available Gift Cards:</p>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"5px"}}>
                    {[{code:"CYBER100",val:"UGX 1,000"},{code:"CYBER500",val:"UGX 5,000"},{code:"CYBER1K",val:"UGX 10,000"},{code:"CYBERVIP",val:"UGX 50,000"}].map(c=>(
                      <div key={c.code} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,215,0,0.18)",borderRadius:"7px",padding:"7px",textAlign:"center"}}>
                        <p style={{color:"#FFD700",fontWeight:"800",fontSize:"0.68rem"}}>{c.code}</p>
                        <p style={{color:"#aa7788",fontSize:"0.6rem"}}>{c.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <label style={{fontSize:"0.67rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:"5px"}}>Enter Code</label>
                <input type="text" placeholder="e.g. CYBER500" value={giftCard} onChange={e=>setCard(e.target.value.toUpperCase())} style={{...inp,border:"1px solid rgba(255,215,0,0.3)",color:"#FFD700",fontWeight:"700",letterSpacing:"0.1em"}}/>
              </div>
            )}

            <div style={{display:"flex",flexDirection:"column",gap:"8px",marginBottom:"13px"}}>
              <div>
                <label style={{fontSize:"0.67rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:"4px"}}>Your Name (shows on music)</label>
                <input type="text" placeholder="Anonymous" value={name} onChange={e=>setName(e.target.value)} style={inp}/>
              </div>
              <div>
                <label style={{fontSize:"0.67rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:"4px"}}>MTN / Airtel Number *</label>
                <input type="tel" placeholder="e.g. 0772000000" value={phone} onChange={e=>{setPhone(e.target.value);setError("");}} style={{...inp,borderColor:error&&!phone?"#D4006A":"rgba(255,255,255,0.12)"}}/>
                <p style={{color:"#555",fontSize:"0.62rem",marginTop:"3px"}}>A payment prompt will be sent to this number</p>
              </div>
              <div>
                <label style={{fontSize:"0.67rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:"4px"}}>Message (optional)</label>
                <input type="text" placeholder="Keep making great music! 🔥" value={message} onChange={e=>setMsg(e.target.value)} style={inp}/>
              </div>
            </div>

            {error && <div style={{background:"rgba(212,0,106,0.1)",border:"1px solid rgba(212,0,106,0.3)",borderRadius:"9px",padding:"9px 13px",marginBottom:"11px",color:"#ff6b9d",fontSize:"0.78rem"}}>⚠️ {error}</div>}
            <button onClick={send} disabled={loading} style={{width:"100%",padding:"14px",borderRadius:"12px",background:loading?"#333":"linear-gradient(135deg,#E8640A,#D4006A)",color:loading?"#666":"#fff",fontWeight:"800",fontSize:"0.95rem",border:"none",cursor:loading?"not-allowed":"pointer"}}>
              {loading ? "Sending payment prompt..." : "🎁 Send Gift via Mobile Money"}
            </button>
          </>
        )}

        {step === "pending" && (
          <div style={{textAlign:"center",padding:"8px 0"}}>
            <div style={{fontSize:"2.8rem",marginBottom:"12px"}}>📱</div>
            <h3 style={{fontWeight:"900",fontSize:"1rem",marginBottom:"7px"}}>Check Your Phone!</h3>
            <p style={{color:"#aa7788",fontSize:"0.78rem",marginBottom:"16px",lineHeight:"1.6"}}>{prompt}</p>
            {!isMock && (
              <div style={{background:"rgba(232,100,10,0.07)",border:"1px solid rgba(232,100,10,0.18)",borderRadius:"10px",padding:"12px",marginBottom:"15px",textAlign:"left"}}>
                {["1. A payment prompt appears on your phone","2. Enter your PIN to approve","3. Come back and tap Confirm below"].map(s=>(
                  <div key={s} style={{display:"flex",gap:"6px",marginBottom:"5px"}}>
                    <span style={{color:"#E8640A",fontSize:"0.68rem",marginTop:"2px",flexShrink:0}}>→</span>
                    <span style={{color:"#ddd",fontSize:"0.75rem"}}>{s}</span>
                  </div>
                ))}
              </div>
            )}
            {error && <div style={{background:"rgba(212,0,106,0.1)",border:"1px solid rgba(212,0,106,0.3)",borderRadius:"9px",padding:"9px 13px",marginBottom:"11px",color:"#ff6b9d",fontSize:"0.78rem",textAlign:"left"}}>⚠️ {error}</div>}
            <button onClick={verify} disabled={verifying} style={{width:"100%",padding:"14px",borderRadius:"12px",background:verifying?"#333":"linear-gradient(135deg,#00C9B1,#006a5a)",color:verifying?"#666":"#fff",fontWeight:"800",fontSize:"0.95rem",border:"none",cursor:verifying?"not-allowed":"pointer",marginBottom:"8px"}}>
              {verifying ? "Checking..." : "✅ I Approved — Confirm Payment"}
            </button>
            <button onClick={()=>setStep("form")} style={{width:"100%",padding:"11px",borderRadius:"12px",background:"transparent",color:"#888",fontWeight:"600",fontSize:"0.82rem",border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer"}}>← Go Back</button>
          </div>
        )}

        {step === "success" && (
          <div style={{textAlign:"center",padding:"16px 0"}}>
            <div style={{fontSize:"3.5rem",marginBottom:"12px"}}>🎉</div>
            <h3 style={{fontWeight:"900",fontSize:"1.1rem",marginBottom:"7px",color:"#00C9B1"}}>Gift Sent!</h3>
            <p style={{color:"#aa7788",fontSize:"0.8rem",marginBottom:"22px",lineHeight:"1.6"}}>Your gift to <strong style={{color:"#fff"}}>{artistName}</strong> was successful!</p>
            <button onClick={onClose} style={{width:"100%",padding:"14px",borderRadius:"12px",background:"linear-gradient(135deg,#00C9B1,#006a5a)",color:"#fff",fontWeight:"800",fontSize:"0.95rem",border:"none",cursor:"pointer"}}>Done ✓</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Promote Picker Modal (home page) ─────────────────────────────
function PromotePickerModal({ onClose }) {
  const [artist,   setArtist]  = useState(null);
  const [tracks,   setTracks]  = useState([]);
  const [loading,  setLoading] = useState(true);
  const [selected, setSelected]= useState(null);
  const [days,     setDays]    = useState(3);
  const [phone,    setPhone]   = useState("");
  const [step,     setStep]    = useState("pick"); // pick|pay|pending|success
  const [payLoad,  setPayLoad] = useState(false);
  const [verLoad,  setVerLoad] = useState(false);
  const [orderRef, setOrder]   = useState("");
  const [txRef,    setTx]      = useState("");
  const [isMock,   setMock]    = useState(false);
  const [msg,      setMsg]     = useState("");
  const [error,    setError]   = useState("");

  const PRICES = { 3:1000, 7:2500, 14:5000, 30:10000 };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("artist");
      const token  = localStorage.getItem("token");
      if (!stored || !token) { setLoading(false); return; }
      const a = JSON.parse(stored);
      setArtist(a);
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/artist/mytracks`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => { setTracks(Array.isArray(data.data) ? data.data : []); setLoading(false); })
        .catch(() => setLoading(false));
    } catch { setLoading(false); }
  }, []);

  const pay = async () => {
    setError("");
    const clean = phone.replace(/\D/g, "");
    if (!selected) { setError("Please select a track to promote"); return; }
    if (clean.length < 9) { setError("Enter a valid MTN or Airtel number"); return; }
    setPayLoad(true);
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gifts/promote`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId: selected._id, phone: clean, days })
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Payment failed."); setPayLoad(false); return; }
      setOrder(data.orderTrackingId || "");
      setTx(data.txRef || "");
      setMock(!!data.mock);
      setMsg(data.message || "Payment initiated. Check your phone.");
      setStep("pending");
    } catch { setError("Network error. Try again."); }
    setPayLoad(false);
  };

  const verify = async () => {
    setVerLoad(true); setError("");
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gifts/promote/verify`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderTrackingId: orderRef, txRef, trackId: selected?._id, days })
      });
      const data = await res.json();
      if (data.paid) setStep("success");
      else setError(data.message || "Not confirmed yet. Approve on phone then try again.");
    } catch { setError("Verification failed. Try again."); }
    setVerLoad(false);
  };

  const inp = { padding:"11px 13px", borderRadius:"9px", border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.06)", color:"#fff", fontSize:"0.85rem", width:"100%", outline:"none" };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.93)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:9999}}>
      <div style={{background:"linear-gradient(180deg,#1a0810,#0d0520)",border:"1px solid rgba(255,215,0,0.25)",borderRadius:"24px 24px 0 0",padding:"22px 20px",width:"100%",maxWidth:"480px",maxHeight:"92vh",overflowY:"auto"}}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"16px"}}>
          <div>
            <h2 style={{fontWeight:"900",fontSize:"1.1rem",background:"linear-gradient(90deg,#FFD700,#E8640A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>⭐ Promote My Music</h2>
            <p style={{color:"#aa7788",fontSize:"0.7rem",marginTop:"2px"}}>Get featured at the top of the home feed</p>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.08)",border:"none",color:"#fff",width:"30px",height:"30px",borderRadius:"50%",cursor:"pointer",fontSize:"0.9rem"}}>✕</button>
        </div>

        {/* Not logged in */}
        {!artist && !loading && (
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:"2.5rem",marginBottom:"12px"}}>🔐</div>
            <p style={{fontWeight:"700",fontSize:"0.95rem",marginBottom:"6px"}}>Sign in to promote your music</p>
            <p style={{color:"#aa7788",fontSize:"0.8rem",marginBottom:"20px"}}>You need an artist account to promote tracks</p>
            <div style={{display:"flex",gap:"8px",justifyContent:"center"}}>
              <a href="/login" onClick={onClose} style={{padding:"11px 20px",borderRadius:"99px",background:"linear-gradient(135deg,#E8640A,#D4006A)",color:"#fff",fontWeight:"800",fontSize:"0.85rem",textDecoration:"none"}}>Sign In</a>
              <a href="/register" onClick={onClose} style={{padding:"11px 20px",borderRadius:"99px",border:"1px solid rgba(255,255,255,0.15)",color:"#fff",fontWeight:"700",fontSize:"0.85rem",textDecoration:"none"}}>Register</a>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{textAlign:"center",padding:"30px 0"}}>
            <div style={{width:"28px",height:"28px",border:"3px solid #FFD700",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 10px"}}/>
            <p style={{color:"#aa7788",fontSize:"0.8rem"}}>Loading your tracks...</p>
          </div>
        )}

        {/* No tracks */}
        {artist && !loading && tracks.length === 0 && (
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:"2.5rem",marginBottom:"10px"}}>🎵</div>
            <p style={{fontWeight:"700",marginBottom:"5px"}}>No tracks uploaded yet</p>
            <p style={{color:"#aa7788",fontSize:"0.78rem",marginBottom:"18px"}}>Upload a track first, then promote it</p>
            <a href="/upload" onClick={onClose} style={{padding:"11px 20px",borderRadius:"99px",background:"linear-gradient(135deg,#E8640A,#D4006A)",color:"#fff",fontWeight:"800",fontSize:"0.85rem",textDecoration:"none"}}>Upload Track</a>
          </div>
        )}

        {/* STEP: PICK TRACK */}
        {artist && !loading && tracks.length > 0 && step === "pick" && (
          <>
            <p style={{fontSize:"0.68rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"9px"}}>Select Track to Promote</p>
            <div style={{marginBottom:"14px",maxHeight:"200px",overflowY:"auto"}}>
              {tracks.map(t => (
                <div key={t._id} onClick={() => setSelected(t)} style={{display:"flex",alignItems:"center",gap:"10px",padding:"9px 12px",borderRadius:"10px",border:`2px solid ${selected?._id===t._id?"#FFD700":"rgba(255,255,255,0.08)"}`,background:selected?._id===t._id?"rgba(255,215,0,0.08)":"rgba(255,255,255,0.03)",marginBottom:"6px",cursor:"pointer",transition:"all 0.15s"}}>
                  <div style={{width:"40px",height:"40px",borderRadius:"7px",overflow:"hidden",flexShrink:0,background:"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem"}}>
                    {(t.artistCover||t.artistPhoto||t.coverImage) ? <img src={t.artistCover||t.artistPhoto||t.coverImage} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}} /> : "🎵"}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontWeight:"700",fontSize:"0.84rem",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.title||"Untitled"}</p>
                    <p style={{color:"#aa7788",fontSize:"0.65rem",marginTop:"1px"}}>👁 {t.plays||0} plays · ❤️ {t.likes||0} likes</p>
                  </div>
                  {t.promoted && t.promotedUntil && new Date(t.promotedUntil) > new Date() && (
                    <span style={{background:"rgba(255,215,0,0.18)",color:"#FFD700",padding:"2px 7px",borderRadius:"99px",fontSize:"0.58rem",fontWeight:"700",flexShrink:0}}>⭐ Live</span>
                  )}
                  {selected?._id === t._id && <span style={{color:"#FFD700",fontSize:"1rem",flexShrink:0}}>✓</span>}
                </div>
              ))}
            </div>

            <p style={{fontSize:"0.68rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"8px"}}>Choose Duration & Budget</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"6px",marginBottom:"12px"}}>
              {Object.entries(PRICES).map(([d,p]) => (
                <button key={d} onClick={() => setDays(Number(d))} style={{padding:"8px 4px",borderRadius:"8px",border:`2px solid ${days===Number(d)?"#FFD700":"rgba(255,255,255,0.1)"}`,background:days===Number(d)?"rgba(255,215,0,0.14)":"rgba(255,255,255,0.04)",cursor:"pointer",textAlign:"center"}}>
                  <p style={{color:days===Number(d)?"#FFD700":"#888",fontWeight:"800",fontSize:"0.72rem"}}>{d===3?"3 Days":d===7?"1 Week":d===14?"2 Weeks":"1 Month"}</p>
                  <p style={{color:"#aa7788",fontSize:"0.58rem",marginTop:"1px"}}>UGX {p>=1000?p/1000+"K":p}</p>
                </button>
              ))}
            </div>

            <div style={{background:"rgba(255,215,0,0.05)",border:"1px solid rgba(255,215,0,0.12)",borderRadius:"9px",padding:"10px 13px",marginBottom:"12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <p style={{color:"#aa7788",fontSize:"0.72rem"}}>{selected ? selected.title : "No track selected"}</p>
                <p style={{color:"#555",fontSize:"0.65rem",marginTop:"1px"}}>{days} day{days>1?"s":""} promotion</p>
              </div>
              <span style={{color:"#FFD700",fontWeight:"900",fontSize:"1rem"}}>UGX {PRICES[days].toLocaleString()}</span>
            </div>

            <label style={{fontSize:"0.68rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:"5px"}}>MTN / Airtel Number *</label>
            <input type="tel" placeholder="e.g. 0772000000" value={phone} onChange={e=>{setPhone(e.target.value);setError("");}} style={{...inp,borderColor:error&&!phone?"#D4006A":"rgba(255,255,255,0.12)",marginBottom:"4px"}}/>
            <p style={{color:"#555",fontSize:"0.62rem",marginBottom:"12px"}}>Payment prompt will be sent to this number</p>

            {error && <div style={{background:"rgba(212,0,106,0.1)",border:"1px solid rgba(212,0,106,0.3)",borderRadius:"8px",padding:"8px 12px",marginBottom:"10px",color:"#ff6b9d",fontSize:"0.78rem"}}>⚠️ {error}</div>}

            <button onClick={pay} disabled={payLoad||!selected} style={{width:"100%",padding:"14px",borderRadius:"11px",background:(payLoad||!selected)?"#333":"linear-gradient(135deg,#FFD700,#E8640A)",color:(payLoad||!selected)?"#666":"#000",fontWeight:"800",fontSize:"0.93rem",border:"none",cursor:(payLoad||!selected)?"not-allowed":"pointer"}}>
              {payLoad ? "Sending payment prompt..." : selected ? `⭐ Promote "${selected.title}" — UGX ${PRICES[days].toLocaleString()}` : "⭐ Select a track above"}
            </button>
          </>
        )}

        {/* STEP: PENDING */}
        {step === "pending" && (
          <div style={{textAlign:"center",padding:"8px 0"}}>
            <div style={{fontSize:"2.8rem",marginBottom:"11px"}}>📱</div>
            <h3 style={{fontWeight:"900",fontSize:"0.98rem",marginBottom:"6px"}}>Check Your Phone!</h3>
            <p style={{color:"#aa7788",fontSize:"0.78rem",marginBottom:"14px",lineHeight:"1.6"}}>{msg}</p>
            {!isMock && (
              <div style={{background:"rgba(255,215,0,0.05)",border:"1px solid rgba(255,215,0,0.15)",borderRadius:"10px",padding:"12px",marginBottom:"14px",textAlign:"left"}}>
                {["1. A payment prompt appears on your phone","2. Enter your mobile money PIN to approve","3. Come back and tap Confirm below"].map(s => (
                  <div key={s} style={{display:"flex",gap:"5px",marginBottom:"5px"}}>
                    <span style={{color:"#FFD700",fontSize:"0.67rem",flexShrink:0,marginTop:"2px"}}>→</span>
                    <span style={{color:"#ddd",fontSize:"0.74rem"}}>{s}</span>
                  </div>
                ))}
              </div>
            )}
            {error && <div style={{background:"rgba(212,0,106,0.1)",border:"1px solid rgba(212,0,106,0.3)",borderRadius:"8px",padding:"8px 12px",marginBottom:"10px",color:"#ff6b9d",fontSize:"0.78rem",textAlign:"left"}}>⚠️ {error}</div>}
            <button onClick={verify} disabled={verLoad} style={{width:"100%",padding:"14px",borderRadius:"11px",background:verLoad?"#333":"linear-gradient(135deg,#FFD700,#E8640A)",color:verLoad?"#666":"#000",fontWeight:"800",fontSize:"0.93rem",border:"none",cursor:verLoad?"not-allowed":"pointer",marginBottom:"8px"}}>
              {verLoad ? "Checking..." : "✅ I Approved — Confirm Payment"}
            </button>
            <button onClick={()=>setStep("pick")} style={{width:"100%",padding:"10px",borderRadius:"11px",background:"transparent",color:"#888",fontWeight:"600",fontSize:"0.8rem",border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer"}}>← Go Back</button>
          </div>
        )}

        {/* STEP: SUCCESS */}
        {step === "success" && (
          <div style={{textAlign:"center",padding:"14px 0"}}>
            <div style={{fontSize:"3.2rem",marginBottom:"11px"}}>⭐</div>
            <h3 style={{fontWeight:"900",fontSize:"1.05rem",marginBottom:"6px",color:"#FFD700"}}>Track Is Now Featured!</h3>
            <p style={{color:"#aa7788",fontSize:"0.78rem",marginBottom:"20px",lineHeight:"1.6"}}>
              <strong style={{color:"#fff"}}>{selected?.title}</strong> now appears at the top of the home feed!
            </p>
            <button onClick={onClose} style={{width:"100%",padding:"14px",borderRadius:"11px",background:"linear-gradient(135deg,#FFD700,#E8640A)",color:"#000",fontWeight:"800",fontSize:"0.93rem",border:"none",cursor:"pointer"}}>Done 🎉</button>
          </div>
        )}
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}


// ─── Artist Card ───────────────────────────────────────────────────
function ArtistCard({ track, isActive, onPlay, index, onRefresh }) {
  const [progress, setProgress] = useState(0);
  const [liked,    setLiked]    = useState(false);
  const [showGift, setShowGift] = useState(false);
  const playRec = useRef(false);

  const isPromoted = !!(track.promoted && track.promotedUntil && new Date(track.promotedUntil) > new Date());
  const gifters    = Array.isArray(track.gifters) ? track.gifters : [];
  const plays      = Number(track.plays)    || 0;
  const likes      = Number(track.likes)    || 0;
  const downloads  = Number(track.downloads)|| 0;
  const title      = track.title   || "Untitled";
  const artist     = track.artist  || "Unknown Artist";

  useEffect(() => {
    try {
      const lt = JSON.parse(localStorage.getItem("likedTracks") || "[]");
      if (lt.includes(track._id)) setLiked(true);
    } catch {}
  }, [track._id]);

  useEffect(() => {
    if (!globalAudio) return;
    if (isActive) {
      globalAudio.src = track.audioUrl || "";
      globalAudio.play().catch(() => {});
      if (!playRec.current) {
        playRec.current = true;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${track._id}/play`, { method: "POST" }).then(() => onRefresh()).catch(() => {});
      }
    } else {
      try { globalAudio.pause(); } catch {}
    }
  }, [isActive]);

  useEffect(() => {
    if (!globalAudio || !isActive) return;
    const upd = () => {
      try { setProgress((globalAudio.currentTime / globalAudio.duration) * 100 || 0); } catch {}
    };
    globalAudio.addEventListener("timeupdate", upd);
    return () => globalAudio.removeEventListener("timeupdate", upd);
  }, [isActive]);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (liked) return;
    setLiked(true);
    try {
      const lt = JSON.parse(localStorage.getItem("likedTracks") || "[]");
      localStorage.setItem("likedTracks", JSON.stringify([...lt, track._id]));
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${track._id}/like`, { method: "POST" });
      onRefresh();
    } catch {}
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    try { await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${track._id}/download`, { method: "POST" }); onRefresh(); } catch {}
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      const text = `🎵 Listen to ${title} by ${artist} on CyberMuzik!`;
      if (navigator.share) await navigator.share({ title, text, url: window.location.href });
      else { navigator.clipboard.writeText(`${text} ${window.location.href}`); alert("Link copied!"); }
    } catch {}
  };

  const gradients = [
    "linear-gradient(135deg,#6B0F3A,#3a0820)", "linear-gradient(135deg,#7B2FBE,#3a1060)",
    "linear-gradient(135deg,#E8640A,#7a300a)", "linear-gradient(135deg,#D4006A,#6a0030)",
    "linear-gradient(135deg,#00C9B1,#006a5a)", "linear-gradient(135deg,#6B0F3A,#7B2FBE)",
    "linear-gradient(135deg,#E8640A,#D4006A)",
  ];

  const coverImg = track.artistCover || track.artistPhoto || track.coverImage || "";

  return (
    <>
      {showGift && <GiftModal track={track} onClose={() => setShowGift(false)} />}
      <div onClick={onPlay} style={{position:"relative",borderRadius:"18px",overflow:"hidden",marginBottom:"14px",cursor:"pointer",background:gradients[index % gradients.length],border:`2px solid ${isPromoted?"#FFD700":isActive?"#E8640A":"rgba(255,255,255,0.07)"}`,transition:"all 0.2s",boxShadow:isPromoted?"0 0 20px rgba(255,215,0,0.18)":isActive?"0 0 22px rgba(232,100,10,0.22)":"none"}}>

        {isPromoted && (
          <div style={{background:"linear-gradient(90deg,#FFD700,#E8640A)",padding:"4px 14px",display:"flex",alignItems:"center",gap:"5px"}}>
            <span style={{fontSize:"0.6rem"}}>⭐</span>
            <span style={{fontSize:"0.6rem",fontWeight:"800",color:"#000",textTransform:"uppercase",letterSpacing:"0.08em"}}>Featured Artist</span>
          </div>
        )}

        {coverImg ? (
          <img src={coverImg} alt={artist} style={{width:"100%",height:"220px",objectFit:"cover",display:"block"}} onError={e=>{e.target.style.display="none";}}/>
        ) : (
          <div style={{width:"100%",height:"220px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"4.5rem"}}>🎤</div>
        )}

        <div style={{position:"absolute",top:isPromoted?"36px":"12px",left:"12px",display:"flex",gap:"4px",flexWrap:"wrap"}}>
          {track.genre && track.genre !== "Other" && <span style={{background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)",padding:"2px 7px",borderRadius:"99px",fontSize:"0.58rem",fontWeight:"700",color:"#00C9B1",border:"1px solid rgba(0,201,177,0.3)"}}>{track.genre}</span>}
          {track.country && <span style={{background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)",padding:"2px 7px",borderRadius:"99px",fontSize:"0.58rem",fontWeight:"700",color:"#FFD700",border:"1px solid rgba(255,215,0,0.3)"}}>🌍 {track.country}</span>}
        </div>

        <div style={{position:"absolute",top:isPromoted?"36px":"12px",right:"12px",display:"flex",gap:"4px",flexWrap:"wrap",justifyContent:"flex-end"}}>
          {isActive && (
            <div style={{background:"rgba(232,100,10,0.85)",backdropFilter:"blur(8px)",padding:"3px 8px",borderRadius:"99px",fontSize:"0.6rem",fontWeight:"700",display:"flex",alignItems:"center",gap:"3px"}}>
              <div style={{display:"flex",gap:"2px",alignItems:"flex-end",height:"12px"}}>
                {[8,12,6,10].map((h,i)=><div key={i} style={{width:"2px",height:`${h}px`,background:"#fff",borderRadius:"2px",animation:`eq 0.65s ease-in-out ${i*0.12}s infinite alternate`}}/>)}
              </div>
              LIVE
            </div>
          )}
          {[{v:plays,ico:"👁",b:"rgba(232,100,10,0.4)"},{v:likes,ico:"❤️",b:"rgba(212,0,106,0.4)"},{v:downloads,ico:"⬇",b:"rgba(0,201,177,0.4)"}].map(s=>(
            <div key={s.ico} style={{background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)",border:`1px solid ${s.b}`,padding:"3px 8px",borderRadius:"99px",fontSize:"0.6rem",fontWeight:"700"}}>{s.ico} {s.v.toLocaleString()}</div>
          ))}
        </div>

        <div style={{position:"absolute",inset:0,background:isActive?"linear-gradient(to bottom,rgba(232,100,10,0.06) 0%,rgba(0,0,0,0.92) 100%)":"linear-gradient(to bottom,transparent 30%,rgba(0,0,0,0.92) 100%)"}}/>

        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"14px"}}>
          {gifters.length > 0 && (
            <div style={{display:"flex",alignItems:"center",gap:"5px",marginBottom:"7px",flexWrap:"wrap"}}>
              <span style={{fontSize:"0.58rem",color:"#FFD700"}}>🎁 Gifted by:</span>
              {gifters.slice(-4).map((g,i) => (
                <span key={i} style={{background:"rgba(255,215,0,0.14)",border:"1px solid rgba(255,215,0,0.28)",padding:"1px 7px",borderRadius:"99px",fontSize:"0.58rem",color:"#FFD700",fontWeight:"600"}}>{g.name || "Fan"}</span>
              ))}
            </div>
          )}
          <div style={{display:"flex",alignItems:"center",gap:"7px",marginBottom:"3px"}}>
            <p style={{fontWeight:"900",fontSize:"1.05rem"}}>{artist}</p>
            <div style={{display:"flex",alignItems:"center",gap:"3px",background:"rgba(0,201,177,0.14)",padding:"2px 7px",borderRadius:"99px",border:"1px solid rgba(0,201,177,0.28)"}}>
              <span style={{color:"#00C9B1",fontSize:"0.58rem"}}>✓</span>
              <span style={{color:"#00C9B1",fontSize:"0.58rem",fontWeight:"700"}}>Verified Artist</span>
            </div>
          </div>
          <p style={{color:"#ddd",fontSize:"0.76rem",marginBottom:"9px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>🎵 {title}</p>
          {isActive && (
            <div style={{height:"3px",background:"rgba(255,255,255,0.18)",borderRadius:"99px",marginBottom:"10px",overflow:"hidden"}}>
              <div style={{width:`${progress}%`,height:"100%",background:"linear-gradient(90deg,#E8640A,#D4006A)",borderRadius:"99px",transition:"width 0.4s"}}/>
            </div>
          )}
          <div style={{display:"flex",alignItems:"center",gap:"6px"}} onClick={e => e.stopPropagation()}>
            <button onClick={onPlay} style={{flex:1,height:"42px",borderRadius:"11px",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"7px",fontWeight:"800",fontSize:"0.85rem",background:isActive?"linear-gradient(135deg,#E8640A,#D4006A)":"#fff",color:"#000",transition:"all 0.2s"}}>
              <div style={{width:"22px",height:"22px",borderRadius:"50%",background:"rgba(0,0,0,0.14)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem"}}>{isActive?"⏸":"▶"}</div>
              {isActive ? "PAUSE" : "PLAY"}
            </button>
            <button onClick={handleLike} style={{width:"42px",height:"42px",borderRadius:"11px",border:`1px solid ${liked?"rgba(212,0,106,0.6)":"rgba(255,255,255,0.14)"}`,background:liked?"rgba(212,0,106,0.22)":"rgba(255,255,255,0.08)",cursor:liked?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.95rem",color:"#fff"}}>
              {liked ? "❤️" : "🤍"}
            </button>
            <button onClick={e=>{e.stopPropagation();setShowGift(true);}} style={{width:"42px",height:"42px",borderRadius:"11px",border:"1px solid rgba(255,215,0,0.38)",background:"rgba(255,215,0,0.09)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.95rem"}} title="Gift artist">🎁</button>
            <a href={track.audioUrl||"#"} download onClick={handleDownload} style={{width:"42px",height:"42px",borderRadius:"11px",border:"1px solid rgba(0,201,177,0.28)",background:"rgba(0,201,177,0.09)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.95rem",color:"#fff",textDecoration:"none"}}>⬇</a>
            <button onClick={handleShare} style={{width:"42px",height:"42px",borderRadius:"11px",border:"1px solid rgba(255,255,255,0.14)",background:"rgba(255,255,255,0.07)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.95rem",color:"#fff"}}>🔗</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Home Page ─────────────────────────────────────────────────────
export default function Home() {
  const [tracks,        setTracks]        = useState(null);
  const [activeTrack,   setActiveTrack]   = useState(null);
  const [shuffled,      setShuffled]      = useState(false);
  const [displayTracks, setDisplayTracks] = useState([]);
  const [searchQuery,   setSearch]        = useState("");
  const [searchFocus,   setFocus]         = useState(false);
  const [activeGenre,   setGenre]         = useState("All");
  const [activeCountry, setCountry]       = useState("All");
  const [showCountries, setShowC]         = useState(false);
  const [showPromotePicker, setShowPromote] = useState(false);

  // Wake backend - Render free tier sleeps, ping 4x to wake it
  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) return;
    [0, 5000, 12000, 20000].forEach(ms =>
      setTimeout(() => fetch(api + '/').catch(() => {}), ms)
    );
  }, []);

  const loadTracks = useCallback((retry = 0) => {
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) return;
    fetch(api + '/api/tracks')
      .then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(data => {
        const t = Array.isArray(data && data.data) ? data.data
                : Array.isArray(data) ? data : [];
        setTracks(t);
        setDisplayTracks(prev => {
          if (!prev.length) return t;
          const isShuffled = prev.some((p, i) => p._id !== (t[i] && t[i]._id));
          if (!isShuffled) return t;
          return prev.map(p => t.find(n => n._id === p._id) || p);
        });
      })
      .catch(() => {
        if (retry < 5) {
          setTimeout(() => loadTracks(retry + 1), 8000);
        } else {
          setTracks([]);
          setDisplayTracks([]);
        }
      });
  }, []);

  useEffect(() => {
    loadTracks();
    const iv = setInterval(loadTracks, 30000);
    return () => clearInterval(iv);
  }, [loadTracks]);

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
    if (shuffled) {
      setDisplayTracks([...tracks]);
    } else {
      const a = [...tracks];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      setDisplayTracks(a);
    }
    setShuffled(!shuffled);
  };

  const filteredTracks = displayTracks.filter(t => {
    const matchS = !searchQuery || [t.title, t.artist, t.genre, t.country].some(v => v?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchG = activeGenre  === "All" || t.genre   === activeGenre;
    const matchC = activeCountry=== "All" || t.country === activeCountry;
    return matchS && matchG && matchC;
  });

  const top10 = tracks ? [...tracks].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 10) : [];
  const trending = tracks ? [...new Map(tracks.map(t => [t.artist, t])).values()].slice(0, 8) : [];

  return (
    <main style={{padding:"0",color:"white",background:"linear-gradient(160deg,#0a0a0f 0%,#0d0520 50%,#0a0a0f 100%)",minHeight:"100vh",maxWidth:"480px",margin:"0 auto",paddingBottom:"80px"}}>
      <style>{`@keyframes eq{from{transform:scaleY(0.3);}to{transform:scaleY(1);}} body{background:#0a0a0f;} *::-webkit-scrollbar{display:none;}`}</style>

      <div style={{padding:"18px 18px 0"}}>
        <h1 style={{fontSize:"1.5rem",fontWeight:"900",letterSpacing:"-0.02em",background:"linear-gradient(90deg,#E8640A,#D4006A,#7B2FBE)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:"3px"}}>Top Trending Artists</h1>
        <p style={{color:"#aa7788",fontSize:"0.78rem",marginBottom:"14px"}}>Stream · 🎁 Gift · Download · Free for Everyone</p>

        {trending.length > 0 && (
          <div style={{display:"flex",gap:"11px",overflowX:"auto",paddingBottom:"14px"}}>
            {trending.map((t, i) => (
              <div key={t._id || i} onClick={() => setActiveTrack(t._id)} style={{flexShrink:0,width:"86px",cursor:"pointer",textAlign:"center"}}>
                <div style={{width:"86px",height:"86px",borderRadius:"13px",overflow:"hidden",marginBottom:"6px",border:t.promoted&&t.promotedUntil&&new Date(t.promotedUntil)>new Date()?"2px solid #FFD700":activeTrack===t._id?"2px solid #E8640A":"2px solid rgba(255,255,255,0.1)",position:"relative",background:"linear-gradient(135deg,#E8640A,#7B2FBE)"}}>
                  {(t.artistCover||t.artistPhoto||t.coverImage)
                    ? <img src={t.artistCover||t.artistPhoto||t.coverImage} alt={t.artist||""} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>
                    : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem"}}>🎤</div>}
                  {t.promoted&&t.promotedUntil&&new Date(t.promotedUntil)>new Date()&&<div style={{position:"absolute",top:"3px",right:"3px",background:"#FFD700",borderRadius:"99px",padding:"1px 4px",fontSize:"0.48rem",fontWeight:"800",color:"#000"}}>⭐</div>}
                  <div style={{position:"absolute",bottom:"3px",left:"3px",background:"rgba(0,201,177,0.9)",borderRadius:"99px",width:"13px",height:"13px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.45rem",fontWeight:"900",color:"#000"}}>✓</div>
                </div>
                <p style={{fontSize:"0.62rem",fontWeight:"700",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.artist||"Artist"}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{marginBottom:"13px"}}>
          <div style={{display:"flex",alignItems:"center",background:"rgba(255,255,255,0.07)",borderRadius:"99px",border:`1px solid ${searchFocus?"#E8640A":"rgba(255,255,255,0.1)"}`,overflow:"hidden",padding:"0 15px",height:"46px",transition:"all 0.3s"}}>
            <span style={{fontSize:"0.95rem",marginRight:"9px",color:"#555"}}>🔍</span>
            <input type="text" value={searchQuery} onChange={e=>setSearch(e.target.value)} onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)} placeholder="Search tracks, artists, genres, countries..." style={{flex:1,height:"100%",background:"transparent",border:"none",outline:"none",color:"#fff",fontSize:"0.82rem"}}/>
            {searchQuery && <button onClick={()=>setSearch("")} style={{background:"none",border:"none",color:"#888",fontSize:"0.88rem",cursor:"pointer"}}>✕</button>}
          </div>
        </div>
      </div>

      <div style={{paddingLeft:"18px",marginBottom:"7px"}}>
        <div style={{display:"flex",gap:"7px",overflowX:"auto",paddingBottom:"7px",paddingRight:"18px"}}>
          {GENRES.map(g => (
            <button key={g} onClick={()=>setGenre(g)} style={{flexShrink:0,padding:"5px 13px",borderRadius:"99px",border:"none",cursor:"pointer",fontSize:"0.7rem",fontWeight:"700",background:activeGenre===g?"linear-gradient(135deg,#E8640A,#D4006A)":"rgba(255,255,255,0.07)",color:activeGenre===g?"#fff":"#888",transition:"all 0.2s"}}>
              {g}
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:"0 18px",marginBottom:"14px"}}>
        <button onClick={()=>setShowC(!showCountries)} style={{display:"flex",alignItems:"center",gap:"5px",padding:"5px 13px",borderRadius:"99px",background:activeCountry!=="All"?"linear-gradient(135deg,#FFD700,#E8640A)":"rgba(255,255,255,0.07)",color:activeCountry!=="All"?"#000":"#888",border:"none",cursor:"pointer",fontSize:"0.7rem",fontWeight:"700"}}>
          🌍 {activeCountry === "All" ? "Filter by Country" : activeCountry} {showCountries ? "▲" : "▼"}
        </button>
        {showCountries && (
          <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginTop:"9px"}}>
            {COUNTRIES.map(c => (
              <button key={c} onClick={()=>{setCountry(c);setShowC(false);}} style={{padding:"4px 11px",borderRadius:"99px",border:"none",cursor:"pointer",fontSize:"0.68rem",fontWeight:"700",background:activeCountry===c?"linear-gradient(135deg,#FFD700,#E8640A)":"rgba(255,255,255,0.07)",color:activeCountry===c?"#000":"#888"}}>
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{padding:"0 18px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"12px"}}>
          <h2 style={{fontSize:"0.72rem",fontWeight:"700",color:"#E8640A",letterSpacing:"0.12em",textTransform:"uppercase"}}>🎤 Artists & Music</h2>
          <div style={{display:"flex",gap:"7px"}}>
            {(activeGenre !== "All" || activeCountry !== "All") && (
              <button onClick={()=>{setGenre("All");setCountry("All");}} style={{padding:"4px 9px",borderRadius:"99px",background:"rgba(255,71,87,0.14)",color:"#ff4757",border:"1px solid rgba(255,71,87,0.28)",cursor:"pointer",fontSize:"0.62rem",fontWeight:"700"}}>✕ Clear</button>
            )}
            <button onClick={handleShuffle} style={{display:"flex",alignItems:"center",gap:"5px",padding:"6px 13px",borderRadius:"99px",background:shuffled?"linear-gradient(135deg,#E8640A,#D4006A)":"rgba(255,255,255,0.07)",color:shuffled?"#fff":"#888",border:`1px solid ${shuffled?"transparent":"rgba(255,255,255,0.1)"}`,cursor:"pointer",fontSize:"0.7rem",fontWeight:"700"}}>
              🔀 {shuffled ? "Shuffled" : "Shuffle"}
            </button>
          </div>
        </div>

        {tracks === null ? (
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{width:"32px",height:"32px",border:"3px solid #E8640A",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 12px"}}/>
            <p style={{color:"#aa7788",fontSize:"0.85rem"}}>Loading tracks...</p><p style={{color:"#555",fontSize:"0.72rem",marginTop:"6px"}}>First load may take 30–40 seconds</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : filteredTracks.length > 0 ? (
          <>
            {filteredTracks.map((t, i) => (
              <ArtistCard key={t._id || i} track={t} index={i} isActive={activeTrack === t._id} onPlay={() => setActiveTrack(activeTrack === t._id ? null : t._id)} onRefresh={loadTracks} />
            ))}

            {!searchQuery && activeGenre === "All" && activeCountry === "All" && top10.length > 0 && (
              <div style={{marginTop:"22px",marginBottom:"22px"}}>
                <h2 style={{fontSize:"0.72rem",fontWeight:"700",color:"#FFD700",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"12px"}}>🏆 Top 10</h2>
                {top10.map((t, i) => (
                  <div key={t._id||i} style={{display:"flex",alignItems:"center",gap:"11px",padding:"9px 13px",borderRadius:"9px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",marginBottom:"7px",cursor:"pointer"}} onClick={() => setActiveTrack(t._id)}>
                    <span style={{fontWeight:"900",fontSize:"1rem",width:"26px",textAlign:"center",flexShrink:0,color:i===0?"#FFD700":i===1?"#aaa":i===2?"#cd7f32":"#555"}}>{i + 1}</span>
                    <div style={{width:"40px",height:"40px",borderRadius:"7px",overflow:"hidden",flexShrink:0,background:"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {(t.artistCover||t.artistPhoto||t.coverImage) ? <img src={t.artistCover||t.artistPhoto||t.coverImage} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/> : "🎵"}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontWeight:"700",fontSize:"0.85rem",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.title||"Untitled"}</p>
                      <p style={{color:"#aa7788",fontSize:"0.68rem"}}>{t.artist||"Unknown"}{t.genre&&<span style={{color:"#00C9B1"}}> · {t.genre}</span>}{t.country&&<span style={{color:"#FFD700"}}> · {t.country}</span>}</p>
                    </div>
                    <span style={{color:"#E8640A",fontSize:"0.68rem",flexShrink:0,fontWeight:"700"}}>{(t.plays||0).toLocaleString()} plays</span>
                  </div>
                ))}
              </div>
            )}

            {!searchQuery && activeGenre === "All" && (
              <div style={{marginBottom:"22px"}}>
                <h2 style={{fontSize:"0.72rem",fontWeight:"700",color:"#7B2FBE",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"12px"}}>🎸 Featured Genres</h2>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"9px"}}>
                  {[{n:"Hip Hop",i:"🎤",c:"#E8640A"},{n:"Afrobeats",i:"🌍",c:"#D4006A"},{n:"Electronic",i:"🎛️",c:"#7B2FBE"},{n:"K-Pop",i:"🎵",c:"#00C9B1"},{n:"Dancehall",i:"🎶",c:"#FFD700"},{n:"R&B",i:"💜",c:"#D4006A"},{n:"Gospel",i:"✝️",c:"#E8640A"},{n:"Reggae",i:"🌿",c:"#00C9B1"}].map(g => (
                    <button key={g.n} onClick={()=>setGenre(g.n)} style={{padding:"12px 6px",borderRadius:"11px",background:"rgba(255,255,255,0.05)",border:`1px solid ${activeGenre===g.n?g.c:"rgba(255,255,255,0.07)"}`,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"5px"}}>
                      <span style={{fontSize:"1.3rem"}}>{g.i}</span>
                      <span style={{fontSize:"0.58rem",fontWeight:"700",color:activeGenre===g.n?g.c:"#888",textAlign:"center"}}>{g.n}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : tracks !== null && (
          <div style={{textAlign:"center",padding:"38px 0"}}>
            <div style={{fontSize:"2.2rem",marginBottom:"9px"}}>🔍</div>
            <p style={{fontWeight:"700",marginBottom:"4px"}}>No tracks found</p>
            <p style={{color:"#aa7788",fontSize:"0.8rem"}}>Try a different search or filter</p>
            <button onClick={()=>{setSearch("");setGenre("All");setCountry("All");}} style={{marginTop:"13px",padding:"8px 20px",borderRadius:"99px",background:"linear-gradient(135deg,#E8640A,#D4006A)",color:"#fff",border:"none",cursor:"pointer",fontSize:"0.78rem",fontWeight:"700"}}>Clear Filters</button>
          </div>
        )}

        <div style={{marginTop:"22px",padding:"18px",borderRadius:"14px",background:"linear-gradient(135deg,rgba(255,215,0,0.07),rgba(232,100,10,0.07))",border:"1px solid rgba(255,215,0,0.18)",textAlign:"center",marginBottom:"12px"}}>
          <p style={{fontSize:"0.95rem",fontWeight:"800",marginBottom:"5px"}}>⭐ Get Featured!</p>
          <p style={{color:"#aa7788",fontSize:"0.76rem",marginBottom:"13px"}}>Promote your music to the top — from UGX 1,000 only</p>
          <button onClick={()=>setShowPromote(true)} style={{padding:"9px 18px",borderRadius:"99px",background:"linear-gradient(135deg,#FFD700,#E8640A)",color:"#000",fontWeight:"800",fontSize:"0.8rem",border:"none",cursor:"pointer"}}>Promote My Music ⭐</button>
        </div>

        <div style={{padding:"18px",borderRadius:"14px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(232,100,10,0.18)",textAlign:"center",marginBottom:"14px"}}>
          <p style={{fontSize:"1.05rem",fontWeight:"800",marginBottom:"5px"}}>Are you an artist? 🎤</p>
          <p style={{color:"#aa7788",fontSize:"0.8rem",marginBottom:"14px"}}>Upload free · Receive gifts · Get featured</p>
          <div style={{display:"flex",gap:"9px",justifyContent:"center"}}>
            <a href="/register" style={{padding:"9px 18px",borderRadius:"99px",background:"linear-gradient(135deg,#E8640A,#D4006A)",color:"#fff",fontWeight:"800",fontSize:"0.8rem",textDecoration:"none"}}>Create Account</a>
            <a href="/login" style={{padding:"9px 18px",borderRadius:"99px",background:"transparent",color:"#fff",fontWeight:"700",fontSize:"0.8rem",textDecoration:"none",border:"1px solid rgba(255,255,255,0.18)"}}>Sign In</a>
          </div>
        </div>
      </div>

      {/* Promote Picker Modal */}
      {showPromotePicker && <PromotePickerModal onClose={()=>setShowPromote(false)}/>}
    </main>
  );
}
