import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ETH Boss Hunter",
  description: "Track ETH's epic battle against historical weekly high prices. Each price level is a boss to defeat! Join the hunt and share your victories.",
  keywords: ["ETH", "Ethereum", "Boss Hunter", "Crypto", "DeFi", "Price Tracker"],
  authors: [{ name: "ETH Boss Hunter" }],
  creator: "ETH Boss Hunter",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://eth-boss-tracker.vercel.app",
    title: "ETH Boss Hunter",
    description: "Track ETH's epic battle against historical weekly high prices. Each price level is a boss to defeat!",
    siteName: "ETH Boss Hunter",
    images: [
      {
        url: "/api/share/current-boss?boss=ETH%20Boss%20Hunter&level=1&target=$4000&current=$3500&progress=50&hp=50",
        width: 1200,
        height: 630,
        alt: "ETH Boss Hunter - Track ETH's battle against price bosses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ETH Boss Hunter",
    description: "Track ETH's epic battle against historical weekly high prices. Each price level is a boss to defeat!",
    creator: "@ethbosshunter",
    images: ["/api/share/current-boss?boss=ETH%20Boss%20Hunter&level=1&target=$4000&current=$3500&progress=50&hp=50"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
