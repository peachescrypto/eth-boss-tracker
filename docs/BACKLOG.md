# ETH Boss Hunter — Backlog

How to use:
- Move items between sections (Backlog → In Progress → Done).
- Use checkboxes; link PRs/issues when available.
- Keep decisions and links updated.

## MVP — Definition of Done
- Deployed to Vercel.
- Page shows sorted daily candle tops (since 2021-01) with date, price, and progress bars.
- Live price polled every ~10–15s via serverless endpoint with fallback providers and basic caching.
- Basic error handling and formatting.

## In Progress
- [ ] **Boss Battle Terminology** - "Defeated", "In Battle", "Next Boss", "Boss HP"
- [ ] **Progress Messaging** - "87% through the $4,500 boss fight!"
- [ ] **Daily Boss Challenges** - "Today's Boss: $4,150 - Can ETH defeat it?"
- [ ] **Real-time Notifications** - Alert when bosses are defeated

# Backlog

## App
- [ ] Restyle/theme to look pretty
- [ ] Current battle overview
- [ ] Search/filter, sticky header, theming/animations

## Maintenance
- [ ] Deploy from github, and post to twitter afterwards
- [ ] Unit tests (progress calc, API normalizer)

## Viral Features
- [x] **Rebrand to "ETH Boss Hunter"** - more engaging gaming terminology
- [ ] **Share Cards** - Generate beautiful social media images for sharing
- [ ] **Achievement System** - "First Boss Slayer", "Boss Rush", "Legendary Hunter"
- [ ] **Community Leaderboards** - "Boss Hunter of the Week"
- [ ] **Social Integration** - One-click share to Twitter/X
- [ ] **Boss Hunter Score** - "23/84 bosses defeated"
- [ ] **Victory Animations** - Celebrate when price breaks through
- [ ] **Multi-coin Support** - BTC Boss Hunter, SOL Boss Hunter
- [ ] **NFT Achievements** - For top hunters
- [ ] **Boss Hunter Tournaments** - Community competitions
- [ ] **API for Integration** - Let other apps use boss battle data

## Done
- [x] Scaffold project (Next.js app, ESLint/Prettier)
- [x] Add data file: `data/eth-daily-highs.json` (hardcode initial subset)
- [x] Serverless price endpoint `app/api/price/route.ts`
  - [x] Primary: Coinbase `https://api.exchange.coinbase.com/products/ETH-USD/ticker`
  - [x] Fallback: Binance `https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT`
  - [x] Fallback: CoinGecko `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`
  - [x] Normalize `{ priceUsd, source, ts }`, timeout + retry, 5–15s in-memory cache
- [x] Page `app/page.tsx`: load highs JSON, client fetch `/api/price` (SWR, 10–15s)
- [x] Table sorted ascending by `high`; show price (USD) and date (UTC)
- [x] Progress calc per row:
  - [x] `prev = previous?.high ?? 0`
  - [x] `progress = clamp((currentPrice - prev) / (row.high - prev), 0, 1)`
  - [x] If `row.high === prev`, treat as 1 if `current >= row.high` else 0
- [x] Simple progress bar UI; 100% when `current >= row.high`
- [x] Formatting: Intl for USD + date `YYYY-MM-DD`
- [x] Error states: API failure → last good price + message
- [x] Deploy to Vercel; verify API route works
- [x] Minimal `README.md` with provider notes
- [x] Create data fetching script with real historical data (Binance API, 2020 onwards, $4000+)
- [x] **Twitter Bot Setup** - Connect X account for automated tweets
- [x] **GitHub Webhook Integration** - Trigger tweets on commits/deploys
- [x] **Tweet Templates** - Engaging formats for different update types
- [x] **Progress Tweet Generator** - "🎯 ETH Boss Hunter Update: Added X feature! Current boss: $4,150 (87% defeated)"
- [x] **Deploy Announcements** - "🚀 New features deployed to ETH Boss Hunter!" (ready, needs Twitter API keys)
- [x] Expand `eth-daily-highs.json` to full 2021→present
- [x] Script to generate highs from historical API and commit JSON

## Research/Decisions Log
- Price providers (no key): Coinbase (primary), Binance (fallback), CoinGecko (fallback).
- Poll interval target: 10–15s (balance freshness vs rate limits).

## Links
- Coinbase Ticker: `https://api.exchange.coinbase.com/products/ETH-USD/ticker`
- Binance Price: `https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT`
- CoinGecko Simple Price: `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`