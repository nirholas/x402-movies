# Raw HTTP walkthrough — 402 → pay → 200

Everything below is plain `curl`. No SDK required.

## 0. Start the server

```bash
npm install
npm run dev      # http://localhost:4024
```

## 1. Free routes need no payment

```bash
curl -s http://localhost:4024/health
curl -s http://localhost:4024/ | jq
curl -s http://localhost:4024/.well-known/x402 | jq
```

## 2. Call a paid route with no payment → 402, both rails

```bash
curl -s -i "http://localhost:4024/search?q=blade%20runner"
```

```http
HTTP/1.1 402 Payment Required
Content-Type: application/json
```

```json
{
  "x402Version": 1,
  "error": "X-PAYMENT header is required",
  "hint": "Pay in USDC on Base or Solana — your client picks the rail. See /.well-known/x402",
  "accepts": [
    {
      "scheme": "exact",
      "network": "base-sepolia",
      "maxAmountRequired": "1000",
      "resource": "http://localhost:4024/search",
      "description": "Search the movie catalogue by title, optionally narrowed to a release year",
      "mimeType": "application/json",
      "payTo": "0x40252CFDF8B20Ed757D61ff157719F33Ec332402",
      "maxTimeoutSeconds": 120,
      "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      "extra": { "name": "USDC", "version": "2" }
    },
    {
      "scheme": "exact",
      "network": "solana",
      "maxAmountRequired": "1000",
      "resource": "http://localhost:4024/search",
      "description": "Search the movie catalogue by title, optionally narrowed to a release year",
      "mimeType": "application/json",
      "payTo": "WwwuGbqHrwF5RG89KhUbmRWEvjnRH9k5kVM5p7T3WwW",
      "maxTimeoutSeconds": 120,
      "asset": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "extra": { "name": "USDC", "decimals": 6, "feePayer": "<facilitator sponsor>" }
    }
  ]
}
```

`maxAmountRequired` is in USDC base units (6 decimals): `1000` = $0.001.

## 3. Build the payment

Pick **one** entry from `accepts`.

**EVM (Base):** sign an EIP-3009 `transferWithAuthorization` for
`maxAmountRequired` USDC to `payTo`. No gas needed from you — the facilitator
submits it.

**Solana:** build an SPL `transferChecked` of `maxAmountRequired` USDC to
`payTo`, with `extra.feePayer` as the transaction fee payer, and sign it. You
need USDC only — the facilitator sponsors the SOL fee.

Either way, base64-encode the x402 payload:

```json
{ "x402Version": 1, "scheme": "exact", "network": "<the rail you picked>", "payload": { … } }
```

In practice, let a library do it:

```bash
PRIVATE_KEY=0xYourTestKey npm run client
```

## 4. Repeat the request with the header → 200 + artifact

```bash
curl -s -i "http://localhost:4024/search?q=blade%20runner" \
  -H "X-PAYMENT: <base64 payload>"
```

```http
HTTP/1.1 200 OK
Content-Type: application/json
X-PAYMENT-RESPONSE: eyJzdWNjZXNzIjp0cnVlLCJyYWlsIjoiZXZtIiwi…
```

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

Decode the receipt:

```bash
echo '<X-PAYMENT-RESPONSE value>' | base64 -d | jq
# { "success": true, "rail": "evm", "network": "base-sepolia",
#   "transaction": "0x…", "payer": "0x…", "amount": "1000", "asset": "USDC" }
```

The artifact is in the body of that same 200. There is nothing else to fetch.

## All paid routes

```bash
curl -s "http://localhost:4024/search?q=blade%20runner" -H "X-PAYMENT: <payload>"   # $0.001
```

```bash
curl -s "http://localhost:4024/movie/524916" -H "X-PAYMENT: <payload>"   # $0.001
```

```bash
curl -s "http://localhost:4024/recommendations/524916?limit=3" -H "X-PAYMENT: <payload>"   # $0.002
```
