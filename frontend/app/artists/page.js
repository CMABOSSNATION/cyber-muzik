"use client";
import { useState, useEffect } from "react";

export default function ArtistsPage() {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks`)
      .then(res => res.json())
      .then(data => setTracks(Array.isArray(data.data) ? data.data : []))
      .catch(() => setTracks([]));
  }, []);

  // Group tracks by artist
  const artists = tracks.reduce((acc, track) => {
    const name = track.artist || "Unknown Artist";
    if (!acc[name]) {
      acc[name] = { name, tracks: [], plays: 0, downloads: 0 };
    }
    acc[name].tracks.push(track);
    acc[name].plays += track.plays || 0;
    acc[name].downloads += track.downloads || 0;
    return acc;
  }, {});

  const artistList = Object.values(artists);

  return (
    <main style={{padding:"20px", color:"white", background:"#080808", minHeight:"100vh", maxWidth:"680px", margin:"0 auto"}}>

      <h1 style={{fontWeight:"900", fontSize:"1.8rem", marginBottom:"6px"}}>Artists 🎤</h1>
      <p style={{color:"#555", fontSize:"0.82rem", marginBottom:"28px"}}>Discover the talent behind the music</p>

      {artistList.length === 0 ? (
        <p style={{color:"#444"}}>No artists yet. Upload a track to appear here!</p>
      ) : (
        artistList.map((artist, i) => (
          <div key={i} style={{background:"#111", border:"1px solid #1e1e1e", borderRadius:"16px", padding:"20px", marginBottom:"14px"}}>

            {/* Avatar */}
            <div style={{width:"60px", height:"60px", borderRadius:"50%", background:"linear-gradient(135deg,#00e5ff33,#0077ff33)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.6rem", marginBottom:"14px"}}>
              🎵
            </div>

            {/* Name */}
            <h2 style={{fontWeight:"900", fontSize:"1.1rem", marginBottom:"6px"}}>{artist.name}</h2>

            {/* Bio */}
            <p style={{color:"#777", fontSize:"0.82rem", lineHeight:"1.6", marginBottom:"16px"}}>
              Independent artist on CyberMuzik with {artist.tracks.length} track{artist.tracks.length !== 1 ? "s" : ""} uploaded. Building their sound and growing their fanbase one track at a time.
            </p>

            {/* Stats */}
            <div style={{display:"flex", gap:"20px", marginBottom:"16px"}}>
              <div>
                <div style={{fontWeight:"700", fontSize:"1rem", color:"#00e5ff"}}>{artist.plays.toLocaleString()}</div>
                <div style={{fontSize:"0.65rem", color:"#555", textTransform:"uppercase", letterSpacing:"0.08em"}}>Plays</div>
              </div>
              <div>
                <div style={{fontWeight:"700", fontSize:"1rem", color:"#2ed573"}}>{artist.downloads.toLocaleString()}</div>
                <div style={{fontSize:"0.65rem", color:"#555", textTransform:"uppercase", letterSpacing:"0.08em"}}>Downloads</div>
              </div>
              <div>
                <div style={{fontWeight:"700", fontSize:"1rem", color:"#FFD700"}}>{artist.tracks.length}</div>
                <div style={{fontSize:"0.65rem", color:"#555", textTransform:"uppercase", letterSpacing:"0.08em"}}>Tracks</div>
              </div>
            </div>

            {/* Track list */}
            <div style={{borderTop:"1px solid #1e1e1e", paddingTop:"14px"}}>
              <p style={{fontSize:"0.7rem", color:"#444", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"10px"}}>Tracks</p>
              {artist.tracks.map((track, j) => (
                <div key={j} style={{display:"flex", alignItems:"center", gap:"10px", padding:"8px 0", borderBottom:"1px solid #161616"}}>
                  <span style={{color:"#333", fontSize:"0.75rem", width:"18px"}}>{j + 1}</span>
                  <div style={{flex:1}}>
                    <p style={{fontSize:"0.88rem", fontWeight:"600"}}>{track.title}</p>
                  </div>
                  <span style={{color:"#444", fontSize:"0.72rem"}}>{(track.plays || 0)} plays</span>
                </div>
              ))}
            </div>

          </div>
        ))
      )}
    </main>
  );
  }
