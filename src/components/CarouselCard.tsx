import React from 'react';
import { BossCard } from './BossCard';

interface CarouselCardProps {
  boss: {
    name?: string;
    high: number;
    date: string;
    image?: string;
    tier?: string;
  };
  index: number;
  isCurrentBoss: boolean;
  isComplete: boolean;
  isFutureBoss: boolean;
  progress: number;
  hp: number;
  className?: string;
  style?: React.CSSProperties;
}

export const CarouselCard: React.FC<CarouselCardProps> = ({
  boss,
  index,
  isCurrentBoss,
  isComplete,
  isFutureBoss,
  progress,
  hp,
  className = '',
  style = {}
}) => {
  // Calculate card dimensions based on status
  const cardWidth = isCurrentBoss ? 'w-96' : 'w-80';
  const cardPadding = isCurrentBoss ? 'p-8' : 'p-6';
  
  // Border and shadow styles based on status
  const getCardStyles = () => {
    if (isCurrentBoss) {
      return 'bg-black/60 backdrop-blur-md border-4 border-cyan-400 shadow-2xl shadow-cyan-400/40 scale-110 transform';
    } else if (isComplete) {
      return 'bg-black/30 backdrop-blur-sm border-2 border-green-400/30 shadow-lg shadow-green-400/10 opacity-75';
    } else {
      return 'bg-black/40 backdrop-blur-sm border-2 border-purple-500/30 shadow-lg shadow-purple-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
      className={`flex-none transition-all duration-300 hover:scale-105 hover:shadow-2xl ${cardWidth} ${cardPadding} ${getCardStyles()} ${className}`}
      style={style}
    >
      {/* Trading Card Container */}
      <div className="relative w-full h-full">
        {/* Use BossCard for the image and overlay */}
        <BossCard
          boss={boss}
          index={index}
          isFutureBoss={isFutureBoss}
          hp={hp}
        />
        
        {/* Status Badge */}
        {isCurrentBoss ? (
          <div></div>
        ) : isComplete && (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-green-400 shadow-lg z-20">
            ✓ DEFEATED
          </div>
        )}
        
        {/* Boss Info */}
        <div className="text-center mb-4 mt-6">
          <h3 className="text-xl font-bold text-white mb-1">
            {boss.name || `Boss #${index + 1}`}
          </h3>
          <p className="text-cyan-300 text-sm mb-1">Level {index + 1}</p>
          <p className="text-gray-400 text-xs">{formatDate(boss.date)}</p>
        </div>
        
        {/* Target Price */}
        <div className="text-center mb-4">
          <p className="text-purple-300 text-sm mb-1">TARGET</p>
          <p className="text-2xl font-bold text-white">
            {formatPrice(boss.high)}
          </p>
        </div>
        
        {/* HP Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-pink-300 text-sm font-semibold">HP</span>
            <span className="text-white text-sm font-bold">
              {isComplete ? '0' : hp}/100
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 border border-gray-600">
            <div 
              className={`h-3 rounded-full transition-all duration-500 shadow-lg ${
                isComplete 
                  ? 'bg-gray-600' 
                  : 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 shadow-red-500/50'
              }`}
              style={{ width: `${isComplete ? 0 : hp}%` }}
            ></div>
          </div>
        </div>
        
        {/* Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-cyan-300 text-sm font-semibold">PROGRESS</span>
            <span className="text-white text-sm font-bold">
              {Math.round(progress * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 border border-gray-600">
            <div 
              className={`h-3 rounded-full transition-all duration-500 shadow-lg ${
                isComplete 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-500/50' 
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-cyan-500/50'
              }`}
              style={{ width: `${Math.round(progress * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
