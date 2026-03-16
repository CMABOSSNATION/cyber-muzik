import AudioPlayer from "../components/AudioPlayer";

async function getTracks() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}
