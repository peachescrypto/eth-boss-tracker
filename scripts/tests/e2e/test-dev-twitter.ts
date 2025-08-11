#!/usr/bin/env node

/**
 * Test script for Twitter bot functionality
 * Usage: tsx scripts/test-twitter.ts
 */

import dotenv from 'dotenv';
import crypto from 'crypto';

// Load environment variables
dotenv.config({ path: '.env.local' });

type TweetType = 'deploy' | 'feature' | 'fix' | 'milestone' | 'default';

interface TweetTemplate {
  format: (message: string, extra?: string) => string;
}

interface TweetTemplates {
  [key: string]: TweetTemplate;
}

function detectTweetType(commitMessage: string, fileChanges?: string[]): TweetType {
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

function generateTweet(commitMessage: string, commitCount: number, fileChanges?: string[]): string {
  const TWEET_TEMPLATES: TweetTemplates = {
    deploy: {
      format: (message: string, extra?: string) => 
        `🚀 ETH Boss Hunter DEPLOYED!\n\n"${message}"\n\n⚔️ Hunt bosses: https://eth-boss-tracker.vercel.app\n\n$ETH #BossHunter #Crypto #Web3`
    },
    
    feature: {
      format: (message: string, extra?: string) => 
        `⚡ ETH Boss Hunter UPDATE!\n\n🔥 ${message}\n\n${extra || 'Fresh feature deployed!'}\n\n⚔️ https://eth-boss-tracker.vercel.app\n\n#BossHunter $ETH #Build`
    },
    
    fix: {
      format: (message: string, extra?: string) => 
        `🛠️ ETH Boss Hunter FIXED!\n\n✅ ${message}\n\nThe hunt continues stronger! ⚔️\n\nhttps://eth-boss-tracker.vercel.app\n\n#BossHunter $ETH #DevLife`
    },
    
    milestone: {
      format: (message: string, extra?: string) => 
        `🎉 ETH Boss Hunter MILESTONE!\n\n🏆 ${message}\n\n${extra || 'Another step forward!'}\n\n⚔️ https://eth-boss-tracker.vercel.app\n\n#BossHunter $ETH #Milestone`
    },
    
    default: {
      format: (message: string, extra?: string) => 
        `🎯 ETH Boss Hunter progress!\n\n"${message}"\n\n${extra || 'Latest update'} pushed to production\n\n⚔️ https://eth-boss-tracker.vercel.app\n\n$ETH #BossHunter #Crypto`
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

async function postToTwitter(content: string): Promise<{ success: boolean; tweetId?: string; error?: string }> {
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
    console.log('🐦 Posting to Twitter...');
    console.log('📝 Content:', content);
    console.log('📏 Character count:', content.length);
    
    // Generate OAuth 1.0a signature
    const { authHeader } = generateOAuthSignature(content);
    
    // Post to Twitter API v2
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: content
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log('❌ Twitter API error:', errorData);
      
      // Handle rate limiting
      if (response.status === 429) {
        const resetTime = response.headers.get('x-rate-limit-reset');
        if (resetTime) {
          const resetDate = new Date(parseInt(resetTime) * 1000);
          const minutesUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60));
          console.log(`⏰ Rate limited. Reset in ${minutesUntilReset} minutes`);
        }
      }
      
      return {
        success: false,
        error: `Twitter API error: ${response.status} - ${JSON.stringify(errorData)}`
      };
    }

    const result = await response.json();
    console.log('✅ Tweet posted successfully!');
    console.log('Tweet ID:', result.data?.id);
    console.log('URL:', `https://twitter.com/i/web/status/${result.data?.id}`);
    
    return {
      success: true,
      tweetId: result.data?.id
    };

  } catch (error) {
    console.error('❌ Failed to post tweet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function generateOAuthSignature(tweetContent: string): { authHeader: string } {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: process.env.TWITTER_API_KEY || '',
    oauth_token: process.env.TWITTER_ACCESS_TOKEN || '',
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_version: '1.0'
  };

  const method = 'POST';
  const url = 'https://api.twitter.com/2/tweets';
  
  // For OAuth 1.0a with JSON body, we need to include the body hash
  const bodyHash = crypto.createHash('sha256').update(tweetContent).digest('base64');
  oauthParams.oauth_body_hash = bodyHash;

  const paramString = Object.keys(oauthParams)
    .sort()
    .map(key => `${key}=${encodeURIComponent(oauthParams[key])}`)
    .join('&');

  const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
  const signingKey = `${encodeURIComponent(process.env.TWITTER_API_SECRET || '')}&${encodeURIComponent(process.env.TWITTER_ACCESS_TOKEN_SECRET || '')}`;
  const signature = crypto.createHmac('sha1', signingKey).update(signatureBaseString).digest('base64');

  const authParams: Record<string, string> = { ...oauthParams, oauth_signature: signature };
  const authHeader = 'OAuth ' + Object.keys(authParams)
    .sort()
    .map(key => `${key}="${encodeURIComponent(authParams[key])}"`)
    .join(', ');

  return { authHeader };
}

async function testTwitterPosting(): Promise<void> {
  console.log('🧪 Testing Twitter Bot Functionality...\n');

  // Test different commit types
  const testCases = [
    {
      message: 'feat: add new boss battle system',
      count: 1,
      files: ['src/lib/boss-battle.ts', 'new file']
    },
    {
      message: 'fix: resolve authentication issues',
      count: 2,
      files: ['src/lib/twitter.ts', 'modified']
    },
    {
      message: 'deploy: production release v1.2.0',
      count: 5,
      files: ['package.json', 'modified']
    },
    {
      message: 'milestone: complete TypeScript migration',
      count: 10,
      files: ['tsconfig.json', 'new file']
    }
  ];

  for (const testCase of testCases) {
    console.log('📝 Testing:', testCase.message);
    
    const tweet = generateTweet(testCase.message, testCase.count, testCase.files);
    console.log('🐦 Generated tweet:');
    console.log(tweet);
    console.log('📏 Character count:', tweet.length);
    console.log('');

    // Uncomment to actually post (be careful with rate limits!)
    // const result = await postToTwitter(tweet);
    // if (result.success) {
    //   console.log('✅ Posted successfully!');
    // } else {
    //   console.log('❌ Failed:', result.error);
    // }
    // console.log('');

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('🎯 Twitter bot testing complete!');
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testTwitterPosting().catch(console.error);
}
