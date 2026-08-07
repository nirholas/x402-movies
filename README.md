# x402-movies

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![x402](https://img.shields.io/badge/payments-x402-0052ff.svg)](https://x402.org)
[![USDC on Base](https://img.shields.io/badge/USDC-Base-0052ff.svg)](https://base.org)
[![USDC on Solana](https://img.shields.io/badge/USDC-Solana-14f195.svg)](https://solana.com)

**Movie catalog concierge over TMDB — search, details, and recommendations per
query.** $0.001 to search, $0.001 for the full detail bundle, $0.002 for ranked
recommendations, in USDC on Base *or* Solana. Cast, crew, streaming providers by
country, release dates and certifications all come back in the response body.

Docs site: **https://nirholas.github.io/x402-movies/**

## Why x402 for this

Catalogue lookups are the cheapest thing an agent does and the most annoying
thing to provision: a key per developer, per app, per environment, with terms
that forbid the exact redistribution an agent needs. x402 inverts it — the route
prices itself at $0.001 in the 402 response, the agent pays from whichever chain
it holds funds on, and one lookup costs one lookup. No key to leak, no plan to
outgrow, and a recommendation call that costs less than the electricity to
render it.

## Quickstart

```bash
git clone https://github.com/nirholas/x402-movies
cd x402-movies
npm install
npm run dev            # http://localhost:4024 — no configuration needed
```

See the price with no wallet at all:

```bash
curl -s "http://localhost:4024/search?q=blade%20runner" | jq
# 402 + accepts: [ USDC on Base, USDC on Solana ]
```

Then buy it, from an agent (wallet funded with Base Sepolia USDC —
https://faucet.circle.com):

```bash
PRIVATE_KEY=0xYourTestKey npm run client
```

## API

| Route | Price | What you get back |
|-------|-------|-------------------|
| `GET /search` | **$0.001** | Matching titles with year, rating, vote count, overview and artwork URLs |
| `GET /movie/:id` | **$0.001** | Metadata, tagline, runtime, budget/revenue, genres, cast and key crew, streaming and rental providers by country, and release dates with certifications |
| `GET /recommendations/:id` | **$0.002** | Ranked related titles, each with a 0-1 `score` and the `reasons` behind its placement — rating, vote confidence, era proximity, language match and popularity |
| `GET /` | free | Service metadata, live prices, active payment rails, backend status |
| `GET /health` | free | Liveness probe |
| `GET /.well-known/x402` | free | Machine-readable discovery manifest |

Full reference: [docs/api.md](docs/api.md) · [openapi.json](openapi.json)

## How x402 works

**Pay in USDC on Base or Solana — your client picks the rail.**

1. **402** — the route, called without payment, replies HTTP 402 with an
   `accepts` array holding **both** rails: exact price
   ($0.001 → `1000` USDC base units), asset, and `payTo`.
2. **Sign** — on Base, the client signs an EIP-3009 USDC authorization (no gas
   from the payer). On Solana, it signs an SPL `transferChecked` whose fee payer
   is the facilitator's sponsor account (so the buyer needs USDC only, no SOL).
3. **Settle** — the server hands the payload to the facilitator
   (`https://x402.org/facilitator`), which verifies and settles on the chosen chain.
4. **200** — the same request returns the artifact in the body, with the
   settlement receipt in the `X-PAYMENT-RESPONSE` header.

| Rail | Network | Asset | payTo |
|------|---------|-------|-------|
| EVM | `base-sepolia` (`base` on mainnet) | USDC | `0x40252CFDF8B20Ed757D61ff157719F33Ec332402` |
| Solana | `solana` (`solana-devnet` on devnet) | USDC | `WwwuGbqHrwF5RG89KhUbmRWEvjnRH9k5kVM5p7T3WwW` |

Those are the suite's public receive addresses and the server's defaults. Set
`PAY_TO_ADDRESS` / `SOLANA_PAY_TO_ADDRESS` to be paid yourself.

Walkthroughs: [examples/curl.md](examples/curl.md) ·
[examples/agent-client.ts](examples/agent-client.ts) ·
[docs/tutorial.md](docs/tutorial.md)

## Real backend / API keys

| Env | Effect |
|-----|--------|
| `TMDB_API_KEY` *or* `TMDB_ACCESS_TOKEN` | Live [TMDB](https://www.themoviedb.org/settings/api) catalogue (`source: "tmdb"`). `TMDB_API_KEY` is the v3 key; `TMDB_ACCESS_TOKEN` is the v4 bearer token. Either works; both are free. |
| *(unset)* | Deterministic fixture catalogue, honestly labelled `source: "fixture"`. Same query → same titles, and fixture ids resolve on `/movie/:id` and `/recommendations/:id`. The demo never requires a key. |

All variables: [.env.example](.env.example)

## For AI agents

- **[skill.md](skill.md)** — agent-facing skill file: endpoints, prices,
  schemas, both payment rails. Point your agent at it.
- **`GET /.well-known/x402`** — discovery manifest listing every resource with
  both networks. Indexable by [x402scan.com](https://x402scan.com), the x402
  Bazaar, and [agentic.market](https://agentic.market).
- **MCP** — [examples/mcp-tool.md](examples/mcp-tool.md) exposes these routes as
  Claude MCP tools, with per-wallet spend caps and a
  `claude_desktop_config.json` example.
- More: [docs/agents.md](docs/agents.md)

## Docs

- Landing: https://nirholas.github.io/x402-movies/
- [Tutorial](docs/tutorial.md) · [API reference](docs/api.md) · [For AI agents](docs/agents.md)

## Support

Questions, bugs, or a listing request: **nichxbt@gmail.com** ·
[open an issue](https://github.com/nirholas/x402-movies/issues)

## License

Apache-2.0. Part of the [x402 Suite](https://github.com/nirholas/x402-suite).
