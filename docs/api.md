# API reference — x402-movies

Base URL: `http://localhost:4024` in development.
Machine-readable: [`openapi.json`](https://github.com/nirholas/x402-movies/blob/main/openapi.json) (OpenAPI 3.1).

All paid routes return the purchased artifact in the **200 response body**.

## Payment

Every paid route answers an unpaid request with **402** and an `accepts` array
holding both rails:

| Rail | Network | Asset | payTo |
|------|---------|-------|-------|
| EVM | `base-sepolia` (`base` on mainnet) | USDC | `0x40252CFDF8B20Ed757D61ff157719F33Ec332402` |
| Solana | `solana` (`solana-devnet` on devnet) | USDC | `WwwuGbqHrwF5RG89KhUbmRWEvjnRH9k5kVM5p7T3WwW` |

Prices are quoted in USDC base units (6 decimals) as `maxAmountRequired`.
On success the response carries `X-PAYMENT-RESPONSE`: base64 JSON with
`{ success, rail, network, transaction, payer, amount, asset }`.

---

## `GET /search`

**$0.001** — Search the movie catalogue by title, optionally narrowed to a release year

### Parameters

| Param | In | Required | Type | Description |
|-------|----|----------|------|-------------|
| `q` | query | yes | string | Title to search for, 1-200 characters. |
| `year` | query | no | integer | Narrow to a primary release year, 1870…2100. |
| `page` | query | no | integer | Result page, 1…500. Default 1. |

### Example request

```bash
curl -s "http://localhost:4024/search?q=blade%20runner" -H "X-PAYMENT: <base64 payload>"
```

### Response `200 application/json`

`source` is `"tmdb"` for the real catalogue or `"fixture"` for deterministic demo data. In fixture mode the titles are synthetic and do not contain your query string — the `source` field is the honest signal, not a doctored title. Each result `id` works on `/movie/:id` and `/recommendations/:id`.

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

### Errors

| HTTP | `error` | When |
|------|---------|------|
| 400 | `invalid_query` | `q` missing, empty, or longer than 200 characters. |
| 400 | `invalid_year` | `year` is not a four-digit year in 1870…2100. |
| 400 | `invalid_page` | `page` outside 1…500. |
| 402 | — | No or invalid `X-PAYMENT`. Body carries `accepts` with both rails. |
| 502 | `upstream_error` | The upstream data source failed or timed out. |

---

## `GET /movie/:id`

**$0.001** — Full detail bundle for one movie

### Parameters

| Param | In | Required | Type | Description |
|-------|----|----------|------|-------------|
| `id` | path | yes | integer | Movie id as returned by `/search`. |

### Example request

```bash
curl -s "http://localhost:4024/movie/524916" -H "X-PAYMENT: <base64 payload>"
```

### Response `200 application/json`

One call, one bundle: TMDB's `credits`, `watch/providers` and `release_dates` appendices are folded into the same response, so an agent never has to make a second paid request to answer "where can I watch this and who directed it".

```json
{
  "source": "fixture",
  "movie": {
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
  "retrievedAt": "2026-08-07T03:02:26.031Z"
}
```

### Errors

| HTTP | `error` | When |
|------|---------|------|
| 400 | `invalid_id` | `id` is not a positive integer. |
| 404 | `not_found` | No movie with that id. |
| 402 | — | No or invalid `X-PAYMENT`. Body carries `accepts` with both rails. |
| 502 | `upstream_error` | The upstream data source failed or timed out. |

---

## `GET /recommendations/:id`

**$0.002** — Recommendations seeded by one movie, ranked with an explicit score and reasons

### Parameters

| Param | In | Required | Type | Description |
|-------|----|----------|------|-------------|
| `id` | path | yes | integer | Seed movie id. |
| `limit` | query | no | integer | How many recommendations to return, 1…20. Default 10. |

### Example request

```bash
curl -s "http://localhost:4024/recommendations/524916?limit=3" -H "X-PAYMENT: <base64 payload>"
```

### Response `200 application/json`

The ranking is this service's own, applied on top of the upstream's related titles: 40% audience rating weighted by vote confidence, 25% era proximity to the seed, 15% language match, 20% popularity. `reasons` explains each placement in plain language.

```json
{
  "source": "fixture",
  "seed": {
    "id": 524916,
    "title": "A Quiet Meridian"
  },
  "count": 3,
  "recommendations": [
    {
      "id": 624967,
      "title": "Return to Instrument",
      "originalTitle": "Return to Instrument",
      "overview": "A documentary about instruments, set in 2009. Deterministic fixture record — set TMDB_API_KEY for the real catalogue.",
      "releaseDate": "2009-02-03",
      "year": 2009,
      "voteAverage": 9,
      "voteCount": 2575,
      "popularity": 87.872,
      "posterUrl": null,
      "backdropUrl": null,
      "originalLanguage": "fr",
      "adult": false,
      "tagline": "Return to instrument you will ever see.",
      "runtimeMinutes": 107,
      "status": "Released",
      "budget": 17000000,
      "revenue": 69047681,
      "genres": [
        "Documentary"
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
          "id": 7149670,
          "name": "Daniel Okafor",
          "character": "Ellis",
          "order": 0,
          "profileUrl": null
        },
        {
          "id": 7149671,
          "name": "Priya Raghunathan",
          "character": "Nadia",
          "order": 1,
          "profileUrl": null
        },
        {
          "id": 7149672,
          "name": "Priya Raghunathan",
          "character": "Rowan",
          "order": 2,
          "profileUrl": null
        },
        {
          "id": 7149673,
          "name": "Sofia Marchetti",
          "character": "Sam",
          "order": 3,
          "profileUrl": null
        }
      ],
      "crew": [
        {
          "id": 1424967,
          "name": "Marcus Bell",
          "job": "Director",
          "department": "Directing"
        },
        {
          "id": 1434967,
          "name": "Tomas Lind",
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
          "date": "2009-02-03T00:00:00.000Z",
          "certification": "PG-13",
          "type": "theatrical"
        },
        {
          "countryCode": "US",
          "date": "2009-05-01T00:00:00.000Z",
          "certification": null,
          "type": "digital"
        }
      ],
      "score": 0.7557,
      "reasons": [
        "highly rated (9/10)",
        "large vote sample",
        "released within 5 years of A Quiet Meridian"
      ]
    },
    {
      "id": 196010,
      "title": "Winter of the Lighthouse",
      "originalTitle": "Winter of the Lighthouse",
      "overview": "A comedy about lighthouses, set in 1999. Deterministic fixture record — set TMDB_API_KEY for the real catalogue.",
      "releaseDate": "1999-02-12",
      "year": 1999,
      "voteAverage": 6.3,
      "voteCount": 1587,
      "popularity": 68.234,
      "posterUrl": null,
      "backdropUrl": null,
      "originalLanguage": "en",
      "adult": false,
      "tagline": "Winter of the lighthouse you will ever see.",
      "runtimeMinutes": 110,
      "status": "Released",
      "budget": 83000000,
      "revenue": 288744616,
      "genres": [
        "Comedy",
        "Adventure"
      ],
      "productionCompanies": [
        "Northwind Pictures"
      ],
      "spokenLanguages": [
        "English"
      ],
      "homepage": null,
      "imdbId": null,
      "cast": [
        {
          "id": 2860100,
          "name": "Marcus Bell",
          "character": "Ellis",
          "order": 0,
          "profileUrl": null
        },
        {
          "id": 2860101,
          "name": "Leo Vasquez",
          "character": "Nadia",
          "order": 1,
          "profileUrl": null
        },
        {
          "id": 2860102,
          "name": "Priya Raghunathan",
          "character": "Rowan",
          "order": 2,
          "profileUrl": null
        },
        {
          "id": 2860103,
          "name": "Tomas Lind",
          "character": "Sam",
          "order": 3,
          "profileUrl": null
        }
      ],
      "crew": [
        {
          "id": 996010,
          "name": "Priya Raghunathan",
          "job": "Director",
          "department": "Directing"
        },
        {
          "id": 1006010,
          "name": "Priya Raghunathan",
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
          "date": "1999-02-12T00:00:00.000Z",
          "certification": "PG-13",
          "type": "theatrical"
        },
        {
          "countryCode": "US",
          "date": "1999-05-01T00:00:00.000Z",
          "certification": null,
          "type": "digital"
        }
      ],
      "score": 0.7185,
      "reasons": [
        "large vote sample",
        "same original language (en)"
      ]
    },
    {
      "id": 334548,
      "title": "Echoes of Frequency",
      "originalTitle": "Echoes of Frequency",
      "overview": "A documentary about frequencys, set in 2005. Deterministic fixture record — set TMDB_API_KEY for the real catalogue.",
      "releaseDate": "2005-10-22",
      "year": 2005,
      "voteAverage": 6.9,
      "voteCount": 2082,
      "popularity": 22.555,
      "posterUrl": null,
      "backdropUrl": null,
      "originalLanguage": "en",
      "adult": false,
      "tagline": "Echoes of frequency you will ever see.",
      "runtimeMinutes": 147,
      "status": "Released",
      "budget": 76000000,
      "revenue": 113248813,
      "genres": [
        "Documentary",
        "Mystery"
      ],
      "productionCompanies": [
        "Meridian Studios"
      ],
      "spokenLanguages": [
        "English"
      ],
      "homepage": null,
      "imdbId": null,
      "cast": [
        {
          "id": 4245480,
          "name": "Tomas Lind",
          "character": "Ellis",
          "order": 0,
          "profileUrl": null
        },
        {
          "id": 4245481,
          "name": "Priya Raghunathan",
          "character": "Nadia",
          "order": 1,
          "profileUrl": null
        },
        {
          "id": 4245482,
          "name": "Daniel Okafor",
          "character": "Rowan",
          "order": 2,
          "profileUrl": null
        },
        {
          "id": 4245483,
          "name": "Ana Ferreira",
          "character": "Sam",
          "order": 3,
          "profileUrl": null
        }
      ],
      "crew": [
        {
          "id": 1134548,
          "name": "Daniel Okafor",
          "job": "Director",
          "department": "Directing"
        },
        {
          "id": 1144548,
          "name": "Yuki Tanaka",
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
          "date": "2005-10-22T00:00:00.000Z",
          "certification": "PG-13",
          "type": "theatrical"
        },
        {
          "countryCode": "US",
          "date": "2005-12-01T00:00:00.000Z",
          "certification": null,
          "type": "digital"
        }
      ],
      "score": 0.7111,
      "reasons": [
        "large vote sample",
        "released within 5 years of A Quiet Meridian",
        "same original language (en)"
      ]
    }
  ],
  "retrievedAt": "2026-08-07T03:02:26.032Z"
}
```

### Errors

| HTTP | `error` | When |
|------|---------|------|
| 400 | `invalid_id` | `id` is not a positive integer. |
| 400 | `invalid_limit` | `limit` outside 1…20. |
| 404 | `not_found` | No movie with that id. |
| 402 | — | No or invalid `X-PAYMENT`. Body carries `accepts` with both rails. |
| 502 | `upstream_error` | The upstream data source failed or timed out. |


---

## Free routes

### `GET /`

Service metadata: description, live prices, active payment rails, data-source
status, and docs links.

### `GET /health`

```json
{ "status": "ok", "uptime": 12.5 }
```

### `GET /.well-known/x402`

The discovery manifest — every resource with its price, output schema, and both
accepted rails. See [agents.md](agents.md).
