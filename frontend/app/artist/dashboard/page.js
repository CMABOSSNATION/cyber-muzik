"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ArtistDashboard() {
  const router = useRouter();
  const [artist, setArtist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("artist");
    const token = localStorage.getItem("token");
    if (!stored || !token) {
      router.push("/login");
      return;
    }
    setArtist(JSON.parse(stored));
    fetchMyTracks(token);
  }, []);

  const fetchMyTracks = async (token) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tracks/artist/mytracks`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setTracks(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await res.json();
      if (data.success) {
        setTracks(t => t.filter(tr => tr._id !== id));
        setMessage("Track deleted successfully ✅");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.message || "Delete failed.");
      }
    } catch (err) {
      setMessage("Something went wrong.");
    }
    setDeleteId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("artist");
    router.push("/");
  };

  const totalPlays = tracks.reduce((sum, t) => sum + (t.plays || 0), 0);
  const totalDownloads = tracks.reduce((sum, t) => sum + (t.downloads || 0), 0);
  const totalLikes = tracks.reduce((sum, t) => sum + (t.likes || 0), 0);

  return (
    <main style={{padding:"20px", color:"white", background:"#080808", minHeight:"100vh", maxWidth:"680px", margin:"0 auto", paddingBottom:"40px"}}>

      {/* Header */}
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"24px"}}>
        <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
          {artist?.profilePhoto ? (
            <img src={artist.profilePhoto} alt="Profile" style={{width:"48px", height:"48px", borderRadius:"50%", objectFit:"cover"}}/>
          ) : (
            <div style={{width:"48px", height:"48px", borderRadius:"50%", background:"linear-gradient(135deg,#00e5ff,#0077ff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem"}}>🎵</div>
          )}
          <div>
            <h1 style={{fontWeight:"900", fontSize:"1.2rem"}}>
              {artist?.username || "Artist"}
            </h1>
            <p style={{color:"#555", fontSize:"0.75rem"}}>{artist?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{padding:"8px 16px", borderRadius:"99px", background:"#1a1a1a", border:"1px solid #222", color:"#888", fontSize:"0.75rem", cursor:"pointer"}}
        >
          Sign Out
        </button>
      </div>

      {/* Cover Photo */}
      {artist?.coverPhoto && (
        <div style={{width:"100%", height:"140px", borderRadius:"14px", overflow:"hidden", marginBottom:"24px"}}>
          <img src={artist.coverPhoto} alt="Cover" style={{width:"100%", height:"100%", objectFit:"cover"}}/>
        </div>
      )}

      {/* Bio */}
      {artist?.bio && (
        <div style={{background:"#111", border:"1px solid #1e1e1e", borderRadius:"12px", padding:"14px", marginBottom:"24px"}}>
          <p style={{color:"#888", fontSize:"0.82rem", lineHeight:"1.6"}}>{artist.bio}</p>
        </div>
      )}

      {/* Stats */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px", marginBottom:"28px"}}>
        <div style={{background:"#111", border:"1px solid #1e1e1e", borderRadius:"12px", padding:"16px", textAlign:"center"}}>
          <div style={{fontWeight:"900", fontSize:"1.4rem", color:"#00e5ff"}}>{totalPlays.toLocaleString()}</div>
          <div style={{fontSize:"0.65rem", color:"#555", textTransform:"uppercase", letterSpacing:"0.08em", marginTop:"4px"}}>Total Plays</div>
        </div>
        <div style={{background:"#111", border:"1px solid #1e1e1e", borderRadius:"12px", padding:"16px", textAlign:"center"}}>
          <div style={{fontWeight:"900", fontSize:"1.4rem", color:"#1DB954"}}>{totalDownloads.toLocaleString()}</div>
          <div style={{fontSize:"0.65rem", color:"#555", textTransform:"uppercase", letterSpacing:"0.08em", marginTop:"4px"}}>Downloads</div>
        </div>
        <div style={{background:"#111", border:"1px solid #1e1e1e", borderRadius:"12px", padding:"16px", textAlign:"center"}}>
          <div style={{fontWeight:"900", fontSize:"1.4rem", color:"#ff4757"}}>{totalLikes.toLocaleString()}</div>
          <div style={{fontSize:"0.65rem", color:"#555", textTransform:"uppercase", letterSpacing:"0.08em", marginTop:"4px"}}>Likes</div>
        </div>
      </div>

      {/* Upload Button */}
      <button
        onClick={() => router.push("/upload")}
        style={{width:"100%", padding:"14px", borderRadius:"12px", background:"#00e5ff", color:"#000", fontWeight:"800", fontSize:"1rem", border:"none", cursor:"pointer", marginBottom:"24px"}}
      >
        + Upload New Track
      </button>

      {/* Message */}
      {message && (
        <div style={{padding:"12px", borderRadius:"10px", background: message.includes("✅") ? "rgba(29,185,84,0.1)" : "rgba(255,71,87,0.1)", border:`1px solid ${message.includes("✅") ? "#1DB954" : "#ff4757"}`, color: message.includes("✅") ? "#1DB954" : "#ff4757", fontSize:"0.85rem", textAlign:"center", marginBottom:"16px"}}>
          {message}
        </div>
      )}

      {/* Track List */}
      <h2 style={{fontSize:"0.78rem", fontWeight:"700", color:"#00e5ff", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:"14px"}}>
        🎵 Your Tracks ({tracks.length})
      </h2>

      {loading ? (
        <p style={{color:"#555"}}>Loading your tracks...</p>
      ) : tracks.length === 0 ? (
        <div style={{textAlign:"center", padding:"40px 0"}}>
          <div style={{fontSize:"3rem", marginBottom:"12px"}}>🎵</div>
          <p style={{fontWeight:"700", marginBottom:"6px"}}>No tracks yet</p>
          <p style={{color:"#555", fontSize:"0.82rem"}}>Upload your first track to get started</p>
        </div>
      ) : (
        tracks.map((track) => (
          <div key={track._id} style={{background:"#111", border:"1px solid #1e1e1e", borderRadius:"14px", padding:"14px 16px", marginBottom:"10px"}}>

            <div style={{display:"flex", alignItems:"center", gap:"12px", marginBottom:"12px"}}>
              {/* Cover */}
              <div style={{width:"52px", height:"52px", borderRadius:"8px", overflow:"hidden", flexShrink:0, background:"#1a1a1a", display:"flex", alignItems:"center", justifyContent:"center"}}>
                {track.coverImage ? (
                  <img src={track.coverImage} alt={track.title} style={{width:"100%", height:"100%", objectFit:"cover"}}/>
                ) : "🎵"}
              </div>
              {/* Info */}
              <div style={{flex:1, minWidth:0}}>
                <p style={{fontWeight:"700", fontSize:"0.92rem", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{track.title}</p>
                <p style={{color:"#555", fontSize:"0.75rem", marginTop:"2px"}}>
                  {new Date(track.createdAt).toLocaleDateString()}
                </p>
              </div>
              {/* Delete Button */}
              <button
                onClick={() => setDeleteId(track._id)}
                style={{width:"36px", height:"36px", borderRadius:"50%", background:"rgba(255,71,87,0.1)", border:"1px solid rgba(255,71,87,0.3)", color:"#ff4757", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.9rem", flexShrink:0}}
              >
                🗑
              </button>
            </div>

            {/* Track Stats */}
            <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px"}}>
              <div style={{background:"#0d0d0d", borderRadius:"8px", padding:"8px", textAlign:"center"}}>
                <div style={{fontWeight:"700", fontSize:"0.95rem", color:"#00e5ff"}}>{(track.plays||0).toLocaleString()}</div>
                <div style={{fontSize:"0.6rem", color:"#444", textTransform:"uppercase", letterSpacing:"0.06em"}}>Plays</div>
              </div>
              <div style={{background:"#0d0d0d", borderRadius:"8px", padding:"8px", textAlign:"center"}}>
                <div style={{fontWeight:"700", fontSize:"0.95rem", color:"#1DB954"}}>{(track.downloads||0).toLocaleString()}</div>
                <div style={{fontSize:"0.6rem", color:"#444", textTransform:"uppercase", letterSpacing:"0.06em"}}>Downloads</div>
              </div>
              <div style={{background:"#0d0d0d", borderRadius:"8px", padding:"8px", textAlign:"center"}}>
                <div style={{fontWeight:"700", fontSize:"0.95rem", color:"#ff4757"}}>{(track.likes||0).toLocaleString()}</div>
                <div style={{fontSize:"0.6rem", color:"#444", textTransform:"uppercase", letterSpacing:"0.06em"}}>Likes</div>
              </div>
            </div>

          </div>
        ))
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, padding:"20px"}}>
          <div style={{background:"#111", border:"1px solid #222", borderRadius:"16px", padding:"24px", maxWidth:"320px", width:"100%", textAlign:"center"}}>
            <div style={{fontSize:"2.5rem", marginBottom:"12px"}}>🗑️</div>
            <h3 style={{fontWeight:"800", fontSize:"1.1rem", marginBottom:"8px"}}>Delete Track?</h3>
            <p style={{color:"#555", fontSize:"0.82rem", marginBottom:"24px"}}>This cannot be undone. The track will be permanently removed.</p>
            <div style={{display:"flex", gap:"10px"}}>
              <button
                onClick={() => setDeleteId(null)}
                style={{flex:1, padding:"12px", borderRadius:"10px", background:"#1a1a1a", border:"1px solid #222", color:"#fff", fontWeight:"700", cursor:"pointer"}}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                style={{flex:1, padding:"12px", borderRadius:"10px", background:"#ff4757", border:"none", color:"#fff", fontWeight:"800", cursor:"pointer"}}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
