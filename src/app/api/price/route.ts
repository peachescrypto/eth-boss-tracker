import { NextResponse } from 'next/server';

interface PriceResponse {
  priceUsd: number;
  source: string;
  ts: number;
}

// In-memory cache
let cache: PriceResponse | null = null;
let cacheTime = 0;
const CACHE_DURATION = 10000; // 10 seconds

async function fetchFromCoinbase(): Promise<PriceResponse | null> {
  try {
    const response = await fetch('https://api.exchange.coinbase.com/products/ETH-USD/ticker', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3000)
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return {
      priceUsd: parseFloat(data.price),
      source: 'coinbase',
      ts: Date.now()
    };
  } catch (error) {
    console.error('Coinbase fetch error:', error);
    return null;
  }
}

async function fetchFromBinance(): Promise<PriceResponse | null> {
  try {
    const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3000)
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return {
      priceUsd: parseFloat(data.price),
      source: 'binance',
      ts: Date.now()
    };
  } catch (error) {
    console.error('Binance fetch error:', error);
    return null;
  }
}

async function fetchFromCoinGecko(): Promise<PriceResponse | null> {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return {
      priceUsd: data.ethereum.usd,
      source: 'coingecko',
      ts: Date.now()
    };
  } catch (error) {
    console.error('CoinGecko fetch error:', error);
    return null;
  }
}

async function getCurrentPrice(): Promise<PriceResponse> {
  // Check cache first
  if (cache && (Date.now() - cacheTime) < CACHE_DURATION) {
    return cache;
  }

  // Try providers in order
  const providers = [
    { name: 'Coinbase', fn: fetchFromCoinbase },
    { name: 'Binance', fn: fetchFromBinance },
    { name: 'CoinGecko', fn: fetchFromCoinGecko }
  ];

  for (const provider of providers) {
    const result = await provider.fn();
    if (result) {
      cache = result;
      cacheTime = Date.now();
      return result;
    }
  }

  // If all providers fail, return cached value or error
  if (cache) {
    return cache;
  }

  throw new Error('All price providers failed');
}

export async function GET() {
  try {
    const price = await getCurrentPrice();
    return NextResponse.json(price);
  } catch (error) {
    console.error('Price API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price' },
      { status: 500 }
    );
  }
} 