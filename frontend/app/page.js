import AudioPlayer from "../components/AudioPlayer";

async function getTracks() {
  const res = await fetch("http://localhost:5000/api/tracks", { cache: "no-store" });
  return res.json();
}

export default async function Home() {
  const tracks = await getTracks();

  return (
    <div className="py-10">
      <header className="mb-12">
        <h1 className="text-5xl font-black mb-4 tracking-tight">TRENDING <span className="text-cyan-500">NOW</span></h1>
        <p className="text-zinc-400">Stream and download the latest hits from regional artists.</p>
      </header>

      <div className="grid gap-4">
        {tracks.map((track) => (
          <AudioPlayer key={track.id} track={track} />
        ))}
      </div>
    </div>
  );
}
