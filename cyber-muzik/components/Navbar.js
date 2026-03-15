import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <Link href="/" className="text-2xl font-black tracking-tighter text-cyan-500">
        CYBER<span className="text-white">MUZIK</span>
      </Link>
      <div className="space-x-6 font-medium text-sm">
        <Link href="/" className="hover:text-cyan-400">HOME</Link>
        <Link href="/upload" className="bg-cyan-500 text-black px-4 py-2 rounded-full font-bold transition hover:scale-105">UPLOAD</Link>
      </div>
    </nav>
  );
}
