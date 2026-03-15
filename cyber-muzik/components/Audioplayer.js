"use client";
import { useState, useRef } from "react";
import { Play, Pause, Download } from "lucide-react"; // npm install lucide-react

export default function AudioPlayer({ track }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="group bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex items-center justify-between hover:border-cyan-500/50 transition">
      <div className="flex flex-col">
        <span className="font-bold text-lg">{track.title}</span>
        <span className="text-zinc-500 text-sm uppercase tracking-widest">{track.artist_name}</span>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={togglePlay} className="p-3 bg-white text-black rounded-full hover:bg-cyan-400 transition">
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <a href={`/api/download/${track.id}`} className="p-3 border border-zinc-700 rounded-full hover:bg-zinc-800">
          <Download size={20} />
        </a>
      </div>
      <audio ref={audioRef} src={track.file_url} onEnded={() => setIsPlaying(false)} />
    </div>
  );
}
