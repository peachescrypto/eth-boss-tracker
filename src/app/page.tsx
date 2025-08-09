'use client';

import { useEffect, useState, useRef } from 'react';
import useSWR from 'swr';

interface DailyHigh {
  date: string;
  high: number;
  name?: string;
  image?: string;
}

interface PriceData {
  priceUsd: number;
  source: string;
  ts: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

// const MIN_PRICE = 4000; // Used in original design, kept for reference

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function calculateProgress(currentPrice: number, previousHigh: number, targetHigh: number): number {
  if (targetHigh === previousHigh) {
    return currentPrice >= targetHigh ? 1 : 0;
  }
  
  const progress = (currentPrice - previousHigh) / (targetHigh - previousHigh);
  return Math.max(0, Math.min(1, progress));
}

export default function Home() {
  const [dailyHighs, setDailyHighs] = useState<DailyHigh[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Fetch current price every 15 seconds
  const { data: priceData, error: priceError } = useSWR<PriceData>('/api/price', fetcher, {
    refreshInterval: 15000,
    revalidateOnFocus: true
  });

  // Load weekly highs data
  useEffect(() => {
    fetch('/eth-weekly-highs.json')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: DailyHigh[]) => {
        // Sort by high price ascending
        const sorted = [...data].sort((a, b) => a.high - b.high);
        setDailyHighs(sorted);
      })
      .catch(err => {
        console.error('Failed to load weekly highs:', err);
        // Set some fallback data to prevent infinite loading
        setDailyHighs([]);
      });
  }, []);

  // Auto-scroll to current boss in carousel
  useEffect(() => {
    if (dailyHighs.length > 0 && priceData && carouselRef.current) {
      // Find current boss index
      let currentBossIndex = -1;
      for (let i = 0; i < dailyHighs.length; i++) {
        const isComplete = priceData.priceUsd >= dailyHighs[i].high;
        if (!isComplete) {
          // Check if all previous bosses are defeated
          const allPreviousDefeated = dailyHighs.slice(0, i).every(prevBoss => 
            priceData.priceUsd >= prevBoss.high
          );
          if (allPreviousDefeated) {
            currentBossIndex = i;
            break;
          }
        }
      }
      
      if (currentBossIndex >= 0) {
        // Delay to ensure DOM is fully rendered and cards have settled
        setTimeout(() => {
          if (carouselRef.current) {
            const carousel = carouselRef.current;
            const carouselWidth = carousel.clientWidth;
            const scrollContainer = carousel.querySelector('div[style*="max-content"]') as HTMLElement;
            
            if (scrollContainer) {
              const cards = scrollContainer.children;
              if (cards[currentBossIndex]) {
                const currentCard = cards[currentBossIndex] as HTMLElement;
                
                // Get the card's position relative to the scroll container
                const cardLeft = currentCard.offsetLeft;
                const cardWidth = currentCard.offsetWidth;
                
                // Calculate scroll position to center the card
                const cardCenter = cardLeft + (cardWidth / 2);
                const scrollPosition = cardCenter - (carouselWidth / 2);
                
                // Center the current boss in the carousel
                
                carousel.scrollTo({
                  left: Math.max(0, scrollPosition),
                  behavior: 'smooth'
                });
              }
            }
          }
        }, 300);
      }
    }
  }, [dailyHighs, priceData]);

  if (dailyHighs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-100">Loading ETH Boss Hunter...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative">
      {/* Fixed neon gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
      <div className="fixed inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
      
      {/* Floating content */}
      <div className="relative z-10 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Hero Banner */}
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tight font-sans bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              ETH BOSS HUNTER
            </h1>
            <p className="text-xl md:text-2xl text-cyan-100 mb-8 max-w-4xl mx-auto leading-relaxed font-light">
              The final battle has begun. ETH has crossed the legendary 4K barrier, and the path to All-Time High is now in sight. But between here and glory stand 18 powerful Bosses — each one guarding a weekly candle on the climb.
            </p>
          </div>
          
          {/* Current Fight Section */}
          {(() => {
            // Find current boss (first boss not yet defeated)
            const currentBossIndex = dailyHighs.findIndex(boss => 
              !priceData || priceData.priceUsd < boss.high
            );
            const currentBoss = currentBossIndex >= 0 ? dailyHighs[currentBossIndex] : dailyHighs[dailyHighs.length - 1];
            const previousHigh = currentBossIndex > 0 ? dailyHighs[currentBossIndex - 1].high : 0;
            const progress = priceData 
              ? calculateProgress(priceData.priceUsd, previousHigh, currentBoss.high)
              : 0;
            const currentHP = Math.max(0, Math.round((1 - progress) * 100));
            
            return (
              <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-8 mb-12 shadow-2xl shadow-cyan-500/20">
                <h2 className="text-3xl font-bold text-center text-cyan-400 mb-8 tracking-wide">
                  🔥 CURRENT BATTLE 🔥
                </h2>
                
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Boss Image and Info */}
                  <div className="text-center">
                    <div className="relative inline-block mb-6">
                      <div className="absolute -inset-4 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-full blur-lg opacity-75 animate-pulse"></div>
                      <div className="relative">
                        {currentBoss.image ? (
                          <img 
                            className="w-60 max-h-90 rounded-lg object-contain border-2 border-cyan-400/50 shadow-lg shadow-cyan-400/50" 
                            src={currentBoss.image} 
                            alt={currentBoss.name || 'Current Boss'} 
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentBoss.name || 'Boss')}&background=gradient&color=fff&size=192`;
                            }}
                          />
                        ) : (
                          <div className="w-32 h-40 md:w-48 md:h-60 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-4xl border-2 border-cyan-400/50">
                            {(currentBoss.name || 'B').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {currentBoss.name || `Boss #${currentBossIndex + 1}`}
                    </h3>
                    <p className="text-cyan-300 text-lg">Level {currentBossIndex + 1} of {dailyHighs.length}</p>
                    <p className="text-pink-300 text-sm mt-1">{formatDate(currentBoss.date)}</p>
                  </div>
                  
                  {/* Battle Stats */}
                  <div className="space-y-6">
                    {/* ETH Price */}
                    <div className="text-center">
                      <p className="text-cyan-300 text-lg mb-2">ETH PRICE</p>
                      {priceError ? (
                        <p className="text-red-400 text-lg">Failed to fetch price</p>
                      ) : priceData ? (
                        <p className="text-4xl md:text-5xl font-bold text-white">
                          {formatPrice(priceData.priceUsd)}
                        </p>
                      ) : (
                        <p className="text-gray-400 text-xl">Loading...</p>
                      )}
                      {priceData && (
                        <p className="text-xs text-gray-400 mt-1">
                          {priceData.source} • {new Date(priceData.ts).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                    
                    {/* Boss HP */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-pink-300 text-lg font-semibold">BOSS HP</span>
                        <span className="text-white text-lg font-bold">{currentHP}/100</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-4 border border-gray-600">
                        <div 
                          className="h-4 rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 transition-all duration-500 shadow-lg shadow-red-500/50"
                          style={{ width: `${currentHP}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Target Price */}
                    <div className="text-center">
                      <p className="text-purple-300 text-lg mb-1">TARGET PRICE</p>
                      <p className="text-2xl md:text-3xl font-bold text-purple-400">
                        {formatPrice(currentBoss.high)}
                      </p>
                    </div>
                    
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-cyan-300 text-lg font-semibold">BATTLE PROGRESS</span>
                        <span className="text-white text-lg font-bold">{Math.round(progress * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-4 border border-gray-600">
                        <div 
                          className="h-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 shadow-lg shadow-cyan-500/50"
                          style={{ width: `${Math.round(progress * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
          
          {/* Twitter Follow CTA */}
          <div className="text-center mb-12">
            <a 
              href="https://twitter.com/ethbosshunter" 
            target="_blank"
            rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50"
            >
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Follow @ETHBossHunter
            </a>
          </div>

          {/* Boss Carousel */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center text-white mb-2">
              ⚔️ ALL BOSSES ⚔️
            </h2>
            <p className="text-center text-cyan-300 mb-8">
              {dailyHighs.length} epic bosses guard the path to victory • Swipe to explore
            </p>
            
            <div className="relative">
              {/* Carousel container */}
              <div ref={carouselRef} className="overflow-x-auto scrollbar-hide h-200">
                <div className="flex space-x-6 px-4 py-8" style={{ width: 'max-content' }}>
                  {dailyHighs.map((boss, index) => {
                    const previousHigh = index > 0 ? dailyHighs[index - 1].high : 0;
                    const progress = priceData 
                      ? calculateProgress(priceData.priceUsd, previousHigh, boss.high)
                      : 0;
                    const isComplete = priceData && priceData.priceUsd >= boss.high;
                    const hp = Math.max(0, Math.round((1 - progress) * 100));
                    
                    // Determine if this is the current boss (first incomplete boss)
                    const isCurrentBoss = !isComplete && dailyHighs.slice(0, index).every(prevBoss => 
                      priceData && priceData.priceUsd >= prevBoss.high
                    );
                    
                    // Determine if this is a future boss (after current boss)
                    const isFutureBoss = !isComplete && !isCurrentBoss;
                    
                    return (
                      <div 
                        key={boss.date} 
                        className={`flex-none transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                          isCurrentBoss 
                            ? 'w-96 bg-black/60 backdrop-blur-md border-2 border-cyan-400 rounded-2xl p-8 shadow-2xl shadow-cyan-400/40 scale-110 transform' 
                            : isComplete 
                              ? 'w-80 bg-black/30 backdrop-blur-sm border border-green-400/30 rounded-2xl p-6 shadow-lg shadow-green-400/10 opacity-75' 
                              : 'w-80 bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 shadow-lg shadow-purple-500/20'
                        }`}
                      >
                        {/* Boss Image - Hero Element */}
                        <div className="relative mb-6">
                          <div className={`absolute -inset-2 rounded-full blur-lg opacity-75 ${
                            isCurrentBoss
                              ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-pulse' 
                              : isComplete 
                                ? 'bg-gradient-to-r from-green-400 to-emerald-400' 
                                : 'bg-gradient-to-r from-gray-600 to-gray-500'
                          }`}></div>
                          <div className="relative">
                            {isFutureBoss ? (
                              // Future boss - use card-reverse with thick white border
                              <img 
                                className="mx-auto rounded-lg object-contain w-20 max-h-40 border-4 border-grey shadow-lg shadow-white/50"
                                src="/images/card-reverse.png" 
                                alt="Mystery Boss" 
                              />
                            ) : boss.image ? (
                              <img 
                                className={`mx-auto rounded-lg object-contain border-2 shadow-lg ${
                                  isCurrentBoss
                                    ? 'w-32 max-h-48 border-cyan-400 shadow-cyan-400/70' 
                                    : isComplete 
                                      ? 'w-20 max-h-40 border-green-400/70 shadow-green-400/50' 
                                      : 'w-20 max-h-40 border-gray-500/50 shadow-gray-500/30'
                                }`}
                                src={boss.image} 
                                alt={boss.name || 'Boss'} 
                                onError={(e) => {
                                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(boss.name || 'Boss')}&background=gradient&color=fff&size=128`;
                                }}
                              />
                            ) : (
                              <div className={`mx-auto rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-3xl border-2 ${
                                isCurrentBoss
                                  ? 'w-40 h-48 border-cyan-400' 
                                  : isComplete 
                                    ? 'w-32 h-40 border-green-400/70' 
                                    : 'w-32 h-40 border-gray-500/50'
                              }`}>
                                {(boss.name || 'B').charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          {/* Status Badge */}
                          {isCurrentBoss ? (
                            <div className="absolute -top-2 -right-2 bg-cyan-500 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-cyan-400 shadow-lg animate-pulse">
                              ⚔️ CURRENT
                            </div>
                          ) : isComplete && (
                            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-green-400 shadow-lg">
                              ✓ DEFEATED
                            </div>
                          )}
                        </div>
                        
                        {/* Boss Info */}
                        <div className="text-center mb-4">
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
                    );
                  })}
                </div>
              </div>
              
              {/* Scroll indicators */}
              <div className="flex justify-center mt-6 space-x-2">
                <div className="text-cyan-400 text-sm">← Swipe to explore bosses →</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
