import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { BossDetailCard } from '@/components/BossDetailCard';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get parameters from URL
    const bossName = searchParams.get('boss') || 'Unknown Boss';

    // Fetch boss data from API
    let bossData = null;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eth-boss-tracker.vercel.app';
      const bossResponse = await fetch(`${baseUrl}/api/boss/${encodeURIComponent(bossName)}`);
      if (bossResponse.ok) {
        bossData = await bossResponse.json();
      }
    } catch (error) {
      console.log('Failed to fetch boss data:', error);
    }

    // Use fetched data or fallback to defaults
    const bossDate = bossData?.date || '2024-01-01';
    const bossTier = bossData?.tier || 'COMMON';
    const bossLevel = bossData?.index || 1;
    const targetPrice = bossData ? `$${bossData.high.toLocaleString()}` : '$4,000';
    const actualBossImage = bossData?.image || null;
    const hp = 100; // Default HP for OpenGraph

    // Generate lore based on boss tier and available data
    const generateLore = () => {
      // Use custom lore if available in the JSON data
      if (bossData?.lore) {
        return bossData.lore;
      }

      if (bossTier === 'ASCENDED' || bossTier === 'GODLIKE') {
        return `The legendary ${bossName} awaits at ${targetPrice}. This ${bossTier.toLowerCase()} boss represents the weekly high from ${formatDate(bossDate)}. Will ETH have the strength to overcome this challenge when the time comes?`;
      } else if (bossTier === 'ULTIMATE') {
        return `A mighty ${bossName} guards the path to ${targetPrice}. This ${bossTier.toLowerCase()} boss from ${formatDate(bossDate)} stands as a formidable obstacle in ETH's climb to All-Time High.`;
      } else {
        return `The battle against ${bossName} has begun. This ${bossTier.toLowerCase()} boss guards the weekly high of ${targetPrice} from ${formatDate(bossDate)}. The journey to defeat this foe has just started.`;
      }
    };

    const bossLore = generateLore();

    // Format date
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };



    // Convert relative image path to absolute URL for @vercel/og
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eth-boss-tracker.vercel.app';
    const absoluteImageUrl = actualBossImage ? `${baseUrl}${actualBossImage}` : undefined;

    // Prepare boss data for the component
    const boss = {
      name: bossName,
      high: bossData?.high || 4000,
      date: bossDate,
      image: absoluteImageUrl,
      tier: bossTier,
      lore: bossLore
    };

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
            fontFamily: 'Arial, sans-serif',
            padding: '40px',
          }}
        >
          <BossDetailCard
            boss={boss}
            index={bossLevel - 1}
            isFutureBoss={false}
            hp={hp}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=0, must-revalidate',
          'Content-Type': 'image/png',
        },
      }
    );
  } catch (e: unknown) {
    console.log(`Failed to generate image: ${e instanceof Error ? e.message : 'Unknown error'}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
