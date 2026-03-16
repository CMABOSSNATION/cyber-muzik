import "../styles/globals.css"; // Make sure globals.css is inside a 'styles' folder
import Navbar from "../components/Navbar";
export const metadata = {
  title: "CyberMuzik | Future of Sound",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}

