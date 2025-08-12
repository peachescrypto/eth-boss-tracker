#!/usr/bin/env tsx

import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { checkAndPostBossDefeats } from '@/lib/twitter';

async function testBossDefeat() {
  try {
    console.log('💀 Testing boss defeat detection and tweet posting...\n');

    // Simulate defeating Buterion (current boss at $4,333)
    const lastCheckedPrice = 4300; // Price below Buterion's level
    const currentPrice = 4350; // Price above Buterion's level

    console.log('💰 Last checked price:', lastCheckedPrice);
    console.log('📈 Current price:', currentPrice);
    console.log('🎯 Expected to defeat Buterion at $4,333');
    console.log('');

    // Test boss defeat detection and posting
    console.log('🔍 Checking for boss defeats...');
    const result = await checkAndPostBossDefeats(currentPrice, lastCheckedPrice);
    
    console.log('📊 Results:', {
      success: result.success,
      newlyDefeatedCount: result.newlyDefeatedCount,
      results: result.results
    });

    if (result.success && result.newlyDefeatedCount > 0) {
      console.log('✅ Boss defeat detected and tweet posted successfully!');
      result.results.forEach((bossResult, index) => {
        console.log(`  ${index + 1}. ${bossResult.boss}: ${bossResult.success ? '✅' : '❌'} ${bossResult.tweetId || bossResult.error}`);
      });
    } else {
      console.log('😴 No boss defeats detected or failed to post');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testBossDefeat();
