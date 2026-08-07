# Tutorial — x402-movies

From a clean checkout to a paid API call, on either payment rail.

## 1. Install

```bash
git clone https://github.com/nirholas/x402-movies
cd x402-movies
npm install
```

Node 18 or newer.

## 2. Configure (optional)

```bash
cp .env.example .env
```

Nothing is required. Out of the box the server:

- listens on port `4024`,
- accepts USDC on **Base Sepolia** and on **Solana**, paying out to the suite's
  public receive addresses,
- serves a deterministic fixture catalogue (no TMDB key needed).

To be paid yourself, change these two lines:

```bash
PAY_TO_ADDRESS=0xYourEvmAddress
SOLANA_PAY_TO_ADDRESS=YourSolanaAddress
```

To query the **real** catalogue, get a free key at
<https://www.themoviedb.org/settings/api> and set either one:

```bash
TMDB_API_KEY=your_v3_key
# or
TMDB_ACCESS_TOKEN=your_v4_read_access_token
```

Responses then come back with `"source": "tmdb"` instead of `"source": "fixture"`.
Everything else — routes, prices, payment — is identical.

## 3. Run the server

```bash
npm run dev
```

```
x402-movies v0.1.0 listening on :4024
  payment rails:
    EVM     base-sepolia  USDC → 0x40252CFDF8B20Ed757D61ff157719F33Ec332402
    Solana  solana         USDC → WwwuGbqHrwF5RG89KhUbmRWEvjnRH9k5kVM5p7T3WwW
  facilitator: https://x402.org/facilitator
  paid routes:
    GET /search                  $0.001
    GET /movie/:id               $0.001
    GET /recommendations/:id     $0.002
  free routes: GET /, GET /health, GET /.well-known/x402
```

Check it is alive:

```bash
curl -s http://localhost:4024/health
# {"status":"ok","uptime":1.2}
```

## 4. Your first 402

```bash
curl -s "http://localhost:4024/search?q=blade%20runner" | jq
```

You get HTTP **402** and a challenge listing **both** rails:

```json
{
  "x402Version": 1,
  "error": "X-PAYMENT header is required",
  "accepts": [
    { "scheme": "exact", "network": "base-sepolia", "maxAmountRequired": "1000",
      "payTo": "0x40252CFDF8B20Ed757D61ff157719F33Ec332402", "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e" },
    { "scheme": "exact", "network": "solana", "maxAmountRequired": "1000",
      "payTo": "WwwuGbqHrwF5RG89KhUbmRWEvjnRH9k5kVM5p7T3WwW", "asset": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" }
  ]
}
```

That is the whole price negotiation: no key, no signup, no account. The price
is `1000` USDC base units (6 decimals) = **$0.001**.

## 5. Pay for real

Get a Base Sepolia test wallet and fund it with test USDC from
<https://faucet.circle.com>. Then:

```bash
PRIVATE_KEY=0xYourTestKey npm run client
```

[`examples/agent-client.ts`](../examples/agent-client.ts) does the full flow:

1. Calls the route unpaid and prints both rails from the 402.
2. Signs an EIP-3009 USDC authorization for exactly $0.001.
3. Retries with the `X-PAYMENT` header.
4. Prints the artifact and decodes the `X-PAYMENT-RESPONSE` receipt.

Prefer Solana? The bottom of that file shows the equivalent flow — the server
needs no changes, since the same 402 already advertises the `solana` rail.

## 6. Read the artifact

The 200 body **is** the purchase:

```json
{
  "source": "fixture",
  "query": {
    "q": "blade runner",
    "year": null,
    "page": 1
  },
  "page": 1,
  "totalResults": 8,
  "totalPages": 2,
  "count": 2,
  "results": [
    {
      "id": 524916,
      "title": "A Quiet Meridian",
      "originalTitle": "A Quiet Meridian",
      "overview": "A mystery about meridians, set in 2006. Deterministic fixture record — set TMDB_API_KEY for the real catalogue.",
      "releaseDate": "2006-10-13",
      "year": 2006,
      "voteAverage": 5.8,
      "voteCount": 3652,
      "popularity": 41.907,
      "posterUrl": null,
      "backdropUrl": null,
      "originalLanguage": "en",
      "adult": false,
      "tagline": "A Quiet meridian you will ever see.",
      "runtimeMinutes": 98,
      "status": "Released",
      "budget": 97000000,
      "revenue": 379255811,
      "genres": [
        "Mystery",
        "Thriller"
      ],
      "productionCompanies": [
        "Foldout Media"
      ],
      "spokenLanguages": [
        "English"
      ],
      "homepage": null,
      "imdbId": null,
      "cast": [
        {
          "id": 6149160,
          "name": "Iris Chen",
          "character": "Ellis",
          "order": 0,
          "profileUrl": null
        },
        {
          "id": 6149161,
          "name": "Priya Raghunathan",
          "character": "Nadia",
          "order": 1,
          "profileUrl": null
        },
        {
          "id": 6149162,
          "name": "Tomas Lind",
          "character": "Rowan",
          "order": 2,
          "profileUrl": null
        },
        {
          "id": 6149163,
          "name": "Sofia Marchetti",
          "character": "Sam",
          "order": 3,
          "profileUrl": null
        }
      ],
      "crew": [
        {
          "id": 1324916,
          "name": "Hanna Bergström",
          "job": "Director",
          "department": "Directing"
        },
        {
          "id": 1334916,
          "name": "Leo Vasquez",
          "job": "Screenplay",
          "department": "Writing"
        }
      ],
      "watchProviders": {
        "US": [
          {
            "provider": "Demo Streaming",
            "type": "flatrate",
            "logoUrl": null
          },
          {
            "provider": "Demo Rentals",
            "type": "rent",
            "logoUrl": null
          }
        ]
      },
      "releaseDates": [
        {
          "countryCode": "US",
          "date": "2006-10-13T00:00:00.000Z",
          "certification": "PG-13",
          "type": "theatrical"
        },
        {
          "countryCode": "US",
          "date": "2006-12-01T00:00:00.000Z",
          "certification": null,
          "type": "digital"
        }
      ]
    },
    {
      "id": 515685,
      "title": "After the Winter",
      "originalTitle": "After the Winter",
      "overview": "A adventure about winters, set in 2015. Deterministic fixture record — set TMDB_API_KEY for the real catalogue.",
      "releaseDate": "2015-10-22",
      "year": 2015,
      "voteAverage": 6.7,
      "voteCount": 1440,
      "popularity": 89.65,
      "posterUrl": null,
      "backdropUrl": null,
      "originalLanguage": "en",
      "adult": false,
      "tagline": "After the winter you will ever see.",
      "runtimeMinutes": 125,
      "status": "Released",
      "budget": 94000000,
      "revenue": 162875636,
      "genres": [
        "Adventure"
      ],
      "productionCompanies": [
        "Blue Harbour Films"
      ],
      "spokenLanguages": [
        "English"
      ],
      "homepage": null,
      "imdbId": null,
      "cast": [
        {
          "id": 6056850,
          "name": "Yuki Tanaka",
          "character": "Ellis",
          "order": 0,
          "profileUrl": null
        },
        {
          "id": 6056851,
          "name": "Ana Ferreira",
          "character": "Nadia",
          "order": 1,
          "profileUrl": null
        },
        {
          "id": 6056852,
          "name": "Leo Vasquez",
          "character": "Rowan",
          "order": 2,
          "profileUrl": null
        },
        {
          "id": 6056853,
          "name": "Daniel Okafor",
          "character": "Sam",
          "order": 3,
          "profileUrl": null
        }
      ],
      "crew": [
        {
          "id": 1315685,
          "name": "Iris Chen",
          "job": "Director",
          "department": "Directing"
        },
        {
          "id": 1325685,
          "name": "Ana Ferreira",
          "job": "Screenplay",
          "department": "Writing"
        }
      ],
      "watchProviders": {
        "US": [
          {
            "provider": "Demo Streaming",
            "type": "flatrate",
            "logoUrl": null
          },
          {
            "provider": "Demo Rentals",
            "type": "rent",
            "logoUrl": null
          }
        ]
      },
      "releaseDates": [
        {
          "countryCode": "US",
          "date": "2015-10-22T00:00:00.000Z",
          "certification": "PG-13",
          "type": "theatrical"
        },
        {
          "countryCode": "US",
          "date": "2015-12-01T00:00:00.000Z",
          "certification": null,
          "type": "digital"
        }
      ]
    }
  ],
  "retrievedAt": "2026-08-07T03:02:26.030Z"
}
```

Check `source` first: `"tmdb"` means the real catalogue, `"fixture"` means the
deterministic demo data. Every result's `id` works directly on `/movie/:id` and
`/recommendations/:id`.

The recommendations route is worth a second look — each title carries a
`score` (0-1) and `reasons`, so an agent can justify its pick to a user instead
of quoting an opaque ranking.

Full field-by-field reference: [api.md](api.md).

## 7. Going to mainnet

```bash
# EVM: Base mainnet
NETWORK=base
PAY_TO_ADDRESS=0xYourRealAddress

# Solana: mainnet (this is already the default)
SOLANA_NETWORK=mainnet-beta
SOLANA_PAY_TO_ADDRESS=YourRealSolanaAddress
SOLANA_RPC_URL=https://your-dedicated-rpc.example.com

# A facilitator that settles on the networks you accept
FACILITATOR_URL=https://x402.org/facilitator
```

Then run `npm run build && npm start`. Nothing else changes: the same routes,
the same prices, real USDC.

> Use a dedicated Solana RPC in production. The public endpoint is heavily
> rate-limited.

## Where to go next

- [api.md](api.md) — every endpoint, parameter, and error
- [agents.md](agents.md) — discovery, MCP, and listing your instance
- [../skill.md](https://github.com/nirholas/x402-movies/blob/main/skill.md) — the agent-facing skill file
- [../examples/curl.md](https://github.com/nirholas/x402-movies/blob/main/examples/curl.md) — the same flow in raw curl
