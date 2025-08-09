# ETH Boss Hunter

A fun web app that tracks the current ETH price against historic daily candle tops since January 2020. Shows progress indicators for each historic high, helping visualize how close ETH is to breaking previous daily highs.

## Features

- **Live Price Tracking**: Fetches current ETH price every 15 seconds from multiple providers (Coinbase, Binance, CoinGecko)
- **Historic Daily Highs**: Displays all daily candle tops sorted from lowest to highest
- **Progress Indicators**: Shows how close the current price is to each historic high
- **Responsive Design**: Works on desktop and mobile
- **Error Handling**: Graceful fallbacks when price APIs are unavailable
- **Twitter Bot**: Automated tweets for development progress and milestones

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
# Update historical data from Binance (2020 onwards, above $4000)
npm run fetch-data-binance

# Test Twitter bot functionality (requires .env.local setup)
npm run test-twitter

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Data Structure

Daily highs are stored in `public/eth-daily-highs.json`:

```json
[
  {
    "date": "2021-01-01",
    "high": 737.80
  }
]
```

## Progress Calculation

For each daily high, progress is calculated as:
```
progress = (currentPrice - previousHigh) / (targetHigh - previousHigh)
```

- Progress is clamped between 0% and 100%
- When current price ≥ target high, progress = 100%
- When target high = previous high, progress = 100% if current ≥ target, else 0%

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
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here
```

See `docs/TWITTER_SETUP.md` for detailed Twitter bot configuration.

### Build Settings

Vercel automatically detects the following settings:
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `next dev`

## Future Enhancements

- Expand daily highs dataset to full 2021→present
- Add search and filtering capabilities
- Implement historical price charts
- Add more cryptocurrencies
- Real-time WebSocket price updates

## License

MIT
