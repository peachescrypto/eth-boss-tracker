import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { analyzeBattleState, generateDailyStatusTweet, generateBossDefeatTweet, generateBossSwitchTweet, type BossData, type BattleState } from './tweet-templates';

// Upload image to Twitter
async function uploadImageToTwitter(imagePath: string): Promise<string> {
  // Resolve the full path to the image
  const fullImagePath = path.join(process.cwd(), 'public', imagePath.startsWith('/') ? imagePath.substring(1) : imagePath);
  
  // Check if file exists
  if (!fs.existsSync(fullImagePath)) {
    throw new Error(`Image file not found: ${fullImagePath}`);
  }
  
  // Read and encode the image
  const imageData = fs.readFileSync(fullImagePath);
  const base64Image = imageData.toString('base64');
  
  // For OAuth 1.0a with application/x-www-form-urlencoded, include body params in signature
  const bodyParams = {
    media_data: base64Image,
    media_category: 'tweet_image'
  };
  
  // Use the generic OAuth function for upload
  const { authHeader } = generateBossHunterOAuthSignatureForUpload(bodyParams);
  
  // Create form body with media data
  const formDataParams = new URLSearchParams();
  formDataParams.append('media_data', base64Image);
  formDataParams.append('media_category', 'tweet_image');
  
  console.log('📝 Request Details:');
  console.log('Body size:', formDataParams.toString().length, 'characters');
  console.log('Image size:', base64Image.length, 'characters');
  console.log('');
  
  // Upload to v1.1 media endpoint using OAuth 1.0a
  const uploadResponse = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formDataParams.toString()
  });
  
  if (!uploadResponse.ok) {
    console.log('❌ Upload failed with status:', uploadResponse.status);
    console.log('Response headers:', Object.fromEntries(uploadResponse.headers));
    
    let errorData;
    try {
      errorData = await uploadResponse.json();
    } catch {
      console.log('Could not parse error response as JSON');
      const textResponse = await uploadResponse.text();
      console.log('Raw response:', textResponse.substring(0, 500));
      throw new Error(`Twitter v1.1 media upload failed: ${uploadResponse.status} - Could not parse response`);
    }
    
    console.log('Detailed error:', errorData);
    throw new Error(`Twitter v1.1 media upload failed: ${uploadResponse.status} - ${JSON.stringify(errorData)}`);
  }
  
  const uploadResult = await uploadResponse.json();
  return uploadResult.media_id_string;
}

// Generic OAuth 1.0a signature generator
function generateBossHunterOAuthSignature(method: string, url: string, queryParams?: Record<string, string>) {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: process.env.BOSS_HUNTER_API_KEY || '',
    oauth_token: process.env.BOSS_HUNTER_ACCESS_TOKEN || '',
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_version: '1.0'
  };
  
  // Include query params in OAuth signature if provided
  const allParams = { ...oauthParams, ...(queryParams || {}) };
  
  const paramString = Object.keys(allParams)
    .sort()
    .map(key => `${key}=${encodeURIComponent(allParams[key])}`)
    .join('&');
  
  const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
  const signingKey = `${encodeURIComponent(process.env.BOSS_HUNTER_API_SECRET || '')}&${encodeURIComponent(process.env.BOSS_HUNTER_ACCESS_TOKEN_SECRET || '')}`;
  const signature = crypto.createHmac('sha1', signingKey).update(signatureBaseString).digest('base64');
  
  const authParams: Record<string, string> = { ...oauthParams, oauth_signature: signature };
  const authHeader = 'OAuth ' + Object.keys(authParams)
    .sort()
    .map(key => `${key}="${encodeURIComponent(authParams[key])}"`)
    .join(', ');
  
  return { authHeader };
}

// OAuth 1.0a signature for tweet posting (no body params)
function generateBossHunterOAuthSignatureForTweets() {
  return generateBossHunterOAuthSignature('POST', 'https://api.twitter.com/2/tweets');
}

// OAuth 1.0a signature for image upload (includes body params)
function generateBossHunterOAuthSignatureForUpload(bodyParams: Record<string, string>) {
  return generateBossHunterOAuthSignature('POST', 'https://upload.twitter.com/1.1/media/upload.json', bodyParams);
}

// Post daily status tweet to Boss Hunter Twitter account
export async function postDailyStatusToTwitter(
  price: number
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
    console.log('🐦 Starting daily status tweet posting process...');
    console.log('💰 Current ETH price:', price);
    
    // Load boss data
    const bossDataPath = path.join(process.cwd(), 'public', 'eth-weekly-highs.json');
    const bossDataRaw = fs.readFileSync(bossDataPath, 'utf8');
    const bossData = JSON.parse(bossDataRaw);
    
    // Analyze current battle state
    const battleState = analyzeBattleState(price, bossData);
    console.log('⚔️ Battle state:', {
      currentBoss: battleState.currentBoss?.name || 'All Defeated',
      progress: Math.round(battleState.progress * 100),
      status: battleState.battleStatus,
      bossesDefeated: battleState.bossesDefeated
    });
    
    // Generate daily status tweet with boss image
    const tweetContent = generateDailyStatusTweet(battleState);
    const tweetText = tweetContent.text;
    const imagePath = tweetContent.image;
    
    console.log('📝 Tweet text length:', tweetText.length);
    console.log('📸 Image path:', imagePath || 'None');
    
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
    
    // Post tweet with optional media
    const tweetPayload: { text: string; media?: { media_ids: string[] } } = {
      text: tweetText
    };
    
    if (mediaId) {
      tweetPayload.media = { media_ids: [mediaId] };
    }
    
    // Use OAuth 2.0 Bearer token if available, otherwise fall back to OAuth 1.0a
    const headers =  
    {
      'Authorization': generateBossHunterOAuthSignatureForTweets().authHeader,
      'Content-Type': 'application/json',
    };
    
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers,
      body: JSON.stringify(tweetPayload)
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers));
    
    if (!response.ok) {
      const errorData = await response.json();
      console.log('❌ Twitter API error response:', errorData);
       if (response.status === 429) {
        const resetTime = response.headers.get('x-rate-limit-reset');
        if (resetTime) {
          // const resetDate = new Date(parseInt(resetTime) * 1000);
          // const minutesUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60));
        }
      }
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

// Check for boss defeats and post tweets
export async function checkAndPostBossDefeats(
  currentPrice: number,
  lastCheckedPrice: number
): Promise<{ 
  success: boolean; 
  currentPrice: number; 
  newlyDefeatedCount: number; 
  bossSwitchCount: number;
  results: Array<{
    boss: string;
    price: number;
    success: boolean;
    tweetId?: string;
    error?: string;
    type: 'defeat' | 'boss_switch';
  }>;
  lastDefeatedBossIndex: number;
  failedCount: number;
}> {
  try {
    console.log('🔍 Checking for boss defeats and switches...');
    console.log('💰 Current price:', currentPrice);
    console.log('📊 Last checked price:', lastCheckedPrice);

    // Load boss data
    const bossDataPath = path.join(process.cwd(), 'public', 'eth-weekly-highs.json');
    const bossDataRaw = fs.readFileSync(bossDataPath, 'utf8');
    const bossData = JSON.parse(bossDataRaw);
    const sortedBosses = [...bossData].sort((a, b) => a.high - b.high);

    // Find bosses that were defeated between lastCheckedPrice and currentPrice
    const newlyDefeatedBosses: BossData[] = [];
    let lastDefeatedBossIndex = -1;
    
    for (let i = 0; i < sortedBosses.length; i++) {
      const boss = sortedBosses[i];
      
      // Boss is defeated if:
      // 1. Current price is above boss level
      // 2. Last checked price was below boss level (meaning we just crossed it)
      if (currentPrice >= boss.high && lastCheckedPrice < boss.high) {
        newlyDefeatedBosses.push(boss);
        lastDefeatedBossIndex = i;
      }
    }

    // Find boss switches (when price drops and a new boss becomes current target)
    const bossSwitchBosses: BossData[] = [];
    
    // Get current and previous target bosses
    const currentTargetBoss = sortedBosses.find(boss => currentPrice < boss.high);
    const previousTargetBoss = sortedBosses.find(boss => lastCheckedPrice < boss.high);
    
    // If we have a different target boss and price dropped, it's a boss switch
    if (currentTargetBoss && previousTargetBoss && 
        currentTargetBoss.high !== previousTargetBoss.high && 
        currentPrice < lastCheckedPrice) {
      bossSwitchBosses.push(currentTargetBoss);
    }

    console.log('🎯 Newly defeated bosses:', newlyDefeatedBosses.length);
    console.log('🎯 Boss switch bosses:', bossSwitchBosses.length);

    const results = [];

    // Post a tweet for each newly defeated boss
    for (const defeatedBoss of newlyDefeatedBosses) {
      const battleState = analyzeBattleState(currentPrice, bossData);
      
      // Post the boss defeat tweet
      const tweetResult = await postBossDefeatTweet(defeatedBoss, currentPrice, battleState, bossData);
      
      results.push({
        boss: defeatedBoss.name || `Level ${lastDefeatedBossIndex + 1}`,
        price: defeatedBoss.high,
        success: tweetResult.success,
        tweetId: tweetResult.tweetId,
        error: tweetResult.error,
        type: 'defeat' as const
      });

      // Add a small delay between tweets if multiple bosses defeated
      if (newlyDefeatedBosses.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // Post a tweet for each boss switch
    for (const switchBoss of bossSwitchBosses) {
      const battleState = analyzeBattleState(currentPrice, bossData);
      
      // Post the boss switch tweet
      const tweetResult = await postBossSwitchTweet(switchBoss, currentPrice, lastCheckedPrice, battleState);
      
      results.push({
        boss: switchBoss.name || 'Unknown Boss',
        price: switchBoss.high,
        success: tweetResult.success,
        tweetId: tweetResult.tweetId,
        error: tweetResult.error,
        type: 'boss_switch' as const
      });

      // Add a small delay between tweets
      if (bossSwitchBosses.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // Check if all tweets were successful
    const allTweetsSuccessful = results.every(result => result.success);
    const failedTweets = results.filter(result => !result.success);
    
    if (failedTweets.length > 0) {
      console.log('❌ Some tweets failed:', failedTweets.map(r => `${r.boss} (${r.type}): ${r.error}`));
    }

    return {
      success: allTweetsSuccessful,
      currentPrice,
      newlyDefeatedCount: newlyDefeatedBosses.length,
      bossSwitchCount: bossSwitchBosses.length,
      results,
      lastDefeatedBossIndex,
      failedCount: failedTweets.length
    };

  } catch (error) {
    console.error('Failed to check for boss defeats and boss switches:', error);
    return {
      success: false,
      currentPrice,
      newlyDefeatedCount: 0,
      bossSwitchCount: 0,
      results: [],
      lastDefeatedBossIndex: -1,
      failedCount: 0
    };
  }
}

// Post boss defeat tweet to Boss Hunter Twitter account
async function postBossDefeatTweet(
  defeatedBoss: BossData,
  currentPrice: number,
  battleState: BattleState,
  bossData: BossData[]
): Promise<{ success: boolean; tweetId?: string; error?: string }> {
  const requiredVars = [
    'BOSS_HUNTER_API_KEY', 'BOSS_HUNTER_API_SECRET',
    'BOSS_HUNTER_ACCESS_TOKEN', 'BOSS_HUNTER_ACCESS_TOKEN_SECRET'
  ];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    return { success: false, error: `Missing Boss Hunter Twitter credentials: ${missingVars.join(', ')}` };
  }

  try {
    console.log('💀 Starting boss defeat tweet posting...');
    console.log('🎯 Defeated boss:', defeatedBoss.name);
    console.log('💰 Current ETH price:', currentPrice);

    // Generate boss defeat tweet
    const tweetText = generateBossDefeatTweet(defeatedBoss, currentPrice, battleState, bossData);
    console.log('📝 Tweet text length:', tweetText.length);

    // Post tweet using OAuth 1.0a signature
    const headers = {
      'Authorization': generateBossHunterOAuthSignatureForTweets().authHeader,
      'Content-Type': 'application/json',
    };

    const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
      headers,
      body: JSON.stringify({ text: tweetText })
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.log('❌ Twitter API error response:', errorData);
      throw new Error(`Boss Hunter Twitter API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    return { success: true, tweetId: result.data?.id };

  } catch (error) {
    console.error('Failed to post boss defeat tweet:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Post boss switch tweet to Boss Hunter Twitter account
async function postBossSwitchTweet(
  newTargetBoss: BossData,
  currentPrice: number,
  lastCheckedPrice: number,
  battleState: BattleState
): Promise<{ success: boolean; tweetId?: string; error?: string }> {
  const requiredVars = [
    'BOSS_HUNTER_API_KEY', 'BOSS_HUNTER_API_SECRET',
    'BOSS_HUNTER_ACCESS_TOKEN', 'BOSS_HUNTER_ACCESS_TOKEN_SECRET'
  ];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    return { success: false, error: `Missing Boss Hunter Twitter credentials: ${missingVars.join(', ')}` };
  }

  try {
    console.log('🎯 Starting boss switch tweet posting...');
    console.log('🎯 New target boss:', newTargetBoss.name);
    console.log('💰 Current ETH price:', currentPrice);
    console.log('📊 Last checked price:', lastCheckedPrice);

    // Generate boss switch tweet
    const tweetText = generateBossSwitchTweet(newTargetBoss, currentPrice, lastCheckedPrice, battleState);
    console.log('📝 Tweet text length:', tweetText.length);

    // Post tweet using OAuth 1.0a signature
    const headers = {
      'Authorization': generateBossHunterOAuthSignatureForTweets().authHeader,
      'Content-Type': 'application/json',
    };

    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers,
      body: JSON.stringify({ text: tweetText })
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.log('❌ Twitter API error response:', errorData);
      throw new Error(`Boss Hunter Twitter API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    return { success: true, tweetId: result.data?.id };

  } catch (error) {
    console.error('Failed to post boss switch tweet:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Test authentication by fetching tweets from @Ethbosshunter account
export async function testBossHunterAuth(): Promise<{ success: boolean; user?: Record<string, unknown>; error?: string }> {
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
    console.log('🔍 Testing Boss Hunter authentication by looking up user...');
    
    const userUrl = 'https://api.twitter.com/2/users/by/username/Ethbosshunter';
    
    console.log('🔍 Looking up user @Ethbosshunter...');
    const response = await fetch(userUrl, {
      method: 'GET',
      headers: {
        'Authorization': generateBossHunterOAuthSignature('GET', userUrl).authHeader,
      }
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers));
    
    if (!response.ok) {
      const errorData = await response.json();
      console.log('❌ Error response:', errorData);
      throw new Error(`Twitter API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    const result = await response.json();
    console.log('✅ Successfully authenticated!');
    console.log('📊 User data:', result.data);
    
    return {
      success: true,
      user: result.data
    };
    
  } catch (error) {
    console.error('❌ Failed to test authentication:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}