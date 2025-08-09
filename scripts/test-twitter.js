#!/usr/bin/env node

/**
 * Test script for Twitter bot functionality
 * Usage: node scripts/test-twitter.js
 */

// Import functions directly to avoid TypeScript module issues
function detectTweetType(commitMessage, fileChanges) {
  const msg = commitMessage.toLowerCase();
  
  if (msg.includes('deploy') || msg.includes('release') || msg.includes('production')) {
    return 'deploy';
  }
  
  if (msg.includes('feat') || msg.includes('add') || msg.includes('new') || msg.includes('implement')) {
    return 'feature';
  }
  
  if (msg.includes('fix') || msg.includes('bug') || msg.includes('patch') || msg.includes('repair')) {
    return 'fix';
  }
  
  if (msg.includes('milestone') || msg.includes('complete') || msg.includes('finish')) {
    return 'milestone';
  }
  
  return 'default';
}

function generateTweet(commitMessage, commitCount, fileChanges) {
  const TWEET_TEMPLATES = {
    deploy: {
      format: (message, extra) => 
        `🚀 ETH Boss Hunter DEPLOYED!\n\n"${message}"\n\n⚔️ Hunt bosses: https://eth-boss-tracker.vercel.app\n\n#ETH #BossHunter #Crypto #Web3`
    },
    
    feature: {
      format: (message, extra) => 
        `⚡ ETH Boss Hunter UPDATE!\n\n🔥 ${message}\n\n${extra || 'Fresh feature deployed!'}\n\n⚔️ https://eth-boss-tracker.vercel.app\n\n#BossHunter #ETH #Build`
    },
    
    fix: {
      format: (message, extra) => 
        `🛠️ ETH Boss Hunter FIXED!\n\n✅ ${message}\n\nThe hunt continues stronger! ⚔️\n\nhttps://eth-boss-tracker.vercel.app\n\n#BossHunter #ETH #DevLife`
    },
    
    milestone: {
      format: (message, extra) => 
        `🎉 ETH Boss Hunter MILESTONE!\n\n🏆 ${message}\n\n${extra || 'Another step forward!'}\n\n⚔️ https://eth-boss-tracker.vercel.app\n\n#BossHunter #ETH #Milestone`
    },
    
    default: {
      format: (message, extra) => 
        `🎯 ETH Boss Hunter progress!\n\n"${message}"\n\n${extra || 'Latest update'} pushed to production\n\n⚔️ https://eth-boss-tracker.vercel.app\n\n#ETH #BossHunter #Crypto`
    }
  };

  const type = detectTweetType(commitMessage, fileChanges);
  const template = TWEET_TEMPLATES[type];
  
  // Clean commit message (first line only, max 100 chars)
  const cleanMessage = commitMessage
    .split('\n')[0]
    .substring(0, 100)
    .trim();
  
  // Generate extra context
  let extra = '';
  if (commitCount > 1) {
    extra = `📦 ${commitCount} commits`;
  } else {
    extra = '📝 Fresh commit';
  }
  
  // Add file change context if interesting
  if (fileChanges && fileChanges.length > 0) {
    const hasNewFiles = fileChanges.some(f => f.includes('new') || f.includes('add'));
    const hasImportantFiles = fileChanges.some(f => 
      f.includes('README') || f.includes('package.json') || f.includes('api/')
    );
    
    if (hasNewFiles) extra += ' ✨';
    if (hasImportantFiles) extra += ' 🔧';
  }
  
  return template.format(cleanMessage, extra);
}

async function postToTwitter(content) {
  // Check for required environment variables (OAuth 1.0a)
  const requiredVars = [
    'TWITTER_API_KEY',
    'TWITTER_API_SECRET', 
    'TWITTER_ACCESS_TOKEN',
    'TWITTER_ACCESS_TOKEN_SECRET'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    return { 
      success: false, 
      error: `Missing Twitter credentials: ${missingVars.join(', ')}` 
    };
  }
  
  try {
    // Generate OAuth 1.0a signature
    const oauthData = generateOAuthSignature(content);
    
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
      throw new Error(`Twitter API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    const result = await response.json();
    
    return {
      success: true,
      tweetId: result.data?.id
    };
    
  } catch (error) {
    console.error('Failed to post tweet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function generateOAuthSignature(tweetContent) {
  const crypto = require('crypto');
  
  // OAuth 1.0a parameters
  const oauthParams = {
    oauth_consumer_key: process.env.TWITTER_API_KEY,
    oauth_token: process.env.TWITTER_ACCESS_TOKEN,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_version: '1.0'
  };
  
  // Create signature base string
  const method = 'POST';
  const url = 'https://api.twitter.com/2/tweets';
  const paramString = Object.keys(oauthParams)
    .sort()
    .map(key => `${key}=${encodeURIComponent(oauthParams[key])}`)
    .join('&');
  
  const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
  
  // Create signing key
  const signingKey = `${encodeURIComponent(process.env.TWITTER_API_SECRET)}&${encodeURIComponent(process.env.TWITTER_ACCESS_TOKEN_SECRET)}`;
  
  // Generate signature
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(signatureBaseString)
    .digest('base64');
  
  // Create authorization header
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

// Mock commit data for testing
const testCommits = [
  {
    message: "feat: add Twitter bot integration for automated commit tweets",
    count: 1,
    fileChanges: ["add:src/app/api/webhook/github/route.ts", "add:src/lib/twitter.ts"]
  },
  {
    message: "fix: resolve API timeout issues in price fetching",
    count: 1,
    fileChanges: ["mod:src/app/api/price/route.ts"]
  },
  {
    message: "deploy: release v1.2.0 with Twitter integration",
    count: 3,
    fileChanges: ["mod:package.json", "mod:README.md"]
  },
  {
    message: "chore: update dependencies and documentation",
    count: 1,
    fileChanges: ["mod:package.json", "mod:docs/TWITTER_SETUP.md"]
  }
];

console.log('🐦 Testing Twitter Bot Tweet Generation\n');

// Test tweet type detection
console.log('📝 Testing Tweet Type Detection:');
testCommits.forEach((commit, index) => {
  const type = detectTweetType(commit.message, commit.fileChanges);
  console.log(`  ${index + 1}. "${commit.message}" → ${type}`);
});

console.log('\n📱 Testing Tweet Generation:');
testCommits.forEach((commit, index) => {
  const tweet = generateTweet(commit.message, commit.count, commit.fileChanges);
  console.log(`\n  ${index + 1}. Generated Tweet:`);
  console.log('  ' + '─'.repeat(50));
  console.log(tweet.split('\n').map(line => `  ${line}`).join('\n'));
  console.log('  ' + '─'.repeat(50));
  console.log(`  Length: ${tweet.length} characters`);
});

// Test actual Twitter posting (only if credentials are available)
async function testTwitterPosting() {
  console.log('\n🚀 Testing Twitter API Connection:');
  
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  
  if (!process.env.TWITTER_BEARER_TOKEN) {
    console.log('  ⚠️  Twitter credentials not found in .env.local');
    console.log('  ℹ️  Skipping actual Twitter API test');
    return;
  }
  
  const testTweet = "🧪 ETH Boss Hunter Twitter Bot Test\n\nThis is a test tweet from the automated bot system!\n\n⚔️ If you see this, the integration is working!\n\n#ETH #BossHunter #Test";
  
  console.log('  📤 Attempting to post test tweet...');
  console.log(`  📝 Tweet content: "${testTweet.substring(0, 50)}..."`);
  
  try {
    const result = await postToTwitter(testTweet);
    
    if (result.success) {
      console.log('  ✅ Test tweet posted successfully!');
      console.log(`  🔗 Tweet ID: ${result.tweetId}`);
    } else {
      console.log('  ❌ Failed to post test tweet');
      console.log(`  📝 Error: ${result.error}`);
    }
  } catch (error) {
    console.log('  ❌ Error testing Twitter API:');
    console.log(`  📝 ${error.message}`);
  }
}

// Run tests
console.log('\n' + '='.repeat(60));
console.log('Twitter Bot Test Results Summary:');
console.log('='.repeat(60));

testTwitterPosting().then(() => {
  console.log('\n✅ All tests completed!');
  console.log('\nNext steps:');
  console.log('1. Set up Twitter Developer account');
  console.log('2. Add credentials to .env.local');
  console.log('3. Configure GitHub webhook');
  console.log('4. Deploy to Vercel with environment variables');
}).catch(error => {
  console.error('\n❌ Test failed:', error);
});
