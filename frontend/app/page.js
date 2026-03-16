import AudioPlayer from "../components/AudioPlayer";

async function getTracks() {
  // Uses the NEXT_PUBLIC_API_URL you set in Vercel settings
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks`, { 
    cache: 'no-store' 
  });
  if (!res.ok) return [];
  return res.json();
}
export default async function Home() {
  const tracks = await getTracks();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Explore Tracks</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tracks.map((track) => (
          <div key={track._id} className="bg-zinc-900 p-4 rounded-lg">
            <img src={track.coverImage} alt={track.title} className="rounded mb-2" />
            <h2 className="font-semibold">{track.title}</h2>
            <p className="text-zinc-400 text-sm">{track.artist?.name}</p>
          </div>
        ))}
      </div>
      <AudioPlayer />
    </div>
  );
}
