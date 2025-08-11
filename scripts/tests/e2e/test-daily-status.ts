import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Import TypeScript functions
import { postToBossHunterTwitter } from '../../../src/lib/twitter.js';
import { analyzeBattleState, generateDailyStatusTweet } from '../../../src/lib/tweet-templates.js';

async function main() {
  console.log('🎯 Testing ETH Boss Hunter Twitter Bot...\n');

  // Load boss data
  const bossDataPath = path.join(process.cwd(), 'public', 'eth-weekly-highs.json');
  const bossData = JSON.parse(fs.readFileSync(bossDataPath, 'utf8'));

  // Get current ETH price (you can change this to test different scenarios)
  const mockPrice = 4160;
  
  // Analyze battle state
  const battleState = analyzeBattleState(mockPrice, bossData);
  
  console.log('📊 Current Battle State:');
  console.log(`Current Price: $${battleState.currentPrice.toLocaleString()}`);
  if (battleState.currentBoss) {
    console.log(`Current Boss: ${battleState.currentBoss.name || 'Unknown'} ($${battleState.currentBoss.high.toLocaleString()})`);
  } else {
    console.log('Current Boss: All bosses defeated!');
  }
  console.log(`Progress: ${battleState.progress.toFixed(1)}%`);
  console.log(`Bosses Defeated: ${battleState.bossesDefeated}/${battleState.totalBosses}\n`);

  // Generate tweet with image
  const tweetContent = generateDailyStatusTweet(battleState);
  const imagePath = tweetContent.image || (battleState.currentBoss?.name ? `/images/${battleState.currentBoss.name.toLowerCase()}.png` : undefined);
  
  console.log('🐦 Generated Tweet:');
  console.log(tweetContent.text);
  console.log(`📸 Image: ${imagePath}`);
  console.log(`📏 Character count: ${tweetContent.text.length}\n`);

  // Post to Twitter
  console.log('🚀 Posting to Twitter...');
  const result = await postToBossHunterTwitter({
    text: tweetContent.text,
    image: imagePath
  });

  if (result.success) {
    console.log('✅ Tweet posted successfully!');
    console.log(`Tweet ID: ${result.tweetId}`);
    console.log(`URL: https://twitter.com/i/web/status/${result.tweetId}`);
  } else {
    console.log('❌ Failed to post tweet:');
    console.log(result.error);
  }
}

main().catch(console.error);
