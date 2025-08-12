import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Import TypeScript functions
import { postDailyStatusToTwitter } from '../../../src/lib/twitter.js';

async function main() {
  console.log('🎯 Testing ETH Boss Hunter Twitter Bot...\n');

  // Get current ETH price (you can change this to test different scenarios)
  const mockPrice = 4160;
  
  console.log('📊 Testing with ETH price: $' + mockPrice.toLocaleString() + '\n');

  // Post to Twitter (all logic handled inside the function)
  console.log('🚀 Posting to Twitter...');
  const result = await postDailyStatusToTwitter(mockPrice);

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
