import React from 'react';
import Image from 'next/image';

interface BossCardProps {
  boss: {
    name?: string;
    high: number;
    date: string;
    image?: string;
    tier?: string;
  };
  index: number;
  isFutureBoss: boolean;
  hp: number;
  className?: string;
  style?: React.CSSProperties;
}

export const BossCard: React.FC<BossCardProps> = ({
  boss,
  index,
  isFutureBoss,
  hp,
  className = '',
  style = {}
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div 
      className={`relative flex justify-center ${className}`}
      style={style}
    >
      
      {/* Background Gradient Border */}
      <div className="relative w-60 max-h-96 rounded-lg z-10" style={{ 
        background: 'linear-gradient(to right, #fecaca, #6b7280, #4b5563)',
        padding: '8px'
      }}>
        
        {/* Image Container */}
        <div className="relative w-full h-full rounded-lg z-10 bg-transparent">
          {/* Blurred Overlay at Top */}
          <div className="absolute top-0 left-0 right-0 backdrop-blur-md rounded-t-lg p-0.5 z-10">
                          <div className="flex justify-between items-center">
                {/* Tier - Left aligned */}
                <div className="text-left ml-2">
                  <div className="font-bold text-purple-300 text-lg leading-tight">{boss.tier || 'COMMON'}</div>
                  <div className="font-bold text-gray-300 text-[8px] leading-tight">{formatDate(boss.date)}</div>
                </div>

                {/* HP */}    
                <div className="text-right mr-2">
                  <div className="font-bold text-purple-300 text-lg leading-tight">{hp.toFixed(0)}</div>
                  <div className="font-bold text-gray-300 text-[8px] leading-tight">HP</div>
                </div>
              </div>
          </div>

          {/* Level */}  
          <div className="absolute bottom-1 left-1 backdrop-blur-md rounded-lg p-1 z-10">
            <div className="text-white text-[8px]">
                <div className="font-bold text-white">{index+1}</div>
            </div>
          </div>

          {/* Boss Image */}
          <div className="relative">
            <div className="relative">
              {isFutureBoss ? (
                // Future boss - use card-reverse with thick white border
                <Image 
                  className="mx-auto rounded-lg object-contain w-full max-h-96 border-4 border-gray-400 shadow-lg shadow-white/50"
                  src="/images/card-reverse.png" 
                  alt="Mystery Boss" 
                  width={240}
                  height={360}
                />
              ) : boss.image ? (
                <Image 
                  className="mx-auto rounded-lg object-contain w-full max-h-96 shadow-lg"
                  src={boss.image} 
                  alt={boss.name || 'Boss'} 
                  width={240}
                  height={360}
                  onError={() => {
                    // Fallback handled by Next.js Image component
                  }}
                />
              ) : (
                <div className="mx-auto rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-3xl border-2 w-full max-h-96 shadow-lg">
                  {(boss.name || 'B').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
