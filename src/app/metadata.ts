import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  try {
    // Fetch current ETH price and boss data
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eth-boss-tracker.vercel.app';
    
    // For now, use a default boss for the main page
    const defaultBoss = {
      name: 'Gorath'
    };

    const shareCardUrl = `/api/share/boss-detail?boss=${encodeURIComponent(defaultBoss.name)}`;

    return {
      title: "ETH Boss Hunter",
      description: "Track ETH's epic battle against historical weekly high prices. Each price level is a boss to defeat! Join the hunt.",
      keywords: ["ETH", "Ethereum", "Boss Hunter", "Crypto", "DeFi", "Price Tracker"],
      authors: [{ name: "ETH Boss Hunter" }],
      creator: "ETH Boss Hunter",
      metadataBase: new URL(baseUrl),
      openGraph: {
        type: "website",
        locale: "en_US",
        url: baseUrl,
        title: "ETH Boss Hunter",
        description: "Track ETH's epic battle against historical weekly high prices. Each price level is a boss to defeat!",
        siteName: "ETH Boss Hunter",
        images: [
          {
            url: shareCardUrl,
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
                site: "@ethbosshunter",
                images: [shareCardUrl],
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
  } catch {
    // Fallback metadata
    return {
      title: "ETH Boss Hunter",
      description: "Track ETH's epic battle against historical weekly high prices.",
    };
  }
}
