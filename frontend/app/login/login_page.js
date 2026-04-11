"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]   = useState("");
  const [password, setPw]      = useState("");
  const [showPw,   setShowPw]  = useState(false);
  const [loading,  setLoading] = useState(false);
  const [status,   setStatus]  = useState(""); // "waking" | "connecting"
  const [error,    setError]   = useState("");

  const handleLogin = async () => {
    setError(""); setStatus("");
    if (!email || !password) { setError("Please enter your email and password."); return; }

    setLoading(true);
    setStatus("connecting");

    const api = process.env.NEXT_PUBLIC_API_URL;

    // First wake the backend silently
    try { await fetch(api + '/'); } catch {}

    // Show waking message after 3s if still loading
    const wakeTimer = setTimeout(() => setStatus("waking"), 3000);

    try {
      const controller = new AbortController();
      const killswitch = setTimeout(() => controller.abort(), 35000);

      const res = await fetch(`${api}/api/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim().toLowerCase(), password }),
        signal:  controller.signal
      });
      clearTimeout(killswitch);
      clearTimeout(wakeTimer);

      let data;
      try { data = await res.json(); }
      catch { setError("Server returned an invalid response. Try again."); setLoading(false); setStatus(""); return; }

      if (!data.success) {
        const errMsg = (data.error || "").toLowerCase();
        if (res.status === 401 || errMsg.includes("password") || errMsg.includes("incorrect") || errMsg.includes("wrong")) {
          setError("❌ Wrong password. Please try again.");
        } else if (errMsg.includes("email") || errMsg.includes("user") || errMsg.includes("not found") || errMsg.includes("exist")) {
          setError("No account found with that email address.");
        } else {
          setError(data.error || "Login failed. Check your email and password.");
        }
        setLoading(false); setStatus(""); return;
      }

      localStorage.setItem("token",  data.token);
      localStorage.setItem("artist", JSON.stringify(data.artist));
      router.push("/artist/dashboard");
    } catch (err) {
      clearTimeout(wakeTimer);
      if (err.name === "AbortError") {
        setError("Server took too long to respond. It may be starting up — wait 30 seconds then try again.");
      } else {
        setError("Connection failed. Check your internet connection and try again.");
      }
    }
    setLoading(false); setStatus("");
  };

  const inp = {
    padding:"14px", borderRadius:"10px",
    border:"1px solid rgba(255,255,255,0.15)",
    background:"rgba(255,255,255,0.07)",
    color:"white", fontSize:"0.95rem",
    width:"100%", outline:"none"
  };

  return (
    <main style={{padding:"24px 20px",color:"white",background:"linear-gradient(160deg,#0a0a0f,#0d0520,#0a0a0f)",minHeight:"100vh",maxWidth:"480px",margin:"0 auto"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{marginBottom:"28px",textAlign:"center"}}>
        <div style={{fontSize:"2.8rem",marginBottom:"10px"}}>🎵</div>
        <h1 style={{fontWeight:"900",fontSize:"1.8rem",letterSpacing:"-0.02em",background:"linear-gradient(90deg,#E8640A,#D4006A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:"6px"}}>
          Welcome Back
        </h1>
        <p style={{color:"#aa7788",fontSize:"0.85rem"}}>Sign in to your CyberMuzik artist account</p>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>

        <div>
          <label style={{fontSize:"0.72rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:"6px"}}>Email</label>
          <input
            type="email" placeholder="your@email.com" value={email}
            onChange={e=>{setEmail(e.target.value);setError("");}}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}
            style={{...inp, borderColor:error&&!email?"#D4006A":"rgba(255,255,255,0.15)"}}
          />
        </div>

        <div>
          <label style={{fontSize:"0.72rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:"6px"}}>Password</label>
          <div style={{position:"relative"}}>
            <input
              type={showPw?"text":"password"} placeholder="Enter your password" value={password}
              onChange={e=>{setPw(e.target.value);setError("");}}
              onKeyDown={e=>e.key==="Enter"&&handleLogin()}
              style={{...inp, paddingRight:"50px", borderColor:error&&!password?"#D4006A":"rgba(255,255,255,0.15)"}}
            />
            <button onClick={()=>setShowPw(!showPw)} style={{position:"absolute",right:"14px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#aa7788",cursor:"pointer",fontSize:"0.85rem"}}>
              {showPw?"🙈":"👁️"}
            </button>
          </div>
        </div>

        {/* Loading status */}
        {loading && (
          <div style={{background:"rgba(232,100,10,0.08)",border:"1px solid rgba(232,100,10,0.25)",borderRadius:"10px",padding:"13px 14px",display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{width:"18px",height:"18px",border:"2px solid #E8640A",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite",flexShrink:0}}/>
            <div>
              <p style={{color:"#E8640A",fontSize:"0.82rem",fontWeight:"700"}}>
                {status==="waking" ? "Server is waking up..." : "Connecting..."}
              </p>
              {status==="waking" && <p style={{color:"#aa7788",fontSize:"0.72rem",marginTop:"2px"}}>First login takes up to 30 seconds. Please wait.</p>}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{background:"rgba(212,0,106,0.1)",border:"1px solid rgba(212,0,106,0.4)",borderRadius:"10px",padding:"12px 14px",display:"flex",alignItems:"flex-start",gap:"8px"}}>
            <span style={{flexShrink:0}}>⚠️</span>
            <p style={{color:"#ff6b9d",fontSize:"0.85rem",fontWeight:"600"}}>{error}</p>
          </div>
        )}

        <button
          onClick={handleLogin} disabled={loading}
          style={{padding:"16px",borderRadius:"12px",background:loading?"rgba(255,255,255,0.08)":"linear-gradient(135deg,#E8640A,#D4006A)",color:loading?"#555":"#fff",fontWeight:"800",fontSize:"1rem",border:"none",cursor:loading?"not-allowed":"pointer",marginTop:"4px",transition:"all 0.2s"}}
        >
          {loading ? "Signing in..." : "Sign In 🎵"}
        </button>

        <div style={{textAlign:"center"}}>
          <a href="/forgot-password" style={{color:"#E8640A",fontSize:"0.82rem",fontWeight:"600",textDecoration:"none"}}>Forgot your password?</a>
        </div>

        <div style={{textAlign:"center",marginTop:"4px"}}>
          <p style={{color:"#aa7788",fontSize:"0.82rem"}}>
            {"Don't have an account? "}
            <a href="/register" style={{color:"#E8640A",fontWeight:"700",textDecoration:"none"}}>Create one</a>
          </p>
        </div>

      </div>
    </main>
  );
}
