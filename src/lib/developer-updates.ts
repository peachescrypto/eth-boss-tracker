interface TweetTemplate {
  emoji: string;
  title: string;
  format: (message: string, extra?: string) => string;
}

export const TWEET_TEMPLATES: Record<string, TweetTemplate> = {
      deploy: {
      emoji: '🚀',
      title: 'DEPLOYED',
      format: (message) => 
        `🚀 ETH Boss Hunter DEPLOYED!\n\n"${message}"\n\n⚔️ Hunt bosses: https://eth-boss-tracker.vercel.app\n\n$ETH #BossHunter #Crypto #Web3`
    },
    
    feature: {
      emoji: '⚡',
      title: 'NEW FEATURE',
      format: (message, extra) => 
        `⚡ ETH Boss Hunter UPDATE!\n\n🔥 ${message}\n\n${extra || 'Fresh feature deployed!'}\n\n⚔️ https://eth-boss-tracker.vercel.app\n\n#BossHunter $ETH #Build`
    },
  
      fix: {
      emoji: '🛠️',
      title: 'FIXED',
      format: (message) => 
        `🛠️ ETH Boss Hunter FIXED!\n\n✅ ${message}\n\nThe hunt continues stronger! ⚔️\n\nhttps://eth-boss-tracker.vercel.app\n\n#BossHunter $ETH #DevLife`
    },
  
  milestone: {
    emoji: '🎉',
    title: 'MILESTONE',
    format: (message, extra) => 
      `🎉 ETH Boss Hunter MILESTONE!\n\n🏆 ${message}\n\n${extra || 'Another step forward!'}\n\n⚔️ https://eth-boss-tracker.vercel.app\n\n#BossHunter $ETH #Milestone`
  },
  
  default: {
    emoji: '🎯',
    title: 'UPDATE',
    format: (message, extra) => 
      `🎯 ETH Boss Hunter progress!\n\n"${message}"\n\n${extra || 'Latest update'} pushed to production\n\n⚔️ https://eth-boss-tracker.vercel.app\n\n$ETH #BossHunter #Crypto`
  }
};

export function detectTweetType(commitMessage: string): string {
  const msg = commitMessage.toLowerCase();
  
  // Check for deployment keywords
  if (msg.includes('deploy') || msg.includes('release') || msg.includes('production')) {
    return 'deploy';
  }
  
  // Check for feature keywords
  if (msg.includes('feat') || msg.includes('add') || msg.includes('new') || msg.includes('implement')) {
    return 'feature';
  }
  
  // Check for fix keywords
  if (msg.includes('fix') || msg.includes('bug') || msg.includes('patch') || msg.includes('repair')) {
    return 'fix';
  }
  
  // Check for milestone keywords
  if (msg.includes('milestone') || msg.includes('complete') || msg.includes('finish')) {
    return 'milestone';
  }
  
  return 'default';
}

export function generateTweet(
  commitMessage: string, 
  commitCount: number, 
  fileChanges?: string[]
): string {
  const type = detectTweetType(commitMessage);
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

// Main function for Peaches dev account (existing functionality)
export async function postToTwitter(content: string): Promise<{ success: boolean; tweetId?: string; error?: string }> {
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
    const oauthData = generateOAuthSignature();
    
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

function generateOAuthSignature() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require('crypto');
  
  // OAuth 1.0a parameters
  const oauthParams = {
    oauth_consumer_key: process.env.TWITTER_API_KEY!,
    oauth_token: process.env.TWITTER_ACCESS_TOKEN!,
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
    .map(key => `${key}=${encodeURIComponent(oauthParams[key as keyof typeof oauthParams])}`)
    .join('&');
  
  const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
  
  // Create signing key
  const signingKey = `${encodeURIComponent(process.env.TWITTER_API_SECRET!)}&${encodeURIComponent(process.env.TWITTER_ACCESS_TOKEN_SECRET!)}`;
  
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
    .map(key => `${key}="${encodeURIComponent(authParams[key as keyof typeof authParams])}"`)
    .join(', ');
  
  return { authHeader };
}
