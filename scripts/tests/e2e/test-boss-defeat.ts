#!/usr/bin/env tsx

import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { checkAndPostBossDefeats } from '@/lib/twitter';

async function testBossDefeatScenario(
  testName: string,
  currentPrice: number,
  lastCheckedPrice: number,
  expectedBehavior: string
) {
  console.log(`\n🎯 Test: ${testName}`);
  console.log('💰 Current price:', currentPrice);
  console.log('📊 Last checked price:', lastCheckedPrice);
  console.log('📈 Expected behavior:', expectedBehavior);
  
  try {
    const result = await checkAndPostBossDefeats(currentPrice, lastCheckedPrice);
    
    console.log('\n📊 Results:');
    console.log('✅ Success:', result.success);
    console.log('🎯 Newly defeated bosses:', result.newlyDefeatedCount);
    console.log('🎯 Boss switches:', result.bossSwitchCount);
    console.log('❌ Failed tweets:', result.failedCount);
    
    if (result.results.length > 0) {
      console.log('\n📝 Tweet Results:');
      result.results.forEach((tweetResult, index) => {
        console.log(`${index + 1}. ${tweetResult.boss} (${tweetResult.type}): ${tweetResult.success ? '✅' : '❌'}`);
        if (tweetResult.tweetId) {
          console.log(`   Tweet ID: ${tweetResult.tweetId}`);
        }
        if (tweetResult.error) {
          console.log(`   Error: ${tweetResult.error}`);
        }
      });
    } else {
      console.log('\n😴 No boss defeats or focus changes detected');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function runAllTests() {
  console.log('🚀 Running all boss defeat and boss switch tests...\n');
  
  //Test Case 1: Boss Defeat (price increase)
  await testBossDefeatScenario(
    'Boss Defeat (Price Increase)',
    4350, // Current ETH price above a boss level
    4300, // Price below boss level
    'Should defeat a boss (+$50 price increase)'
  );
  
  // Test Case 2: Boss Switch (price decrease)
  await testBossDefeatScenario(
    'Boss Switch (Price Decrease)',
    4090, // Current ETH price (lower)
    4100, // Price from 15 minutes ago (higher)
    'Should switch to a new boss target (-$200 price decrease)'
  );
  
  // Test Case 3: No Change (price stays in same range)
  await testBossDefeatScenario(
    'No Change (Price Stays Same)',
    3500, // Current ETH price
    3510, // Price from 15 minutes ago (similar)
    'Should not trigger any events (-$10 price change)'
  );
  
  console.log('\n✅ All tests completed!');
}

runAllTests();
