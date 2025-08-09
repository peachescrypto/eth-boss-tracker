require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const {
  analyzeBattleState,
  generateDailyStatusTweet,
  generateBossDefeatTweet
} = require('../lib/tweet-templates');

async function postToBossHunterTwitter(content) {
  // Check for required ETH Boss Hunter environment variables
  const requiredVars = [
    'BOSS_HUNTER_API_KEY',
    'BOSS_HUNTER_API_SECRET', 
    'BOSS_HUNTER_ACCESS_TOKEN',
    'BOSS_HUNTER_ACCESS_TOKEN_SECRET'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    return { 
      success: false, 
      error: `Missing Boss Hunter Twitter credentials: ${missingVars.join(', ')}` 
    };
  }
  
  try {
    const oauthData = generateBossHunterOAuthSignature();
    
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': oauthData.authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: content
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Boss Hunter Twitter API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    const result = await response.json();
    
    return {
      success: true,
      tweetId: result.data?.id
    };
    
  } catch (error) {
    console.error('Failed to post Boss Hunter tweet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function generateBossHunterOAuthSignature() {
  const crypto = require('crypto');
  
  const oauthParams = {
    oauth_consumer_key: process.env.BOSS_HUNTER_API_KEY,
    oauth_token: process.env.BOSS_HUNTER_ACCESS_TOKEN,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_version: '1.0'
  };
  
  const method = 'POST';
  const url = 'https://api.twitter.com/2/tweets';
  const paramString = Object.keys(oauthParams)
    .sort()
    .map(key => `${key}=${encodeURIComponent(oauthParams[key])}`)
    .join('&');
  
  const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
  const signingKey = `${encodeURIComponent(process.env.BOSS_HUNTER_API_SECRET)}&${encodeURIComponent(process.env.BOSS_HUNTER_ACCESS_TOKEN_SECRET)}`;
  
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(signatureBaseString)
    .digest('base64');
  
  const authParams = {
    ...oauthParams,
    oauth_signature: signature
  };
  
  const authHeader = 'OAuth ' + Object.keys(authParams)
    .sort()
    .map(key => `${key}="${encodeURIComponent(authParams[key])}"`)
    .join(', ');
  
  return { authHeader };
}

async function main() {
  console.log('🎯 Testing ETH Boss Hunter Twitter Bot...\n');

  // Load boss data
  const bossDataPath = path.join(__dirname, '..', 'public', 'eth-weekly-highs.json');
  const bossData = JSON.parse(fs.readFileSync(bossDataPath, 'utf8'));

  // Get current ETH price (you can change this to test different scenarios)
  const mockPrice = 4160;
  
  // Analyze battle state
  const battleState = analyzeBattleState(mockPrice, bossData);
  
  console.log('📊 Current Battle State:');
  console.log(`Current Price: $${battleState.currentPrice.toLocaleString()}`);
  console.log(`Current Boss: ${battleState.currentBoss?.name || 'All Defeated'}`);
  console.log(`Progress: ${Math.round(battleState.progress * 100)}%`);
  console.log(`Status: ${battleState.battleStatus}`);
  console.log(`Bosses Defeated: ${battleState.bossesDefeated}/${battleState.totalBosses}`);
  console.log('');

  // Generate tweet using centralized function
  let tweet = generateDailyStatusTweet(battleState);
  
  // Add timestamp for testing to avoid duplicate content errors
  tweet += `\n\n🧪 Test: ${new Date().toLocaleTimeString()}`;
  console.log('📝 Generated Tweet:');
  console.log('='.repeat(50));
  console.log(tweet);
  console.log('='.repeat(50));
  console.log(`Length: ${tweet.length} characters`);
  console.log('');

  // Check credentials
  const hasCredentials = [
    'BOSS_HUNTER_API_KEY',
    'BOSS_HUNTER_API_SECRET', 
    'BOSS_HUNTER_ACCESS_TOKEN',
    'BOSS_HUNTER_ACCESS_TOKEN_SECRET'
  ].every(varName => process.env[varName]);

  if (!hasCredentials) {
    console.log('❌ Missing Boss Hunter Twitter credentials');
    console.log('Add these to your .env.local:');
    console.log('BOSS_HUNTER_API_KEY=your_api_key');
    console.log('BOSS_HUNTER_API_SECRET=your_api_secret');
    console.log('BOSS_HUNTER_ACCESS_TOKEN=your_access_token');
    console.log('BOSS_HUNTER_ACCESS_TOKEN_SECRET=your_access_token_secret');
    return;
  }

  console.log('🐦 Posting to ETH Boss Hunter Twitter...');
  const result = await postToBossHunterTwitter(tweet);
  
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
