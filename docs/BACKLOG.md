# ETH Boss Tracker — Backlog

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

## Backlog (MVP)
- [ ] Scaffold project (Next.js app, ESLint/Prettier)
- [ ] Add data file: `data/eth-daily-highs.json` (hardcode initial subset)
- [ ] Serverless price endpoint `app/api/price/route.ts`
  - [ ] Primary: Coinbase `https://api.exchange.coinbase.com/products/ETH-USD/ticker`
  - [ ] Fallback: Binance `https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT`
  - [ ] Fallback: CoinGecko `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`
  - [ ] Normalize `{ priceUsd, source, ts }`, timeout + retry, 5–15s in-memory cache
- [ ] Page `app/page.tsx`: load highs JSON, client fetch `/api/price` (SWR, 10–15s)
- [ ] Table sorted ascending by `high`; show price (USD) and date (UTC)
- [ ] Progress calc per row:
  - [ ] `prev = previous?.high ?? 0`
  - [ ] `progress = clamp((currentPrice - prev) / (row.high - prev), 0, 1)`
  - [ ] If `row.high === prev`, treat as 1 if `current >= row.high` else 0
- [ ] Simple progress bar UI; 100% when `current >= row.high`
- [ ] Formatting: Intl for USD + date `YYYY-MM-DD`
- [ ] Error states: API failure → last good price + message
- [ ] Deploy to Vercel; verify API route works
- [ ] Minimal `README.md` with provider notes

## Nice-to-have (post-MVP)
- [ ] Expand `eth-daily-highs.json` to full 2021→present
- [ ] Script to generate highs from historical API and commit JSON
- [ ] Search/filter, sticky header, theming/animations
- [ ] Unit tests (progress calc, API normalizer)
- [ ] GitHub Issues/Project board if moving to GitHub

## Research/Decisions Log
- Price providers (no key): Coinbase (primary), Binance (fallback), CoinGecko (fallback).
- Poll interval target: 10–15s (balance freshness vs rate limits).

## Links
- Coinbase Ticker: `https://api.exchange.coinbase.com/products/ETH-USD/ticker`
- Binance Price: `https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT`
- CoinGecko Simple Price: `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`