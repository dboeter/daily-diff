/**
 * Selection, ranking and numbering for the weekly trending report — pure, except
 * for loading and saving the star history (`digests/trending-state.json`).
 *
 * Code decides which items appear, in which order, with which 🆕 flag and
 * which numbers; the LLM only writes the per-row summaries and the prose
 * (`buildTrendingSummariesPrompt`, `buildTrendingProsePrompt`). Two tables:
 * the Agent & Coding Tool Radar (OpenRouter, npm and new GitHub repos) and the
 * GitHub category tables. Scope and category come from a `Classification` per
 * item (`trending/jev.ts`).
 */

import fs from "node:fs";
import path from "node:path";
import type { Numbered } from "../reports/summarized-table.ts";
import type { SearchRepo, TrendingRepo } from "./trending.ts";
import { formatTokens, type OpenRouterApp } from "../sources/openrouter.ts";
import { momentumRatio, type NpmData, type NpmPackage } from "./npm.ts";
import { toCstDateStr } from "../core/date.ts";
import { STAR_GAIN_DAYS } from "../core/github.ts";
import { inScope, onRadar, type Classification, type ClassifyCache, type MatchState } from "./jev.ts";

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
  /** Sort key: stars gained in the last STAR_GAIN_DAYS; null = unknown, sorted after every other row. */
  gain: number | null;
  /** Where `gain` came from (`rankGithubRepos`); null with it. */
  gainFrom: GainSource | null;
  /** `gain` over the stars a week ago; null when unknown or that baseline is under RELATIVE_MIN_BASELINE. */
  relative: number | null;
  starsCell: string;
  isNew: boolean;
  /** The search topic that found it; absent for trending-page-only repos. */
  topic?: string;
}

/** The trending page, the 7-day star-history point, the repo's age, or the history API. */
export type GainSource = "trending" | "snapshot" | "age" | "api";

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

export interface TrendingReportData {
  radar: Numbered<RadarRow>[];
  /** Fixed CATEGORIES order, empty ones omitted. */
  categories: { category: Category; rows: Numbered<GithubRow>[] }[];
  classifiedBy: "jev" | "topics";
  /** `buildTrendingRankingFile` output when Jev classified or matched, saved next to the report. */
  rankingFile?: string;
  /** Match state to save once the report is written; absent when the file could not be read. */
  nextMatches?: MatchState;
  /** Classification cache to save once the report is written; absent when the file could not be read. */
  nextClassifications?: ClassifyCache;
  /** Star history to save once the report is written. */
  nextStarHistory?: StarHistory;
}

/** `digests/trending-state.json`: [CST date, total stars] points per repo, oldest first. */
export interface StarHistory {
  /** Key: `fullName` lowercased — GitHub names are case-insensitive, and the trending page and search may differ in case. */
  repos: Record<string, [string, number][]>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** The topic search's `created:` window uses it too. */
export const NEW_REPO_DAYS = 14;
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
 * A new repo below this many stars stays off the Radar, and the `created:`
 * search asks for no fewer. On the 2026-10-06 live check an 8-star repo created
 * that day ranked above week-old repos; the LLM's new-repo picks on 2026-10-05
 * had 27–168 stars.
 */
export const NEW_REPO_MIN_STARS = 25;
/**
 * A relative gain needs at least this many stars a week ago: below it, 8 → 16
 * stars reads as +100%. The established-repo search asks for this many stars
 * now, since a repo with fewer cannot have had more a week ago.
 */
export const RELATIVE_MIN_BASELINE = 100;
/**
 * A row enters a category table through its relative gain only with at least
 * this many new stars. On the 2026-10-08 live check a +22-star week
 * (138 stars, +19%) took a multi-agent slot that way.
 */
const RELATIVE_MIN_GAIN = 50;

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

/**
 * Star-history points older than this are pruned: a gain is only read from the
 * point exactly STAR_GAIN_DAYS old (`starBaseline`), so older points are never used.
 */
const STAR_HISTORY_DAYS = STAR_GAIN_DAYS;

export const STAR_HISTORY_FILE = path.join("digests", "trending-state.json");

const DAY_MS = 24 * 60 * 60 * 1000;

const fmt = (n: number) => n.toLocaleString("en-US");
const rankStr = (r: number | null) => (r === null ? "—" : `#${r}`);

export const githubKey = (fullName: string) => `github:${fullName}`;
export const openrouterKey = (app: OpenRouterApp) => `openrouter:${app.appId}`;
export const npmKey = (pkg: NpmPackage) => `npm:${pkg.name}`;

/** Whole days between two CST dates (`YYYY-MM-DD`). */
const daysBetween = (from: string, to: string) => Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS);

/** Whole days from the CST date of `iso` to `dateStr`; null when `iso` is missing or unparseable. */
function ageDays(iso: string | undefined, dateStr: string): number | null {
  const t = iso ? Date.parse(iso) : NaN;
  if (Number.isNaN(t)) return null;
  return Math.round((Date.parse(dateStr) - Date.parse(toCstDateStr(new Date(t)))) / DAY_MS);
}

// ---------------------------------------------------------------------------
// Star history
// ---------------------------------------------------------------------------

export function loadStarHistory(file = STAR_HISTORY_FILE): StarHistory {
  if (!fs.existsSync(file)) return { repos: {} };
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf-8")) as Partial<StarHistory> | null;
    if (typeof parsed?.repos !== "object" || parsed.repos === null || Array.isArray(parsed.repos)) {
      throw new Error("no `repos` object");
    }
    return parsed as StarHistory;
  } catch (err) {
    // Unlike the match file, starting over is safe: the history is never
    // hand-edited, and losing it costs one run of history-API calls, not a decision.
    console.error(`  [trending] Cannot read ${file}, star history starts over: ${err}`);
    return { repos: {} };
  }
}

/**
 * One repo per line: `JSON.stringify(_, null, 2)` puts every date and star
 * count on its own line, which makes the file several times longer.
 */
export function saveStarHistory(history: StarHistory, file = STAR_HISTORY_FILE): void {
  const lines = Object.entries(history.repos).map(
    ([name, points]) => `    ${JSON.stringify(name)}: ${JSON.stringify(points)}`,
  );
  const body = lines.length > 0 ? `{\n${lines.join(",\n")}\n  }` : "{}";
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `{\n  "repos": ${body}\n}\n`, "utf-8");
}

/**
 * Total stars at the point dated exactly STAR_GAIN_DAYS before `dateStr`, so
 * the delta covers the same week as the history API and the trending page. A
 * forced mid-week run cannot shorten next Monday's window, and a same-day
 * re-run computes the same deltas. Null without such a point: the gain then
 * comes from the history API.
 */
export function starBaseline(history: StarHistory, fullName: string, dateStr: string): number | null {
  const point = (history.repos[fullName.toLowerCase()] ?? []).find(
    ([date]) => daysBetween(date, dateStr) === STAR_GAIN_DAYS,
  );
  return point ? point[1] : null;
}

/** History after this run: today's points recorded or replaced, unseen repos carried forward, old points pruned. */
export function nextStarHistory(history: StarHistory, githubRows: GithubRow[], dateStr: string): StarHistory {
  const repos: Record<string, [string, number][]> = {};
  for (const [name, points] of Object.entries(history.repos)) {
    repos[name] = points.filter(([date]) => date !== dateStr);
  }
  // totalStars 0 means the trending scrape missed the count, not a repo with no stars.
  for (const row of githubRows.filter((r) => r.totalStars > 0)) {
    const name = row.fullName.toLowerCase();
    repos[name] = [...(repos[name] ?? []), [dateStr, row.totalStars]];
  }
  // Repos not seen this run are kept until pruned: a forced mid-week run must not drop Monday's points.
  const next: StarHistory = { repos: {} };
  for (const [name, points] of Object.entries(repos)) {
    const kept = points
      .filter(([date]) => daysBetween(date, dateStr) <= STAR_HISTORY_DAYS)
      .sort((a, b) => a[0].localeCompare(b[0]));
    if (kept.length > 0) next.repos[name] = kept;
  }
  return next;
}

// ---------------------------------------------------------------------------
// GitHub rows
// ---------------------------------------------------------------------------

/** "+7.1%" below 10%, "+40%" from there: the big repos gain fractions of a percent. */
function fmtPercent(ratio: number): string {
  const p = ratio * 100;
  // Rounding a tiny loss gives -0, which prints as "0".
  const v = Math.abs(p) >= 10 ? Math.round(p) : Math.round(p * 10) / 10;
  return `${v > 0 ? "+" : ""}${v}%`;
}

/**
 * Merge the trending page and topic search by repo and sort by this week's
 * star gain. `fetched` holds history-API gains by lowercased name, for the
 * rows nothing else measures (`composeTrendingReport` asks for those only).
 */
export function rankGithubRepos(
  trendingRepos: TrendingRepo[],
  searchRepos: SearchRepo[],
  dateStr: string,
  history: StarHistory = { repos: {} },
  fetched: Map<string, number> = new Map(),
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
    const baseline = totalStars > 0 ? starBaseline(history, fullName, dateStr) : null;

    // Gain sources, first match wins; each counts the same week:
    //   1. trending `periodStars` > 0 — GitHub's own "this week";
    //   2. the star-history point from exactly a week ago;
    //   3. a repo created less than a week ago — every star it has; one
    //      created on the CST date a week back can predate the previous
    //      weekly run, so its count could overshoot and it goes to the API;
    //   4. `fetched` — the stargazers/history API;
    //   5. otherwise null, sorted after every other row.
    const apiGain = fetched.get(fullName.toLowerCase());
    let gain: number | null = null;
    let gainFrom: GainSource | null = null;
    if (periodStars > 0) [gain, gainFrom] = [periodStars, "trending"];
    else if (baseline !== null) [gain, gainFrom] = [totalStars - baseline, "snapshot"];
    else if (age !== null && age < STAR_GAIN_DAYS) [gain, gainFrom] = [totalStars, "age"];
    else if (apiGain !== undefined) [gain, gainFrom] = [apiGain, "api"];

    // A trending scrape miss (totalStars 0) leaves no baseline, so no relative gain.
    const before = gain === null ? 0 : totalStars - gain;
    const relative = gain !== null && before >= RELATIVE_MIN_BASELINE ? gain / before : null;
    const total = totalStars > 0 ? fmt(totalStars) : "";
    const starsCell =
      gain === null
        ? fmt(totalStars)
        : `${total} (${gain >= 0 ? "+" : ""}${fmt(gain)}${relative !== null ? `, ${fmtPercent(relative)}` : ""})`.trim();

    const topic = s?.topic;
    return {
      key: githubKey(fullName),
      fullName,
      url: t?.url ?? s!.url,
      description: t?.description || s?.description || "",
      language: t?.language || s?.language || "",
      totalStars,
      gain,
      gainFrom,
      relative,
      starsCell,
      isNew: age !== null && age <= NEW_REPO_DAYS,
      ...(topic !== undefined ? { topic } : {}),
    };
  });

  // Stable sort: input order (trending page first) breaks ties.
  return rows.sort((a, b) => {
    if (a.gain === null || b.gain === null) {
      if (a.gain !== null) return -1;
      if (b.gain !== null) return 1;
      return b.totalStars - a.totalStars;
    }
    return b.gain - a.gain;
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

  const githubRadarRows = githubRows.filter(isRadarRepo).map((r) =>
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

/** The Radar-eligible candidates considered for merging, before any merge. */
export function radarPool(
  radarCandidates: RadarRow[],
  classifications: Map<string, Classification>,
): RadarRow[] {
  // An unclassified candidate is dropped: nothing vouches for its scope.
  const eligible = radarCandidates.filter((r) => {
    const c = classifications.get(r.keys[0]!);
    return c !== undefined && onRadar(c);
  });
  const fresh = eligible.filter((r) => r.isNew);
  const established = eligible.filter((r) => !r.isNew);
  // 🆕 first, capped; established next; leftover 🆕 backfill a short established list.
  return [...fresh.slice(0, RADAR_POOL_NEW), ...established, ...fresh.slice(RADAR_POOL_NEW)].slice(
    0,
    RADAR_POOL,
  );
}

/**
 * Up to CATEGORY_MAX rows, alternating the top by absolute gain (`rows` comes
 * sorted by it) with the top by relative gain: the biggest movers and the
 * fastest-growing smaller repos, with no combined score (see
 * `buildRadarCandidates`). A row without a relative gain, or with fewer than
 * RELATIVE_MIN_GAIN new stars, enters through the absolute list only.
 */
function interleaveGains(rows: GithubRow[]): GithubRow[] {
  const byRelative = rows
    // `relative` is only set alongside a gain (`rankGithubRepos`).
    .filter((r) => r.relative !== null && r.gain! >= RELATIVE_MIN_GAIN)
    .sort((a, b) => b.relative! - a.relative!);
  const picked = new Map<string, GithubRow>();
  for (let i = 0; i < rows.length && picked.size < CATEGORY_MAX; i++) {
    for (const r of [rows[i], byRelative[i]]) {
      if (r && !picked.has(r.key) && picked.size < CATEGORY_MAX) picked.set(r.key, r);
    }
  }
  return [...picked.values()];
}

/** New repos the Radar can list (`buildRadarCandidates`); `radarPool` then applies `onRadar`. */
export function isRadarRepo(r: GithubRow): boolean {
  return r.isNew && r.totalStars >= NEW_REPO_MIN_STARS;
}

/**
 * Whether `selectTrendingReport` can show the row: a Radar repo that passes
 * `onRadar`, or an established repo in scope (the category tables).
 * `fetchMissingGains` asks the history API only about these.
 */
export function reachesReport(r: GithubRow, c: Classification | undefined): boolean {
  if (c === undefined) return false;
  return r.isNew ? isRadarRepo(r) && onRadar(c) : hasDescription(r) && inScope(c);
}

/**
 * The category tables need one: a repo without a description has nothing to
 * summarize, and on 2026-10-19 the model padded emo-xiaoyu/harness-mix's slot
 * with "is a TypeScript project". Jev still classifies it.
 */
const hasDescription = (r: GithubRow): boolean => r.description.trim() !== "";

/**
 * Apply scope, merge, cap and number the rows. New repos are Radar-only: the
 * category tables are the established projects, ranked by this week's stars,
 * so the two tables never share an item. `links` are the saved cross-source
 * matches (`matchLinks`), applied after the URL merge.
 */
export function selectTrendingReport(
  githubRows: GithubRow[],
  radarCandidates: RadarRow[],
  classifications: Map<string, Classification>,
  classifiedBy: TrendingReportData["classifiedBy"],
  links: [string, string][] = [],
): TrendingReportData {
  // A merged row is 🆕 when any member is, so split again after merging.
  const merged = mergeRows(urlMerge(radarPool(radarCandidates, classifications)), links);
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
    rows: interleaveGains(
      githubRows.filter(
        (r) => !r.isNew && hasDescription(r) && classifications.get(r.key)?.category === category,
      ),
    ),
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
