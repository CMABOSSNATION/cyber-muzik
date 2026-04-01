"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [artist, setArtist] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("artist");
      if (stored) setArtist(JSON.parse(stored));
    } catch {}
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else {
      alert('To install: tap ⋮ in Chrome → Add to Home Screen');
    }
  };

  return (
    <nav style={{position:"sticky",top:0,zIndex:100,background:"rgba(5,5,10,0.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(232,100,10,0.2)"}}>
      <div style={{maxWidth:"680px",margin:"0 auto",padding:"0 16px",display:"flex",alignItems:"center",height:"50px",gap:"2px"}}>
        <Link href="/" style={{fontWeight:"900",fontSize:"1.1rem",textDecoration:"none",marginRight:"auto",letterSpacing:"-0.02em"}}>
          <span style={{color:"#00e5ff"}}>CYBER</span><span style={{color:"#fff"}}>MUZIK</span>
        </Link>
        <Link href="/" style={{padding:"6px 10px",fontSize:"0.65rem",fontWeight:"600",letterSpacing:"0.08em",textTransform:"uppercase",color:"rgba(255,255,255,0.45)",textDecoration:"none"}}>Home</Link>
        <Link href="/charts" style={{padding:"6px 10px",fontSize:"0.65rem",fontWeight:"600",letterSpacing:"0.08em",textTransform:"uppercase",color:"rgba(255,255,255,0.45)",textDecoration:"none"}}>Charts</Link>
        <Link href="/news" style={{padding:"6px 10px",fontSize:"0.65rem",fontWeight:"600",letterSpacing:"0.08em",textTransform:"uppercase",color:"rgba(255,255,255,0.45)",textDecoration:"none"}}>News</Link>

        {/* Only show when mounted to avoid hydration mismatch */}
        {mounted && (
          artist ? (
            /* Logged in — show profile, hide sign in/register */
            <Link href="/artist/dashboard" style={{marginLeft:"6px",display:"flex",alignItems:"center",gap:"7px",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(232,100,10,0.4)",padding:"5px 12px",borderRadius:"99px",textDecoration:"none"}}>
              {artist.profilePhoto ? (
                <img src={artist.profilePhoto} alt={artist.username} style={{width:"22px",height:"22px",borderRadius:"50%",objectFit:"cover"}}/>
              ) : (
                <div style={{width:"22px",height:"22px",borderRadius:"50%",background:"linear-gradient(135deg,#E8640A,#D4006A)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.6rem"}}>🎵</div>
              )}
              <span style={{color:"#fff",fontSize:"0.72rem",fontWeight:"700"}}>{artist.username}</span>
            </Link>
          ) : (
            /* Not logged in — show sign in only */
            <Link href="/login" style={{marginLeft:"6px",background:"linear-gradient(135deg,#E8640A,#D4006A)",color:"#fff",padding:"6px 14px",borderRadius:"99px",fontSize:"0.68rem",fontWeight:"800",textDecoration:"none"}}>
              SIGN IN
            </Link>
          )
        )}
      </div>

      {/* Download App row */}
      <div style={{maxWidth:"680px",margin:"0 auto",padding:"0 16px 8px"}}>
        <button onClick={handleInstall} style={{display:"flex",alignItems:"center",gap:"5px",background:"linear-gradient(135deg,#E8640A,#D4006A)",color:"#fff",padding:"4px 12px",borderRadius:"99px",fontSize:"0.65rem",fontWeight:"800",border:"none",cursor:"pointer"}}>
          ⬇ Download App
        </button>
      </div>
    </nav>
  );
                  }
  
