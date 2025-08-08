'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';

interface DailyHigh {
  date: string;
  high: number;
}

interface PriceData {
  priceUsd: number;
  source: string;
  ts: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

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

  // Load daily highs data
  useEffect(() => {
    fetch('/data/eth-daily-highs.json')
      .then(res => res.json())
      .then((data: DailyHigh[]) => {
        // Sort by high price ascending
        const sorted = [...data].sort((a, b) => a.high - b.high);
        setDailyHighs(sorted);
      })
      .catch(err => console.error('Failed to load daily highs:', err));
  }, []);

  if (dailyHighs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ETH boss tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ETH Boss Tracker</h1>
          <p className="text-gray-600 mb-4">
            Track ETH price progress against historic daily candle tops
          </p>
          
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

        {/* Daily Highs Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Daily Candle Tops (Sorted Low to High)</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
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
