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

async function fetchFromCoinbase(minutesAgo?: number): Promise<PriceResponse | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    let url = 'https://api.exchange.coinbase.com/products/ETH-USD/ticker';
    
    // If minutesAgo is specified, use historical candles endpoint
    if (minutesAgo) {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - (minutesAgo * 60 * 1000));
      
      url = `https://api.exchange.coinbase.com/products/ETH-USD/candles?start=${startTime.toISOString()}&end=${endTime.toISOString()}&granularity=60`;
    }
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (minutesAgo) {
      // Historical candles data: [timestamp, open, high, low, close, volume]
      const candles = Array.isArray(data) ? data : [];
      if (candles.length > 0) {
        const [timestamp, open, high, low, close] = candles[candles.length - 1];
        return {
          priceUsd: parseFloat(close),
          source: 'coinbase',
          ts: timestamp * 1000 // Convert to milliseconds
        };
      }
      return null;
    } else {
      // Current ticker data
      return {
        priceUsd: parseFloat(data.price),
        source: 'coinbase',
        ts: Date.now()
      };
    }
  } catch (error) {
    console.error('Coinbase fetch error:', error);
    return null;
  }
}

async function fetchFromBinance(minutesAgo?: number): Promise<PriceResponse | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    let url = 'https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT';
    
    // If minutesAgo is specified, use historical klines endpoint
    if (minutesAgo) {
      const endTime = Date.now();
      const startTime = endTime - (minutesAgo * 60 * 1000);
      
      url = `https://api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=1m&startTime=${startTime}&endTime=${endTime}&limit=1`;
    }
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (minutesAgo) {
      // Historical klines data: [openTime, open, high, low, close, volume, closeTime, ...]
      const klines = Array.isArray(data) ? data : [];
      if (klines.length > 0) {
        const [openTime, open, high, low, close, volume, closeTime] = klines[klines.length - 1];
        return {
          priceUsd: parseFloat(close),
          source: 'binance',
          ts: parseInt(closeTime)
        };
      }
      return null;
    } else {
      // Current ticker data
      return {
        priceUsd: parseFloat(data.price),
        source: 'binance',
        ts: Date.now()
      };
    }
  } catch (error) {
    console.error('Binance fetch error:', error);
    return null;
  }
}

async function fetchFromCoinGecko(minutesAgo?: number): Promise<PriceResponse | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    let url = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
    
    // If minutesAgo is specified, use historical data endpoint
    if (minutesAgo) {
      const date = new Date(Date.now() - (minutesAgo * 60 * 1000));
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      url = `https://api.coingecko.com/api/v3/coins/ethereum/history?date=${dateString}`;
    }
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (minutesAgo) {
      // Historical data
      if (data.market_data && data.market_data.current_price && data.market_data.current_price.usd) {
        const date = new Date(Date.now() - (minutesAgo * 60 * 1000));
        const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        return {
          priceUsd: data.market_data.current_price.usd,
          source: 'coingecko',
          ts: new Date(dateString).getTime()
        };
      }
      return null;
    } else {
      // Current price data
      return {
        priceUsd: data.ethereum.usd,
        source: 'coingecko',
        ts: Date.now()
      };
    }
  } catch (error) {
    console.error('CoinGecko fetch error:', error);
    return null;
  }
}

async function getCurrentPrice(minutesAgo?: number): Promise<PriceResponse> {
  // Only use cache for current prices, not historical
  if (!minutesAgo && cache && (Date.now() - cacheTime) < CACHE_DURATION) {
    return cache;
  }

  // Try providers in order
  const providers = [
    { name: 'Coinbase', fn: () => fetchFromCoinbase(minutesAgo) },
    { name: 'Binance', fn: () => fetchFromBinance(minutesAgo) },
    { name: 'CoinGecko', fn: () => fetchFromCoinGecko(minutesAgo) }
  ];

  for (const provider of providers) {
    const result = await provider.fn();
    if (result) {
      // Only cache current prices, not historical
      if (!minutesAgo) {
        cache = result;
        cacheTime = Date.now();
      }
      return result;
    }
  }

  // If all providers fail, return cached value or error
  if (!minutesAgo && cache) {
    return cache;
  }

  throw new Error('All price providers failed');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const minutesAgo = searchParams.get('minutes_ago');
    
    if (minutesAgo) {
      const minutes = parseInt(minutesAgo);
      if (isNaN(minutes) || minutes < 0) {
        return NextResponse.json(
          { error: 'Invalid minutes_ago parameter. Must be a positive number.' },
          { status: 400 }
        );
      }
      
      // Fetch historical price from exchanges
      const price = await getCurrentPrice(minutes);
      return NextResponse.json(price);
    }
    
    // Fetch current price
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