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

// Dedicated function for ETH Boss Hunter account with image support
export async function postToBossHunterTwitter(
  content: string | { text: string; image?: string }
): Promise<{ success: boolean; tweetId?: string; error?: string }> {
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
    // Extract text and image from content
    const tweetText = typeof content === 'string' ? content : content.text;
    const imagePath = typeof content === 'object' ? content.image : undefined;
    
    // If we have an image, we need to upload it first via Twitter Media API
    let mediaId = undefined;
    if (imagePath) {
      try {
        mediaId = await uploadImageToTwitter(imagePath);
      } catch (imageError) {
        console.warn('Failed to upload image, posting without:', imageError);
        // Continue without image rather than failing the entire tweet
      }
    }
    
    // Generate OAuth 1.0a signature for Boss Hunter account
    const oauthData = generateBossHunterOAuthSignature();
    
    // Post tweet with optional media
    const tweetPayload: { text: string; media?: { media_ids: string[] } } = {
      text: tweetText
    };
    
    if (mediaId) {
      tweetPayload.media = { media_ids: [mediaId] };
    }
    
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': oauthData.authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tweetPayload)
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

async function uploadImageToTwitter(imagePath: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require('path');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require('crypto');
  
  // Resolve the full path to the image
  const fullImagePath = path.join(process.cwd(), 'public', imagePath.startsWith('/') ? imagePath.substring(1) : imagePath);
  
  // Check if file exists
  if (!fs.existsSync(fullImagePath)) {
    throw new Error(`Image file not found: ${fullImagePath}`);
  }
  
  // Read and encode the image
  const imageData = fs.readFileSync(fullImagePath);
  const base64Image = imageData.toString('base64');
  
  // Use OAuth 1.0a for v1.1 media upload (same credentials as tweet posting)
  const oauthParams = {
    oauth_consumer_key: process.env.BOSS_HUNTER_API_KEY!,
    oauth_token: process.env.BOSS_HUNTER_ACCESS_TOKEN!,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_version: '1.0'
  };
  
  const method = 'POST';
  const url = 'https://upload.twitter.com/1.1/media/upload.json';
  
  // For OAuth 1.0a with application/x-www-form-urlencoded, include body params in signature
  const bodyParams = {
    media_data: base64Image,
    media_category: 'tweet_image'
  };
  
  // Combine OAuth and body parameters for signature generation
  const allParams = { ...oauthParams, ...bodyParams };
  const paramString = Object.keys(allParams)
    .sort()
    .map(key => `${key}=${encodeURIComponent(allParams[key as keyof typeof allParams])}`)
    .join('&');
  
  const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
  const signingKey = `${encodeURIComponent(process.env.BOSS_HUNTER_API_SECRET!)}&${encodeURIComponent(process.env.BOSS_HUNTER_ACCESS_TOKEN_SECRET!)}`;
  const signature = crypto.createHmac('sha1', signingKey).update(signatureBaseString).digest('base64');
  
  // Create OAuth header
  const authParams = { ...oauthParams, oauth_signature: signature };
  const authHeader = 'OAuth ' + Object.keys(authParams)
    .sort()
    .map(key => `${key}="${encodeURIComponent(authParams[key as keyof typeof authParams])}"`)
    .join(', ');
  
  // Create form body with media data
  const formDataParams = new URLSearchParams();
  formDataParams.append('media_data', base64Image);
  formDataParams.append('media_category', 'tweet_image');
  
  // Upload to v1.1 media endpoint using OAuth 1.0a
  const uploadResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formDataParams.toString()
  });
  
  if (!uploadResponse.ok) {
    const errorData = await uploadResponse.json();
    throw new Error(`Twitter v1.1 media upload failed: ${uploadResponse.status} - ${JSON.stringify(errorData)}`);
  }
  
  const uploadResult = await uploadResponse.json();
  return uploadResult.media_id_string;
}

function generateBossHunterOAuthSignature() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require('crypto');
  
  // OAuth 1.0a parameters for Boss Hunter account
  const oauthParams = {
    oauth_consumer_key: process.env.BOSS_HUNTER_API_KEY!,
    oauth_token: process.env.BOSS_HUNTER_ACCESS_TOKEN!,
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
  const signingKey = `${encodeURIComponent(process.env.BOSS_HUNTER_API_SECRET!)}&${encodeURIComponent(process.env.BOSS_HUNTER_ACCESS_TOKEN_SECRET!)}`;
  
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

// Special tweet for when ETH defeats a boss level
export function generateBossDefeatTweet(price: number, bossLevel: number): string {
  return `💀 BOSS DEFEATED! 💀\n\nETH just CRUSHED the $${bossLevel.toLocaleString()} level!\n\nCurrent price: $${price.toLocaleString()}\n\n⚔️ Another boss falls to the ETH army!\n\nhttps://eth-boss-tracker.vercel.app\n\n$ETH #BossHunter #DEFEATED #Crypto`;
}

// Tweet for daily progress updates
export function generateDailyProgressTweet(currentPrice: number, nextBoss: number, progress: number): string {
  const progressPercent = Math.round(progress * 100);
  const remainingDollars = nextBoss - currentPrice;
  
  return `⚔️ Daily Boss Battle Report!\n\nETH: $${currentPrice.toLocaleString()}\nNext Boss: $${nextBoss.toLocaleString()}\nProgress: ${progressPercent}% 📊\n\nOnly $${remainingDollars.toFixed(2)} to victory!\n\nhttps://eth-boss-tracker.vercel.app\n\n$ETH #BossHunter #DailyReport`;
}
