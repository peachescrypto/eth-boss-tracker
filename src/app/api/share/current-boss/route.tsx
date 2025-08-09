import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get parameters from URL
    const bossName = searchParams.get('boss') || 'Unknown Boss';
    const bossLevel = searchParams.get('level') || '1';
    const targetPrice = searchParams.get('target') || '$4,000';
    const currentPrice = searchParams.get('current') || '$3,500';
    const progress = Math.min(100, Math.max(0, parseInt(searchParams.get('progress') || '50')));
    const hp = Math.min(100, Math.max(0, parseInt(searchParams.get('hp') || '50')));
    
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
            backgroundColor: '#0f0729',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          {/* Header */}
          <div
            style={{
              fontSize: '48px',
              fontWeight: '900',
              color: '#06b6d4',
              marginBottom: '40px',
              textAlign: 'center',
            }}
          >
            ETH BOSS HUNTER
          </div>

          {/* Boss Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              border: '2px solid #06b6d4',
              borderRadius: '20px',
              padding: '40px',
              minWidth: '600px',
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
                  display: 'flex',
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  marginBottom: '10px',
                  textAlign: 'center',
                }}
              >
                {bossName}
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: '18px',
                  color: '#06b6d4',
                  marginBottom: '5px',
                }}
              >
                Level {bossLevel}
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: '24px',
                  color: '#a855f7',
                  fontWeight: 'bold',
                }}
              >
                TARGET: {targetPrice}
              </div>
            </div>

            {/* HP Bar */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <span style={{ display: 'flex', color: '#ec4899', fontSize: '18px', fontWeight: 'bold' }}>
                  HP
                </span>
                <span style={{ display: 'flex', color: '#ffffff', fontSize: '18px', fontWeight: 'bold' }}>
                  {hp}/100
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '20px',
                  backgroundColor: '#1f2937',
                  borderRadius: '10px',
                  border: '1px solid #374151',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${hp}%`,
                    height: '100%',
                    background: hp > 0 
                      ? 'linear-gradient(to right, #ef4444, #f97316, #eab308)'
                      : '#374151',
                  }}
                />
              </div>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <span style={{ display: 'flex', color: '#06b6d4', fontSize: '18px', fontWeight: 'bold' }}>
                  PROGRESS
                </span>
                <span style={{ display: 'flex', color: '#ffffff', fontSize: '18px', fontWeight: 'bold' }}>
                  {progress}%
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '20px',
                  backgroundColor: '#1f2937',
                  borderRadius: '10px',
                  border: '1px solid #374151',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: progress >= 100
                      ? 'linear-gradient(to right, #10b981, #34d399)'
                      : 'linear-gradient(to right, #06b6d4, #3b82f6)',
                  }}
                />
              </div>
            </div>

            {/* Current Price */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid #06b6d4',
                borderRadius: '10px',
                padding: '15px 25px',
              }}
            >
              <span style={{ display: 'flex', color: '#06b6d4', fontSize: '16px', marginRight: '10px' }}>
                CURRENT ETH:
              </span>
              <span style={{ display: 'flex', color: '#ffffff', fontSize: '24px', fontWeight: 'bold' }}>
                {currentPrice}
              </span>
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
            eth-boss-tracker.vercel.app
          </div>
        </div>
      ),
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
