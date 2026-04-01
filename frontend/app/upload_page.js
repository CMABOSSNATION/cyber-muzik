"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const GENRES = ["Afrobeats","Dancehall","Hip Hop","R&B","Pop","Gospel","Reggae","Electronic","K-Pop","Latin","Jazz","Classical","Other"];
const COUNTRIES = ["Uganda","Nigeria","Ghana","Kenya","South Africa","Tanzania","Rwanda","USA","UK","Jamaica","South Korea","Brazil","Other"];

export default function UploadPage() {
  const router = useRouter();
  const [title, setTitle]         = useState("");
  const [artistName, setArtistName] = useState("");
  const [genre, setGenre]         = useState("Afrobeats");
  const [country, setCountry]     = useState("Uganda");
  const [file, setFile]           = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [message, setMessage]     = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [artist, setArtist]       = useState(null);
  const [uploadStep, setUploadStep] = useState(""); // cover|audio|saving|done
  const [coverPct, setCoverPct]   = useState(0);
  const [audioPct, setAudioPct]   = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("artist");
      const token  = localStorage.getItem("token");
      if (stored && token) {
        const a = JSON.parse(stored);
        setArtist(a);
        setArtistName(a.username);
        setIsLoggedIn(true);
      }
    } catch {}
  }, []);

  const handleCoverChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  // Real XHR upload so we get progress events
  const xhrUpload = (file, resourceType, onProgress) =>
    new Promise((resolve, reject) => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
        else reject(new Error(`Upload failed (${xhr.status})`));
      };
      xhr.onerror = () => reject(new Error("Network error"));
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`);
      xhr.send(fd);
    });

  const handleUpload = async () => {
    if (!title || !file) { setMessage("Please enter a title and select an audio file."); return; }
    if (!isLoggedIn)     { setMessage("Please sign in to upload tracks."); return; }
    setLoading(true);
    setMessage("");
    setCoverPct(0);
    setAudioPct(0);

    try {
      let coverImage = "";

      // Step 1 — cover photo
      if (coverFile) {
        setUploadStep("cover");
        const cd = await xhrUpload(coverFile, "image", setCoverPct);
        coverImage = cd.secure_url || "";
        setCoverPct(100);
      }

      // Step 2 — audio
      setUploadStep("audio");
      setAudioPct(0);
      const ad = await xhrUpload(file, "video", setAudioPct);
      const audioUrl = ad.secure_url;
      if (!audioUrl) throw new Error("Audio upload failed.");
      setAudioPct(100);

      // Step 3 — save to backend
      setUploadStep("saving");
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, artist: artistName, audioUrl, coverImage, genre, country })
      });
      const data = await res.json();
      if (!data.success) { setMessage(data.error || "Save failed."); setLoading(false); setUploadStep(""); return; }

      setUploadStep("done");
      setMessage("Track uploaded successfully! 🎉");
      setTimeout(() => router.push("/artist/dashboard"), 1400);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
      setUploadStep("");
    }
    setLoading(false);
  };

  const inp = { padding:"13px", borderRadius:"10px", border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", color:"white", fontSize:"0.92rem", width:"100%", outline:"none" };

  return (
    <main style={{padding:"20px",color:"white",background:"linear-gradient(160deg,#0a0a0f,#0d0520,#0a0a0f)",minHeight:"100vh",maxWidth:"480px",margin:"0 auto",paddingBottom:"40px"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{marginBottom:"22px"}}>
        <h1 style={{fontWeight:"900",fontSize:"1.7rem",letterSpacing:"-0.02em",background:"linear-gradient(90deg,#E8640A,#D4006A)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:"4px"}}>Upload Track 🎵</h1>
        <p style={{color:"#aa7788",fontSize:"0.8rem"}}>Share your music with the world — Free</p>
      </div>

      {!isLoggedIn && (
        <div style={{background:"rgba(212,0,106,0.1)",border:"1px solid rgba(212,0,106,0.3)",borderRadius:"12px",padding:"14px",marginBottom:"18px",textAlign:"center"}}>
          <p style={{color:"#ff6b9d",fontSize:"0.82rem",marginBottom:"10px"}}>Sign in to upload tracks</p>
          <div style={{display:"flex",gap:"8px",justifyContent:"center"}}>
            <a href="/register" style={{padding:"8px 16px",borderRadius:"99px",background:"linear-gradient(135deg,#E8640A,#D4006A)",color:"#fff",fontWeight:"700",fontSize:"0.75rem",textDecoration:"none"}}>Create Account</a>
            <a href="/login" style={{padding:"8px 16px",borderRadius:"99px",border:"1px solid rgba(255,255,255,0.15)",color:"#fff",fontWeight:"700",fontSize:"0.75rem",textDecoration:"none"}}>Sign In</a>
          </div>
        </div>
      )}

      {/* Cover Photo Picker */}
      <div onClick={() => document.getElementById('cvr').click()} style={{width:"150px",height:"150px",borderRadius:"14px",background:coverPreview?"transparent":"rgba(255,255,255,0.05)",border:"2px dashed rgba(255,255,255,0.15)",margin:"0 auto 22px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden"}}>
        {coverPreview ? <img src={coverPreview} style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <><span style={{fontSize:"2rem",marginBottom:"6px"}}>🖼️</span><span style={{fontSize:"0.7rem",color:"#aa7788"}}>Add cover</span></>}
      </div>
      <input id="cvr" type="file" accept="image/*" onChange={handleCoverChange} style={{display:"none"}}/>

      <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
        <div>
          <label style={{fontSize:"0.68rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:"5px"}}>Track Title *</label>
          <input type="text" placeholder="e.g. Kunsi" value={title} onChange={e=>setTitle(e.target.value)} style={inp}/>
        </div>
        <div>
          <label style={{fontSize:"0.68rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:"5px"}}>Artist Name</label>
          <input type="text" value={artistName} onChange={e=>setArtistName(e.target.value)} style={{...inp,color:isLoggedIn?"#E8640A":"#fff"}} readOnly={isLoggedIn}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
          <div>
            <label style={{fontSize:"0.68rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:"5px"}}>Genre</label>
            <select value={genre} onChange={e=>setGenre(e.target.value)} style={{...inp,cursor:"pointer",background:"rgba(15,10,30,0.95)"}}>
              {GENRES.map(g=><option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label style={{fontSize:"0.68rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:"5px"}}>Country</label>
            <select value={country} onChange={e=>setCountry(e.target.value)} style={{...inp,cursor:"pointer",background:"rgba(15,10,30,0.95)"}}>
              {COUNTRIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={{fontSize:"0.68rem",color:"#aa7788",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:"5px"}}>Audio File *</label>
          <div onClick={()=>document.getElementById('aud').click()} style={{...inp,cursor:"pointer",color:file?"#E8640A":"#aa7788",display:"flex",alignItems:"center",gap:"10px"}}>
            <span style={{fontSize:"1.2rem"}}>🎵</span>
            <span style={{fontSize:"0.85rem"}}>{file?file.name:"Tap to select audio"}</span>
          </div>
          <input id="aud" type="file" accept="audio/*" onChange={e=>setFile(e.target.files[0])} style={{display:"none"}}/>
        </div>

        {/* Progress bars — only shown while uploading */}
        {loading && uploadStep && uploadStep !== "done" && (
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(232,100,10,0.2)",borderRadius:"12px",padding:"16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"14px"}}>
              <div style={{width:"16px",height:"16px",border:"2px solid #E8640A",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite",flexShrink:0}}/>
              <p style={{fontWeight:"700",fontSize:"0.82rem",color:"#E8640A"}}>
                {uploadStep==="cover"?"📸 Uploading cover photo...":uploadStep==="audio"?"🎵 Uploading audio file...":"💾 Saving track..."}
              </p>
            </div>
            {coverFile && (
              <div style={{marginBottom:"10px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                  <span style={{color:"#aa7788",fontSize:"0.68rem",textTransform:"uppercase",letterSpacing:"0.06em"}}>Cover Photo</span>
                  <span style={{color:"#00C9B1",fontSize:"0.68rem",fontWeight:"700"}}>{coverPct}%</span>
                </div>
                <div style={{height:"5px",background:"rgba(255,255,255,0.1)",borderRadius:"99px",overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${coverPct}%`,background:"linear-gradient(90deg,#00C9B1,#00a896)",borderRadius:"99px",transition:"width 0.25s"}}/>
                </div>
              </div>
            )}
            <div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                <span style={{color:"#aa7788",fontSize:"0.68rem",textTransform:"uppercase",letterSpacing:"0.06em"}}>Audio File</span>
                <span style={{color:"#E8640A",fontSize:"0.68rem",fontWeight:"700"}}>{audioPct}%</span>
              </div>
              <div style={{height:"5px",background:"rgba(255,255,255,0.1)",borderRadius:"99px",overflow:"hidden"}}>
                <div style={{height:"100%",width:`${audioPct}%`,background:"linear-gradient(90deg,#E8640A,#D4006A)",borderRadius:"99px",transition:"width 0.25s"}}/>
              </div>
            </div>
          </div>
        )}

        {message && (
          <p style={{textAlign:"center",color:message.includes("🎉")?"#00C9B1":"#ff6b9d",fontSize:"0.85rem",fontWeight:"600"}}>{message}</p>
        )}

        <button onClick={handleUpload} disabled={loading||!isLoggedIn} style={{padding:"15px",borderRadius:"12px",background:(!isLoggedIn||loading)?"rgba(255,255,255,0.08)":"linear-gradient(135deg,#E8640A,#D4006A)",color:(!isLoggedIn||loading)?"#555":"#fff",fontWeight:"800",fontSize:"0.95rem",border:"none",cursor:(!isLoggedIn||loading)?"not-allowed":"pointer",marginTop:"4px"}}>
          {loading?"Uploading...":"Upload Track ▶"}
        </button>

        {isLoggedIn && (
          <button onClick={()=>router.push("/artist/dashboard")} style={{padding:"12px",borderRadius:"12px",background:"transparent",color:"#aa7788",fontWeight:"600",fontSize:"0.85rem",border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer"}}>
            Go to Dashboard
          </button>
        )}
      </div>
    </main>
  );
}
