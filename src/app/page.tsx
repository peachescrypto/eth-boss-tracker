'use client';

import { useEffect, useState } from 'react';
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

const MIN_PRICE = 4000;

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

  if (dailyHighs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ETH boss hunter...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ETH Boss Hunter</h1>
          <p className="text-gray-600 mb-4">
          Welcome to ETH Boss Hunter.   
          
          The final battle has begun. ETH has crossed the legendary 4K barrier, and the path to All-Time High is now in sight. But between here and glory stand 18 powerful Bosses — each one guarding a weekly candle on the climb.          </p>
          
          {/* Current Price Display */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Current ETH Price</h2>
                {priceError ? (
                  <p className="text-red-600 text-sm">Failed to fetch price</p>
                ) : priceData ? (
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPrice(priceData.priceUsd)}
                  </p>
                ) : (
                  <p className="text-gray-500">Loading...</p>
                )}
              </div>
              {priceData && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Source: {priceData.source}</p>
                  <p className="text-xs text-gray-400">
                    Updated: {new Date(priceData.ts).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Highs Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Weekly Boss Levels (Sorted Low to High)</h2>
            <p className="text-sm text-gray-600 mt-1">{dailyHighs.length} weekly highs above ${MIN_PRICE.toLocaleString()}</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Boss
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    High Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dailyHighs.map((high, index) => {
                  const previousHigh = index > 0 ? dailyHighs[index - 1].high : 0;
                  const progress = priceData 
                    ? calculateProgress(priceData.priceUsd, previousHigh, high.high)
                    : 0;
                  const isComplete = priceData && priceData.priceUsd >= high.high;
                  
                  return (
                    <tr key={high.date} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {high.image ? (
                              <img 
                                className="h-10 w-10 rounded-full object-cover" 
                                src={high.image} 
                                alt={high.name || 'Boss'} 
                                onError={(e) => {
                                  // Use placeholder if image fails to load
                                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(high.name || 'Boss')}&background=random&color=fff&size=40`;
                                }}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                                {(high.name || 'B').charAt(0).toUpperCase()}
                              </div>
                            )}</div>
                          <div className={high.image ? "ml-4" : ""}>
                            <div className="text-sm font-medium text-gray-900">
                              {high.name || `Boss #${index + 1}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              Level {index + 1}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(high.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatPrice(high.high)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                isComplete ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${Math.round(progress * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500 min-w-[3rem]">
                            {Math.round(progress * 100)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
