import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "CyberMuzik | Future of Sound",
  description: "Download and stream the latest music.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <Navbar />
        <main className="max-w-6xl mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
