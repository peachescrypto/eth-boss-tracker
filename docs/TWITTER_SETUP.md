# Twitter Bot Setup Guide

This guide explains how to set up the automated Twitter bot for ETH Boss Hunter.

## 1. Twitter Developer Account Setup

### Get Twitter API Credentials
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Apply for a developer account (if you don't have one)
3. Create a new project/app
4. Generate the following credentials:
   - **API Key** (Consumer Key)
   - **API Secret** (Consumer Secret)
   - **Access Token** 
   - **Access Token Secret**

### Required Permissions
Make sure your Twitter app has:
- ✅ **Read and Write** permissions (to post tweets)
- ✅ **Tweet** permissions enabled

## 2. Environment Variables

Add these to your `.env.local` file (create if it doesn't exist):

```bash
# Twitter Bot Configuration (OAuth 1.0a)
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here

# Optional: GitHub Webhook Secret (for security)
GITHUB_WEBHOOK_SECRET=your_github_webhook_secret_here
```

## 3. GitHub Webhook Setup

### Configure Repository Webhook
1. Go to your GitHub repository settings
2. Navigate to **Settings > Webhooks**
3. Click **Add webhook**
4. Configure:
   - **Payload URL**: `https://your-vercel-domain.vercel.app/api/webhook/github`
   - **Content type**: `application/json`
   - **Secret**: (optional, for security)
   - **Events**: Select "Just the push event"
   - **Active**: ✅ Checked

### Webhook URL
Replace with your actual Vercel deployment URL:
```
https://eth-boss-tracker-5p6a27l92-peachescryptos-projects.vercel.app/api/webhook/github
```

## 4. Tweet Templates

The bot automatically generates different tweet types based on commit messages:

### Deploy Tweets
Triggered by: `deploy`, `release`, `production`
```
🚀 ETH Boss Hunter DEPLOYED!

"your commit message"

⚔️ Hunt bosses: https://eth-boss-tracker.vercel.app

#ETH #BossHunter #Crypto #Web3
```

### Feature Tweets
Triggered by: `feat`, `add`, `new`, `implement`
```
⚡ ETH Boss Hunter UPDATE!

🔥 your commit message

📦 X commits ✨

⚔️ https://eth-boss-tracker.vercel.app

#BossHunter #ETH #Build
```

### Bug Fix Tweets
Triggered by: `fix`, `bug`, `patch`, `repair`
```
🛠️ ETH Boss Hunter FIXED!

✅ your commit message

The hunt continues stronger! ⚔️

https://eth-boss-tracker.vercel.app

#BossHunter #ETH #DevLife
```

## 5. Testing the Setup

### Test Webhook Locally
```bash
# Start development server
npm run dev

# Use ngrok to expose localhost (for testing)
npx ngrok http 3000

# Update GitHub webhook URL to ngrok URL temporarily
```

### Test Tweet Generation
Create a test commit and push to main:
```bash
git add .
git commit -m "feat: test Twitter bot integration"
git push origin main
```

### Verify in Vercel Logs
1. Go to Vercel dashboard
2. Navigate to your project
3. Check **Functions** tab for webhook logs
4. Look for successful POST requests to `/api/webhook/github`

## 6. Deployment

### Add Environment Variables to Vercel
1. Go to Vercel dashboard > Your Project > Settings
2. Navigate to **Environment Variables**
3. Add each Twitter credential:
   - `TWITTER_API_KEY`
   - `TWITTER_API_SECRET` 
   - `TWITTER_ACCESS_TOKEN`
   - `TWITTER_ACCESS_TOKEN_SECRET`
4. Redeploy to apply changes

### Deploy Changes
```bash
git add .
git commit -m "feat: add Twitter bot for automated commit tweets"
git push origin main
```

The webhook will automatically trigger and should post your first automated tweet! 🚀

## 7. Future Enhancements

- **Boss Defeat Tweets**: Automatic tweets when ETH price breaks through boss levels
- **Daily Progress**: Scheduled tweets with current boss battle status
- **Milestone Celebrations**: Special tweets for development milestones
- **Rich Media**: Tweet images/charts showing progress
- **Community Engagement**: Reply to mentions and engage with followers
