"use client";
import { useEffect, useState } from 'react';

export default function ArtistDashboard() {
  const [stats, setStats] = useState(null);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Artist Console</h1>
      
      {/* Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Total Streams" value={stats?.totalStreams || "1.2k"} color="text-purple-500" />
        <StatCard title="Monthly Listeners" value="450" color="text-blue-500" />
        <StatCard title="Uploaded Tracks" value={stats?.trackCount || "8"} color="text-green-500" />
      </div>

      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Your Top Tracks</h2>
          <button className="bg-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition">
            Upload New Track
          </button>
        </div>
        
        {/* Simple Table for Tracks */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 text-zinc-500 text-sm border-b border-zinc-800 pb-2">
            <span>Title</span>
            <span>Release Date</span>
            <span className="text-right">Streams</span>
          </div>
          {/* Map your tracks here */}
          <div className="grid grid-cols-3 py-2 border-b border-zinc-800/50 hover:bg-white/5 transition px-2 rounded">
            <span className="font-medium">Cyber-Pulse 2077</span>
            <span className="text-zinc-400">Mar 10, 2026</span>
            <span className="text-right text-purple-400 font-mono">842</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
      <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider">{title}</p>
      <p className={`text-4xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );
}
