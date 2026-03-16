import "./globals.css"; // Fixed: Ensure this matches your file location
import Navbar from "../components/Navbar"; // Fixed: Ensure 'components' is lowercase

export const metadata = {
  title: "Cybermuzik",
  description: "Your ultimate music destination",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
