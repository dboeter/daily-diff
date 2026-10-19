/**
 * OpenRouter app and model popularity.
 *
 * OpenRouter has no public API for app or model usage. Both `/apps` and
 * `/rankings` are Next.js pages whose data is embedded in the React Server
 * Components payload (`self.__next_f.push([1,"…"])` script chunks). This
 * scrape is undocumented and breaks when the frontend changes — every parser
 * returns empty instead of throwing, and the report degrades to its other
 * sources. Category pages (`/apps/category/cli-agent`) load data client-side,
 * so `/apps` (top 200 per day/week/month + trending) is the widest view.
 *
 * New models and stealth models come from the official `/api/v1/models` catalog.
 * Apps and models feed the weekly trending report; stealth models are fetched
 * daily for the agents report (`fetchStealthModels`).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OpenRouterApp {
  appId: number;
  title: string;
  description: string;
  url: string;
  categories: string[];
  createdAt: string;
  /** Tokens over the last 7 days; 0 when the app is not in the week top 200. */
  weekTokens: number;
  dayRank: number | null;
  weekRank: number | null;
  monthRank: number | null;
  /** Only set for apps on OpenRouter's own "trending" list. */
  growthPercent: number | null;
}

export interface OpenRouterModel {
  slug: string;
  /** Prompt + completion tokens for the snapshot day. */
  tokens: number;
}

export interface OpenRouterNewModel {
  id: string;
  name: string;
  description: string;
  created: string;
  contextLength: number;
}

/** An anonymous pre-release model, usually free for a limited window. */
export interface OpenRouterStealthModel {
  id: string;
  name: string;
  created: string;
  /** `expiration_date` from the catalog (YYYY-MM-DD), when OpenRouter has announced one. */
  expires: string | null;
}

export interface OpenRouterData {
  apps: OpenRouterApp[];
  topModels: OpenRouterModel[];
  topModelsDate: string;
  newModels: OpenRouterNewModel[];
  fetchSuccess: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const APPS_URL = "https://openrouter.ai/apps";
const RANKINGS_URL = "https://openrouter.ai/rankings";
const MODELS_URL = "https://openrouter.ai/api/v1/models";

/** OpenRouter's own app categories that cover agents and coding tools. */
const AGENT_CATEGORIES = new Set([
  "cli-agent",
  "personal-agent",
  "cloud-agent",
  "ide-extension",
  "programming-app",
  "native-app-builder",
]);

/** Agent-category apps are kept down to this week rank. */
const AGENT_MAX_WEEK_RANK = 100;
/** Apps created this recently are kept regardless of category (most apps are uncategorized). */
const NEW_APP_DAYS = 30;
/** Cap on apps sent to the LLM. */
const MAX_APPS = 60;
/** New-model window: the trending report is weekly, so one week plus a day of slack for a delayed cron. */
const NEW_MODEL_DAYS = 8;

const HEADERS = { "User-Agent": "Mozilla/5.0 (compatible; daily-diff/1.0)" };

/** 13_694_514_725_528 → "13.69T". OpenRouter token counts span 10^9–10^13. */
export function formatTokens(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  return `${(n / 1e6).toFixed(1)}M`;
}

// ---------------------------------------------------------------------------
// RSC payload parsing
// ---------------------------------------------------------------------------

/**
 * Concatenate all RSC flight chunks into one string. Each chunk is a
 * JSON-encoded string literal; a chunk boundary can fall mid-value, so callers
 * must search the joined text, never individual chunks.
 */
export function extractRscPayload(html: string): string {
  const chunkPattern = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
  let text = "";
  for (const m of html.matchAll(chunkPattern)) {
    try {
      text += JSON.parse(m[1]!) as string;
    } catch {
      // malformed chunk — skip it
    }
  }
  return text;
}

/**
 * Find the first `"key":[` in `text` and parse the JSON array that follows,
 * bracket-matching while skipping string contents. Returns null when the key
 * is missing or the slice is not valid JSON.
 */
export function extractJsonArray(text: string, key: string): unknown[] | null {
  const marker = `"${key}":[`;
  const start = text.indexOf(marker);
  if (start === -1) return null;

  const from = start + marker.length - 1;
  let depth = 0;
  let inString = false;
  for (let i = from; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (ch === "\\") i++;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "[" || ch === "{") depth++;
    else if (ch === "]" || ch === "}") {
      depth--;
      if (depth === 0) {
        try {
          const parsed: unknown = JSON.parse(text.slice(from, i + 1));
          return Array.isArray(parsed) ? parsed : null;
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

interface RawAppEntry {
  app_id: number;
  total_tokens: string;
  rank: number;
  app: {
    title: string;
    description: string | null;
    origin_url: string | null;
    created_at: string;
    categories: string[] | null;
  };
}

interface RawTrendingEntry {
  appAnalytics: RawAppEntry;
  growthPercent: number;
}

function isAppEntry(x: unknown): x is RawAppEntry {
  const e = x as RawAppEntry;
  return typeof e?.app_id === "number" && typeof e.rank === "number" && typeof e.app?.title === "string";
}

/** Join the day/week/month top-200 lists and the trending list by app id. */
export function parseOpenRouterApps(html: string): OpenRouterApp[] {
  const text = extractRscPayload(html);
  const apps = new Map<number, OpenRouterApp>();

  const upsert = (e: RawAppEntry): OpenRouterApp => {
    let app = apps.get(e.app_id);
    if (!app) {
      app = {
        appId: e.app_id,
        title: e.app.title,
        description: e.app.description ?? "",
        url: e.app.origin_url ?? "",
        categories: e.app.categories ?? [],
        createdAt: e.app.created_at,
        weekTokens: 0,
        dayRank: null,
        weekRank: null,
        monthRank: null,
        growthPercent: null,
      };
      apps.set(e.app_id, app);
    }
    return app;
  };

  for (const period of ["day", "week", "month"] as const) {
    for (const e of (extractJsonArray(text, period) ?? []).filter(isAppEntry)) {
      const app = upsert(e);
      if (period === "day") app.dayRank = e.rank;
      if (period === "week") {
        app.weekRank = e.rank;
        app.weekTokens = Number(e.total_tokens) || 0;
      }
      if (period === "month") app.monthRank = e.rank;
    }
  }

  for (const t of (extractJsonArray(text, "trending") ?? []) as RawTrendingEntry[]) {
    if (!isAppEntry(t?.appAnalytics)) continue;
    upsert(t.appAnalytics).growthPercent = typeof t.growthPercent === "number" ? t.growthPercent : null;
  }

  return [...apps.values()];
}

/**
 * Keep the apps relevant to spotting agents: OpenRouter-trending apps,
 * agent-category apps in the week top 100, and recently created apps of any
 * category. Sorted trending-first, then by best rank.
 */
export function selectAgentApps(apps: OpenRouterApp[], now = Date.now()): OpenRouterApp[] {
  const newCutoff = now - NEW_APP_DAYS * 24 * 60 * 60 * 1000;
  const bestRank = (a: OpenRouterApp) => Math.min(a.dayRank ?? Infinity, a.weekRank ?? Infinity);

  return apps
    .filter(
      (a) =>
        a.growthPercent !== null ||
        (a.categories.some((c) => AGENT_CATEGORIES.has(c)) && bestRank(a) <= AGENT_MAX_WEEK_RANK) ||
        Date.parse(a.createdAt) >= newCutoff,
    )
    .sort(
      (a, b) =>
        Number(b.growthPercent !== null) - Number(a.growthPercent !== null) || bestRank(a) - bestRank(b),
    )
    .slice(0, MAX_APPS);
}

interface RawModelRow {
  date: string;
  model_permaslug: string;
  total_prompt_tokens: number;
  total_completion_tokens: number;
}

/** Top models by tokens from the `/rankings` page's daily snapshot. */
export function parseOpenRouterModels(html: string): { models: OpenRouterModel[]; date: string } {
  const rows = (extractJsonArray(extractRscPayload(html), "data") ?? []).filter(
    (r): r is RawModelRow => typeof (r as RawModelRow)?.model_permaslug === "string",
  );
  const date =
    rows
      .map((r) => r.date.slice(0, 10))
      .sort()
      .at(-1) ?? "";
  const byModel = new Map<string, number>();
  for (const r of rows.filter((r) => r.date.startsWith(date))) {
    const tokens = (r.total_prompt_tokens || 0) + (r.total_completion_tokens || 0);
    byModel.set(r.model_permaslug, (byModel.get(r.model_permaslug) ?? 0) + tokens);
  }
  const models = [...byModel.entries()]
    .map(([slug, tokens]) => ({ slug, tokens }))
    .sort((a, b) => b.tokens - a.tokens);
  return { models, date };
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

async function fetchHtml(url: string): Promise<string> {
  const resp = await fetch(url, { headers: { ...HEADERS, Accept: "text/html" } });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.text();
}

export interface ApiModel {
  id: string;
  name: string;
  description: string;
  created: number;
  context_length: number;
  expiration_date?: string | null;
}

/**
 * Stealth models live under the `stealth/` namespace (e.g. `stealth/space-bunny-alpha`).
 * Earlier ones were published as `openrouter/<name>-alpha` and described as a
 * "cloaked model"; the description match covers that naming too.
 */
export function isStealthModel(m: Pick<ApiModel, "id" | "description">): boolean {
  return (
    m.id.startsWith("stealth/") ||
    /\b(?:stealth|cloaked|anonymous)\b[^.]{0,40}?\bmodel\b/i.test(m.description ?? "")
  );
}

export function selectStealthModels(models: ApiModel[]): OpenRouterStealthModel[] {
  return models
    .filter(isStealthModel)
    .sort((a, b) => b.created - a.created)
    .map((m) => ({
      id: m.id,
      name: m.name,
      created: new Date(m.created * 1000).toISOString().slice(0, 10),
      expires: m.expiration_date ?? null,
    }));
}

async function fetchModelCatalog(): Promise<ApiModel[]> {
  const resp = await fetch(MODELS_URL, { headers: HEADERS });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const { data } = (await resp.json()) as { data: ApiModel[] };
  return data;
}

function selectNewModels(data: ApiModel[]): OpenRouterNewModel[] {
  const cutoff = Date.now() / 1000 - NEW_MODEL_DAYS * 24 * 60 * 60;
  return data
    .filter((m) => m.created >= cutoff)
    .sort((a, b) => b.created - a.created)
    .map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      created: new Date(m.created * 1000).toISOString().slice(0, 10),
      contextLength: m.context_length,
    }));
}

export async function fetchOpenRouterData(): Promise<OpenRouterData> {
  const [apps, top, catalog] = await Promise.all([
    fetchHtml(APPS_URL)
      .then((html) => selectAgentApps(parseOpenRouterApps(html)))
      .catch((err): OpenRouterApp[] => {
        console.error(`  [openrouter] apps fetch failed: ${err}`);
        return [];
      }),
    fetchHtml(RANKINGS_URL)
      .then(parseOpenRouterModels)
      .catch((err) => {
        console.error(`  [openrouter] rankings fetch failed: ${err}`);
        return { models: [], date: "" };
      }),
    fetchModelCatalog().catch((err): ApiModel[] | null => {
      console.error(`  [openrouter] models fetch failed: ${err}`);
      return null;
    }),
  ]);
  const newModels = catalog ? selectNewModels(catalog) : [];

  if (apps.length === 0) console.error("  [openrouter] Parsed 0 apps — payload structure may have changed");
  if (top.models.length === 0)
    console.error("  [openrouter] Parsed 0 ranked models — payload structure may have changed");
  console.log(
    `  [openrouter] ${apps.length} agent apps, ${top.models.length} ranked models, ${newModels.length} new models`,
  );

  return {
    apps,
    topModels: top.models,
    topModelsDate: top.date,
    newModels,
    fetchSuccess: apps.length > 0 || top.models.length > 0 || catalog !== null,
  };
}

/**
 * Stealth models currently in the catalog, for the daily agents report.
 * Returns null when the catalog could not be fetched — distinct from "none listed".
 */
export async function fetchStealthModels(): Promise<OpenRouterStealthModel[] | null> {
  try {
    const models = selectStealthModels(await fetchModelCatalog());
    console.log(
      `  [openrouter] ${models.length} stealth models: ${models.map((m) => m.id).join(", ") || "none"}`,
    );
    return models;
  } catch (err) {
    console.error(`  [openrouter] stealth model check failed: ${err}`);
    return null;
  }
}
