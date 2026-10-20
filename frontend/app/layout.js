import './globals.css';
import Navbar from '../components/Navbar';
import PlayerBar from '../components/PlayerBar';
import PlayerProvider from '../components/PlayerProvider';

export const metadata = {
  title: 'Cyber-Muzik',
  description: 'Stream and discover independent music.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'Cyber-Muzik', statusBarStyle: 'black-translucent' },
};

export const viewport = { themeColor: '#e8640a' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-512.png" />
      </head>
      <body className="bg-ink-950 text-zinc-100 antialiased">
        <PlayerProvider>
          <Navbar />
          <main className="min-h-screen pb-28">{children}</main>
          <PlayerBar />
        </PlayerProvider>
      </body>
    </html>
  );
}
