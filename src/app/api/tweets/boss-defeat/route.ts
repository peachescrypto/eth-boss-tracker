import { NextRequest, NextResponse } from 'next/server';
import { analyzeBattleState } from '@/lib/battle-analysis';
import { generateBossDefeatTweet } from '@/lib/tweet-generator';
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

// In-memory store for last checked price (in production, use Redis or database)
let lastCheckedPrice = 0;
let lastDefeatedBossIndex = -1;

export async function POST(request: NextRequest) {
  try {
    // This endpoint will be called by a cron job or price monitoring system
    
    // Get current ETH price
    const priceResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/price`);
    if (!priceResponse.ok) {
      throw new Error('Failed to fetch current price');
    }
    const priceData: PriceData = await priceResponse.json();
    const currentPrice = priceData.priceUsd;

    // Load boss data
    const bossDataPath = path.join(process.cwd(), 'public', 'eth-weekly-highs.json');
    const bossDataRaw = fs.readFileSync(bossDataPath, 'utf8');
    const bossData: BossData[] = JSON.parse(bossDataRaw);
    const sortedBosses = [...bossData].sort((a, b) => a.high - b.high);

    // Check if any new bosses have been defeated
    const newlyDefeatedBosses: BossData[] = [];
    
    for (let i = 0; i < sortedBosses.length; i++) {
      const boss = sortedBosses[i];
      
      // If price is above this boss level and we haven't already posted about it
      if (currentPrice >= boss.high && i > lastDefeatedBossIndex) {
        newlyDefeatedBosses.push(boss);
        lastDefeatedBossIndex = i;
      }
    }

    const results = [];

    // Post a tweet for each newly defeated boss
    for (const defeatedBoss of newlyDefeatedBosses) {
      const battleState = analyzeBattleState(currentPrice, bossData);
      const tweetText = generateBossDefeatTweet(defeatedBoss, currentPrice, battleState);
      
      const tweetResult = await postToBossHunterTwitter(tweetText);
      
      results.push({
        boss: defeatedBoss.name || `Level ${lastDefeatedBossIndex + 1}`,
        price: defeatedBoss.high,
        success: tweetResult.success,
        tweetId: tweetResult.tweetId,
        error: tweetResult.error
      });

      // Add a small delay between tweets if multiple bosses defeated
      if (newlyDefeatedBosses.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    lastCheckedPrice = currentPrice;

    return NextResponse.json({
      success: true,
      currentPrice,
      newlyDefeatedCount: newlyDefeatedBosses.length,
      results,
      lastDefeatedBossIndex
    });

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
    // Get current ETH price
    const priceResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/price`);
    if (!priceResponse.ok) {
      throw new Error('Failed to fetch current price');
    }
    const priceData: PriceData = await priceResponse.json();
    const currentPrice = priceData.priceUsd;

    // Load boss data
    const bossDataPath = path.join(process.cwd(), 'public', 'eth-weekly-highs.json');
    const bossDataRaw = fs.readFileSync(bossDataPath, 'utf8');
    const bossData: BossData[] = JSON.parse(bossDataRaw);
    const sortedBosses = [...bossData].sort((a, b) => a.high - b.high);

    // Analyze what bosses would be defeated
    const defeatedBosses = sortedBosses.filter(boss => currentPrice >= boss.high);
    const nextBoss = sortedBosses.find(boss => currentPrice < boss.high);

    return NextResponse.json({
      preview: true,
      currentPrice,
      lastCheckedPrice,
      lastDefeatedBossIndex,
      defeatedBossCount: defeatedBosses.length,
      nextBoss: nextBoss ? {
        name: nextBoss.name || 'Unknown',
        price: nextBoss.high,
        remaining: nextBoss.high - currentPrice
      } : null,
      wouldTrigger: defeatedBosses.length > (lastDefeatedBossIndex + 1)
    });

  } catch (error) {
    console.error('Boss defeat preview error:', error);
    return NextResponse.json({
      error: 'Failed to preview boss defeat detection',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
