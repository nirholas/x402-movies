/**
 * Per-route request/response schemas published in the x402 402 challenge.
 *
 * GENERATED from `openapi.json` — the runtime challenge and the OpenAPI
 * document must agree, and the runtime is authoritative for x402scan
 * discovery. Regenerate rather than hand-editing.
 *
 * Shape follows the x402 Bazaar convention:
 *   `input`  — how to call the route (`type: "http"`, method, query params /
 *              JSON body fields)
 *   `output` — the JSON-Schema of the 200 response body.
 *
 * Keys match the paywall route map in `src/server.ts` exactly.
 */

export type RouteSchema = {
  /** How an agent invokes this route. */
  input: Record<string, unknown>;
  /** JSON-Schema of the artifact returned in the 200 body. */
  output: Record<string, unknown>;
};

export const ROUTE_SCHEMAS: Record<string, RouteSchema> = {
  "GET /search": {
    "input": {
      "type": "http",
      "method": "GET",
      "queryParams": {
        "q": {
          "type": "string",
          "description": "Title to search for, 1-200 characters.",
          "example": "blade runner"
        },
        "year": {
          "type": "integer",
          "description": "Narrow to a primary release year, 1870…2100.",
          "example": 1982
        },
        "page": {
          "type": "integer",
          "description": "Result page, 1…500. Default 1.",
          "example": 1
        }
      },
      "queryParamsRequired": [
        "q"
      ]
    },
    "output": {
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
  },
  "GET /movie/:id": {
    "input": {
      "type": "http",
      "method": "GET"
    },
    "output": {
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
  },
  "GET /recommendations/:id": {
    "input": {
      "type": "http",
      "method": "GET",
      "queryParams": {
        "limit": {
          "type": "integer",
          "description": "How many recommendations to return, 1…20. Default 10.",
          "example": 3
        }
      }
    },
    "output": {
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
  }
};
