import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "CyberMuzik",
  description: "Stream the future",
  manifest: "/manifest.json",
  themeColor: "#E8640A",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CyberMuzik"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json"/>
        <meta name="theme-color" content="#E8640A"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
        <meta name="apple-mobile-web-app-title" content="CyberMuzik"/>
        <link rel="apple-touch-icon" href="/icon-192.png"/>
      </head>
      <body className="bg-black text-white">
        <Navbar />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
    }
