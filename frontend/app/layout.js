import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Cybermuzik",
  description: "Stream the future",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <Navbar />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
