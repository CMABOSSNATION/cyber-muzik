"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        }
      );
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Login failed. Please try again.");
        setLoading(false);
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("artist", JSON.stringify(data.artist));
      router.push("/artist/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const inputStyle = {
    padding:"14px", borderRadius:"10px",
    border:"1px solid #222", background:"#111",
    color:"white", fontSize:"0.95rem",
    width:"100%", outline:"none"
  };

  return (
    <main style={{padding:"20px", color:"white", background:"linear-gradient(160deg,#1a0810 0%,#0d0520 50%,#1a0810 100%)", minHeight:"100vh", maxWidth:"480px", margin:"0 auto"}}>

      <div style={{marginBottom:"28px"}}>
        <h1 style={{fontWeight:"900", fontSize:"1.8rem", letterSpacing:"-0.02em", background:"linear-gradient(90deg,#E8640A,#D4006A)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>Welcome Back 🎵</h1>
        <p style={{color:"#aa7788", fontSize:"0.85rem", marginTop:"6px"}}>Sign in to your CyberMuzik account</p>
      </div>

      <div style={{display:"flex", flexDirection:"column", gap:"14px"}}>

        {/* Email */}
        <div>
          <label style={{fontSize:"0.72rem", color:"#aa7788", textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:"6px"}}>Email</label>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(""); }}
            style={{...inputStyle, borderColor: error && !email ? "#D4006A" : "#222"}}
          />
        </div>

        {/* Password */}
        <div>
          <label style={{fontSize:"0.72rem", color:"#aa7788", textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:"6px"}}>Password</label>
          <div style={{position:"relative"}}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              style={{...inputStyle, paddingRight:"50px", borderColor: error && !password ? "#D4006A" : "#222"}}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{position:"absolute", right:"14px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#aa7788", cursor:"pointer", fontSize:"0.85rem"}}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{background:"rgba(212,0,106,0.1)", border:"1px solid rgba(212,0,106,0.4)", borderRadius:"10px", padding:"12px 14px", display:"flex", alignItems:"center", gap:"8px"}}>
            <span style={{fontSize:"1rem"}}>⚠️</span>
            <p style={{color:"#ff6b9d", fontSize:"0.85rem", fontWeight:"600"}}>{error}</p>
          </div>
        )}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{padding:"16px", borderRadius:"12px", background: loading ? "#333" : "linear-gradient(135deg,#E8640A,#D4006A)", color: loading ? "#666" : "#fff", fontWeight:"800", fontSize:"1rem", border:"none", cursor: loading ? "not-allowed" : "pointer", marginTop:"4px", transition:"all 0.2s"}}
        >
          {loading ? "Signing in..." : "Sign In 🎵"}
        </button>

        {/* Forgot Password */}
        <div style={{textAlign:"center"}}>
          <a
            href="/forgot-password"
            style={{color:"#E8640A", fontSize:"0.82rem", fontWeight:"600", textDecoration:"none"}}
          >
            Forgot your password?
          </a>
        </div>

        {/* Register Link */}
        <div style={{textAlign:"center", marginTop:"8px"}}>
          <p style={{color:"#aa7788", fontSize:"0.82rem"}}>
            Don't have an account?{" "}
            <a href="/register" style={{color:"#E8640A", fontWeight:"700", textDecoration:"none"}}>
              Create one
            </a>
          </p>
        </div>

      </div>
    </main>
  );
    }
