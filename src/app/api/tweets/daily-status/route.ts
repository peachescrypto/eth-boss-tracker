import { NextRequest, NextResponse } from 'next/server';
import { postToBossHunterTwitter } from '@/lib/twitter';

interface PriceData {
  priceUsd: number;
  source: string;
  ts: number;
}

export async function POST(request: NextRequest) {
  try {
    // Verify this is an authorized request (could add API key check here)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current ETH price
    const priceUrl = process.env.NODE_ENV === 'production' 
      ? 'https://eth-boss-tracker.vercel.app/api/price'
      : 'http://localhost:3000/api/price';
    const priceResponse = await fetch(priceUrl);
    if (!priceResponse.ok) {
      throw new Error('Failed to fetch current price');
    }
    const priceData: PriceData = await priceResponse.json();

    // Post daily status tweet (all logic handled inside the function)
    const tweetResult = await postToBossHunterTwitter(priceData.priceUsd);

    if (tweetResult.success) {
      return NextResponse.json({
        success: true,
        tweetId: tweetResult.tweetId
      });
    } else {
      return NextResponse.json({
        success: false,
        error: tweetResult.error
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Daily status tweet error:', error);
    return NextResponse.json({
      error: 'Failed to post daily status tweet',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint for testing
export async function GET() {
  try {
    // Get current ETH price
    const priceUrl = process.env.NODE_ENV === 'production' 
      ? 'https://eth-boss-tracker.vercel.app/api/price'
      : 'http://localhost:3000/api/price';
    const priceResponse = await fetch(priceUrl);
    if (!priceResponse.ok) {
      throw new Error('Failed to fetch current price');
    }
    const priceData: PriceData = await priceResponse.json();

    // For preview, we'll just return the price and let the client handle the rest
    return NextResponse.json({
      preview: true,
      currentPrice: priceData.priceUsd,
      message: 'Use POST endpoint to actually post the tweet'
    });

  } catch (error) {
    console.error('Daily status preview error:', error);
    return NextResponse.json({
      error: 'Failed to generate daily status preview',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
