"use client";
import { useState } from "react";

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!title || !artistName || !file) {
      setMessage("Please fill in all fields and select a file.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
      formData.append("resource_type", "video");

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
        { method: "POST", body: formData }
      );
      const cloudData = await cloudRes.json();

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          artist_name: artistName,
          file_url: cloudData.secure_url,
        }),
      });

      setMessage("Track uploaded successfully! 🎉");
      setTitle("");
      setArtistName("");
      setFile(null);
    } catch (err) {
      console.error(err);
      setMessage("Upload failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <main style={{padding:"20px", color:"white", background:"black", minHeight:"100vh"}}>
      <h1 style={{fontSize:"2rem", marginBottom:"20px"}}>Upload Track 🎵</h1>

      <div style={{display:"flex", flexDirection:"column", gap:"14px", maxWidth:"400px"}}>
        <input
          type="text"
          placeholder="Track Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{padding:"10px", borderRadius:"8px", border:"1px solid #333", background:"#111", color:"white"}}
        />
        <input
          type="text"
          placeholder="Artist Name"
          value={artistName}
          onChange={e => setArtistName(e.target.value)}
          style={{padding:"10px", borderRadius:"8px", border:"1px solid #333", background:"#111", color:"white"}}
        />
        <input
          type="file"
          accept="audio/*"
          onChange={e => setFile(e.target.files[0])}
          style={{padding:"10px", borderRadius:"8px", border:"1px solid #333", background:"#111", color:"white"}}
        />
        <button
          onClick={handleUpload}
          disabled={loading}
          style={{padding:"12px", borderRadius:"8px", background:"#00e5ff", color:"black", fontWeight:"bold", border:"none", cursor:"pointer"}}
        >
          {loading ? "Uploading..." : "Upload Track"}
        </button>
        {message && <p style={{color: message.includes("success") ? "#00e5ff" : "#ff4444"}}>{message}</p>}
      </div>
    </main>
  );
    }
