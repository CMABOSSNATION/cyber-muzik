"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Audioplayer from "../../../components/Audioplayer";

export default function ArtistPage() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const url = "https://your-backend-url.onrender.com"; // PASTE YOUR RENDER URL HERE
    fetch(`${url}/api/artists/${id}`)
      .then(res => res.json())
      .then(data => setArtist(data))
      .catch(err => console.log(err));
  }, [id]);

  // Safety Wrap: Stops the 404/Application Error
  if (!isClient) return null;

  return (
    <div className="p-8 text-white bg-black min-h-screen">
      {artist ? (
        <>
          <h1 className="text-4xl font-bold mb-4">{artist.name}</h1>
          <p className="text-zinc-400 mb-8">{artist.bio}</p>
          {/* Add more artist details here */}
        </>
      ) : (
        <p>Loading artist details...</p>
      )}
      <Audioplayer />
    </div>
  );
}
