/**
 * Selection, ranking and numbering for the weekly trending report — pure, no I/O.
 *
 * Code decides which items appear, in which order, with which 🆕 flag and
 * which numbers; the LLM only writes the per-row summaries and the prose
 * (`buildTrendingSummariesPrompt`, `buildTrendingProsePrompt`). Two tables:
 * the Agent & Coding Tool Radar (OpenRouter, npm and new GitHub repos) and the
 * GitHub category tables. Scope and category come from a `Classification` per
 * item (`trending-jev.ts`).
 */

import type { SearchRepo, TrendingRepo } from "./trending.ts";
import { formatTokens, type OpenRouterApp } from "./openrouter.ts";
import { momentumRatio, type NpmData, type NpmPackage } from "./npm.ts";
import { toCstDateStr } from "./date.ts";
import { onRadar, type Classification } from "./trending-jev.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const CATEGORIES = [
  "coding_agent",
  "harness_framework",
  "multi_agent",
  "agent_tooling",
  "other_agent",
] as const;
export type Category = (typeof CATEGORIES)[number];

export interface GithubRow {
  /** "github:<fullName>" */
  key: string;
  fullName: string;
  url: string;
  /** "" when none (search repos can have null). */
  description: string;
  /** "" when unknown. */
  language: string;
  /** 0 = unknown (trending scrape miss). */
  totalStars: number;
  /** Sort key, stars per week; null = no momentum signal. */
  perWeek: number | null;
  starsCell: string;
  isNew: boolean;
  /** Search `searchQuery` label; absent for trending-page-only repos. */
  topic?: string;
}

export type RadarSource = "OpenRouter" | "npm" | "GitHub";

export interface RadarRow {
  /** Item keys of every merged member, first = own: "openrouter:<appId>", "npm:<name>", "github:<fullName>". */
  keys: string[];
  name: string;
  url: string;
  description: string;
  /** Per member. */
  sources: RadarSource[];
  /** Per member, "🆕 " prefix when that member is new. */
  signals: string[];
  /** Some member is new. */
  isNew: boolean;
  /** Normalized merge links (`repo:<owner/repo>`, `host:<hostname>`), see `urlMerge`. */
  links: string[];
}

export type Numbered<T> = T & { n: number };

export interface TrendingReportData {
  radar: Numbered<RadarRow>[];
  /** Fixed CATEGORIES order, empty ones omitted. */
  categories: { category: Category; rows: Numbered<GithubRow>[] }[];
  classifiedBy: "jev" | "topics";
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Matches the `new:*` search queries' 14-day `created:` window. */
const NEW_REPO_DAYS = 14;
/**
 * An OpenRouter app listed this recently is new. Same window as new repos, so
 * "new" means the same across the Radar's sources.
 */
const NEW_LISTING_DAYS = 14;
/**
 * momentumRatio ~4.3 means first published this week; 3 leaves slack for a
 * package published late last week.
 */
const NPM_NEW_MIN_RATIO = 3;

/**
 * A new repo below this many stars stays off the Radar. The age scaling of
 * `perWeek` put an 8-star repo created that day above week-old repos on the
 * 2026-10-06 live check; the LLM's new-repo picks on 2026-10-05 had 27–168 stars.
 */
const NEW_REPO_MIN_STARS = 25;

/** In-scope candidates considered for merging. Merging happens before the cap, so a merged tool takes one slot. */
const RADAR_POOL = 30;
/**
 * At most this many of the pool are 🆕. Without it ~45 new GitHub repos a week
 * fill the pool and the Radar alone, and the established tools never reach it.
 */
const RADAR_POOL_NEW = 20;
/** Radar rows shown: enough to spot the week's new agents without turning into a directory. */
const RADAR_MAX = 12;
/**
 * At most this many Radar rows are 🆕; the rest go to the best-ranked established
 * tools (Hermes, Kilo Code, Cline on 2026-10-05), so the week's leaders show next
 * to the newcomers. Either side backfills when the other runs short.
 */
const RADAR_NEW_MAX = 8;
/** Rows per category table; the old prompt asked for 3–8. */
const CATEGORY_MAX = 8;

const DAY_MS = 24 * 60 * 60 * 1000;

const fmt = (n: number) => n.toLocaleString("en-US");
const rankStr = (r: number | null) => (r === null ? "—" : `#${r}`);

export const githubKey = (fullName: string) => `github:${fullName}`;
export const openrouterKey = (app: OpenRouterApp) => `openrouter:${app.appId}`;
export const npmKey = (pkg: NpmPackage) => `npm:${pkg.name}`;

/** Whole days from the CST date of `iso` to `dateStr`; null when `iso` is missing or unparseable. */
function ageDays(iso: string | undefined, dateStr: string): number | null {
  const t = iso ? Date.parse(iso) : NaN;
  if (Number.isNaN(t)) return null;
  return Math.round((Date.parse(dateStr) - Date.parse(toCstDateStr(new Date(t)))) / DAY_MS);
}

// ---------------------------------------------------------------------------
// GitHub rows
// ---------------------------------------------------------------------------

/** Merge the trending page and topic search by repo and sort by stars per week. */
export function rankGithubRepos(
  trendingRepos: TrendingRepo[],
  searchRepos: SearchRepo[],
  dateStr: string,
): GithubRow[] {
  // GitHub names are case-insensitive; the two sources may differ in case.
  const searchByName = new Map(searchRepos.map((s) => [s.fullName.toLowerCase(), s]));
  const trendingNames = new Set(trendingRepos.map((t) => t.fullName.toLowerCase()));
  const pairs: { t?: TrendingRepo; s?: SearchRepo }[] = [
    ...trendingRepos.map((t) => ({ t, s: searchByName.get(t.fullName.toLowerCase()) })),
    ...searchRepos.filter((s) => !trendingNames.has(s.fullName.toLowerCase())).map((s) => ({ s })),
  ];

  const rows = pairs.map(({ t, s }): GithubRow => {
    // Keep the trending page's numbers and the search repo's topic label and creation date.
    const fullName = t?.fullName ?? s!.fullName;
    const totalStars = t && t.totalStars > 0 ? t.totalStars : (s?.stargazersCount ?? 0);
    const periodStars = t?.periodStars ?? 0;
    const age = ageDays(s?.createdAt, dateStr);
    const newRepo = age !== null && age <= NEW_REPO_DAYS;

    // perWeek precedence, first match wins:
    //   1. trending `periodStars` > 0 — GitHub's own "this week" count;
    //   2. (reserved: the star-history delta, a later commit);
    //   3. new repo — its whole star count is this fortnight's, scaled to a week
    //      (only orders the Radar: new repos stay off the category tables);
    //   4. otherwise null — no momentum signal, sorted after every other row.
    let perWeek: number | null;
    let starsCell: string;
    if (periodStars > 0) {
      perWeek = periodStars;
      starsCell = totalStars > 0 ? `${fmt(totalStars)} (+${fmt(periodStars)})` : `(+${fmt(periodStars)})`;
    } else if (newRepo) {
      perWeek = (totalStars * 7) / Math.max(age, 1);
      starsCell = `${fmt(totalStars)} (new, ${age} ${age === 1 ? "day" : "days"})`;
    } else {
      perWeek = null;
      starsCell = fmt(totalStars);
    }

    const topic = s?.searchQuery;
    return {
      key: githubKey(fullName),
      fullName,
      url: t?.url ?? s!.url,
      description: t?.description || s?.description || "",
      language: t?.language || s?.language || "",
      totalStars,
      perWeek,
      starsCell,
      isNew: newRepo || (topic?.startsWith("new:") ?? false),
      ...(topic !== undefined ? { topic } : {}),
    };
  });

  // Stable sort: input order (trending page first) breaks ties.
  return rows.sort((a, b) => {
    if (a.perWeek === null || b.perWeek === null) {
      if (a.perWeek !== null) return -1;
      if (b.perWeek !== null) return 1;
      return b.totalStars - a.totalStars;
    }
    return b.perWeek - a.perWeek;
  });
}

// ---------------------------------------------------------------------------
// Radar candidates
// ---------------------------------------------------------------------------

/** `repo:<owner/repo>` from any github.com URL form (https, `git+https://….git`, `git@github.com:x/y.git`). */
function repoLink(url: string | undefined): string | null {
  const m = url?.match(/github\.com[/:]([^/\s]+)\/([^/#?\s]+)/i);
  if (!m) return null;
  return `repo:${m[1]}/${m[2]!.replace(/\.git$/i, "")}`.toLowerCase();
}

/**
 * `host:<hostname>` for a site-root URL only. A URL with a path is often a
 * vendor site hosting several products (`openai.com/codex/`), so host-level
 * merging there would join different tools; a missed merge is cheap (the tool
 * shows up twice), a false one is not.
 */
function hostLink(url: string | undefined): string | null {
  if (!url) return null;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (u.pathname !== "/" && u.pathname !== "") return null;
  const host = u.hostname.toLowerCase().replace(/^www\./, "");
  if (!host || host === "github.com" || host === "npmjs.com") return null;
  return `host:${host}`;
}

const linksOf = (...links: (string | null)[]) => [...new Set(links.filter((l): l is string => l !== null))];

const SOURCE_ORDER: RadarSource[] = ["OpenRouter", "npm", "GitHub"];

/** Every Radar candidate, 🆕 first, before scope filtering and merging. */
export function buildRadarCandidates(
  openrouter: OpenRouterApp[],
  npm: NpmData,
  githubRows: GithubRow[],
  dateStr: string,
): RadarRow[] {
  const row = (r: Omit<RadarRow, "signals"> & { signal: string }): RadarRow => {
    const { signal, ...rest } = r;
    return { ...rest, signals: [(r.isNew ? "🆕 " : "") + signal] };
  };

  const openrouterRows = openrouter.map((a) => {
    const listed = ageDays(a.createdAt, dateStr);
    const growth =
      a.growthPercent !== null
        ? ` · 📈 ${a.growthPercent >= 0 ? "+" : ""}${a.growthPercent.toLocaleString("en-US")}%`
        : "";
    return row({
      keys: [openrouterKey(a)],
      name: a.title,
      url: a.url,
      description: a.description,
      sources: ["OpenRouter"],
      signal:
        `week ${rankStr(a.weekRank)} / month ${rankStr(a.monthRank)}` +
        (a.weekTokens > 0 ? `, ${formatTokens(a.weekTokens)} tokens/week` : "") +
        growth,
      // Ranked this week but absent from the month list = newly popular.
      isNew: (listed !== null && listed <= NEW_LISTING_DAYS) || (a.weekRank !== null && a.monthRank === null),
      links: linksOf(repoLink(a.url), hostLink(a.url)),
    });
  });

  const npmRows = [...npm.rising, ...npm.top].map((p) =>
    row({
      keys: [npmKey(p)],
      name: p.name,
      url: p.url,
      description: p.description,
      sources: ["npm"],
      signal: `${fmt(p.weekly)}/week, ${momentumRatio(p).toFixed(1)}x`,
      isNew: momentumRatio(p) >= NPM_NEW_MIN_RATIO,
      links: linksOf(repoLink(p.repository), repoLink(p.homepage), hostLink(p.homepage)),
    }),
  );

  const githubRadarRows = githubRows
    .filter((r) => r.isNew && r.totalStars >= NEW_REPO_MIN_STARS)
    .map((r) =>
      row({
        keys: [r.key],
        name: r.fullName,
        url: r.url,
        description: r.description,
        sources: ["GitHub"],
        signal: r.starsCell,
        isNew: true,
        links: linksOf(`repo:${r.fullName.toLowerCase()}`),
      }),
    );

  // Ranks, stars and download ratios are not comparable across sources, so no
  // combined score is invented: 🆕 first, then each row's relative position in
  // its own source list, ties broken by source order.
  const positioned = [openrouterRows, npmRows, githubRadarRows].flatMap((list) =>
    list.map((r, i) => ({ r, pos: i / list.length, src: SOURCE_ORDER.indexOf(r.sources[0]!) })),
  );
  return positioned
    .sort((a, b) => Number(b.r.isNew) - Number(a.r.isNew) || a.pos - b.pos || a.src - b.src)
    .map((p) => p.r);
}

// ---------------------------------------------------------------------------
// Merging
// ---------------------------------------------------------------------------

/**
 * Union rows connected by a link pair (each side names any member key);
 * transitive. A merged row sits at its earliest member's position and takes
 * that member's name and url.
 */
export function mergeRows(rows: RadarRow[], links: [string, string][]): RadarRow[] {
  const parent = rows.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i]!)));
  const indexByKey = new Map<string, number>();
  rows.forEach((r, i) => r.keys.forEach((k) => indexByKey.set(k, i)));

  for (const [a, b] of links) {
    const i = indexByKey.get(a);
    const j = indexByKey.get(b);
    if (i === undefined || j === undefined) continue;
    const [ri, rj] = [find(i), find(j)];
    // The smaller index stays root, so a group's root is its earliest member.
    if (ri !== rj) parent[Math.max(ri, rj)] = Math.min(ri, rj);
  }

  // Rows are visited in order, so each group is first seen at its root: Map order = position.
  const groups = new Map<number, RadarRow[]>();
  rows.forEach((r, i) => {
    const root = find(i);
    const group = groups.get(root);
    if (group) group.push(r);
    else groups.set(root, [r]);
  });

  return [...groups.values()].map((members) => {
    const first = members[0]!;
    if (members.length === 1) return first;
    return {
      keys: members.flatMap((m) => m.keys),
      name: first.name,
      url: first.url,
      description: members.find((m) => m.description)?.description ?? "",
      sources: members.flatMap((m) => m.sources),
      signals: members.flatMap((m) => m.signals),
      isNew: members.some((m) => m.isNew),
      links: members.flatMap((m) => m.links),
    };
  });
}

/** Merge rows sharing a normalized GitHub repo or site-root host. */
export function urlMerge(rows: RadarRow[]): RadarRow[] {
  const firstWithLink = new Map<string, string>();
  const pairs: [string, string][] = [];
  for (const r of rows) {
    for (const link of r.links) {
      const other = firstWithLink.get(link);
      if (other === undefined) firstWithLink.set(link, r.keys[0]!);
      else pairs.push([other, r.keys[0]!]);
    }
  }
  return mergeRows(rows, pairs);
}

// ---------------------------------------------------------------------------
// Selection and numbering
// ---------------------------------------------------------------------------

/**
 * Apply scope, merge, cap and number the rows. New repos are Radar-only: the
 * category tables are the established projects, ranked by this week's stars,
 * so the two tables never share an item.
 */
export function selectTrendingReport(
  githubRows: GithubRow[],
  radarCandidates: RadarRow[],
  classifications: Map<string, Classification>,
  classifiedBy: TrendingReportData["classifiedBy"],
): TrendingReportData {
  // An unclassified candidate is dropped: nothing vouches for its scope.
  const eligible = radarCandidates.filter((r) => {
    const c = classifications.get(r.keys[0]!);
    return c !== undefined && onRadar(c);
  });
  const fresh = eligible.filter((r) => r.isNew);
  const established = eligible.filter((r) => !r.isNew);
  // 🆕 first, capped; established next; leftover 🆕 backfill a short established list.
  const pool = [...fresh.slice(0, RADAR_POOL_NEW), ...established, ...fresh.slice(RADAR_POOL_NEW)].slice(
    0,
    RADAR_POOL,
  );

  // A merged row is 🆕 when any member is, so split again after merging.
  const merged = urlMerge(pool);
  const mergedFresh = merged.filter((r) => r.isNew);
  const mergedEstablished = merged.filter((r) => !r.isNew);
  const freshCount = Math.min(
    mergedFresh.length,
    Math.max(RADAR_NEW_MAX, RADAR_MAX - mergedEstablished.length),
  );
  let n = 0;
  const radar = [
    ...mergedFresh.slice(0, freshCount),
    ...mergedEstablished.slice(0, RADAR_MAX - freshCount),
  ].map((r) => ({ ...r, n: ++n }));

  const categories = CATEGORIES.map((category) => ({
    category,
    rows: githubRows
      .filter((r) => !r.isNew && classifications.get(r.key)?.category === category)
      .slice(0, CATEGORY_MAX),
  }))
    .filter((g) => g.rows.length > 0)
    .map((g) => ({ category: g.category, rows: g.rows.map((r) => ({ ...r, n: ++n })) }));

  return { radar, categories, classifiedBy };
}

/** One entry per row, by number: the input of the summaries prompt. */
export function summaryRows(
  report: TrendingReportData,
): { n: number; name: string; description: string; facts: string }[] {
  return [
    ...report.radar.map((r) => ({
      n: r.n,
      name: r.name,
      description: r.description,
      facts: `Source: ${r.sources.join("; ")} | Signal: ${r.signals.join("; ")}`,
    })),
    ...report.categories.flatMap((g) =>
      g.rows.map((r) => ({
        n: r.n,
        name: r.fullName,
        description: r.description,
        facts: [r.language && `Language: ${r.language}`, `Stars: ${r.starsCell}`].filter(Boolean).join(" | "),
      })),
    ),
  ];
}
