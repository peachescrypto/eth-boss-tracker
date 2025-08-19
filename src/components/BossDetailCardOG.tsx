import React from 'react';

interface BossDetailCardOGProps {
  boss: {
    name?: string;
    high: number;
    date: string;
    image?: string;
    tier?: string;
    lore?: string;
  };
  index: number;
  isFutureBoss: boolean;
  hp: number;
  imageData?: string | null;
}

export const BossDetailCardOG: React.FC<BossDetailCardOGProps> = ({
  boss,
  index,
  hp,
  imageData,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
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
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          border: '2px solid rgba(168, 85, 247, 0.4)',
          borderRadius: '24px',
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
                alt={boss.name || 'Boss'}
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
                {(boss.name || 'B').charAt(0).toUpperCase()}
              </div>
            )}

            {/* Boss Info - Below Image */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                width: '100%',
                marginTop: '12px',
                padding: '8px',
                background: 'rgba(0, 0, 0, 0.7)',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ color: '#a855f7', fontSize: '14px', fontWeight: 'bold' }}>
                  {boss.tier || 'COMMON'}
                </span>
                <span style={{ color: '#9ca3af', fontSize: '10px' }}>
                  Level {index + 1}/18
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ color: '#a855f7', fontSize: '14px', fontWeight: 'bold' }}>
                  {hp} HP
                </span>
                <span style={{ color: '#9ca3af', fontSize: '10px' }}>
                  {formatDate(boss.date)}
                </span>
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ color: '#a855f7', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                SPAWN DATE
              </span>
              <span style={{ color: 'white', fontSize: '16px' }}>
                {formatDate(boss.date)}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ color: '#10b981', fontSize: '48px', fontWeight: 'bold' }}>
                {formatPrice(boss.high)}
              </span>
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
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ color: '#a855f7', fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', display: 'block' }}>
              LORE
            </span>
            <span style={{ color: 'white', fontSize: '14px', lineHeight: '1.4', display: 'block' }}>
              {boss.lore || `The battle against ${boss.name} has begun. This boss guards the weekly high of ${formatPrice(boss.high)} from ${formatDate(boss.date)}. The journey to defeat this foe has just started.`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};