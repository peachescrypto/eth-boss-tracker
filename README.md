# ETH Boss Hunter

A fun web app that tracks the current ETH price against historic weekly candle highs since January 2020. Shows progress indicators for each historic high, helping visualize how close ETH is to breaking previous weekly highs.

## Features

- **Live Price Tracking**: Fetches current ETH price every 15 seconds from multiple providers (Coinbase, Binance, CoinGecko)
- **Historic Weekly Highs**: Displays all weekly candle highs above $4000 since 2020, sorted from lowest to highest
- **Boss Battle System**: Each weekly high represents a "boss" with names, images, and battle progression
- **Progress Indicators**: Shows how close the current price is to defeating each boss level
- **Responsive Design**: Works on desktop and mobile with boss avatars and battle status
- **Error Handling**: Graceful fallbacks when price APIs are unavailable
- **Twitter Bot Integration**: 
  - Development account for commit/deploy tweets
  - ETH Boss Hunter account for automated battle status and boss defeat celebrations

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: SWR for client-side polling
- **Deployment**: Vercel

## Price Data Sources

The app uses multiple free APIs with fallback logic:

1. **Primary**: Coinbase Exchange API
   - Endpoint: `https://api.exchange.coinbase.com/products/ETH-USD/ticker`
   - No API key required
   - Real-time USD price

2. **Fallback 1**: Binance API
   - Endpoint: `https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT`
   - No API key required
   - USDT price (very close to USD)

3. **Fallback 2**: CoinGecko API
   - Endpoint: `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`
   - No API key required
   - Slower but reliable

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Update weekly historical data (weekly highs above $4000 since 2020)
npm run fetch-weekly-data

# Twitter Bot Testing
npm run test-twitter        # Test development account (commit tweets)
npm run test-boss-hunter    # Test ETH Boss Hunter account (battle tweets)
npm run test-auth           # Test Twitter authentication
npm run iterate-tweets      # Preview all tweet types without posting

# Test specific tweet types
npm run iterate-tweets defeat             # run all the variants
npm run iterate-tweets defeat 4100        # Boss defeat tweet at $4100
npm run iterate-tweets daily 4200         # Daily status at $4200
npm run iterate-tweets milestone 4300 90  # 90% milestone tweet
```

## Data Structure

Weekly highs are stored in `public/eth-weekly-highs.json`:

```json
[
  {
    "date": "2024-12-09",
    "high": 4006.17,
    "name": "Gorath",
    "image": "/images/gorath.png"
  },
  {
    "date": "2021-08-30", 
    "high": 4027.88,
    "name": "Nyxara",
    "image": "/images/nyxara.png"
  }
]
```

- `name` and `image` fields are optional for boss customization
- Missing boss images fall back to generated avatars
- Data is sorted by price (lowest to highest) for boss progression

## Battle Mechanics

For each boss battle, progress is calculated as:
```
progress = (currentPrice - previousBossPrice) / (targetBossPrice - previousBossPrice)
```

**Battle States:**
- **😴 Resting** (0-25%): Boss is dormant
- **⚡ Approaching** (25-50%): Battle begins
- **🔥 Heating Up** (50-75%): Battle intensifies
- **🚨 Critical** (75-90%): Critical battle phase
- **⚔️ Final Assault** (90-100%): Final push to victory
- **🏆 Defeated** (≥100%): Boss defeated, move to next boss

**Tweet Types:**
- **Daily Status**: Battle progress reports
- **Boss Defeats**: Celebration when bosses fall
- **Milestones**: Special alerts at 50%, 75%, 90% progress
- **Legendary Status**: All bosses defeated celebration

## Deployment

### Initial Deployment to Vercel

The app is designed to deploy on Vercel with zero configuration. The serverless API routes handle price fetching with appropriate caching and error handling.

**Option 1: Deploy via GitHub (Recommended)**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "Add New" → "Project"
4. Import your repository
5. Vercel will auto-detect Next.js settings
6. Click "Deploy"

**Option 2: Deploy via Vercel CLI**
```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Deploying Changes

Once your initial deployment is set up, future updates are automatic:

**Via GitHub (Auto-deployment)**
- Simply push changes to your main branch
- Vercel will automatically detect changes and redeploy
- No manual intervention needed

```bash
git add .
git commit -m "Your change description"
git push origin main
# Vercel automatically deploys within 1-2 minutes
```

**Via Vercel CLI (Manual deployment)**
```bash
# Deploy latest changes to production
vercel --prod

# Deploy to preview (for testing)
vercel
```

### Environment Variables

For basic functionality, no environment variables are required - the app uses public APIs without authentication.

For Twitter bot integration, add to `.env.local`:
```bash
# Development Account (Peaches) - for commit/deploy tweets
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here

# ETH Boss Hunter Account - for battle tweets
BOSS_HUNTER_API_KEY=your_boss_hunter_api_key_here
BOSS_HUNTER_API_SECRET=your_boss_hunter_api_secret_here
BOSS_HUNTER_ACCESS_TOKEN=your_boss_hunter_access_token_here
BOSS_HUNTER_ACCESS_TOKEN_SECRET=your_boss_hunter_access_token_secret_here
```

See `docs/TWITTER_SETUP.md` for detailed Twitter bot configuration.

### Build Settings

Vercel automatically detects the following settings:
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `next dev`

## Twitter Bot Features

### Development Account
- **Commit Tweets**: Automatic tweets when code is pushed to main branch
- **Deploy Notifications**: Alerts when new features go live
- **Milestone Celebrations**: Development progress updates

### ETH Boss Hunter Account  
- **Daily Status Reports**: Morning battle status with current boss and progress
- **Boss Defeat Celebrations**: Immediate tweets when ETH breaks through boss levels
- **Critical Battles**: Special alerts when approaching victory (90%+ progress)
- **Legendary Status**: Epic celebration when all bosses are defeated

## API Endpoints

- `/api/price` - Current ETH price with fallback providers
- `/api/tweets/daily-status` - Generate and post daily battle status
- `/api/tweets/boss-defeat` - Monitor and celebrate boss defeats
- `/api/webhook/github` - Handle GitHub push events for commit tweets

## Future Enhancements

- **Scheduled Daily Tweets**: Automated morning battle reports
- **Real-time Boss Detection**: Instant boss defeat notifications
- **Community Features**: Army recruitment, battle predictions, victory celebrations
- **Rich Media**: Tweet boss images and battle progress charts
- **Historical Analysis**: Track ETH's journey through all boss levels

## License

MIT
