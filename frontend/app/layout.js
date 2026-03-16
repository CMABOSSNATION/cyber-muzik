import "./globals.css"; 
import Navbar from "../components/Navbar";

export const metadata = {
  title: "CyberMuzik | Future of Sound",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
