"use client";
import { useState } from "react";

const newsData = [
  {
    tag: "🏆 Awards",
    tagColor: "#FFD700",
    tagBg: "rgba(255,215,0,0.12)",
    title: "Taylor Swift Confirmed to Attend iHeartRadio Music Awards on March 26",
    body: "The superstar will make an in-person appearance at the 2026 iHeartRadio Music Awards. Fan voting is open now across categories including Best Music Video and Favorite Tour.",
    date: "March 20, 2026 · iHeartRadio"
  },
  {
    tag: "🎵 Music",
    tagColor: "#00e5ff",
    tagBg: "rgba(0,229,255,0.12)",
    title: "BTS Breaks Hiatus with Nautical New Single 'SWIM'",
    body: "The K-pop giants have returned after their hiatus, releasing a stunning new music video. Fans worldwide are celebrating the long-awaited comeback from all seven members.",
    date: "March 20, 2026 · iHeart"
  },
  {
    tag: "🎵 Music",
    tagColor: "#00e5ff",
    tagBg: "rgba(0,229,255,0.12)",
    title: "Niall Horan Channels Grief Over Liam Payne's Death Into Powerful New Song",
    body: "The former One Direction member has turned his grief into art, releasing an emotional new track inspired by the loss of his bandmate Liam Payne.",
    date: "March 20, 2026 · iHeart"
  },
  {
    tag: "🏆 Awards",
    tagColor: "#FFD700",
    tagBg: "rgba(255,215,0,0.12)",
    title: "Michael B. Jordan Wins Best Actor Oscar for 'Sinners,' Celebrates with In-N-Out Burger",
    body: "After receiving the Best Actor Academy Award for playing twin brothers in 'Sinners,' Michael B. Jordan kept it real by celebrating with a burger at a Hollywood In-N-Out.",
    date: "March 17, 2026 · NBC Chicago"
  },
  {
    tag: "💬 Gossip",
    tagColor: "#ff4757",
    tagBg: "rgba(255,71,87,0.12)",
    title: "Travis Kelce & Taylor Swift Set to Marry Before New NFL Season — Source",
    body: "Sources reveal the engaged couple plan to tie the knot before the new Chiefs season begins. The two got engaged last summer after dating for two years.",
    date: "March 20, 2026 · Yahoo Entertainment"
  },
  {
    tag: "💬 Gossip",
    tagColor: "#ff4757",
    tagBg: "rgba(255,71,87,0.12)",
    title: "Olivia Rodrigo Clears the Air About Rumored Sabrina Carpenter Feud",
    body: "The pop star has finally addressed ongoing speculation about a feud with Sabrina Carpenter, setting the record straight in a candid new interview.",
    date: "March 20, 2026 · iHeart"
  },
  {
    tag: "💔 Breakup",
    tagColor: "#ff6b6b",
    tagBg: "rgba(255,107,107,0.1)",
    title: "Feid & Karol G End 3-Year Relationship — 'The Breakup Was Amicable'",
    body: "Latin music's power couple have called it quits. A source confirms the separation was mutual and the two stars remain on good terms professionally.",
    date: "January 19, 2026 · TMZ"
  },
  {
    tag: "🎵 Music",
    tagColor: "#00e5ff",
    tagBg: "rgba(0,229,255,0.12)",
    title: "Rick Ross Teams Up With French Montana & Max B for 'Minks in Miami'",
    body: "The hip-hop heavyweights have linked up for a new collaboration generating serious buzz in the rap community ahead of its official release.",
    date: "March 20, 2026 · iHeart"
  },
  {
    tag: "🎵 Music",
    tagColor: "#00e5ff",
    tagBg: "rgba(0,229,255,0.12)",
    title: "Radiohead to Tour One Continent Per Year Starting 2027 — Ed O'Brien",
    body: "Guitarist Ed O'Brien confirmed the legendary band's touring plans, revealing they will limit themselves to one continent per year beginning in 2027.",
    date: "March 20, 2026 · iHeart"
  },
  {
    tag: "💬 Gossip",
    tagColor: "#ff4757",
    tagBg: "rgba(255,71,87,0.12)",
    title: "Cardi B and Offset Officially Finalise Divorce After Years of On-Off Drama",
    body: "The divorce between rap royalty Cardi B and Migos member Offset has been officially finalised. The two share children together and will continue co-parenting.",
    date: "March 18, 2026 · TMZ"
  },
];

const filters = ["All", "Music", "Gossip", "Awards", "Breakup"];

export default function NewsPage() {
  const [active, setActive] = useState("All");

  const filtered = newsData.filter(n => {
    if (active === "All") return true;
    return n.tag.toLowerCase().includes(active.toLowerCase());
  });

  return (
    <main style={{padding:"20px", color:"white", background:"#080808", minHeight:"100vh", maxWidth:"680px", margin:"0 auto"}}>

      <h1 style={{fontWeight:"900", fontSize:"1.8rem", marginBottom:"6px"}}>News & Gossip 📰</h1>
      <p style={{color:"#555", fontSize:"0.82rem", marginBottom:"20px"}}>Latest from the music world · March 21, 2026</p>

      {/* Filter Pills */}
      <div style={{display:"flex", gap:"8px", marginBottom:"24px", flexWrap:"wrap"}}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActive(f)}
            style={{
              padding:"6px 14px",
              borderRadius:"99px",
              fontSize:"0.75rem",
              fontWeight:"600",
              cursor:"pointer",
              border: active === f ? "none" : "1px solid #222",
              background: active === f ? "#00e5ff" : "transparent",
              color: active === f ? "#000" : "#666",
              transition:"all 0.2s"
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* News Cards */}
      {filtered.map((item, i) => (
        <div key={i} style={{background:"#111", border:"1px solid #1e1e1e", borderRadius:"14px", padding:"18px", marginBottom:"12px", transition:"border-color 0.2s", cursor:"pointer"}}
          onMouseEnter={e => e.currentTarget.style.borderColor="#333"}
          onMouseLeave={e => e.currentTarget.style.borderColor="#1e1e1e"}
        >
          <span style={{
            display:"inline-block",
            padding:"3px 10px",
            borderRadius:"99px",
            fontSize:"0.65rem",
            fontWeight:"700",
            letterSpacing:"0.08em",
            textTransform:"uppercase",
            background: item.tagBg,
            color: item.tagColor,
            marginBottom:"10px"
          }}>
            {item.tag}
          </span>
          <h3 style={{fontWeight:"700", fontSize:"0.95rem", lineHeight:"1.45", marginBottom:"8px"}}>{item.title}</h3>
          <p style={{color:"#777", fontSize:"0.8rem", lineHeight:"1.6"}}>{item.body}</p>
          <p style={{color:"#444", fontSize:"0.7rem", marginTop:"10px"}}>{item.date}</p>
        </div>
      ))}

    </main>
  );
  }
