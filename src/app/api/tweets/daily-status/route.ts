import { NextRequest, NextResponse } from 'next/server';
import { analyzeBattleState } from '@/lib/battle-analysis';
import { generateDailyStatusTweet } from '@/lib/tweet-generator';
import { postToBossHunterTwitter } from '@/lib/twitter';
import fs from 'fs';
import path from 'path';

interface BossData {
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

export async function POST(request: NextRequest) {
  try {
    // Verify this is an authorized request (could add API key check here)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current ETH price
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    const priceResponse = await fetch(`${baseUrl}/api/price`);
    if (!priceResponse.ok) {
      throw new Error('Failed to fetch current price');
    }
    const priceData: PriceData = await priceResponse.json();

    // Load boss data
    const bossDataPath = path.join(process.cwd(), 'public', 'eth-weekly-highs.json');
    const bossDataRaw = fs.readFileSync(bossDataPath, 'utf8');
    const bossData: BossData[] = JSON.parse(bossDataRaw);

    // Analyze current battle state
    const battleState = analyzeBattleState(priceData.priceUsd, bossData);

    // Generate daily status tweet with boss image
    const tweetContent = generateDailyStatusTweet(battleState);

    // Post to Boss Hunter Twitter
    const tweetResult = await postToBossHunterTwitter(tweetContent);

    if (tweetResult.success) {
      return NextResponse.json({
        success: true,
        tweetId: tweetResult.tweetId,
        tweetText: typeof tweetContent === 'string' ? tweetContent : tweetContent.text,
        battleState: {
          currentBoss: battleState.currentBoss?.name || 'All Defeated',
          progress: Math.round(battleState.progress * 100),
          status: battleState.battleStatus,
          bossesDefeated: battleState.bossesDefeated
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: tweetResult.error,
        tweetText: typeof tweetContent === 'string' ? tweetContent : tweetContent.text
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
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    const priceResponse = await fetch(`${baseUrl}/api/price`);
    if (!priceResponse.ok) {
      throw new Error('Failed to fetch current price');
    }
    const priceData: PriceData = await priceResponse.json();

    // Load boss data
    const bossDataPath = path.join(process.cwd(), 'public', 'eth-weekly-highs.json');
    const bossDataRaw = fs.readFileSync(bossDataPath, 'utf8');
    const bossData: BossData[] = JSON.parse(bossDataRaw);

    // Analyze current battle state
    const battleState = analyzeBattleState(priceData.priceUsd, bossData);

    // Generate daily status tweet (preview only)
    const tweetContent = generateDailyStatusTweet(battleState);

    return NextResponse.json({
      preview: true,
      tweetText: typeof tweetContent === 'string' ? tweetContent : tweetContent.text,
      hasImage: typeof tweetContent === 'object' && tweetContent.image ? true : false,
      imagePath: typeof tweetContent === 'object' ? tweetContent.image : null,
      battleState: {
        currentBoss: battleState.currentBoss?.name || 'All Defeated',
        currentPrice: battleState.currentPrice,
        progress: Math.round(battleState.progress * 100),
        status: battleState.battleStatus,
        bossesDefeated: battleState.bossesDefeated,
        totalBosses: battleState.totalBosses
      }
    });

  } catch (error) {
    console.error('Daily status preview error:', error);
    return NextResponse.json({
      error: 'Failed to generate daily status preview',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
