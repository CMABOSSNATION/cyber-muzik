import Audioplayer from "../../components/Audioplayer"; // FIXED: relative path + lowercase 'p'
import { BadgeCheck } from "lucide-react";
async function getArtistData(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/artists/${id}`, { 
    cache: "no-store" 
  });
  if (!res.ok) return null;
  return res.json();
}
export default async function ArtistProfile({ params }) {
  const data = await getArtistData(params.id);
  if (!data) return <div className="py-20 text-center">Artist not found.</div>;

  const { artist, tracks } = data;

  return (
    <div className="py-10 px-8">
      <div className="flex flex-col md:flex-row items-center gap-8 mb-16 p-8 rounded-3xl bg-zinc-900">
        <img src={artist.profile_image} className="w-48 h-48 rounded-full object-cover" />
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2">
            {artist.name} {artist.is_verified && <BadgeCheck className="text-cyan-500" />}
          </h1>
          <p className="text-zinc-400 mt-4">{artist.bio}</p>
        </div>
      </div>
      <div className="space-y-4">
        {tracks.map((track) => (
          <Audioplayer key={track._id || track.id} track={{ ...track, artist_name: artist.name }} />
        ))}
      </div>
    </div>
  );
}
