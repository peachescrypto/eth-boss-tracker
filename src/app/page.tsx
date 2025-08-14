'use client';

import { useEffect, useState, useRef } from 'react';
import useSWR from 'swr';
import { CarouselCard } from '@/components/CarouselCard';
import { PriceBar } from '@/components/PriceBar';
import { BossDetailCard } from '@/components/BossDetailCard';
import { generateTwitterShareText } from '@/lib/share-cards';

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
  const hasInitialScroll = useRef(false);
  
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

  // Auto-scroll to current boss in carousel (only once on initial load)
  useEffect(() => {
    if (dailyHighs.length > 0 && priceData && carouselRef.current && !hasInitialScroll.current) {
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
        // Mark that we've done the initial scroll
        hasInitialScroll.current = true;
        
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
              The final battle has begun. ETH has crossed the legendary 4K barrier, and the path to All-Time High is now in sight. But between here and glory stand {dailyHighs.length} powerful Bosses — each one guarding a weekly candle on the climb.
            </p>
          </div>
          
          {/* Current Battle Header */}
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
              <div className="text-center mb-8">
                {/* Share Buttons */}
                <div className="flex justify-center gap-3 pb-10">
                  <button
                    onClick={() => {
                      const twitterText = generateTwitterShareText('current', {
                        bossName: currentBoss.name || `Boss #${currentBossIndex + 1}`,
                        bossLevel: currentBossIndex + 1,
                        targetPrice: formatPrice(currentBoss.high),
                        currentPrice: formatPrice(priceData?.priceUsd || 0),
                        progress: Math.round(progress * 100),
                        hp: currentHP,
                        image: currentBoss.image,
                      });
                      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(window.location.href)}`;
                      window.open(twitterUrl, '_blank');
                    }}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Share on X
                  </button>
                </div>

                <h2 className="text-3xl font-bold text-cyan-400 tracking-wide mb-4">
                  🔥 CURRENT BATTLE 🔥
                </h2>
              </div>
            );
          })()}
          
          {/* Price Bar */}
          {(() => {
            const currentBossIndex = dailyHighs.findIndex(boss => 
              !priceData || priceData.priceUsd < boss.high
            );
            const currentBoss = currentBossIndex >= 0 ? dailyHighs[currentBossIndex] : dailyHighs[dailyHighs.length - 1];
            const previousHigh = currentBossIndex > 0 ? dailyHighs[currentBossIndex - 1].high : 0;
            const progress = priceData 
              ? calculateProgress(priceData.priceUsd, previousHigh, currentBoss.high)
              : 0;
            
            return (
              <PriceBar
                switchOutPrice={previousHigh}
                targetPrice={currentBoss.high}
                progress={progress}
                priceError={priceError}
                priceData={priceData || null}
              />
            );
          })()}
          
          {/* Boss Detail Card */}
          {(() => {
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
              <BossDetailCard
                boss={currentBoss}
                index={currentBossIndex}
                isComplete={false}
                isFutureBoss={false}
                hp={currentHP}
                progress={progress}
              />
            );
          })()}
          
          {/* X Follow CTA */}
          <div className="text-center mb-12 pt-10">
            <a 
              href="https://twitter.com/ethbosshunter" 
            target="_blank"
            rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white font-bold text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-gray-500/30 hover:shadow-gray-400/50"
          >
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Follow @ETHBossHunter on X
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
                    const isComplete = Boolean(priceData && priceData.priceUsd >= boss.high);
                    const hp = Math.max(0, Math.round((1 - progress) * 100));
                    
                    // Determine if this is the current boss (first incomplete boss)
                    const isCurrentBoss = Boolean(!isComplete && dailyHighs.slice(0, index).every(prevBoss => 
                      Boolean(priceData && priceData.priceUsd >= prevBoss.high)
                    ));
                    
                    // Determine if this is a future boss (after current boss)
                    const isFutureBoss = Boolean(!isComplete && !isCurrentBoss);
                    
                                return (
              <CarouselCard
                key={boss.date}
                boss={boss}
                index={index}
                isCurrentBoss={isCurrentBoss}
                isComplete={isComplete}
                isFutureBoss={isFutureBoss}
                progress={progress}
                hp={hp}
              />
            );
                  })}
                </div>
              </div>
              
              {/* Scroll indicators */}
              <div className="flex justify-center mt-6 space-x-2">
                <div className="text-cyan-400 text-sm">← Swipe to explore bosses →</div>
              </div>
            </div>

            {/* X Follow CTA */}
          <div className="text-center mb-12 pt-10">
            <a 
              href="https://twitter.com/ethbosshunter" 
            target="_blank"
            rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white font-bold text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-gray-500/30 hover:shadow-gray-400/50"
          >
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Follow @ETHBossHunter on X
          </a>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
