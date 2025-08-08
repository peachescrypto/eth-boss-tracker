# ETH Boss Tracker — Decisions Log

Purpose:
- Record key choices and why. Update if decisions change.

## 0001 — Tech Stack (2025-08-08)
- Decision: Next.js 14 (App Router) + TypeScript, deployed on Vercel.
- Rationale: First-class Vercel support, serverless API routes, simple deploys.

## 0002 — Price Providers (2025-08-08)
- Decision: Primary Coinbase `https://api.exchange.coinbase.com/products/ETH-USD/ticker`; fallback Binance `https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT`; fallback CoinGecko `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`.
- Rationale: Free, no keys; good latency; diversify against rate limits/outages.

## 0003 — Polling Interval (2025-08-08)
- Decision: Client polls `/api/price` every 10–15s via SWR; server caches for ~10s.
- Rationale: Balance freshness vs provider rate limits.

## 0004 — Historical Highs Data (2025-08-08)
- Decision: Start with hardcoded `data/eth-daily-highs.json` committed to repo; consider script to generate later.
- Rationale: Faster MVP; deterministic builds.

## 0005 — Deployment (2025-08-08)
- Decision: Vercel with default settings; ensure serverless route works on Edge/Node runtime as needed.
- Rationale: Simplicity and free tier convenience. 