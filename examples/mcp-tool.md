# Exposing x402-movies as an MCP tool

[MCP](https://modelcontextprotocol.io) lets Claude (and other MCP clients) call
this service directly. The wrapper below holds the wallet, pays the x402
invoice, and hands the artifact straight back to the model.

## Minimal server

```ts
// mcp-x402-movies.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createSigner, wrapFetchWithPayment } from "x402-fetch";
import { z } from "zod";

const BASE_URL = process.env.MOVIES_URL ?? "http://localhost:4024";

const signer = await createSigner("base-sepolia", process.env.PRIVATE_KEY!);
const payFetch = wrapFetchWithPayment(fetch, signer);

const server = new McpServer({ name: "x402-movies", version: "0.1.0" });

server.tool(
  "search_movies",
  "Search the movie catalogue by title, optionally narrowed to a release year",
  {
    q: z.string().describe("Title to search for, 1-200 characters."),
    year: z.number().optional().describe("Narrow to a primary release year, 1870…2100."),
    page: z.number().optional().describe("Result page, 1…500. Default 1."),
  },
  async (args) => {
    const url = new URL(`${BASE_URL}/search`);
    url.searchParams.set("q", args.q);
    if (args.year) url.searchParams.set("year", String(args.year));
    if (args.page) url.searchParams.set("page", String(args.page));
    const res = await payFetch(url);
    if (!res.ok) throw new Error(`GET /search → ${res.status}`);
    return { content: [{ type: "text", text: JSON.stringify(await res.json(), null, 2) }] };
  },
);

server.tool(
  "movie_detail",
  "Full detail bundle for one movie",
  {
    id: z.number().describe("Movie id as returned by `/search`."),
  },
  async (args) => {
    const url = `${BASE_URL}/movie/${args.id}`;
    const res = await payFetch(url);
    if (!res.ok) throw new Error(`GET /movie/:id → ${res.status}`);
    return { content: [{ type: "text", text: JSON.stringify(await res.json(), null, 2) }] };
  },
);

server.tool(
  "movie_recommendations",
  "Recommendations seeded by one movie, ranked with an explicit score and reasons",
  {
    id: z.number().describe("Seed movie id."),
    limit: z.number().optional().describe("How many recommendations to return, 1…20. Default 10."),
  },
  async (args) => {
    const url = new URL(`${BASE_URL}/recommendations/${args.id}`);
    if (args.limit) url.searchParams.set("limit", String(args.limit));
    const res = await payFetch(url);
    if (!res.ok) throw new Error(`GET /recommendations/:id → ${res.status}`);
    return { content: [{ type: "text", text: JSON.stringify(await res.json(), null, 2) }] };
  },
);

await server.connect(new StdioServerTransport());
```

## Wire it into Claude Desktop

`claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "x402-movies": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/mcp-x402-movies.ts"],
      "env": {
        "PRIVATE_KEY": "0xYourFundedTestKey",
        "MOVIES_URL": "http://localhost:4024"
      }
    }
  }
}
```

## Spending caps

Each GET /search call costs $0.001. Wrap `payFetch` with a
budget so a runaway loop cannot drain the wallet:

```ts
let spentMicros = 0;
const CAP_MICROS = 1_000_000; // $1.00

const cappedFetch: typeof fetch = async (input, init) => {
  if (spentMicros >= CAP_MICROS) throw new Error("x402 spend cap reached");
  const res = await payFetch(input, init);
  const receipt = res.headers.get("X-PAYMENT-RESPONSE");
  if (receipt) {
    const { amount } = JSON.parse(Buffer.from(receipt, "base64").toString());
    spentMicros += Number(amount ?? 0);
  }
  return res;
};
```

## Notes

- The tool descriptions above come from [`skill.md`](../skill.md) — keep them in
  sync so the model knows exactly what it is buying.
- Paying on Solana instead? Swap `x402-fetch` for a Solana x402 client; the 402
  challenge already advertises the `solana` rail, so nothing on this
  server changes.
- Discovery for autonomous agents: [`/.well-known/x402`](../public/.well-known/x402).
