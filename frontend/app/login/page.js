"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setMessage("");
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
        setMessage(data.message || "Login failed.");
        setLoading(false);
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("artist", JSON.stringify(data.artist));
      setMessage("Welcome back! 🎉");
      setTimeout(() => router.push("/upload"), 1200);
    } catch (err) {
      setMessage("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const inputStyle = {
    padding:"14px",
    borderRadius:"10px",
    border:"1px solid #222",
    background:"#111",
    color:"white",
    fontSize:"0.95rem",
    width:"100%",
    outline:"none"
  };

  return (
    <main style={{padding:"20px", color:"white", background:"#080808", minHeight:"100vh", maxWidth:"480px", margin:"0 auto"}}>

      {/* Header */}
      <div style={{marginBottom:"36px", paddingTop:"20px"}}>
        <div style={{fontSize:"2.5rem", marginBottom:"12px"}}>🎵</div>
        <h1 style={{fontWeight:"900", fontSize:"1.8rem", letterSpacing:"-0.02em", marginBottom:"6px"}}>
          Welcome Back
        </h1>
        <p style={{color:"#555", fontSize:"0.82rem"}}>
          Sign in to upload and manage your tracks
        </p>
      </div>

      {/* Form */}
      <div style={{display:"flex", flexDirection:"column", gap:"14px"}}>

        {/* Email */}
        <div>
          <label style={{fontSize:"0.75rem", color:"#555", textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:"6px"}}>
            Email Address
          </label>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Password */}
        <div>
          <label style={{fontSize:"0.75rem", color:"#555", textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:"6px"}}>
            Password
          </label>
          <div style={{position:"relative"}}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{...inputStyle, paddingRight:"50px"}}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{position:"absolute", right:"14px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:"1rem"}}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <p style={{color: message.includes("Welcome") ? "#1DB954" : "#ff4757", fontSize:"0.85rem", textAlign:"center"}}>
            {message}
          </p>
        )}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{padding:"16px", borderRadius:"10px", background: loading ? "#333" : "#00e5ff", color: loading ? "#aaa" : "#000", fontWeight:"800", fontSize:"1rem", border:"none", cursor: loading ? "not-allowed" : "pointer", marginTop:"8px", transition:"all 0.2s"}}
        >
          {loading ? "Signing in..." : "Sign In →"}
        </button>

        {/* Divider */}
        <div style={{display:"flex", alignItems:"center", gap:"12px", margin:"8px 0"}}>
          <div style={{flex:1, height:"1px", background:"#1e1e1e"}}/>
          <span style={{color:"#333", fontSize:"0.75rem"}}>OR</span>
          <div style={{flex:1, height:"1px", background:"#1e1e1e"}}/>
        </div>

        {/* Register Link */}
        <button
          onClick={() => router.push("/register")}
          style={{padding:"16px", borderRadius:"10px", background:"transparent", color:"#fff", fontWeight:"700", fontSize:"0.95rem", border:"1px solid #222", cursor:"pointer", transition:"all 0.2s"}}
        >
          Create Artist Account 🎤
        </button>

        <p style={{textAlign:"center", color:"#333", fontSize:"0.75rem", marginTop:"8px"}}>
          By signing in you agree to our Terms of Service
        </p>

      </div>
    </main>
  );
    }
