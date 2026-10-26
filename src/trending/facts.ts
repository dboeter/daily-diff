/**
 * Trends' facts block: the comparisons the Signals and Highlights may make, computed in
 * code from the rows the tables render. Left to the model, the free model called a
 * likes total "likes gained", gave a +45% row "the largest relative gain on the page"
 * beside a +98% one, and counted a provider over 19 rows after "3 of the top 10" (2026-10-27
 * check). Each fact names its table, row and window; nothing compares across tables
 * with different units.
 */

import { TRENDS_FACTS as F, TRENDS_REPORT } from "../core/strings.ts";
import { formatTokens } from "../sources/openrouter.ts";

export interface FactsGithubRow {
  fullName: string;
  url: string;
  gain: number | null;
  relative: number | null;
  /** The Stars cell as the table shows it, quoted as the figure. */
  starsCell: string;
}

export interface FactsRadarRow {
  name: string;
  url: string;
  sources: string[];
  /** The Signal cell's parts, one per source, as buildRadarCandidates writes them. */
  signals: string[];
}

export interface TrendsFactsInput {
  radar: FactsRadarRow[];
  tables: { title: string; rows: FactsGithubRow[] }[];
  openrouter: { models: { slug: string; tokens: number }[]; date: string };
  hf: { id: string; url: string; likes: number; downloads: number }[];
}

/** Provider counts are given within this many top OpenRouter models. */
export const PROVIDER_TOP_N = 10;

const fmt = (n: number) => n.toLocaleString("en-US");
/** A table heading as the facts name it: without its leading emoji. */
const tableName = (heading: string) => heading.replace(/^\p{Extended_Pictographic}\uFE0F?\s*/u, "");
const link = (name: string, url: string) => (url ? `[${name}](${url})` : name);
const maxBy = <T>(rows: T[], value: (r: T) => number | null): T | undefined => {
  let best: T | undefined;
  let bestValue = -Infinity;
  for (const r of rows) {
    const v = value(r);
    if (v !== null && v > bestValue) [best, bestValue] = [r, v];
  }
  return best;
};

const TOKEN_UNIT: Record<string, number> = { T: 1e12, B: 1e9, M: 1e6 };

/**
 * A Radar Signal part's figures, parsed from the cell buildRadarCandidates writes
 * ("week #2 / month #2, 12.67T tokens/week (+12% vs previous week)", "20,549 downloads/week",
 * "2,718 (+1,233, +83%)"): the row carries no number, and the cell is what the reader sees.
 */
function radarFigures(signal: string) {
  const tokens = /([\d.]+)([TBM]) tokens\/week/.exec(signal);
  const downloads = /([\d,]+) downloads\/week/.exec(signal);
  const change = /\(([+-]?[\d.]+)% vs previous week\)/.exec(signal);
  const stars = /\(([+-][\d,]+)(?:, ([+-]?[\d.]+)%)?\)/.exec(signal);
  return {
    tokens: tokens ? Number(tokens[1]) * TOKEN_UNIT[tokens[2]!]! : null,
    tokensText: tokens ? `${tokens[1]}${tokens[2]} tokens/week` : "",
    downloads: downloads ? Number(downloads[1]!.replace(/,/g, "")) : null,
    downloadsText: downloads ? `${downloads[1]} downloads/week` : "",
    change: change ? Number(change[1]) : null,
    changeText: change ? `${change[1]}% vs previous week` : "",
    stars: !change && stars ? Number(stars[1]!.replace(/,/g, "")) : null,
    starsText: !change && stars ? signal.replace(/^🆕 /, "") : "",
  };
}

function radarFacts(radar: FactsRadarRow[]): string[] {
  if (!radar.length) return [];
  const T = tableName(TRENDS_REPORT.radarHeading);
  // One entry per source part, with its position in the table; sources are not compared.
  const parts = radar.flatMap((r, i) =>
    r.signals.map((s, j) => ({
      row: r,
      pos: i + 1,
      source: r.sources[j] ?? r.sources[0] ?? "",
      f: radarFigures(s),
    })),
  );
  const out: string[] = [];
  const at = (p: (typeof parts)[number]) => `${link(p.row.name, p.row.url)} (row ${p.pos})`;
  const ofSource = (s: string) => parts.filter((p) => p.source === s);
  const topTokens = maxBy(ofSource("OpenRouter"), (p) => p.f.tokens);
  if (topTokens) out.push(F.radarTop(T, "OpenRouter", "tokens", at(topTokens), topTokens.f.tokensText));
  const topDownloads = maxBy(ofSource("npm"), (p) => p.f.downloads);
  if (topDownloads)
    out.push(F.radarTop(T, "npm", "downloads", at(topDownloads), topDownloads.f.downloadsText));
  const topStars = maxBy(ofSource("GitHub"), (p) => p.f.stars);
  if (topStars) out.push(F.radarTop(T, "GitHub", "stars gained", at(topStars), topStars.f.starsText));
  const topChange = maxBy(parts, (p) => p.f.change);
  // A fall is no rise: with every change negative, the "largest" one is the smallest fall.
  out.push(
    !topChange
      ? F.radarNoChange(T)
      : topChange.f.change! > 0
        ? F.radarRise(T, at(topChange), topChange.source, topChange.f.changeText)
        : F.radarNoRise(T),
  );
  out.push(F.radarUnits(T));
  return out;
}

function gainFacts(tables: TrendsFactsInput["tables"]): string[] {
  const out: string[] = [];
  const pair = (where: string, rows: (FactsGithubRow & { at: string })[]) => {
    const abs = maxBy(rows, (r) => r.gain);
    const rel = maxBy(rows, (r) => r.relative);
    if (!abs) return;
    const quote = (r: FactsGithubRow & { at: string }) =>
      `${link(r.fullName, r.url)} (${r.at}), ${r.starsCell}`;
    out.push(
      abs === rel
        ? F.gainBoth(where, F.gainWindow, quote(abs))
        : F.gainSplit(where, F.gainWindow, quote(abs), rel ? quote(rel) : null),
    );
  };
  const located = tables
    .filter((t) => t.rows.length)
    .map((t) => ({
      title: t.title,
      rows: t.rows.map((r, i) => ({ ...r, at: `${t.title}, row ${i + 1}` })),
    }));
  for (const t of located) pair(t.title, t.rows);
  const all = located.flatMap((t) => t.rows);
  if (located.length > 1) pair(F.gainAcross(located.length, all.length), all);
  return out;
}

function openRouterFacts({ models, date }: TrendsFactsInput["openrouter"]): string[] {
  if (!models.length) return [];
  const T = F.openRouterTitle(tableName(TRENDS_REPORT.openRouterHeading), date);
  const out = [F.openRouterRows(T, models.length)];
  const [first, second] = models;
  const at = (slug: string) => link(slug, `https://openrouter.ai/${slug}`);
  out.push(
    F.openRouterFirst(T, at(first!.slug), formatTokens(first!.tokens)) +
      (second
        ? F.openRouterSecond(at(second.slug), formatTokens(second.tokens)) +
          (second.tokens > 0 ? F.openRouterRatio((first!.tokens / second.tokens).toFixed(1)) : "") +
          "."
        : "."),
  );
  const top = models.slice(0, PROVIDER_TOP_N);
  const counts = new Map<string, number>();
  for (const m of top) {
    // "~anthropic/claude-x" is an alias slug of the same provider.
    const slug = m.slug.replace(/^~/, "");
    const provider = slug.includes("/") ? slug.split("/")[0]! : F.openRouterNoProvider;
    counts.set(provider, (counts.get(provider) ?? 0) + 1);
  }
  const listed = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  out.push(F.openRouterProviders(T, top.length, listed.map(([p, n]) => `${p} ${n}`).join(", ")));
  return out;
}

function hfFacts(hf: TrendsFactsInput["hf"]): string[] {
  if (!hf.length) return [];
  const T = tableName(TRENDS_REPORT.hfHeading);
  const likes = maxBy(hf, (r) => r.likes)!;
  const downloads = maxBy(hf, (r) => r.downloads)!;
  const pos = (r: (typeof hf)[number]) => `#${hf.indexOf(r) + 1}`;
  return [
    F.hfOrder(T),
    F.hfLeaders(
      T,
      link(hf[0]!.id, hf[0]!.url),
      `${link(likes.id, likes.url)} (${pos(likes)}), ${fmt(likes.likes)}`,
      `${link(downloads.id, downloads.url)} (${pos(downloads)}), ${fmt(downloads.downloads)}`,
    ),
  ];
}

/** The facts block for the Trends prose prompt, one `- ` line per fact; "" when no table has rows. */
export function trendsFacts(input: TrendsFactsInput): string {
  return [
    ...radarFacts(input.radar),
    ...gainFacts(input.tables),
    ...openRouterFacts(input.openrouter),
    ...hfFacts(input.hf),
  ]
    .map((f) => `- ${f}`)
    .join("\n");
}
