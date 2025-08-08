# ETH Boss Tracker

A fun web app that tracks the current ETH price against historic daily candle tops since January 2021. Shows progress indicators for each historic high, helping visualize how close ETH is to breaking previous daily highs.

## Features

- **Live Price Tracking**: Fetches current ETH price every 15 seconds from multiple providers (Coinbase, Binance, CoinGecko)
- **Historic Daily Highs**: Displays all daily candle tops sorted from lowest to highest
- **Progress Indicators**: Shows how close the current price is to each historic high
- **Responsive Design**: Works on desktop and mobile
- **Error Handling**: Graceful fallbacks when price APIs are unavailable

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

The app is designed to deploy on Vercel with zero configuration. The serverless API routes handle price fetching with appropriate caching and error handling.

## Future Enhancements

- Expand daily highs dataset to full 2021→present
- Add search and filtering capabilities
- Implement historical price charts
- Add more cryptocurrencies
- Real-time WebSocket price updates

## License

MIT
