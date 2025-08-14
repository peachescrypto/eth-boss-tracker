import React from 'react';

interface PriceBarProps {
  switchOutPrice: number;
  targetPrice: number;
  progress: number;
  priceError: boolean;
  priceData: {
    priceUsd: number;
    source: string;
    ts: number;
  } | null;
}

export const PriceBar: React.FC<PriceBarProps> = ({
  switchOutPrice,
  targetPrice,
  progress,
  priceError,
  priceData
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 mb-8 shadow-xl shadow-purple-500/20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Switch Out Price */}
        <div className="text-center">
          <p className="text-green-300 text-lg mb-2 font-semibold">SWITCH OUT</p>
          <p className="text-3xl font-bold text-white">
            {formatPrice(switchOutPrice)}
          </p>
        </div>

        {/* Current Price */}
        <div className="text-center">
          <p className="text-cyan-300 text-lg mb-2 font-semibold">CURRENT PRICE</p>
          {priceError ? (
            <p className="text-red-400 text-xl">Failed to fetch</p>
          ) : priceData ? (
            <div>
              <p className="text-3xl font-bold text-white">
                {formatPrice(priceData.priceUsd)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {priceData.source} • {new Date(priceData.ts).toLocaleTimeString()}
              </p>
            </div>
          ) : (
            <p className="text-gray-400 text-xl">Loading...</p>
          )}
        </div>

        {/* Target Price */}
        <div className="text-center">
          <p className="text-purple-300 text-lg mb-2 font-semibold">TARGET</p>
          <p className="text-3xl font-bold text-white">
            {formatPrice(targetPrice)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-cyan-300 text-sm font-semibold">PROGRESS</span>
          <span className="text-white text-sm font-bold">
            {Math.round(progress * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-4 border border-gray-600">
          <div 
            className="h-4 rounded-full transition-all duration-500 shadow-lg bg-gradient-to-r from-cyan-500 to-blue-500 shadow-cyan-500/50"
            style={{ width: `${Math.round(progress * 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
