"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Audioplayer from "../../components/Audioplayer";

export default function ArtistPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [artist, setArtist] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!id) return;
    const url = process.env.NEXT_PUBLIC_API_URL || "";
    fetch(`${url}/api/artists/${id}`)
      .then(res => res.json())
      .then(data => setArtist(data))
      .catch(err => console.log(err));
  }, [id]);

  if (!isClient) return null;

  return (
    <div className="p-8 text-white bg-black min-h-screen">
      {artist ? (
        <>
          <h1 className="text-4xl font-bold mb-4">{artist.name}</h1>
          <p className="text-zinc-400 mb-8">{artist.bio}</p>
        </>
      ) : (
        <p>Loading artist details...</p>
      )}
      {artist && Array.isArray(artist.tracks) && artist.tracks.map((track) => (
        <Audioplayer key={track._id || track.id} track={track} />
      ))}
    </div>
  );
}
