"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCheckEmail = async () => {
    setError("");
    if (!email) { setError("Please enter your email."); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        }
      );
      // Check if email exists by trying reset
      const checkRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        }
      );
      const data = await checkRes.json();
      if (!data.success) {
        setError("No account found with this email.");
        setLoading(false);
        return;
      }
      setStep(2);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleReset = async () => {
    setError("");
    if (!newPassword) { setError("Please enter a new password."); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, newPassword })
        }
      );
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Reset failed. Please try again.");
        setLoading(false);
        return;
      }
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
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
        <h1 style={{fontWeight:"900", fontSize:"1.8rem", letterSpacing:"-0.02em", background:"linear-gradient(90deg,#E8640A,#D4006A)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>
          {step === 1 ? "Forgot Password 🔐" : "Reset Password 🔑"}
        </h1>
        <p style={{color:"#aa7788", fontSize:"0.85rem", marginTop:"6px"}}>
          {step === 1 ? "Enter your email to reset your password" : "Enter your new password below"}
        </p>
      </div>

      {/* Step indicator */}
      <div style={{display:"flex", gap:"8px", marginBottom:"24px"}}>
        <div style={{flex:1, height:"4px", borderRadius:"99px", background: step >= 1 ? "linear-gradient(90deg,#E8640A,#D4006A)" : "#222"}}/>
        <div style={{flex:1, height:"4px", borderRadius:"99px", background: step >= 2 ? "linear-gradient(90deg,#E8640A,#D4006A)" : "#222"}}/>
      </div>

      <div style={{display:"flex", flexDirection:"column", gap:"14px"}}>

        {step === 1 ? (
          <>
            <div>
              <label style={{fontSize:"0.72rem", color:"#aa7788", textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:"6px"}}>Email Address</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                style={{...inputStyle, borderColor: error ? "#D4006A" : "#222"}}
              />
            </div>

            {error && (
              <div style={{background:"rgba(212,0,106,0.1)", border:"1px solid rgba(212,0,106,0.4)", borderRadius:"10px", padding:"12px 14px", display:"flex", alignItems:"center", gap:"8px"}}>
                <span>⚠️</span>
                <p style={{color:"#ff6b9d", fontSize:"0.85rem", fontWeight:"600"}}>{error}</p>
              </div>
            )}

            <button
              onClick={handleCheckEmail}
              disabled={loading}
              style={{padding:"16px", borderRadius:"12px", background: loading ? "#333" : "linear-gradient(135deg,#E8640A,#D4006A)", color: loading ? "#666" : "#fff", fontWeight:"800", fontSize:"1rem", border:"none", cursor: loading ? "not-allowed" : "pointer", transition:"all 0.2s"}}
            >
              {loading ? "Checking..." : "Continue →"}
            </button>
          </>
        ) : (
          <>
            <div>
              <label style={{fontSize:"0.72rem", color:"#aa7788", textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:"6px"}}>New Password</label>
              <div style={{position:"relative"}}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setError(""); }}
                  style={{...inputStyle, paddingRight:"50px", borderColor: error ? "#D4006A" : "#222"}}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  style={{position:"absolute", right:"14px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#aa7788", cursor:"pointer", fontSize:"0.85rem"}}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div>
              <label style={{fontSize:"0.72rem", color:"#aa7788", textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:"6px"}}>Confirm New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setError(""); }}
                style={{...inputStyle, borderColor: error && newPassword !== confirmPassword ? "#D4006A" : "#222"}}
              />
            </div>

            {error && (
              <div style={{background:"rgba(212,0,106,0.1)", border:"1px solid rgba(212,0,106,0.4)", borderRadius:"10px", padding:"12px 14px", display:"flex", alignItems:"center", gap:"8px"}}>
                <span>⚠️</span>
                <p style={{color:"#ff6b9d", fontSize:"0.85rem", fontWeight:"600"}}>{error}</p>
              </div>
            )}

            {success && (
              <div style={{background:"rgba(0,201,177,0.1)", border:"1px solid rgba(0,201,177,0.4)", borderRadius:"10px", padding:"12px 14px", display:"flex", alignItems:"center", gap:"8px"}}>
                <span>✅</span>
                <p style={{color:"#00C9B1", fontSize:"0.85rem", fontWeight:"600"}}>{success}</p>
              </div>
            )}

            <button
              onClick={handleReset}
              disabled={loading}
              style={{padding:"16px", borderRadius:"12px", background: loading ? "#333" : "linear-gradient(135deg,#E8640A,#D4006A)", color: loading ? "#666" : "#fff", fontWeight:"800", fontSize:"1rem", border:"none", cursor: loading ? "not-allowed" : "pointer", transition:"all 0.2s"}}
            >
              {loading ? "Resetting..." : "Reset Password 🔑"}
            </button>

            <button
              onClick={() => { setStep(1); setError(""); }}
              style={{padding:"14px", borderRadius:"12px", background:"transparent", color:"#aa7788", fontWeight:"600", fontSize:"0.88rem", border:"1px solid #222", cursor:"pointer"}}
            >
              ← Back
            </button>
          </>
        )}

        <div style={{textAlign:"center", marginTop:"8px"}}>
          <a href="/login" style={{color:"#E8640A", fontSize:"0.82rem", fontWeight:"600", textDecoration:"none"}}>
            Back to Sign In
          </a>
        </div>

      </div>
    </main>
  );
      }
