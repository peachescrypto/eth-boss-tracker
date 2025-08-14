import React from 'react';
import { BossCard } from './BossCard';

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
    <div className="bg-black/40 backdrop-blur-sm border border-purple-500/40 rounded-2xl shadow-2xl shadow-purple-500/30 min-h-[600px] lg:aspect-[1.91/1] lg:h-auto">
      <div className="grid md:grid-cols-2 p-20 gap-20 md:gap-8 items-start md:items-center h-full">
        {/* Boss Card Section */}
        <div className="flex justify-center relative">
          {/* Glow Effect - positioned behind the BossCard */}
          <div className="absolute rounded-full blur-lg opacity-75 animate-pulse z-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" style={{ width: '320px', height: '460px', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}></div>
          
          <BossCard
            boss={boss}
            index={index}
            isFutureBoss={isFutureBoss}
            hp={hp}
            style={{ transform: 'scale(1.2)' }}
          />
        </div>
        
        {/* Info Section */}
        <div className="space-y-4 h-full flex flex-col justify-start md:justify-center">
          {/* Spawn Date */}
                         <div className="bg-black/30 backdrop-blur-sm border border-purple-400/30 rounded-xl p-4">
               <div className="flex justify-between items-start">
                 <div>
                   <h3 className="text-lg font-bold text-purple-300 mb-2">SPAWN DATE</h3>
                   <p className="text-white text-base">
                   {formatDate(boss.date)}
                   </p>
                 </div>
                 <div className="text-right">
                   <h1 className="text-6xl font-bold text-green-300">
                   {formatPrice(boss.high)}
                   </h1>
                 </div>
               </div>
             </div>
          
          {/* Lore */}
          <div className="bg-black/30 backdrop-blur-sm border border-purple-400/30 rounded-xl p-4 flex-1">
            <h3 className="text-lg font-bold text-purple-300 mb-2">LORE</h3>
            <p className="text-white text-3xl ">
              {generateLore()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
