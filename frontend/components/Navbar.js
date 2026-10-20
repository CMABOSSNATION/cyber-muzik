'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '../lib/session';
import Cover from './Cover';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/charts', label: 'Charts' },
  { href: '/artists', label: 'Artists' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { ready, artist } = useSession();
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const install = async () => {
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-ink-700 bg-ink-950/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-2xl items-center gap-4 px-4">
        <Link href="/" className="mr-auto text-base font-bold tracking-tight text-white">
          Cyber<span className="text-brand">Muzik</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={pathname === l.href ? 'text-white' : 'text-zinc-400 hover:text-white'}>
              {l.label}
            </Link>
          ))}
        </nav>
        {installPrompt && (
          <button onClick={install} className="text-sm text-zinc-400 hover:text-white">
            Install
          </button>
        )}
        {ready &&
          (artist ? (
            <Link href="/artist/dashboard" aria-label="Your dashboard">
              <Cover src={artist.profilePhoto} label={artist.username} className="h-8 w-8 rounded-full text-xs" />
            </Link>
          ) : (
            <Link href="/login" className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark">
              Sign in
            </Link>
          ))}
      </div>
    </header>
  );
}
