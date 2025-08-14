import { NextResponse } from 'next/server';
import { checkAndPostBossDefeats } from '@/lib/twitter';

interface PriceData {
  priceUsd: number;
  source: string;
  ts: number;
}

export async function POST() {
  try {
    // Use the public URL instead of the internal Vercel URL
    const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://eth-boss-tracker.vercel.app'
    : 'http://localhost:3000';

    console.log('🔍 Starting boss defeat check...');
    console.log('🌐 Using base URL:', baseUrl);

    // Get current ETH price
    console.log('📊 Fetching current price...');
    const currentPriceResponse = await fetch(`${baseUrl}/api/price`);
    console.log('📡 Current price response status:', currentPriceResponse.status);
    
    if (!currentPriceResponse.ok) {
      const errorText = await currentPriceResponse.text();
      console.error('❌ Current price fetch failed:', errorText);
      throw new Error(`Failed to fetch current price: ${currentPriceResponse.status} - ${errorText}`);
    }
    
    const currentPriceData: PriceData = await currentPriceResponse.json();
    const currentPrice = currentPriceData.priceUsd;
    console.log('💰 Current price:', currentPrice);

    // Get price 15 minutes ago
    console.log('📊 Fetching price from 15 minutes ago...');
    const lastPriceResponse = await fetch(`${baseUrl}/api/price?minutes_ago=15`);
    console.log('📡 Last price response status:', lastPriceResponse.status);
    
    if (!lastPriceResponse.ok) {
      const errorText = await lastPriceResponse.text();
      console.error('❌ Last price fetch failed:', errorText);
      throw new Error(`Failed to fetch last price: ${lastPriceResponse.status} - ${errorText}`);
    }
    
    const lastPriceData: PriceData = await lastPriceResponse.json();
    const lastPrice = lastPriceData.priceUsd;
    console.log('💰 Last price:', lastPrice);

    // Check for boss defeats and post tweets
    console.log('⚔️ Checking for boss defeats...');
    const result = await checkAndPostBossDefeats(currentPrice, lastPrice);
    console.log('✅ Boss defeat check completed:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('💥 Boss defeat detection error:', error);
    return NextResponse.json({
      error: 'Failed to check for boss defeats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint for manual checking/testing
export async function GET() {
  try {
    // Use the public URL instead of the internal Vercel URL
    const baseUrl = 'https://eth-boss-tracker.vercel.app';

    // Get current ETH price
    const currentPriceResponse = await fetch(`${baseUrl}/api/price`);
    if (!currentPriceResponse.ok) {
      throw new Error('Failed to fetch current price');
    }
    const currentPriceData: PriceData = await currentPriceResponse.json();
    const currentPrice = currentPriceData.priceUsd;

    // Get price 15 minutes ago
    const lastPriceResponse = await fetch(`${baseUrl}/api/price?minutes_ago=15`);
    if (!lastPriceResponse.ok) {
      throw new Error('Failed to fetch last price');
    }
    const lastPriceData: PriceData = await lastPriceResponse.json();
    const lastPrice = lastPriceData.priceUsd;

    return NextResponse.json({
      currentPrice,
      lastPrice,
      priceDifference: currentPrice - lastPrice,
      currentPriceData,
      lastPriceData
    });

  } catch (error) {
    console.error('Boss defeat preview error:', error);
    return NextResponse.json({
      error: 'Failed to fetch prices',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
