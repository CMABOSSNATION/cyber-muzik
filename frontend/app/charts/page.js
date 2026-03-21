"use client";
import { useState, useEffect } from "react";

export default function ChartsPage() {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks`)
      .then(res => res.json())
      .then(data => setTracks(Array.isArray(data.data) ? data.data : []))
      .catch(() => setTracks([]));
  }, []);

  const sorted = [...tracks].sort((a, b) => (b.plays || 0) - (a.plays || 0));
  const top10 = sorted.slice(0, 10);
  const top100 = sorted.slice(0, 100);
  const mostDownloaded = [...tracks].sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 10);

  const medalColor = (i) => {
    if (i === 0) return "#FFD700";
    if (i === 1) return "#aaaaaa";
    if (i === 2) return "#cd7f32";
    return "#444";
  };

  return (
    <main style={{padding:"20px", color:"white", background:"#080808", minHeight:"100vh", maxWidth:"680px", margin:"0 auto"}}>

      <h1 style={{fontWeight:"900", fontSize:"1.8rem", marginBottom:"6px"}}>Charts 🏆</h1>
      <p style={{color:"#555", fontSize:"0.82rem", marginBottom:"28px"}}>Ranked by plays and downloads</p>

      {/* TOP 10 */}
      <h2 style={{fontSize:"0.8rem", fontWeight:"700", color:"#FFD700", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:"14px"}}>🥇 Top 10</h2>
      {top10.length > 0 ? top10.map((track, i) => (
        <div key={i} style={{display:"flex", alignItems:"center", gap:"12px", padding:"12px 14px", borderRadius:"12px", background:"#111", border:"1px solid #1e1e1e", marginBottom:"8px"}}>
          <span style={{fontWeight:"900", fontSize:"1.2rem", width:"32px", textAlign:"center", color: medalColor(i), flexShrink:0}}>{i + 1}</span>
          <div style={{flex:1, minWidth:0}}>
            <p style={{fontWeight:"600", fontSize:"0.92rem", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{track.title}</p>
            <p style={{color:"#666", fontSize:"0.75rem", marginTop:"2px"}}>{track.artist}</p>
          </div>
          <span style={{color:"#555", fontSize:"0.75rem", flexShrink:0}}>{(track.plays || 0).toLocaleString()} plays</span>
        </div>
      )) : (
        <p style={{color:"#444", fontSize:"0.85rem", marginBottom:"20px"}}>No tracks yet. Upload to appear on charts!</p>
      )}

      {/* TOP 100 */}
      {top100.length > 10 && (
        <>
          <h2 style={{fontSize:"0.8rem", fontWeight:"700", color:"#ff4757", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:"14px", marginTop:"28px"}}>💯 Top 100</h2>
          {top100.slice(10).map((track, i) => (
            <div key={i} style={{display:"flex", alignItems:"center", gap:"12px", padding:"10px 14px", borderRadius:"10px", background:"#0d0d0d", border:"1px solid #181818", marginBottom:"6px"}}>
              <span style={{fontWeight:"700", fontSize:"0.9rem", width:"32px", textAlign:"center", color:"#ff4757", flexShrink:0}}>{i + 11}</span>
              <div style={{flex:1, minWidth:0}}>
                <p style={{fontWeight:"600", fontSize:"0.88rem", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{track.title}</p>
                <p style={{color:"#555", fontSize:"0.73rem"}}>{track.artist}</p>
              </div>
              <span style={{color:"#444", fontSize:"0.73rem", flexShrink:0}}>{(track.plays || 0).toLocaleString()} plays</span>
            </div>
          ))}
        </>
      )}

      {/* MOST DOWNLOADED */}
      <h2 style={{fontSize:"0.8rem", fontWeight:"700", color:"#2ed573", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:"14px", marginTop:"28px"}}>⬇ Most Downloaded</h2>
      {mostDownloaded.length > 0 ? mostDownloaded.map((track, i) => (
        <div key={i} style={{display:"flex", alignItems:"center", gap:"12px", padding:"12px 14px", borderRadius:"12px", background:"#111", border:"1px solid #1e1e1e", marginBottom:"8px"}}>
          <span style={{fontWeight:"900", fontSize:"1.1rem", width:"32px", textAlign:"center", color:"#2ed573", flexShrink:0}}>{i + 1}</span>
          <div style={{flex:1, minWidth:0}}>
            <p style={{fontWeight:"600", fontSize:"0.92rem", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{track.title}</p>
            <p style={{color:"#666", fontSize:"0.75rem", marginTop:"2px"}}>{track.artist}</p>
          </div>
          <span style={{color:"#555", fontSize:"0.75rem", flexShrink:0}}>{(track.downloads || 0).toLocaleString()} downloads</span>
        </div>
      )) : (
        <p style={{color:"#444", fontSize:"0.85rem"}}>No downloads tracked yet.</p>
      )}

    </main>
  );
  }
