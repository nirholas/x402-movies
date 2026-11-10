---
name: query-movie-catalog
description: Run the x402-movies HTTP service and call its paid routes for movie search, full title records and ranked recommendations over TMDB. Use when an agent needs movie data and can pay per query in USDC over x402.
---

# Query the x402-movies catalog

x402-movies is an Express service. Each paid route returns its result in the 200 body, priced per call in USDC on Base or Solana (x402, HTTP 402). It uses TMDB when a key is set and labelled fixtures otherwise (the `source` field says `tmdb` or `fixture`).

Paying is irreversible. Before any paid call, show the user the route, price, network and payTo address from the 402 response, and wait for an explicit yes.

## Run the service

From a clone (Node 18+):

```bash
git clone https://github.com/nirholas/x402-movies
cd x402-movies && npm install
npm run dev        # tsx src/server.ts, listens on :4024 (PORT overrides)
```

Environment (all optional, see `.env.example`): `TMDB_API_KEY` (v3 key) or `TMDB_ACCESS_TOKEN` (v4 token, takes precedence), `PAY_TO_ADDRESS` (Base receive address), `SOLANA_PAY_TO_ADDRESS`, `NETWORK` (`base-sepolia` default, or `base`), `SOLANA_NETWORK` (`mainnet-beta` default, or `devnet`), `FACILITATOR_URL`, `PUBLIC_BASE_URL`. Set your own pay-to addresses to be paid yourself. `npm run build` then `npm start` runs the compiled server.

## Routes

| Route | Price | Params |
|---|---|---|
| `GET /search` | $0.001 | `q` (required, 1-200 chars), `year` (1870-2100), `page` (1-500) |
| `GET /movie/:id` | $0.001 | `id` from `/search`; returns cast, crew, watch providers by country, release dates |
| `GET /recommendations/:id` | $0.002 | `id` seed movie, `limit` (1-20, default 10); each result has `score` and `reasons` |
| `GET /health`, `GET /.well-known/x402`, `GET /` | free | service status and discovery |

The repo also serves `skill.md` and `openapi.json` at its root.

## Paying

An unpaid request to a paid route returns 402 with an `accepts` array listing both rails. Sign the entry your wallet supports and retry with the base64 `X-PAYMENT` header. The settlement receipt is in the `X-PAYMENT-RESPONSE` header. The reference client is `examples/agent-client.ts` (`npm run client`), which uses `x402-fetch` with `PRIVATE_KEY` for a Base Sepolia wallet and `BASE_URL` (default `http://localhost:4024`).

## Example

```bash
curl -i "localhost:4024/search?q=blade%20runner&year=1982"   # 402 with accepts[]
# after the user approves the price, via an x402 client:
#   pay("localhost:4024/search?q=blade%20runner") -> results[].id
#   pay("localhost:4024/recommendations/<id>?limit=5")
```
