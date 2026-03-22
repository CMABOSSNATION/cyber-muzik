"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [profilePreview, setProfilePreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    bio: "",
    profilePhoto: "",
    coverPhoto: ""
  });

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    formData.append("resource_type", "image");
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    return data.secure_url;
  };

  const handleProfilePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePreview(URL.createObjectURL(file));
    const url = await uploadImage(file);
    update("profilePhoto", url);
  };

  const handleCoverPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
    const url = await uploadImage(file);
    update("coverPhoto", url);
  };

  const handleStep1 = () => {
    if (!form.username || !form.email || !form.password) {
      setMessage("Please fill in all required fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    setMessage("");
    setStep(2);
  };

  const handleRegister = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: form.username,
            email: form.email,
            password: form.password,
            bio: form.bio,
            profilePhoto: form.profilePhoto,
            coverPhoto: form.coverPhoto
          })
        }
      );
      const data = await res.json();
      if (!data.success) {
        setMessage(data.message || "Registration failed.");
        setLoading(false);
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("artist", JSON.stringify(data.artist));
      setMessage("Account created successfully! 🎉");
      setTimeout(() => router.push("/upload"), 1500);
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
      <div style={{marginBottom:"28px"}}>
        <h1 style={{fontWeight:"900", fontSize:"1.8rem", letterSpacing:"-0.02em", marginBottom:"6px"}}>
          {step === 1 ? "Create Account 🎤" : "Your Artist Profile 🎨"}
        </h1>
        <p style={{color:"#555", fontSize:"0.82rem"}}>
          {step === 1 ? "Join CyberMuzik and start uploading your music" : "Tell fans about yourself"}
        </p>
      </div>

      {/* Step Indicator */}
      <div style={{display:"flex", gap:"8px", marginBottom:"28px"}}>
        {[1,2].map(s => (
          <div key={s} style={{flex:1, height:"4px", borderRadius:"99px", background: s <= step ? "#00e5ff" : "#1e1e1e", transition:"background 0.3s"}}/>
        ))}
      </div>

      {/* ── STEP 1: Account Details ── */}
      {step === 1 && (
        <div style={{display:"flex", flexDirection:"column", gap:"12px"}}>
          <div>
            <label style={{fontSize:"0.75rem", color:"#555", textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:"6px"}}>Username *</label>
            <input
              type="text"
              placeholder="e.g. Vyroota"
              value={form.username}
              onChange={e => update("username", e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{fontSize:"0.75rem", color:"#555", textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:"6px"}}>Email Address *</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={e => update("email", e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{fontSize:"0.75rem", color:"#555", textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:"6px"}}>Password *</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={e => update("password", e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{fontSize:"0.75rem", color:"#555", textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:"6px"}}>Confirm Password *</label>
            <input
              type="password"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={e => update("confirmPassword", e.target.value)}
              style={inputStyle}
            />
          </div>

          {message && (
            <p style={{color:"#ff4757", fontSize:"0.85rem", textAlign:"center"}}>{message}</p>
          )}

          <button
            onClick={handleStep1}
            style={{padding:"16px", borderRadius:"10px", background:"#00e5ff", color:"#000", fontWeight:"800", fontSize:"1rem", border:"none", cursor:"pointer", marginTop:"8px"}}
          >
            Continue →
          </button>

          <p style={{textAlign:"center", color:"#555", fontSize:"0.82rem"}}>
            Already have an account?{" "}
            <a href="/login" style={{color:"#00e5ff", textDecoration:"none", fontWeight:"600"}}>Sign in</a>
          </p>
        </div>
      )}

      {/* ── STEP 2: Artist Profile ── */}
      {step === 2 && (
        <div style={{display:"flex", flexDirection:"column", gap:"16px"}}>

          {/* Cover Photo */}
          <div>
            <label style={{fontSize:"0.75rem", color:"#555", textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:"8px"}}>Cover Photo</label>
            <div
              onClick={() => document.getElementById('coverInput').click()}
              style={{width:"100%", height:"140px", borderRadius:"12px", background: coverPreview ? "transparent" : "#111", border:"2px dashed #222", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", overflow:"hidden", position:"relative"}}
            >
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" style={{width:"100%", height:"100%", objectFit:"cover"}}/>
              ) : (
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:"2rem", marginBottom:"6px"}}>🖼️</div>
                  <p style={{color:"#555", fontSize:"0.78rem"}}>Tap to upload cover photo</p>
                </div>
              )}
            </div>
            <input id="coverInput" type="file" accept="image/*" onChange={handleCoverPhoto} style={{display:"none"}}/>
          </div>

          {/* Profile Photo */}
          <div style={{display:"flex", alignItems:"center", gap:"16px"}}>
            <div
              onClick={() => document.getElementById('profileInput').click()}
              style={{width:"80px", height:"80px", borderRadius:"50%", background: profilePreview ? "transparent" : "#111", border:"2px dashed #222", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", overflow:"hidden", flexShrink:0}}
            >
              {profilePreview ? (
                <img src={profilePreview} alt="Profile" style={{width:"100%", height:"100%", objectFit:"cover"}}/>
              ) : (
                <span style={{fontSize:"1.8rem"}}>👤</span>
              )}
            </div>
            <div>
              <p style={{fontWeight:"600", fontSize:"0.88rem", marginBottom:"4px"}}>Profile Photo</p>
              <p style={{color:"#555", fontSize:"0.75rem"}}>Tap the circle to upload</p>
            </div>
            <input id="profileInput" type="file" accept="image/*" onChange={handleProfilePhoto} style={{display:"none"}}/>
          </div>

          {/* Bio */}
          <div>
            <label style={{fontSize:"0.75rem", color:"#555", textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:"6px"}}>
              Bio / Description
            </label>
            <textarea
              placeholder="Tell fans about yourself, your sound, your story..."
              value={form.bio}
              onChange={e => update("bio", e.target.value)}
              maxLength={500}
              rows={4}
              style={{...inputStyle, resize:"none", lineHeight:"1.6"}}
            />
            <p style={{color:"#333", fontSize:"0.7rem", textAlign:"right", marginTop:"4px"}}>{form.bio.length}/500</p>
          </div>

          {message && (
            <p style={{color: message.includes("success") ? "#00e5ff" : "#ff4757", fontSize:"0.85rem", textAlign:"center"}}>
              {message}
            </p>
          )}

          <div style={{display:"flex", gap:"10px"}}>
            <button
              onClick={() => { setStep(1); setMessage(""); }}
              style={{flex:1, padding:"14px", borderRadius:"10px", background:"#111", color:"#fff", fontWeight:"700", fontSize:"0.95rem", border:"1px solid #222", cursor:"pointer"}}
            >
              ← Back
            </button>
            <button
              onClick={handleRegister}
              disabled={loading}
              style={{flex:2, padding:"14px", borderRadius:"10px", background: loading ? "#333" : "#1DB954", color: loading ? "#aaa" : "#000", fontWeight:"800", fontSize:"0.95rem", border:"none", cursor: loading ? "not-allowed" : "pointer"}}
            >
              {loading ? "Creating Account..." : "Create Account 🎉"}
            </button>
          </div>

        </div>
      )}

    </main>
  );
      }
