import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

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

    // Fetch boss image if provided
    let imageData = null;
    if (actualBossImage) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eth-boss-tracker.vercel.app';
        const imageUrl = `${baseUrl}${actualBossImage}`;
        const imageResponse = await fetch(imageUrl);
        if (imageResponse.ok) {
          const arrayBuffer = await imageResponse.arrayBuffer();
          imageData = `data:image/png;base64,${Buffer.from(arrayBuffer).toString('base64')}`;
        }
      } catch (error) {
        console.log('Failed to fetch boss image:', error);
      }
    }
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
            fontFamily: 'Arial, sans-serif',
            padding: '40px',
          }}
        >
          {/* BossDetailCard Container */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(8px)',
              border: '2px solid rgba(168, 85, 247, 0.4)',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(168, 85, 247, 0.3)',
              padding: '40px',
            }}
          >
            {/* Left Side - Boss Card */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: '1',
                position: 'relative',
              }}
            >
              {/* Glow Effect */}
              <div
                style={{
                  position: 'absolute',
                  width: '320px',
                  height: '460px',
                  borderRadius: '50%',
                  background: 'linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6)',
                  filter: 'blur(20px)',
                  opacity: 0.75,
                  animation: 'pulse 2s infinite',
                }}
              />
              
              {/* Boss Card */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  border: '2px solid rgba(168, 85, 247, 0.4)',
                  borderRadius: '16px',
                  padding: '20px',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {/* Boss Image */}
                {imageData ? (
                  <img
                    src={imageData}
                    style={{
                      width: '240px',
                      height: '360px',
                      objectFit: 'contain',
                      borderRadius: '12px',
                      border: '2px solid rgba(168, 85, 247, 0.3)',
                    }}
                    alt={bossName}
                  />
                ) : (
                  <div
                    style={{
                      width: '240px',
                      height: '360px',
                      background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '48px',
                      fontWeight: 'bold',
                      color: 'white',
                      border: '2px solid rgba(168, 85, 247, 0.3)',
                    }}
                  >
                    {bossName.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Boss Info Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    right: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '8px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div>
                    <div style={{ color: '#a855f7', fontSize: '16px', fontWeight: 'bold' }}>
                      {bossTier}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '8px' }}>
                      {formatDate(bossDate)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#a855f7', fontSize: '16px', fontWeight: 'bold' }}>
                      {hp}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '8px' }}>
                      HP
                    </div>
                  </div>
                </div>
                
                {/* Level Badge */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div style={{ color: 'white', fontSize: '8px', fontWeight: 'bold' }}>
                    {bossLevel}/18
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Side - Info */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: '1',
                marginLeft: '40px',
                gap: '20px',
              }}
            >
              {/* Spawn Date & Target */}
              <div
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <div style={{ color: '#a855f7', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                    SPAWN DATE
                  </div>
                  <div style={{ color: 'white', fontSize: '16px' }}>
                    {formatDate(bossDate)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#10b981', fontSize: '48px', fontWeight: 'bold' }}>
                    {targetPrice}
                  </div>
                </div>
              </div>
              
              {/* Lore */}
              <div
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '16px',
                  padding: '20px',
                  flex: 1,
                }}
              >
                <div style={{ color: '#a855f7', fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
                  LORE
                </div>
                <div style={{ color: 'white', fontSize: '14px', lineHeight: '1.4' }}>
                  {bossLore}
                </div>
              </div>
            </div>
          </div>
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
