import Audioplayer from "../../components/Audioplayer"; // Fixed path and casing
import { BadgeCheck } from "lucide-react";

async function getArtistData(id) {
  // Fixed: Replaced localhost with environment variable
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/artists/${id}`, { 
    cache: "no-store" 
  });
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
      <div className="flex flex-col md:flex-row items-center gap-8 mb-16 p-8 rounded-3xl bg-gradient-to-b from-zinc-800">
        <div className="w-48 h-48 rounded-full overflow-hidden bg-zinc-800 border-4 border-cyan-500/20">
          <img 
            src={artist.profile_image || "/default-avatar.png"} 
            alt={artist.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 text-center md:text-left">
           <h1 className="text-4xl font-black uppercase tracking-tighter">{artist.name}</h1>
           {artist.is_verified && <BadgeCheck className="text-cyan-500" size={28} />}
           <p className="text-zinc-400 max-w-2xl leading-relaxed">{artist.bio || "This artist hasn't added a bio yet."}</p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold border-l-4 border-cyan-500 pl-4 mb-8">DISCOGRAPHY</h2>
        <div className="grid gap-4">
          {tracks.length > 0 ? (
            tracks.map((track) => (
              <Audioplayer key={track.id} track={{ ...track, artist_name: artist.name }} />
            ))
          ) : (
            <p className="text-zinc-500 italic">No tracks uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
