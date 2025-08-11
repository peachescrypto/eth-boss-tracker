require('dotenv').config({ path: '.env.local' });

// Copy of postToBossHunterTwitter function for Node.js testing
async function postToBossHunterTwitter(content) {
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
    const tweetText = typeof content === 'string' ? content : content.text;
    const imagePath = typeof content === 'object' ? content.image : undefined;
    
    let mediaId = undefined;
    if (imagePath) {
      try {
        console.log(`🖼️ Attempting to upload image: ${imagePath}`);
        
        // Debug: Test that the same credentials work for a simple API call
        console.log('🧪 Testing credentials with a simple API call first...');
        const testOAuth = generateBossHunterOAuthSignature();
        console.log('✅ OAuth generation for tweets works');
        
        mediaId = await uploadImageToTwitter(imagePath);
        console.log(`📸 Image uploaded successfully: ${mediaId}`);
      } catch (imageError) {
        console.warn('Failed to upload image, posting without:', imageError.message);
        console.warn('Continuing with text-only tweet...');
      }
    }
       
    const tweetPayload = {
      text: tweetText
    };
    
    if (mediaId) {
      tweetPayload.media = { media_ids: [mediaId] };
    }
    
    const headers =
    {
      'Authorization': generateBossHunterOAuthSignature().authHeader,
      'Content-Type': 'application/json',
    };
    
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers,
      body: JSON.stringify(tweetPayload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      
      // Show rate limit headers for 429 errors
      if (response.status === 429) {
        console.log('\n🔴 Rate Limit Headers:');
        console.log('x-rate-limit-remaining:', response.headers.get('x-rate-limit-remaining'));
        console.log('x-rate-limit-reset:', response.headers.get('x-rate-limit-reset'));
        console.log('x-rate-limit-limit:', response.headers.get('x-rate-limit-limit'));
        
        const resetTime = response.headers.get('x-rate-limit-reset');
        if (resetTime) {
          const resetDate = new Date(parseInt(resetTime) * 1000);
          console.log('Rate limit resets at:', resetDate.toLocaleString());
          const minutesUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60));
          console.log(`Minutes until reset: ${minutesUntilReset}`);
        }
        console.log('');
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

async function uploadImageToTwitter(imagePath) {
  const fs = require('fs');
  const path = require('path');
  const crypto = require('crypto');
  
  const fullImagePath = path.join(process.cwd(), 'public', imagePath.startsWith('/') ? imagePath.substring(1) : imagePath);
  
  if (!fs.existsSync(fullImagePath)) {
    throw new Error(`Image file not found: ${fullImagePath}`);
  }
  
  // Read and encode the image
  const imageData = fs.readFileSync(fullImagePath);
  const base64Image = imageData.toString('base64');
  
  // Use OAuth 1.0a for v1.1 media upload (same credentials as tweet posting)
  const oauthParams = {
    oauth_consumer_key: process.env.BOSS_HUNTER_API_KEY,
    oauth_token: process.env.BOSS_HUNTER_ACCESS_TOKEN,
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
    .map(key => `${key}=${encodeURIComponent(allParams[key])}`)
    .join('&');
  
  const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
  const signingKey = `${encodeURIComponent(process.env.BOSS_HUNTER_API_SECRET)}&${encodeURIComponent(process.env.BOSS_HUNTER_ACCESS_TOKEN_SECRET)}`;
  const signature = crypto.createHmac('sha1', signingKey).update(signatureBaseString).digest('base64');
  
  // Create OAuth header
  const authParams = { ...oauthParams, oauth_signature: signature };
  const authHeader = 'OAuth ' + Object.keys(authParams)
    .sort()
    .map(key => `${key}="${encodeURIComponent(authParams[key])}"`)
    .join(', ');
  
  // Debug: Log signature generation details
  console.log('🔍 OAuth Debug Info:');
  console.log('Method:', method);
  console.log('URL:', url);
  console.log('OAuth Params:', oauthParams);
  console.log('Param String:', paramString);
  console.log('Signature Base String:', signatureBaseString);
  console.log('Signing Key (first 20 chars):', signingKey.substring(0, 20) + '...');
  console.log('Generated Signature:', signature);
  console.log('Auth Header:', authHeader);
  console.log('');
  
  // Create form body with media data
  const formDataParams = new URLSearchParams();
  formDataParams.append('media_data', base64Image);
  formDataParams.append('media_category', 'tweet_image');
  
  console.log('📝 Request Details:');
  console.log('Body size:', formDataParams.toString().length, 'characters');
  console.log('Image size:', base64Image.length, 'characters');
  console.log('');
  
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
    console.log('❌ Upload failed with status:', uploadResponse.status);
    console.log('Response headers:', Object.fromEntries(uploadResponse.headers));
    
    let errorData;
    try {
      errorData = await uploadResponse.json();
    } catch (parseError) {
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
  const signature = crypto.createHmac('sha1', signingKey).update(signatureBaseString).digest('base64');
  
  const authParams = { ...oauthParams, oauth_signature: signature };
  const authHeader = 'OAuth ' + Object.keys(authParams)
    .sort()
    .map(key => `${key}="${encodeURIComponent(authParams[key])}"`)
    .join(', ');
  
  return { authHeader };
}

async function testImageUpload() {
  console.log('🎯 Testing Boss Hunter Image Upload...');
  
  // Test with the same format that was working
  const testTweetContent = {
    text: `⚔️ Daily Boss Battle Report

👹 Boss: Sevrath  
💰 Target: $4,460.47
📈 ETH: $4,450

❤️ HP: 1/45
░░░░░░░░░░ 2%

⚔️ Status: 💀 Almost defeated!
💥 Damage Dealt: $44
🎯 To Victory: $11

#ETHBossHunter $ETH

🧪 Image Test: ${new Date().toLocaleTimeString()}`,
    image: '/images/sevrath.png'
  };
  
  console.log('📝 Testing tweet with image:');
  console.log('='.repeat(50));
  console.log(testTweetContent.text);
  console.log(`🖼️ Image: ${testTweetContent.image}`);
  console.log('='.repeat(50));
  console.log(`Length: ${testTweetContent.text.length} characters`);
  console.log('');
  
  try {
    console.log('🐦 Posting to ETH Boss Hunter Twitter with image...');
    const result = await postToBossHunterTwitter(testTweetContent);
    
    if (result.success) {
      console.log('✅ Tweet with image posted successfully!');
      console.log(`Tweet ID: ${result.tweetId}`);
      console.log(`URL: https://twitter.com/i/web/status/${result.tweetId}`);
    } else {
      console.error('❌ Failed to post tweet with image:', result.error);
    }
  } catch (error) {
    console.error('❌ Error during image upload test:', error.message);
  }
}

testImageUpload().catch(console.error);
