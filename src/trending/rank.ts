/**
 * Selection, ranking and numbering for the weekly Trends page's agents tables —
 * pure, except for loading and saving the star history (`digests/trending-state.json`).
 *
 * Code decides which items appear, in which order, with which 🆕 and 🔥 flags
 * and which numbers; the LLM only writes the per-row summaries
 * (`buildTrendingSummariesPrompt`) and the page's prose (`buildTrendsProsePrompt`). Two tables:
 * the Agent & Coding Tool Radar (OpenRouter, npm and new GitHub repos) and the
 * GitHub category tables. Scope and category come from a `Classification` per
 * item (`trending/classify.ts`).
 */

import fs from "node:fs";
import path from "node:path";
import type { Numbered } from "../reports/summarized-table.ts";
import { escapeRegex } from "../reports/project-news.ts";
import type { SearchRepo, TrendingRepo } from "./compose.ts";
import { formatTokens, type OpenRouterApp } from "../sources/openrouter.ts";
import type { NpmData, NpmPackage } from "./npm.ts";
import { toCstDateStr } from "../core/date.ts";
import { STAR_GAIN_DAYS } from "../core/github.ts";
import { inScope, onRadar, type Classification, type TrendingVerdicts } from "./classify.ts";
import { type MatchState } from "./match.ts";
import type { DroppedReason } from "../core/jev.ts";

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
  /** Also in the report dated exactly 7 days earlier (`selectTrendingReport`): 🔥. */
  onFire?: boolean;
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
  /** Some member was also in the report dated exactly 7 days earlier (`selectTrendingReport`): 🔥. */
  onFire?: boolean;
  /** Normalized merge links (`repo:<owner/repo>`, `host:<hostname>`), see `urlMerge`. */
  links: string[];
}

export interface TrendingReportData {
  radar: Numbered<RadarRow>[];
  /** Fixed CATEGORIES order, empty ones omitted. */
  categories: { category: Category; rows: Numbered<GithubRow>[] }[];
  /**
   * The 🔥 GitHub repos with their category: category-table rows and Radar
   * GitHub members that were in last week's report. Trends' Candidates to track.
   */
  onFire: { fullName: string; category: Category }[];
  classifiedBy: "jev" | "topics";
  /** `buildTrendingTraceFile` output when Jev classified or matched, saved next to the report. */
  traceFile?: string;
  /** Match state to save once the report is written; absent when the file could not be read. */
  nextMatches?: MatchState;
  /** Trending verdicts to save once the report is written; absent when the file could not be read. */
  nextTrendingVerdicts?: TrendingVerdicts;
  /** Star history to save once the report is written. */
  nextStarHistory?: StarHistory;
}

/** `digests/trending-state.json`: [CST date, total stars] points per repo, oldest first. */
export interface StarHistory {
  /** Key: `fullName` lowercased — GitHub names are case-insensitive, and the trending page and search may differ in case. */
  repos: Record<string, [string, number][]>;
  /** CST date of a weekly report → the lowercased item keys it showed (`reportedKeys`, plus `hf:<id>`), for 🔥. */
  reported?: Record<string, string[]>;
  /**
   * CST date → the figure each shown Radar member's Signal leads with (OpenRouter tokens in the
   * last 7 days, npm downloads in the last 7 days), by lowercased key: next week's "vs previous week".
   */
  figures?: Record<string, Record<string, number>>;
  /** CST date → OpenRouter usage's model slugs in rank order, for next week's Last week column. */
  modelRanking?: Record<string, string[]>;
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
 * Total stars an established GitHub repo needs for the category tables; the
 * `pushed:` search asks for no fewer. Raised from 100 on 2026-10-20: the report
 * should follow established projects, and on 2026-10-19 most rows were
 * few-hundred-star repos with one good week. 0 (a trending scrape miss) is
 * unknown and does not pass.
 */
export const MIN_STARS = 1000;
/**
 * The same bar for a new repo (created in 14 days) on the Radar, lower since it
 * has had two weeks at most; the `created:` search asks for no fewer. Raised
 * from 25 on 2026-10-20 (on the 2026-10-06 live check an 8-star repo created
 * that day ranked above week-old repos).
 */
export const NEW_REPO_MIN_STARS = 500;
/**
 * A relative gain needs at least this many stars a week ago: below it, 8 → 16
 * stars reads as +100%.
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
    const { reported, figures, modelRanking } = parsed;
    const isRecord = (v: unknown): v is Record<string, unknown> =>
      typeof v === "object" && v !== null && !Array.isArray(v);
    const isStrings = (v: unknown) => Array.isArray(v) && v.every((k) => typeof k === "string");
    // A missing or malformed field costs one week of its comparison (🔥, figures, ranks), nothing else.
    const validReported = isRecord(reported) && Object.values(reported).every(isStrings);
    const validFigures =
      isRecord(figures) &&
      Object.values(figures).every(
        (f) => isRecord(f) && Object.values(f).every((v) => typeof v === "number"),
      );
    const validRanking = isRecord(modelRanking) && Object.values(modelRanking).every(isStrings);
    return {
      repos: parsed.repos,
      ...(validReported ? { reported } : {}),
      ...(validFigures ? { figures } : {}),
      ...(validRanking ? { modelRanking } : {}),
    };
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
  // One date per line, like the repos.
  const byDate = (name: string, field: Record<string, unknown> | undefined) => {
    const lines = Object.entries(field ?? {}).map(
      ([date, value]) => `    ${JSON.stringify(date)}: ${JSON.stringify(value)}`,
    );
    return lines.length > 0 ? `,\n  ${JSON.stringify(name)}: {\n${lines.join(",\n")}\n  }` : "";
  };
  const rest =
    byDate("reported", history.reported) +
    byDate("figures", history.figures) +
    byDate("modelRanking", history.modelRanking);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `{\n  "repos": ${body}${rest}\n}\n`, "utf-8");
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

/**
 * The item keys of the report dated exactly STAR_GAIN_DAYS before `dateStr`,
 * the same rule as `starBaseline`: a forced mid-week run is not "last week",
 * and a missed Monday breaks the run of weeks, so its rows get no 🔥.
 */
export function lastWeekKeys(history: StarHistory, dateStr: string): Set<string> {
  return new Set(weekAgo(history.reported, dateStr) ?? []);
}

/** The entry dated exactly STAR_GAIN_DAYS before `dateStr`, the rule `lastWeekKeys` explains. */
export function weekAgo<T>(byDate: Record<string, T> | undefined, dateStr: string): T | undefined {
  return Object.entries(byDate ?? {}).find(([date]) => daysBetween(date, dateStr) === STAR_GAIN_DAYS)?.[1];
}

/** The previous weekly run's Radar figures by lowercased key (`StarHistory.figures`). */
export function lastWeekFigures(history: StarHistory, dateStr: string): Map<string, number> {
  return new Map(Object.entries(weekAgo(history.figures, dateStr) ?? {}));
}

/** Every item key the report shows, merged Radar members included, lowercased like the star history. */
export function reportedKeys(report: Pick<TrendingReportData, "radar" | "categories">): string[] {
  return [
    ...report.radar.flatMap((r) => r.keys),
    ...report.categories.flatMap((c) => c.rows.map((r) => r.key)),
  ].map((k) => k.toLowerCase());
}

/**
 * History after this run: today's points recorded or replaced, unseen repos
 * carried forward, old points pruned; today's report keys recorded or
 * replaced, reports older than a week pruned.
 */
export function nextStarHistory(
  history: StarHistory,
  githubRows: GithubRow[],
  dateStr: string,
  reported?: string[],
  /** Today's shown Radar figures (`StarHistory.figures`) and OpenRouter usage slugs. */
  today: { figures?: Record<string, number>; modelRanking?: string[] } = {},
): StarHistory {
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
  const byDate = <T>(old: Record<string, T> | undefined, todays: T | undefined) => {
    const kept = Object.entries({ ...old, ...(todays !== undefined ? { [dateStr]: todays } : {}) })
      .filter(([date]) => daysBetween(date, dateStr) <= STAR_HISTORY_DAYS)
      .sort(([a], [b]) => a.localeCompare(b));
    return kept.length > 0 ? Object.fromEntries(kept) : undefined;
  };
  const keptReported = byDate(history.reported, reported);
  const keptFigures = byDate(history.figures, today.figures);
  const keptRanking = byDate(history.modelRanking, today.modelRanking);
  if (keptReported) next.reported = keptReported;
  if (keptFigures) next.figures = keptFigures;
  if (keptRanking) next.modelRanking = keptRanking;
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

/**
 * " (+28% vs previous week)": the change against the figure the previous
 * weekly run saved for the same key (`lastWeekFigures`); "" without one. It
 * replaces OpenRouter's own growth figure and the npm 30-day ratio, whose
 * baselines did not reconcile with the previous page (2026-10-26).
 */
function vsPreviousWeek(key: string, now: number, previous: Map<string, number>): string {
  const before = previous.get(key.toLowerCase());
  if (before === undefined || before <= 0 || now <= 0) return "";
  return ` (${fmtPercent(now / before - 1)} vs previous week)`;
}

/**
 * The figure each Radar member's Signal leads with, by lowercased key:
 * OpenRouter tokens and npm downloads in the last 7 days. GitHub members are
 * left out: their star gain already counts against a week ago.
 */
export function radarFigures(openrouter: OpenRouterApp[], npm: NpmData): Map<string, number> {
  return new Map([
    ...openrouter
      .filter((a) => a.weekTokens > 0)
      .map((a): [string, number] => [openrouterKey(a).toLowerCase(), a.weekTokens]),
    ...[...npm.rising, ...npm.top].map((p): [string, number] => [npmKey(p).toLowerCase(), p.weekly]),
  ]);
}

/** Every Radar candidate, 🆕 first, before scope filtering and merging. */
export function buildRadarCandidates(
  openrouter: OpenRouterApp[],
  npm: NpmData,
  githubRows: GithubRow[],
  dateStr: string,
  /** `lastWeekFigures`: each row's figure is shown against it. */
  previous: Map<string, number> = new Map(),
): RadarRow[] {
  const row = (r: Omit<RadarRow, "signals"> & { signal: string }): RadarRow => {
    const { signal, ...rest } = r;
    return { ...rest, signals: [(r.isNew ? "🆕 " : "") + signal] };
  };

  // A new app with no description and no usage gives its row nothing to say
  // (4 of 11 Radar rows on 2026-10-26: "🆕 week — / month —", summary "—").
  const isNewApp = (a: OpenRouterApp) => {
    const listed = ageDays(a.createdAt, dateStr);
    return listed !== null && listed <= NEW_LISTING_DAYS;
  };
  const sayable = (a: OpenRouterApp) =>
    !isNewApp(a) ||
    a.description.trim() !== "" ||
    a.weekTokens > 0 ||
    a.weekRank !== null ||
    a.monthRank !== null;
  // An app without a description borrows its GitHub repo's when the trending page or topic search
  // has it: DeepSeek Harness linked deepseek-ai/deepseek-harness and showed "—" on 2026-10-26.
  const repoDescription = new Map(
    githubRows.filter((r) => r.description).map((r) => [`repo:${r.fullName.toLowerCase()}`, r.description]),
  );
  const openrouterRows = openrouter.filter(sayable).map((a) => {
    const key = openrouterKey(a);
    const repo = repoLink(a.url);
    return row({
      keys: [key],
      name: a.title,
      url: a.url,
      description: a.description.trim() || (repo !== null ? (repoDescription.get(repo) ?? "") : ""),
      sources: ["OpenRouter"],
      signal:
        `week ${rankStr(a.weekRank)} / month ${rankStr(a.monthRank)}` +
        (a.weekTokens > 0
          ? `, ${formatTokens(a.weekTokens)} tokens/week${vsPreviousWeek(key, a.weekTokens, previous)}`
          : ""),
      // By listing date only: ranked this week but not this month is Rising, not New.
      isNew: isNewApp(a),
      links: linksOf(repo, hostLink(a.url)),
    });
  });

  const npmRows = [...npm.rising, ...npm.top].map((p) =>
    row({
      keys: [npmKey(p)],
      name: p.name,
      url: p.url,
      description: p.description,
      sources: ["npm"],
      signal: `${fmt(p.weekly)} downloads/week${vsPreviousWeek(npmKey(p), p.weekly, previous)}`,
      // The registry search carries no first-publish date (`date` is the last
      // publish), and download momentum is Rising, not New: npm rows are never 🆕.
      isNew: false,
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
  /** Gets each left-out candidate's keys and why (for the trace); a key keeps its first reason. */
  dropped?: Map<string, DroppedReason>,
): RadarRow[] {
  // An unclassified candidate is dropped: nothing vouches for its scope.
  const eligible = radarCandidates.filter((r) => {
    const c = classifications.get(r.keys[0]!);
    const ok = c !== undefined && onRadar(c);
    if (!ok) dropAll(dropped, r.keys, "routing");
    return ok;
  });
  const fresh = eligible.filter((r) => r.isNew);
  const established = eligible.filter((r) => !r.isNew);
  // 🆕 first, capped; established next; leftover 🆕 backfill a short established list.
  const ordered = [...fresh.slice(0, RADAR_POOL_NEW), ...established, ...fresh.slice(RADAR_POOL_NEW)];
  for (const r of ordered.slice(RADAR_POOL)) dropAll(dropped, r.keys, "cap");
  return ordered.slice(0, RADAR_POOL);
}

/** Set `reason` on each key not yet in `dropped`. */
function dropAll(
  dropped: Map<string, DroppedReason> | undefined,
  keys: string[],
  reason: DroppedReason,
): void {
  for (const k of keys) if (!dropped?.has(k)) dropped?.set(k, reason);
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
  return r.isNew ? isRadarRepo(r) && onRadar(c) : isCategoryRepo(r) && inScope(c);
}

/**
 * The category tables need one: a repo without a description has nothing to
 * summarize, and on 2026-10-19 the model padded emo-xiaoyu/harness-mix's slot
 * with "is a TypeScript project". Jev still classifies it.
 */
const hasDescription = (r: GithubRow): boolean => r.description.trim() !== "";

/** An established repo the category tables can list, before scope. */
const isCategoryRepo = (r: GithubRow): boolean => !r.isNew && r.totalStars >= MIN_STARS && hasDescription(r);

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
  /** `lastWeekKeys`: a row with a key in it is 🔥. */
  lastWeek: Set<string> = new Set(),
  /** Gets every left-out candidate's key and why (for the trace); a key keeps its first reason. */
  dropped?: Map<string, DroppedReason>,
): TrendingReportData {
  const onFire = (keys: string[]) => keys.some((k) => lastWeek.has(k.toLowerCase()));
  // A merged row is 🆕 when any member is, so split again after merging.
  const merged = mergeRows(urlMerge(radarPool(radarCandidates, classifications, dropped)), links);
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
  ].map((r) => ({ ...r, onFire: onFire(r.keys), n: ++n }));
  for (const r of [...mergedFresh.slice(freshCount), ...mergedEstablished.slice(RADAR_MAX - freshCount)]) {
    dropAll(dropped, r.keys, "cap");
  }

  for (const r of githubRows) {
    if (r.isNew) continue;
    const category = classifications.get(r.key)?.category;
    if (!isCategoryRepo(r)) dropAll(dropped, [r.key], "threshold");
    else if (!(CATEGORIES as readonly unknown[]).includes(category)) {
      dropAll(dropped, [r.key], "routing");
    }
  }
  const categories = CATEGORIES.map((category) => {
    const eligible = githubRows.filter(
      (r) => isCategoryRepo(r) && classifications.get(r.key)?.category === category,
    );
    // Picked by absolute and relative gain, shown by the gain the row displays.
    const rows = interleaveGains(eligible).sort((a, b) => (b.gain ?? -1) - (a.gain ?? -1));
    for (const r of eligible) if (!rows.includes(r)) dropAll(dropped, [r.key], "cap");
    return { category, rows };
  })
    .filter((g) => g.rows.length > 0)
    .map((g) => ({
      category: g.category,
      rows: g.rows.map((r) => ({ ...r, onFire: onFire([r.key]), n: ++n })),
    }));

  const radarFire = radar.flatMap((r) =>
    r.keys.flatMap((key) => {
      const category = classifications.get(key)?.category;
      return key.startsWith("github:") &&
        lastWeek.has(key.toLowerCase()) &&
        category &&
        category !== "out_of_scope"
        ? [{ fullName: key.slice("github:".length), category }]
        : [];
    }),
  );
  const tableFire = categories.flatMap((g) =>
    g.rows.filter((r) => r.onFire).map((r) => ({ fullName: r.fullName, category: g.category })),
  );
  return { radar, categories, onFire: [...tableFire, ...radarFire], classifiedBy };
}

/**
 * One entry per row, by number: the input of the summaries prompt. No stars,
 * gains, downloads or ranks: the row shows them, and on 2026-10-19 half of
 * every summary repeated them ("It has 625 stars, up 328") and the model read
 * OpenRouter's "week #16 / month #19" as a date.
 */
export function summaryRows(
  report: TrendingReportData,
): { n: number; name: string; description: string; facts: string }[] {
  return [
    ...report.radar.map((r) => ({
      n: r.n,
      name: r.name,
      description: r.description,
      facts: [`Source: ${r.sources.join("; ")}`, r.isNew && "New: created or listed in the last 14 days"]
        .filter(Boolean)
        .join(" | "),
    })),
    ...report.categories.flatMap((g) =>
      g.rows.map((r) => ({
        n: r.n,
        name: r.fullName,
        description: r.description,
        facts: r.language ? `Language: ${r.language}` : "",
      })),
    ),
  ];
}

/**
 * The share of a later sentence's content words already in the first at which
 * it is dropped as a restatement. On 2026-10-28 the restating second sentences
 * scored 0.67 (pi: "among", "many" new), 1 (Proto Agent) and 1
 * (anomalyco/opencode); 0.6 still keeps a sentence whose words are over 40% new.
 */
export const RESTATED_SENTENCE_SHARE = 0.6;

const STOPWORDS = new Set(
  "a an and are as at be by for from has have in is it its of on or that the their this to was with you your yours".split(
    " ",
  ),
);

/** Lowercased words minus stopwords, a plural "s" cut so "agents" matches "agent". */
function contentWords(sentence: string): string[] {
  return (sentence.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}+#'-]*/gu) ?? [])
    .filter((w) => !STOPWORDS.has(w))
    .map((w) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w));
}

/**
 * Trends' row summaries with what the model repeats cut (2026-10-28: 42 of 53
 * had a second "It …" sentence restating the first, 30 ended "in TypeScript."
 * next to the Lang column; the prompt forbids the first and the free model
 * ignores it): a later sentence mostly made of the first's words, then a trailing
 * "(written) in <language>" matching a category row's Lang column. Pass the report
 * for the Radar and category summaries, none for Hugging Face's.
 */
export function tidyTrendsSummaries(
  summaries: Map<number, string>,
  report?: TrendingReportData,
): Map<number, string> {
  const languages = new Map(
    (report?.categories ?? []).flatMap((g) => g.rows.flatMap((r) => (r.language ? [[r.n, r.language]] : []))),
  );
  return new Map(
    [...summaries].map(([n, line]) => {
      const [first = "", ...rest] = line.split(/(?<=[.!?])\s+(?=\p{Lu})/u);
      const firstWords = new Set(contentWords(first));
      const kept = rest.filter((s) => {
        const words = contentWords(s);
        return words.filter((w) => firstWords.has(w)).length < RESTATED_SENTENCE_SHARE * words.length;
      });
      let text = [first, ...kept].join(" ");
      const language = languages.get(n);
      if (language) {
        // Not after "is" or "written": "Foo is written in Rust." would become "Foo is.".
        const suffix = `(?<!\\b(?:is|are|was|written)),?\\s+(?:written\\s+)?in\\s+${escapeRegex(language)}(?=[.!]?$)`;
        text = text.replace(new RegExp(suffix, "i"), "");
      }
      return [n, text];
    }),
  );
}
