/**
 * x402-movies — service layer.
 *
 * Live adapter for The Movie Database (TMDB), env-gated by TMDB_API_KEY (v3 key)
 * or TMDB_ACCESS_TOKEN (v4 bearer). When neither is present the service returns
 * deterministic fixture data so the demo always runs without credentials. Every
 * response carries a `source` field: "tmdb" or "fixture".
 */

export interface MovieSummary {
  id: number;
  title: string;
  originalTitle: string | null;
  overview: string;
  releaseDate: string | null;
  year: number | null;
  voteAverage: number | null;
  voteCount: number | null;
  popularity: number | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  originalLanguage: string | null;
  adult: boolean;
}

export interface SearchResult {
  source: "tmdb" | "fixture";
  query: { q: string; year: number | null; page: number };
  page: number;
  totalResults: number;
  totalPages: number;
  count: number;
  results: MovieSummary[];
  retrievedAt: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string | null;
  order: number;
  profileUrl: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string | null;
}

export interface WatchProvider {
  provider: string;
  type: "flatrate" | "rent" | "buy" | "ads" | "free";
  logoUrl: string | null;
}

export interface ReleaseDateEntry {
  countryCode: string;
  date: string | null;
  certification: string | null;
  type: string;
}

export interface MovieDetail extends MovieSummary {
  tagline: string | null;
  runtimeMinutes: number | null;
  status: string | null;
  budget: number | null;
  revenue: number | null;
  genres: string[];
  productionCompanies: string[];
  spokenLanguages: string[];
  homepage: string | null;
  imdbId: string | null;
  cast: CastMember[];
  crew: CrewMember[];
  /** Streaming/rental availability, keyed by ISO country code. */
  watchProviders: Record<string, WatchProvider[]>;
  /** Theatrical/digital/physical release dates and certifications by country. */
  releaseDates: ReleaseDateEntry[];
}

export interface DetailResult {
  source: "tmdb" | "fixture";
  movie: MovieDetail;
  retrievedAt: string;
}

export interface Recommendation extends MovieSummary {
  /** 0-1 relevance score computed by this service, highest first. */
  score: number;
  /** Why this title was ranked where it was. */
  reasons: string[];
}

export interface RecommendationsResult {
  source: "tmdb" | "fixture";
  seed: { id: number; title: string };
  count: number;
  recommendations: Recommendation[];
  retrievedAt: string;
}

const TMDB_BASE = process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

/** True when a TMDB credential is configured. */
export function hasTmdbCredentials(): boolean {
  return Boolean(process.env.TMDB_API_KEY || process.env.TMDB_ACCESS_TOKEN);
}

function imageUrl(path: string | null | undefined, size: string): string | null {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

async function tmdb(path: string, params: URLSearchParams = new URLSearchParams()): Promise<unknown> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = process.env.TMDB_ACCESS_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    params.set("api_key", process.env.TMDB_API_KEY ?? "");
  }
  const res = await fetch(`${TMDB_BASE}${path}?${params.toString()}`, {
    headers,
    signal: AbortSignal.timeout(Number(process.env.TMDB_TIMEOUT_MS ?? 20_000)),
  });
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    throw new Error(`TMDB request failed: ${res.status} ${detail}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// TMDB shapes (only the fields this service uses)
// ---------------------------------------------------------------------------

interface TmdbMovie {
  id?: number;
  title?: string;
  original_title?: string;
  overview?: string;
  release_date?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  poster_path?: string | null;
  backdrop_path?: string | null;
  original_language?: string;
  adult?: boolean;
  tagline?: string | null;
  runtime?: number | null;
  status?: string;
  budget?: number;
  revenue?: number;
  genres?: { name?: string }[];
  production_companies?: { name?: string }[];
  spoken_languages?: { english_name?: string; name?: string }[];
  homepage?: string | null;
  imdb_id?: string | null;
  genre_ids?: number[];
  credits?: {
    cast?: { id?: number; name?: string; character?: string; order?: number; profile_path?: string | null }[];
    crew?: { id?: number; name?: string; job?: string; department?: string }[];
  };
  "watch/providers"?: {
    results?: Record<
      string,
      {
        flatrate?: { provider_name?: string; logo_path?: string }[];
        rent?: { provider_name?: string; logo_path?: string }[];
        buy?: { provider_name?: string; logo_path?: string }[];
        ads?: { provider_name?: string; logo_path?: string }[];
        free?: { provider_name?: string; logo_path?: string }[];
      }
    >;
  };
  release_dates?: {
    results?: {
      iso_3166_1?: string;
      release_dates?: { release_date?: string; certification?: string; type?: number }[];
    }[];
  };
}

const RELEASE_TYPES: Record<number, string> = {
  1: "premiere",
  2: "theatrical_limited",
  3: "theatrical",
  4: "digital",
  5: "physical",
  6: "tv",
};

function toSummary(m: TmdbMovie): MovieSummary {
  const releaseDate = m.release_date && m.release_date.length > 0 ? m.release_date : null;
  return {
    id: m.id ?? 0,
    title: m.title ?? "(untitled)",
    originalTitle: m.original_title ?? null,
    overview: m.overview ?? "",
    releaseDate,
    year: releaseDate ? Number(releaseDate.slice(0, 4)) : null,
    voteAverage: m.vote_average ?? null,
    voteCount: m.vote_count ?? null,
    popularity: m.popularity ?? null,
    posterUrl: imageUrl(m.poster_path, "w500"),
    backdropUrl: imageUrl(m.backdrop_path, "w780"),
    originalLanguage: m.original_language ?? null,
    adult: m.adult ?? false,
  };
}

function toDetail(m: TmdbMovie): MovieDetail {
  const watchProviders: Record<string, WatchProvider[]> = {};
  const results = m["watch/providers"]?.results ?? {};
  for (const [country, entry] of Object.entries(results)) {
    const list: WatchProvider[] = [];
    for (const type of ["flatrate", "rent", "buy", "ads", "free"] as const) {
      for (const p of entry[type] ?? []) {
        list.push({
          provider: p.provider_name ?? "unknown",
          type,
          logoUrl: imageUrl(p.logo_path, "w92"),
        });
      }
    }
    if (list.length > 0) watchProviders[country] = list;
  }

  const releaseDates: ReleaseDateEntry[] = [];
  for (const r of m.release_dates?.results ?? []) {
    for (const d of r.release_dates ?? []) {
      releaseDates.push({
        countryCode: r.iso_3166_1 ?? "??",
        date: d.release_date ?? null,
        certification: d.certification && d.certification.length > 0 ? d.certification : null,
        type: RELEASE_TYPES[d.type ?? 0] ?? "unknown",
      });
    }
  }

  return {
    ...toSummary(m),
    tagline: m.tagline && m.tagline.length > 0 ? m.tagline : null,
    runtimeMinutes: m.runtime ?? null,
    status: m.status ?? null,
    budget: m.budget ?? null,
    revenue: m.revenue ?? null,
    genres: (m.genres ?? []).map((g) => g.name ?? "").filter(Boolean),
    productionCompanies: (m.production_companies ?? []).map((c) => c.name ?? "").filter(Boolean),
    spokenLanguages: (m.spoken_languages ?? [])
      .map((l) => l.english_name ?? l.name ?? "")
      .filter(Boolean),
    homepage: m.homepage && m.homepage.length > 0 ? m.homepage : null,
    imdbId: m.imdb_id ?? null,
    cast: (m.credits?.cast ?? []).slice(0, 15).map((c) => ({
      id: c.id ?? 0,
      name: c.name ?? "(unknown)",
      character: c.character && c.character.length > 0 ? c.character : null,
      order: c.order ?? 999,
      profileUrl: imageUrl(c.profile_path, "w185"),
    })),
    crew: (m.credits?.crew ?? [])
      .filter((c) =>
        ["Director", "Screenplay", "Writer", "Producer", "Original Music Composer", "Director of Photography"].includes(
          c.job ?? "",
        ),
      )
      .slice(0, 12)
      .map((c) => ({
        id: c.id ?? 0,
        name: c.name ?? "(unknown)",
        job: c.job ?? "",
        department: c.department ?? null,
      })),
    watchProviders,
    releaseDates,
  };
}

// ---------------------------------------------------------------------------
// Ranking — applied to both live and fixture recommendations so the ordering
// is this service's own, not just whatever order the upstream returned.
// ---------------------------------------------------------------------------

/** Ranks candidates against a seed movie and explains each placement. */
function rank(seed: MovieSummary, candidates: MovieSummary[]): Recommendation[] {
  const seedYear = seed.year;
  return candidates
    .map((c) => {
      const reasons: string[] = [];

      // Audience score, normalised to 0-1 (TMDB votes are out of 10).
      const rating = (c.voteAverage ?? 0) / 10;
      if ((c.voteAverage ?? 0) >= 7.5) reasons.push(`highly rated (${c.voteAverage}/10)`);

      // Confidence in that score: 1000+ votes counts as fully trusted.
      const confidence = Math.min(1, (c.voteCount ?? 0) / 1000);
      if ((c.voteCount ?? 0) >= 1000) reasons.push("large vote sample");

      // Era proximity: same decade as the seed scores highest.
      let era = 0.5;
      if (seedYear != null && c.year != null) {
        const gap = Math.abs(seedYear - c.year);
        era = Math.max(0, 1 - gap / 25);
        if (gap <= 5) reasons.push(`released within 5 years of ${seed.title}`);
      }

      // Same original language as the seed.
      let language = 0;
      if (c.originalLanguage && c.originalLanguage === seed.originalLanguage) {
        language = 1;
        reasons.push(`same original language (${c.originalLanguage})`);
      }

      const popularity = Math.min(1, (c.popularity ?? 0) / 100);

      const score =
        0.40 * rating * (0.5 + 0.5 * confidence) +
        0.25 * era +
        0.15 * language +
        0.20 * popularity;

      if (reasons.length === 0) reasons.push("returned as related by the catalogue");

      return { ...c, score: Number(score.toFixed(4)), reasons };
    })
    .sort((a, b) => b.score - a.score);
}

// ---------------------------------------------------------------------------
// Fixture data — used when TMDB_API_KEY / TMDB_ACCESS_TOKEN are unset.
// Deterministic: the same query always produces the same catalogue.
// ---------------------------------------------------------------------------

function seedFrom(...parts: (string | number)[]): number {
  let h = 2166136261;
  const s = parts.join("|");
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIXTURE_TITLE_HEADS = [
  "The Last", "Winter of the", "Echoes of", "Return to", "A Quiet",
  "Beneath the", "The Long", "Signals from", "After the", "The Second",
];
const FIXTURE_TITLE_TAILS = [
  "Lighthouse", "Cartographer", "Harbour", "Instrument", "Orchard",
  "Frequency", "Expedition", "Archive", "Meridian", "Winter",
];
const FIXTURE_GENRES = ["Drama", "Science Fiction", "Thriller", "Documentary", "Comedy", "Mystery", "Adventure"];
const FIXTURE_COMPANIES = ["Northwind Pictures", "Blue Harbour Films", "Meridian Studios", "Foldout Media"];
const FIXTURE_NAMES = [
  "Ana Ferreira", "Tomas Lind", "Priya Raghunathan", "Marcus Bell", "Yuki Tanaka",
  "Sofia Marchetti", "Daniel Okafor", "Hanna Bergström", "Leo Vasquez", "Iris Chen",
];

function fixtureMovie(id: number): MovieDetail {
  const rand = mulberry32(id * 2654435761);
  const head = FIXTURE_TITLE_HEADS[Math.floor(rand() * FIXTURE_TITLE_HEADS.length)];
  const tail = FIXTURE_TITLE_TAILS[Math.floor(rand() * FIXTURE_TITLE_TAILS.length)];
  const title = `${head} ${tail}`;
  const year = 1975 + Math.floor(rand() * 50);
  const month = 1 + Math.floor(rand() * 12);
  const day = 1 + Math.floor(rand() * 28);
  const releaseDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const runtime = 84 + Math.floor(rand() * 76);
  const voteAverage = Number((5 + rand() * 4).toFixed(1));
  const voteCount = 40 + Math.floor(rand() * 4000);
  const budget = 1_000_000 * (1 + Math.floor(rand() * 120));
  const genres = Array.from(
    new Set(Array.from({ length: 2 }, () => FIXTURE_GENRES[Math.floor(rand() * FIXTURE_GENRES.length)])),
  );
  const pick = (): string => FIXTURE_NAMES[Math.floor(rand() * FIXTURE_NAMES.length)];

  return {
    id,
    title,
    originalTitle: title,
    overview: `A ${genres[0].toLowerCase()} about ${tail.toLowerCase()}s, set in ${year}. Deterministic fixture record — set TMDB_API_KEY for the real catalogue.`,
    releaseDate,
    year,
    voteAverage,
    voteCount,
    popularity: Number((rand() * 120).toFixed(3)),
    posterUrl: null,
    backdropUrl: null,
    originalLanguage: rand() < 0.75 ? "en" : "fr",
    adult: false,
    tagline: `${head} ${tail.toLowerCase()} you will ever see.`,
    runtimeMinutes: runtime,
    status: "Released",
    budget,
    revenue: Math.round(budget * (0.4 + rand() * 4)),
    genres,
    productionCompanies: [FIXTURE_COMPANIES[Math.floor(rand() * FIXTURE_COMPANIES.length)]],
    spokenLanguages: ["English"],
    homepage: null,
    imdbId: null,
    cast: Array.from({ length: 4 }, (_, i) => ({
      id: 900000 + id * 10 + i,
      name: pick(),
      character: `${["Ellis", "Nadia", "Rowan", "Sam"][i]}`,
      order: i,
      profileUrl: null,
    })),
    crew: [
      { id: 800000 + id, name: pick(), job: "Director", department: "Directing" },
      { id: 810000 + id, name: pick(), job: "Screenplay", department: "Writing" },
    ],
    watchProviders: {
      US: [
        { provider: "Demo Streaming", type: "flatrate", logoUrl: null },
        { provider: "Demo Rentals", type: "rent", logoUrl: null },
      ],
    },
    releaseDates: [
      { countryCode: "US", date: `${releaseDate}T00:00:00.000Z`, certification: "PG-13", type: "theatrical" },
      { countryCode: "US", date: `${year}-${String(Math.min(12, month + 3)).padStart(2, "0")}-01T00:00:00.000Z`, certification: null, type: "digital" },
    ],
  };
}

/** Stable set of fixture ids derived from a query string. */
function fixtureIdsFor(key: string, count: number): number[] {
  const rand = mulberry32(seedFrom(key));
  const ids = new Set<number>();
  while (ids.size < count) ids.add(100_000 + Math.floor(rand() * 900_000));
  return [...ids];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Search the catalogue. Live TMDB when credentialed, fixtures otherwise. */
export async function searchMovies(
  q: string,
  year: number | null,
  page: number,
): Promise<SearchResult> {
  if (hasTmdbCredentials()) {
    const params = new URLSearchParams({ query: q, page: String(page), include_adult: "false" });
    if (year != null) params.set("primary_release_year", String(year));
    const body = (await tmdb("/search/movie", params)) as {
      page?: number;
      total_results?: number;
      total_pages?: number;
      results?: TmdbMovie[];
    };
    const results = (body.results ?? []).map(toSummary);
    return {
      source: "tmdb",
      query: { q, year, page },
      page: body.page ?? page,
      totalResults: body.total_results ?? results.length,
      totalPages: body.total_pages ?? 1,
      count: results.length,
      results,
      retrievedAt: new Date().toISOString(),
    };
  }

  // Fixture mode: 8 deterministic titles per query, filtered by year if given.
  const all = fixtureIdsFor(`search:${q.toLowerCase()}`, 8).map((id) => fixtureMovie(id));
  const filtered = year == null ? all : all.filter((m) => m.year === year);
  const perPage = 5;
  const start = (page - 1) * perPage;
  // Fixture titles are synthetic and do not contain the query string — the
  // `source: "fixture"` field is the honest signal, not a doctored title.
  const results: MovieSummary[] = filtered.slice(start, start + perPage);
  return {
    source: "fixture",
    query: { q, year, page },
    page,
    totalResults: filtered.length,
    totalPages: Math.max(1, Math.ceil(filtered.length / perPage)),
    count: results.length,
    results,
    retrievedAt: new Date().toISOString(),
  };
}

/** Full detail bundle for one movie: credits, providers, release dates. */
export async function movieDetail(id: number): Promise<DetailResult | null> {
  if (hasTmdbCredentials()) {
    try {
      const body = (await tmdb(
        `/movie/${id}`,
        new URLSearchParams({ append_to_response: "credits,watch/providers,release_dates" }),
      )) as TmdbMovie;
      return { source: "tmdb", movie: toDetail(body), retrievedAt: new Date().toISOString() };
    } catch (err) {
      if (err instanceof Error && err.message.includes("404")) return null;
      throw err;
    }
  }
  if (!Number.isInteger(id) || id < 100_000 || id > 999_999) return null;
  return { source: "fixture", movie: fixtureMovie(id), retrievedAt: new Date().toISOString() };
}

/** Ranked recommendations seeded by one movie. */
export async function recommendations(
  id: number,
  limit: number,
): Promise<RecommendationsResult | null> {
  const detail = await movieDetail(id);
  if (!detail) return null;
  const seed = detail.movie;

  if (hasTmdbCredentials()) {
    const body = (await tmdb(`/movie/${id}/recommendations`, new URLSearchParams({ page: "1" }))) as {
      results?: TmdbMovie[];
    };
    const candidates = (body.results ?? []).map(toSummary);
    const ranked = rank(seed, candidates).slice(0, limit);
    return {
      source: "tmdb",
      seed: { id: seed.id, title: seed.title },
      count: ranked.length,
      recommendations: ranked,
      retrievedAt: new Date().toISOString(),
    };
  }

  const candidates = fixtureIdsFor(`recs:${id}`, Math.max(limit + 4, 10)).map((cid) =>
    fixtureMovie(cid),
  );
  const ranked = rank(seed, candidates).slice(0, limit);
  return {
    source: "fixture",
    seed: { id: seed.id, title: seed.title },
    count: ranked.length,
    recommendations: ranked,
    retrievedAt: new Date().toISOString(),
  };
}
