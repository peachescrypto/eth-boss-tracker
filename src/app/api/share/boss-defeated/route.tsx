/** @jsxImportSource react */
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get parameters from URL
    const bossName = searchParams.get('boss') || 'Unknown Boss';
    const bossLevel = searchParams.get('level') || '1';
    const defeatPrice = searchParams.get('price') || '$4,000';
    const currentPrice = searchParams.get('current') || '$4,050';
    const date = searchParams.get('date') || new Date().toLocaleDateString();
    const bossImage = searchParams.get('image') || null;
    
    // Fetch boss image if provided
    let imageData = null;
    if (bossImage) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const imageUrl = `${baseUrl}${bossImage}`;
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
      <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f0729',
            backgroundImage: `
              radial-gradient(circle at 20% 50%, #10b981 0%, transparent 40%),
              radial-gradient(circle at 80% 50%, #059669 0%, transparent 40%),
              radial-gradient(circle at 50% 20%, #34d399 0%, transparent 30%)
            `,
            fontFamily: 'Arial, sans-serif',
          }}
        >
          {/* Victory Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '30px',
            }}
          >
            <div
              style={{
                fontSize: '56px',
                fontWeight: '900',
                background: 'linear-gradient(45deg, #10b981, #34d399)',
                backgroundClip: 'text',
                color: 'transparent',
                textAlign: 'center',
                marginBottom: '10px',
              }}
            >
              🏆 BOSS DEFEATED! 🏆
            </div>
          </div>

          {/* ETH Boss Hunter Logo */}
          <div
            style={{
              fontSize: '36px',
              fontWeight: '900',
              background: 'linear-gradient(45deg, #06b6d4, #8b5cf6)',
              backgroundClip: 'text',
              color: 'transparent',
              textAlign: 'center',
              marginBottom: '40px',
            }}
          >
            ETH BOSS HUNTER
          </div>

          {/* Boss Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              border: '3px solid #10b981',
              borderRadius: '20px',
              padding: '40px',
              boxShadow: '0 0 60px rgba(16, 185, 129, 0.5)',
              minWidth: '900px',
              gap: '40px',
            }}
          >
            {/* Boss Image */}
            {imageData && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <img
                  src={imageData}
                  style={{
                    width: '200px',
                    height: '250px',
                    objectFit: 'contain',
                    borderRadius: '15px',
                    border: '3px solid #10b981',
                    boxShadow: '0 0 30px rgba(16, 185, 129, 0.5)',
                    opacity: 0.7,
                    filter: 'grayscale(50%)',
                  }}
                  alt={bossName}
                />
                <div
                  style={{
                    position: 'absolute',
                    fontSize: '48px',
                    color: '#ef4444',
                    fontWeight: 'bold',
                    transform: 'rotate(-15deg)',
                    marginTop: '100px',
                  }}
                >
                  DEFEATED
                </div>
              </div>
            )}
            
            {/* Boss Stats */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}
            >
            {/* Boss Info */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '30px',
              }}
            >
              <div
                style={{
                  fontSize: '40px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  marginBottom: '10px',
                  textAlign: 'center',
                  textDecoration: 'line-through',
                  opacity: 0.7,
                }}
              >
                {bossName}
              </div>
              <div
                style={{
                  fontSize: '18px',
                  color: '#10b981',
                  marginBottom: '5px',
                }}
              >
                Level {bossLevel} ⚡ DEFEATED
              </div>
              <div
                style={{
                  fontSize: '24px',
                  color: '#ef4444',
                  fontWeight: 'bold',
                  textDecoration: 'line-through',
                }}
              >
                TARGET: {defeatPrice}
              </div>
            </div>

            {/* Victory Stats */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                gap: '15px',
                marginBottom: '25px',
              }}
            >
              {/* Final Price */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  border: '2px solid #10b981',
                  borderRadius: '10px',
                  padding: '15px 20px',
                }}
              >
                <span style={{ color: '#10b981', fontSize: '20px', fontWeight: 'bold' }}>
                  VICTORY PRICE:
                </span>
                <span style={{ color: '#ffffff', fontSize: '28px', fontWeight: 'bold' }}>
                  {currentPrice}
                </span>
              </div>

              {/* Date */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid #06b6d4',
                  borderRadius: '10px',
                  padding: '12px 20px',
                }}
              >
                <span style={{ color: '#06b6d4', fontSize: '18px' }}>
                  DEFEATED ON:
                </span>
                <span style={{ color: '#ffffff', fontSize: '20px', fontWeight: 'bold' }}>
                  {date}
                </span>
              </div>
            </div>

            {/* Victory Message */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '2px solid #10b981',
                borderRadius: '15px',
                padding: '20px',
                width: '100%',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#10b981',
                  textAlign: 'center',
                }}
              >
                ⚔️ ANOTHER BOSS FALLS! ⚔️
              </div>
            </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: '30px',
              fontSize: '16px',
              color: '#9ca3af',
              textAlign: 'center',
            }}
          >
            Join the hunt at eth-boss-tracker.vercel.app
          </div>
        </div>,
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    console.log(`Failed to generate image: ${e instanceof Error ? e.message : 'Unknown error'}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
