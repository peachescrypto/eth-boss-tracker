import React from 'react';

interface BossDetailCardProps {
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
}

export const BossDetailCard: React.FC<BossDetailCardProps> = ({
  boss,
  index,
  isFutureBoss,
  hp,
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

  // Generate lore based on boss tier
  const generateLore = () => {
    // Use custom lore if available in the JSON data
    if (boss.lore) {
      return boss.lore;
    }

    if (isFutureBoss) {
      return `A mysterious force awaits at ${formatPrice(boss.high)}. This boss represents the weekly high from ${formatDate(boss.date)}. Will ETH have the strength to overcome this challenge when the time comes?`;
    }

    return `The battle against ${boss.name} has begun. This boss guards the weekly high of ${formatPrice(boss.high)} from ${formatDate(boss.date)}. The journey to defeat this foe has just started.`;
  };

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(168, 85, 247, 0.4)',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(168, 85, 247, 0.3)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          padding: '40px',
          gap: '40px',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        {/* Boss Card Section */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', flex: '0 0 auto' }}>
          {/* Glow Effect */}
          <div
            style={{
              position: 'absolute',
              width: '320px',
              height: '460px',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: 'linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6)',
              filter: 'blur(20px)',
              opacity: 0.75,
              animation: 'pulse 2s infinite',
            }}
          />

          {/* Simple Boss Card */}
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
            {boss.image ? (
              <img
                src={boss.image}
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

            {/* Boss Info */}
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

        {/* Info Section */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            justifyContent: 'center',
            flex: '1',
            maxWidth: '500px',
          }}
        >
          {/* Spawn Date */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '12px',
              padding: '12px 16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#a855f7', marginBottom: '4px' }}>
                  SPAWN DATE
                </span>
                <span style={{ color: 'white', fontSize: '14px' }}>
                  {formatDate(boss.date)}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981' }}>
                  {formatPrice(boss.high)}
                </span>
              </div>
            </div>
          </div>

          {/* Lore */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '12px',
              padding: '24px',
              flex: 1,
              minHeight: '280px',
              overflow: 'visible',
              maxWidth: '100%',
            }}
          >
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#a855f7', marginBottom: '12px', display: 'block' }}>
              LORE
            </span>
            <span style={{
              color: 'white',
              fontSize: '16px',
              lineHeight: '1.4',
              display: 'block',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto',
              maxWidth: '100%',
              padding: '8px 0'
            }}>
              {generateLore()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
