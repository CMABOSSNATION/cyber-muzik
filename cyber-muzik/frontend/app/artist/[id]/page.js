import AudioPlayer from "@/components/AudioPlayer";
import { BadgeCheck } from "lucide-react"; // npm install lucide-react

async function getArtistData(id) {
  // Replace localhost with your production URL later
  const res = await fetch(`http://localhost:5000/api/artists/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function ArtistProfile({ params }) {
  const data = await getArtistData(params.id);

  if (!data) {
    return <div className="py-20 text-center">Artist not found.</div>;
  }

  const { artist, tracks } = data;

  return (
    <div className="py-10">
      {/* Artist Header Section */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-16 p-8 rounded-3xl bg-gradient-to-b from-zinc-900 to-black border border-zinc-800">
        <div className="w-48 h-48 rounded-full overflow-hidden bg-zinc-800 border-4 border-cyan-500/20">
          <img 
            src={artist.profile_image || "/default-avatar.png"} 
            alt={artist.name} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <h1 className="text-4xl font-black uppercase tracking-tighter">{artist.name}</h1>
            {artist.is_verified && <BadgeCheck className="text-cyan-500" size={28} />}
          </div>
          <p className="text-zinc-400 max-w-2xl leading-relaxed">
            {artist.bio || "This artist hasn't added a bio yet."}
          </p>
          <div className="mt-6 flex justify-center md:justify-start gap-4 text-sm font-bold">
            <div className="bg-zinc-800 px-4 py-2 rounded-lg">
              <span className="text-cyan-500">{tracks.length}</span> TRACKS
            </div>
          </div>
        </div>
      </div>

      {/* Track List Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold border-l-4 border-cyan-500 pl-4 mb-8">DISCOGRAPHY</h2>
        <div className="grid gap-4">
          {tracks.length > 0 ? (
            tracks.map((track) => (
              <AudioPlayer key={track.id} track={{ ...track, artist_name: artist.name }} />
            ))
          ) : (
            <p className="text-zinc-500 italic">No tracks uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
