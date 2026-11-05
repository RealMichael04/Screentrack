import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata = {
  title: "ReelGuide — Everything You Watch. Everything You Want to Watch.",
  description:
    "ReelGuide is an all-in-one entertainment companion: track what you watch, discover new movies and shows, follow franchises and never miss an update.",
};

export const viewport = {
  themeColor: "#080606",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
