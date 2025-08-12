import { NextResponse } from 'next/server';
import { checkAndPostBossDefeats } from '@/lib/twitter';

interface PriceData {
  priceUsd: number;
  source: string;
  ts: number;
}

export async function POST() {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';

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

    // Check for boss defeats and post tweets
    const result = await checkAndPostBossDefeats(currentPrice, lastPrice);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Boss defeat detection error:', error);
    return NextResponse.json({
      error: 'Failed to check for boss defeats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint for manual checking/testing
export async function GET() {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';

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
