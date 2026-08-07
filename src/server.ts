/**
 * x402-movies — Express server with the dual-rail x402 paywall.
 *
 * Movie catalogue concierge over TMDB. Paid routes return the purchased
 * artifact directly in the 200 response body. Buyers pay in USDC on Base (EVM)
 * or on Solana; the 402 challenge advertises both rails and the client picks.
 */
import "dotenv/config";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import {
  facilitatorUrl,
  paywall,
  rails,
  solanaCheckoutRouter,
  usingSuiteDefaultPayTo,
  type RoutePrices,
} from "./payments.js";
import { ROUTE_SCHEMAS } from "./schemas.js";
import {
  hasTmdbCredentials,
  movieDetail,
  recommendations,
  searchMovies,
} from "./service.js";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

/** Paid routes. Anything not listed here is free. */
const ROUTES: RoutePrices = {
  "GET /search": {
    price: "$0.001",
    description:
      "Movie search over TMDB. Returns matching titles with year, rating, overview and artwork.",
    outputSchema: ROUTE_SCHEMAS["GET /search"],
  },
  "GET /movie/:id": {
    price: "$0.001",
    description:
      "Full detail bundle for one movie: metadata, genres, cast and key crew, streaming/rental providers by country, and release dates with certifications.",
    outputSchema: ROUTE_SCHEMAS["GET /movie/:id"],
  },
  "GET /recommendations/:id": {
    price: "$0.002",
    description:
      "Recommendations seeded by one movie, ranked by this service with an explicit score and reasons per title.",
    outputSchema: ROUTE_SCHEMAS["GET /recommendations/:id"],
  },
};

const app = express();
app.disable("x-powered-by");
app.use(express.json());

// Dual-rail x402 paywall: USDC on Base or Solana.
app.use(paywall(ROUTES, { service: "x402-movies" }));

// Optional: browser (Phantom) Solana checkout helper.
const checkoutRouter = await solanaCheckoutRouter();
if (checkoutRouter) app.use("/api/x402-checkout", checkoutRouter);

// Discovery manifest — before express.static so it keeps an explicit JSON type.
app.get("/.well-known/x402", (_req, res) => {
  res.type("application/json").sendFile(join(publicDir, ".well-known", "x402"));
});

// `index: false` keeps `GET /` on the handler below, which serves the landing
// page to browsers and the JSON service descriptor to agents.
app.use(express.static(publicDir, { index: false }));

// Free: service info.
// Content-negotiated — `Accept: text/html` (a browser, or a crawler looking for
// title/description/favicon/og:image) gets the landing page; everything else,
// including `Accept: */*`, gets the JSON descriptor.
app.get("/", (req, res) => {
  if (req.accepts(["json", "html"]) === "html") {
    res.sendFile(join(publicDir, "index.html"));
    return;
  }
  res.json({
    name: "x402-movies",
    description: "Movie catalog concierge over TMDB — search, details, and recommendations per query",
    payment: {
      protocol: "x402",
      note: "Pay in USDC on Base or Solana — your client picks the rail.",
      facilitator: facilitatorUrl(),
      rails: rails(),
    },
    backend: hasTmdbCredentials()
      ? { source: "tmdb", live: true }
      : {
          source: "fixture",
          live: false,
          note: "Set TMDB_API_KEY (v3) or TMDB_ACCESS_TOKEN (v4) for the live catalogue.",
        },
    routes: {
      "GET /search": { price: "$0.001", params: "q (required), year, page", returns: "matching titles" },
      "GET /movie/:id": { price: "$0.001", params: "id", returns: "full detail bundle (cast, providers, release dates)" },
      "GET /recommendations/:id": { price: "$0.002", params: "id, limit (1-20, default 10)", returns: "ranked recommendations with scores and reasons" },
      "GET /health": { price: "free" },
      "GET /.well-known/x402": { price: "free" },
    },
    attribution: "This product uses the TMDB API but is not endorsed or certified by TMDB.",
    docs: "https://nirholas.github.io/x402-movies/",
    skill: "https://github.com/nirholas/x402-movies/blob/main/skill.md",
  });
});

// Free: health check.
app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

/** Parses a positive integer path param, or null when malformed. */
function parseId(raw: string): number | null {
  if (!/^\d{1,9}$/.test(raw)) return null;
  const n = Number(raw);
  return n > 0 ? n : null;
}

// Paid: $0.001 — movie search. Artifact returned in this response body.
app.get("/search", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const year = req.query.year != null ? Number(req.query.year) : null;
  const page = req.query.page != null ? Number(req.query.page) : 1;

  if (q.length < 1 || q.length > 200) {
    res.status(400).json({
      error: "invalid_query",
      message: "Query param 'q' is required and must be 1-200 characters.",
    });
    return;
  }
  if (year != null && (!Number.isInteger(year) || year < 1870 || year > 2100)) {
    res.status(400).json({
      error: "invalid_year",
      message: "Query param 'year' must be a four-digit year between 1870 and 2100.",
    });
    return;
  }
  if (!Number.isInteger(page) || page < 1 || page > 500) {
    res.status(400).json({
      error: "invalid_page",
      message: "Query param 'page' must be an integer between 1 and 500.",
    });
    return;
  }

  try {
    res.json(await searchMovies(q, year, page));
  } catch (err) {
    res.status(502).json({
      error: "upstream_error",
      message: err instanceof Error ? err.message : "TMDB request failed",
    });
  }
});

// Paid: $0.001 — full detail bundle. Artifact returned in this response body.
app.get("/movie/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id == null) {
    res.status(400).json({
      error: "invalid_id",
      message: "Path param 'id' must be a positive integer movie id.",
    });
    return;
  }
  try {
    const detail = await movieDetail(id);
    if (!detail) {
      res.status(404).json({ error: "not_found", message: `No movie with id ${id}.` });
      return;
    }
    res.json(detail);
  } catch (err) {
    res.status(502).json({
      error: "upstream_error",
      message: err instanceof Error ? err.message : "TMDB request failed",
    });
  }
});

// Paid: $0.002 — ranked recommendations. Artifact returned in this body.
app.get("/recommendations/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id == null) {
    res.status(400).json({
      error: "invalid_id",
      message: "Path param 'id' must be a positive integer movie id.",
    });
    return;
  }
  const limit = req.query.limit != null ? Number(req.query.limit) : 10;
  if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
    res.status(400).json({
      error: "invalid_limit",
      message: "Query param 'limit' must be an integer between 1 and 20.",
    });
    return;
  }
  try {
    const result = await recommendations(id, limit);
    if (!result) {
      res.status(404).json({ error: "not_found", message: `No movie with id ${id}.` });
      return;
    }
    res.json(result);
  } catch (err) {
    res.status(502).json({
      error: "upstream_error",
      message: err instanceof Error ? err.message : "TMDB request failed",
    });
  }
});

const port = Number(process.env.PORT ?? 4024);
app.listen(port, () => {
  const pkg = require("../package.json") as { version: string };
  console.log(`x402-movies v${pkg.version} listening on :${port}`);
  console.log("  payment rails:");
  for (const rail of rails()) {
    console.log(
      `    ${rail.rail === "evm" ? "EVM   " : "Solana"}  ${rail.network.padEnd(14)} ${rail.asset} → ${rail.payTo}`,
    );
  }
  console.log(`  facilitator: ${facilitatorUrl()}`);
  if (usingSuiteDefaultPayTo()) {
    console.log(
      "  note:        using suite default payTo — set PAY_TO_ADDRESS/SOLANA_PAY_TO_ADDRESS to receive funds yourself",
    );
  }
  console.log(
    `  backend:     ${hasTmdbCredentials() ? "TMDB (live)" : "fixtures (set TMDB_API_KEY or TMDB_ACCESS_TOKEN for the live catalogue)"}`,
  );
  console.log("  paid routes:");
  for (const [route, spec] of Object.entries(ROUTES)) {
    console.log(`    ${route.padEnd(28)} ${typeof spec === "string" ? spec : spec.price}`);
  }
  console.log("  free routes: GET /, GET /health, GET /.well-known/x402");
});
