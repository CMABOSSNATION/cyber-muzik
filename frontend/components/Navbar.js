import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-zinc-900">
      <div className="max-w-2xl mx-auto px-4 flex items-center gap-0">
        <Link href="/" className="font-black text-lg text-cyan-400 py-4 mr-auto tracking-tight">
          CYBER<span className="text-white">MUZIK</span>
        </Link>
        <Link href="/" className="px-3 py-4 text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-white transition">Home</Link>
        <Link href="/charts" className="px-3 py-4 text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-white transition">Charts</Link>
        <Link href="/artists" className="px-3 py-4 text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-white transition">Artists</Link>
        <Link href="/news" className="px-3 py-4 text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-white transition">News</Link>
        <Link href="/upload" className="ml-3 bg-cyan-400 text-black px-4 py-2 rounded-full text-xs font-bold hover:scale-105 transition">UPLOAD</Link>
      </div>
    </nav>
  );
}
