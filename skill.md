# x402-movies — agent skill

Search a movie catalogue, pull the full record for any title, and get ranked
recommendations seeded by one movie. The detail bundle includes cast and key
crew, streaming/rental availability by country, and release dates with
certifications. Recommendations are re-ranked by this service — every result
carries a `score` and a list of `reasons`, so you can explain the ordering
rather than trusting an opaque list. Backed by [TMDB](https://www.themoviedb.org)
when a key is configured, deterministic fixtures otherwise (always labelled in
`source`).

**Base URL:** `{BASE_URL}` (local default `http://localhost:4024`)

Every paid call returns the purchased artifact **in the 200 response body**.
There is nothing to poll and nothing to collect later.

## Payment

This service speaks **x402** (HTTP 402 Payment Required, <https://x402.org>).

**Pay in USDC on Base or Solana — your client picks the rail.**

| Rail | Network | Asset | payTo |
|------|---------|-------|-------|
| EVM | `base-sepolia` (`base` on mainnet) | USDC | `0x40252CFDF8B20Ed757D61ff157719F33Ec332402` |
| Solana | `solana` (`solana-devnet` on devnet) | USDC | `WwwuGbqHrwF5RG89KhUbmRWEvjnRH9k5kVM5p7T3WwW` |

Facilitator: `https://x402.org/facilitator` (verifies and settles both rails).

Flow:

1. Call the endpoint with no `X-PAYMENT` header. You get **402** with an
   `accepts` array holding **both** rails.
2. Pick a rail, sign the payment, and put the base64 payload in `X-PAYMENT`.
3. Repeat the request. You get **200** with the artifact, and a settlement
   receipt in the `X-PAYMENT-RESPONSE` header (base64 JSON:
   `{ success, rail, network, transaction, payer, amount, asset }`).

Use `x402-fetch` (EVM), a Solana x402 client, or any x402-aware HTTP client —
the wire format is the standard one.

```ts
import { wrapFetchWithPayment, createSigner } from "x402-fetch";
const signer = await createSigner("base-sepolia", process.env.PRIVATE_KEY!);
const pay = wrapFetchWithPayment(fetch, signer);
const res = await pay("{BASE_URL}/search?q=blade%20runner");
const artifact = await res.json();
```

## Endpoints

### `GET /search` — $0.001

Search the movie catalogue by title, optionally narrowed to a release year

| Param | In | Required | Type | Description |
|-------|----|----------|------|-------------|
| `q` | query | yes | string | Title to search for, 1-200 characters. |
| `year` | query | no | integer | Narrow to a primary release year, 1870…2100. |
| `page` | query | no | integer | Result page, 1…500. Default 1. |

**Returns** (`200 application/json`) — Matching titles with year, rating, vote count, overview and artwork URLs

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

<details><summary>Response schema</summary>

```json
{
  "type": "object",
  "required": [
    "source",
    "query",
    "page",
    "totalResults",
    "count",
    "results",
    "retrievedAt"
  ],
  "properties": {
    "source": {
      "type": "string",
      "enum": [
        "tmdb",
        "fixture"
      ]
    },
    "query": {
      "type": "object",
      "properties": {
        "q": {
          "type": "string"
        },
        "year": {
          "type": [
            "integer",
            "null"
          ]
        },
        "page": {
          "type": "integer"
        }
      }
    },
    "page": {
      "type": "integer"
    },
    "totalResults": {
      "type": "integer"
    },
    "totalPages": {
      "type": "integer"
    },
    "count": {
      "type": "integer"
    },
    "retrievedAt": {
      "type": "string",
      "format": "date-time"
    },
    "results": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "id",
          "title",
          "overview"
        ],
        "properties": {
          "id": {
            "type": "integer",
            "description": "Pass to `/movie/:id` and `/recommendations/:id`."
          },
          "title": {
            "type": "string"
          },
          "originalTitle": {
            "type": [
              "string",
              "null"
            ]
          },
          "overview": {
            "type": "string"
          },
          "releaseDate": {
            "type": [
              "string",
              "null"
            ],
            "description": "`YYYY-MM-DD`."
          },
          "year": {
            "type": [
              "integer",
              "null"
            ]
          },
          "voteAverage": {
            "type": [
              "number",
              "null"
            ],
            "description": "0-10."
          },
          "voteCount": {
            "type": [
              "integer",
              "null"
            ]
          },
          "popularity": {
            "type": [
              "number",
              "null"
            ]
          },
          "posterUrl": {
            "type": [
              "string",
              "null"
            ],
            "format": "uri"
          },
          "backdropUrl": {
            "type": [
              "string",
              "null"
            ],
            "format": "uri"
          },
          "originalLanguage": {
            "type": [
              "string",
              "null"
            ],
            "description": "ISO 639-1."
          },
          "adult": {
            "type": "boolean"
          }
        }
      }
    }
  }
}
```

</details>

---

### `GET /movie/:id` — $0.001

Full detail bundle for one movie

| Param | In | Required | Type | Description |
|-------|----|----------|------|-------------|
| `id` | path | yes | integer | Movie id as returned by `/search`. |

**Returns** (`200 application/json`) — Metadata, tagline, runtime, budget/revenue, genres, cast and key crew, streaming and rental providers by country, and release dates with certifications

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

<details><summary>Response schema</summary>

```json
{
  "type": "object",
  "required": [
    "source",
    "movie",
    "retrievedAt"
  ],
  "properties": {
    "source": {
      "type": "string",
      "enum": [
        "tmdb",
        "fixture"
      ]
    },
    "retrievedAt": {
      "type": "string",
      "format": "date-time"
    },
    "movie": {
      "allOf": [
        {
          "type": "object",
          "required": [
            "id",
            "title",
            "overview"
          ],
          "properties": {
            "id": {
              "type": "integer",
              "description": "Pass to `/movie/:id` and `/recommendations/:id`."
            },
            "title": {
              "type": "string"
            },
            "originalTitle": {
              "type": [
                "string",
                "null"
              ]
            },
            "overview": {
              "type": "string"
            },
            "releaseDate": {
              "type": [
                "string",
                "null"
              ],
              "description": "`YYYY-MM-DD`."
            },
            "year": {
              "type": [
                "integer",
                "null"
              ]
            },
            "voteAverage": {
              "type": [
                "number",
                "null"
              ],
              "description": "0-10."
            },
            "voteCount": {
              "type": [
                "integer",
                "null"
              ]
            },
            "popularity": {
              "type": [
                "number",
                "null"
              ]
            },
            "posterUrl": {
              "type": [
                "string",
                "null"
              ],
              "format": "uri"
            },
            "backdropUrl": {
              "type": [
                "string",
                "null"
              ],
              "format": "uri"
            },
            "originalLanguage": {
              "type": [
                "string",
                "null"
              ],
              "description": "ISO 639-1."
            },
            "adult": {
              "type": "boolean"
            }
          }
        },
        {
          "type": "object",
          "properties": {
            "tagline": {
              "type": [
                "string",
                "null"
              ]
            },
            "runtimeMinutes": {
              "type": [
                "integer",
                "null"
              ]
            },
            "status": {
              "type": [
                "string",
                "null"
              ]
            },
            "budget": {
              "type": [
                "integer",
                "null"
              ]
            },
            "revenue": {
              "type": [
                "integer",
                "null"
              ]
            },
            "genres": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "productionCompanies": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "spokenLanguages": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "homepage": {
              "type": [
                "string",
                "null"
              ],
              "format": "uri"
            },
            "imdbId": {
              "type": [
                "string",
                "null"
              ]
            },
            "cast": {
              "type": "array",
              "description": "Top-billed cast, up to 15.",
              "items": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "integer"
                  },
                  "name": {
                    "type": "string"
                  },
                  "character": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "order": {
                    "type": "integer"
                  },
                  "profileUrl": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "format": "uri"
                  }
                }
              }
            },
            "crew": {
              "type": "array",
              "description": "Key crew only: directors, writers, producers, composer, DoP.",
              "items": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "integer"
                  },
                  "name": {
                    "type": "string"
                  },
                  "job": {
                    "type": "string"
                  },
                  "department": {
                    "type": [
                      "string",
                      "null"
                    ]
                  }
                }
              }
            },
            "watchProviders": {
              "type": "object",
              "description": "Availability keyed by ISO 3166-1 country code.",
              "additionalProperties": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "provider": {
                      "type": "string"
                    },
                    "type": {
                      "type": "string",
                      "enum": [
                        "flatrate",
                        "rent",
                        "buy",
                        "ads",
                        "free"
                      ]
                    },
                    "logoUrl": {
                      "type": [
                        "string",
                        "null"
                      ],
                      "format": "uri"
                    }
                  }
                }
              }
            },
            "releaseDates": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "countryCode": {
                    "type": "string"
                  },
                  "date": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "format": "date-time"
                  },
                  "certification": {
                    "type": [
                      "string",
                      "null"
                    ]
                  },
                  "type": {
                    "type": "string",
                    "enum": [
                      "premiere",
                      "theatrical_limited",
                      "theatrical",
                      "digital",
                      "physical",
                      "tv",
                      "unknown"
                    ]
                  }
                }
              }
            }
          }
        }
      ]
    }
  }
}
```

</details>

---

### `GET /recommendations/:id` — $0.002

Recommendations seeded by one movie, ranked with an explicit score and reasons

| Param | In | Required | Type | Description |
|-------|----|----------|------|-------------|
| `id` | path | yes | integer | Seed movie id. |
| `limit` | query | no | integer | How many recommendations to return, 1…20. Default 10. |

**Returns** (`200 application/json`) — Ranked related titles, each with a 0-1 `score` and the `reasons` behind its placement — rating, vote confidence, era proximity, language match and popularity

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

<details><summary>Response schema</summary>

```json
{
  "type": "object",
  "required": [
    "source",
    "seed",
    "count",
    "recommendations",
    "retrievedAt"
  ],
  "properties": {
    "source": {
      "type": "string",
      "enum": [
        "tmdb",
        "fixture"
      ]
    },
    "seed": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer"
        },
        "title": {
          "type": "string"
        }
      }
    },
    "count": {
      "type": "integer"
    },
    "retrievedAt": {
      "type": "string",
      "format": "date-time"
    },
    "recommendations": {
      "type": "array",
      "items": {
        "allOf": [
          {
            "type": "object",
            "required": [
              "id",
              "title",
              "overview"
            ],
            "properties": {
              "id": {
                "type": "integer",
                "description": "Pass to `/movie/:id` and `/recommendations/:id`."
              },
              "title": {
                "type": "string"
              },
              "originalTitle": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "overview": {
                "type": "string"
              },
              "releaseDate": {
                "type": [
                  "string",
                  "null"
                ],
                "description": "`YYYY-MM-DD`."
              },
              "year": {
                "type": [
                  "integer",
                  "null"
                ]
              },
              "voteAverage": {
                "type": [
                  "number",
                  "null"
                ],
                "description": "0-10."
              },
              "voteCount": {
                "type": [
                  "integer",
                  "null"
                ]
              },
              "popularity": {
                "type": [
                  "number",
                  "null"
                ]
              },
              "posterUrl": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "uri"
              },
              "backdropUrl": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "uri"
              },
              "originalLanguage": {
                "type": [
                  "string",
                  "null"
                ],
                "description": "ISO 639-1."
              },
              "adult": {
                "type": "boolean"
              }
            }
          },
          {
            "type": "object",
            "required": [
              "score",
              "reasons"
            ],
            "properties": {
              "score": {
                "type": "number",
                "description": "0-1 relevance, highest first."
              },
              "reasons": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "description": "Plain-language justification for the placement."
              }
            }
          }
        ]
      }
    }
  }
}
```

</details>


## Free endpoints

- `GET /` — Service metadata, live prices, active payment rails, backend status
- `GET /health` — Liveness probe
- `GET /.well-known/x402` — Machine-readable discovery manifest

## Error codes

| HTTP | `error` | Meaning |
|------|---------|---------|
| 400 | `invalid_query` | `q` missing, empty, or longer than 200 characters. |
| 400 | `invalid_year` | `year` is not a four-digit year in 1870…2100. |
| 400 | `invalid_page` | `page` outside 1…500. |
| 400 | `invalid_id` | `id` is not a positive integer. |
| 400 | `invalid_limit` | `limit` outside 1…20. |
| 404 | `not_found` | No movie with that id. |
| 502 | `upstream_error` | TMDB rejected the request or timed out. |
| 402 | — | Payment required or rejected. Body carries `accepts` (both rails) and an `error` reason. |
| 500 | `no_payment_rail_configured` | Server has neither a valid EVM nor Solana payTo. |

## Data source

Live [TMDB](https://www.themoviedb.org) data when `TMDB_API_KEY` (v3 key) or
`TMDB_ACCESS_TOKEN` (v4 bearer) is set (`source: "tmdb"`). Both are free.
Without either, the service returns a deterministic fixture catalogue
(`source: "fixture"`) — the same query always yields the same titles, and
fixture movie ids (6 digits, 100000-999999) work on `/movie/:id` and
`/recommendations/:id`, so the whole flow is demonstrable with no credentials.
Always check `source` before treating results as the real catalogue.

Attribution: this product uses the TMDB API but is not endorsed or certified by
TMDB.

## Discovery

Machine-readable manifest: **`GET /.well-known/x402`**
(also at <https://github.com/nirholas/x402-movies/blob/main/public/.well-known/x402>).
Indexed by [x402scan.com](https://x402scan.com), the x402 Bazaar, and
[agentic.market](https://agentic.market).

OpenAPI 3.1: [`openapi.json`](https://github.com/nirholas/x402-movies/blob/main/openapi.json)

## Contact

nichxbt@gmail.com · <https://github.com/nirholas/x402-movies>
