"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [file, setFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [artist, setArtist] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("artist");
    const token = localStorage.getItem("token");
    if (stored && token) {
      const a = JSON.parse(stored);
      setArtist(a);
      setArtistName(a.username);
      setIsLoggedIn(true);
    }
  }, []);

  const handleCoverChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  const uploadToCloudinary = async (file, type) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    formData.append("resource_type", type);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${type}/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    return data.secure_url;
  };

  const handleUpload = async () => {
    if (!title || !artistName || !file) {
      setMessage("Please fill in all fields and select an audio file.");
      return;
    }
    if (!isLoggedIn) {
      setMessage("Please sign in to upload tracks.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      // Upload audio
      const audioUrl = await uploadToCloudinary(file, "video");

      // Upload cover if provided
      let coverImage = "";
      if (coverFile) {
        coverImage = await uploadToCloudinary(coverFile, "image");
      }

      // Save to backend with auth token
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tracks/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            title,
            artist: artistName,
            audioUrl,
            coverImage
          })
        }
      );
      const data = await res.json();
      if (!data.success) {
        setMessage(data.error || "Upload failed.");
        setLoading(false);
        return;
      }
      setMessage("Track uploaded successfully! 🎉");
      setTitle("");
      setFile(null);
      setCoverFile(null);
      setCoverPreview(null);
      setTimeout(() => router.push("/artist/dashboard"), 1500);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  const inputStyle = {
    padding:"14px", borderRadius:"10px",
    border:"1px solid #222", background:"#111",
    color:"white", fontSize:"0.95rem", width:"100%", outline:"none"
  };

  return (
    <main style={{padding:"20px", color:"white", background:"#080808", minHeight:"100vh", maxWidth:"480px", margin:"0 auto"}}>

      <div style={{marginBottom:"24px"}}>
        <h1 style={{fontWeight:"900", fontSize:"1.8rem", letterSpacing:"-0.02em", marginBottom:"6px"}}>
          Upload Track 🎵
        </h1>
        <p style={{color:"#555", fontSize:"0.82rem"}}>Share your music with the world</p>
      </div>

      {/* Not logged in warning */}
      {!isLoggedIn && (
        <div style={{background:"rgba(255,71,87,0.1)", border:"1px solid rgba(255,71,87,0.3)", borderRadius:"12px", padding:"14px", marginBottom:"20px", textAlign:"center"}}>
          <p style={{color:"#ff4757", fontSize:"0.85rem", marginBottom:"10px"}}>
            You need an account to upload tracks
          </p>
          <div style={{display:"flex", gap:"8px", justifyContent:"center"}}>
            <a href="/register" style={{padding:"8px 16px", borderRadius:"99px", background:"#00e5ff", color:"#000", fontWeight:"700", fontSize:"0.78rem", textDecoration:"none"}}>
              Create Account
            </a>
            <a href="/login" style={{padding:"8px 16px", borderRadius:"99px", background:"transparent", color:"#fff", fontWeight:"700", fontSize:"0.78rem", textDecoration:"none", border:"1px solid #222"}}>
              Sign In
            </a>
          </div>
        </div>
      )}

      {/* Cover Photo */}
      <div
        onClick={() => document.getElementById('coverInput').click()}
        style={{width:"160px", height:"160px", borderRadius:"14px", background: coverPreview ? "transparent" : "#111", border:"2px dashed #222", margin:"0 auto 24px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", overflow:"hidden"}}
      >
        {coverPreview ? (
          <img src={coverPreview} alt="Cover" style={{width:"100%", height:"100%", objectFit:"cover"}}/>
        ) : (
          <>
            <span style={{fontSize:"2rem", marginBottom:"8px"}}>🖼️</span>
            <span style={{fontSize:"0.72rem", color:"#555", textAlign:"center"}}>Add cover photo</span>
          </>
        )}
      </div>
      <input id="coverInput" type="file" accept="image/*" onChange={handleCoverChange} style={{display:"none"}}/>

      {/* Form */}
      <div style={{display:"flex", flexDirection:"column", gap:"12px"}}>
        <div>
          <label style={{fontSize:"0.72rem", color:"#555", textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:"6px"}}>Track Title</label>
          <input type="text" placeholder="e.g. Kunsi" value={title} onChange={e => setTitle(e.target.value)} style={inputStyle}/>
        </div>

        <div>
          <label style={{fontSize:"0.72rem", color:"#555", textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:"6px"}}>Artist Name</label>
          <input
            type="text"
            placeholder="Artist name"
            value={artistName}
            onChange={e => setArtistName(e.target.value)}
            style={{...inputStyle, color: isLoggedIn ? "#00e5ff" : "#fff"}}
            readOnly={isLoggedIn}
          />
        </div>

        <div>
          <label style={{fontSize:"0.72rem", color:"#555", textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:"6px"}}>Audio File</label>
          <div
            onClick={() => document.getElementById('audioInput').click()}
            style={{...inputStyle, cursor:"pointer", color: file ? "#00e5ff" : "#555", display:"flex", alignItems:"center", gap:"10px"}}
          >
            <span style={{fontSize:"1.2rem"}}>🎵</span>
            <span style={{fontSize:"0.88rem"}}>{file ? file.name : "Tap to select audio file"}</span>
          </div>
          <input id="audioInput" type="file" accept="audio/*" onChange={e => setFile(e.target.files[0])} style={{display:"none"}}/>
        </div>

        {message && (
          <p style={{textAlign:"center", color: message.includes("🎉") ? "#1DB954" : "#ff4757", fontSize:"0.85rem"}}>
            {message}
          </p>
        )}

        <button
          onClick={handleUpload}
          disabled={loading || !isLoggedIn}
          style={{padding:"16px", borderRadius:"12px", background: (!isLoggedIn || loading) ? "#333" : "#00e5ff", color: (!isLoggedIn || loading) ? "#666" : "#000", fontWeight:"800", fontSize:"1rem", border:"none", cursor: (!isLoggedIn || loading) ? "not-allowed" : "pointer", marginTop:"8px", transition:"all 0.2s"}}
        >
          {loading ? "Uploading..." : "Upload Track ▶"}
        </button>

        {isLoggedIn && (
          <button
            onClick={() => router.push("/artist/dashboard")}
            style={{padding:"14px", borderRadius:"12px", background:"transparent", color:"#555", fontWeight:"600", fontSize:"0.88rem", border:"1px solid #1e1e1e", cursor:"pointer"}}
          >
            Go to Dashboard
          </button>
        )}
      </div>
    </main>
  );
  }
