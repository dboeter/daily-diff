/**
 * Trends' facts block: the comparisons the Signals and Highlights may make, computed in
 * code from the rows the tables render. Left to the model, the free model called a
 * likes total "likes gained", gave a +45% row "the largest relative gain on the page"
 * beside a +98% one, and counted a provider over 19 rows after "3 of the top 10" (2026-10-27
 * check). Each fact names its table, row and window; nothing compares across tables
 * with different units.
 */

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
  const T = "Agent & Coding Tool Radar";
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
  if (topTokens)
    out.push(
      `${T}, OpenRouter rows: most tokens in the last 7 days: ${at(topTokens)}, ${topTokens.f.tokensText}.`,
    );
  const topDownloads = maxBy(ofSource("npm"), (p) => p.f.downloads);
  if (topDownloads)
    out.push(
      `${T}, npm rows: most downloads in the last 7 days: ${at(topDownloads)}, ${topDownloads.f.downloadsText}.`,
    );
  const topStars = maxBy(ofSource("GitHub"), (p) => p.f.stars);
  if (topStars)
    out.push(
      `${T}, GitHub rows: most stars gained in the last 7 days: ${at(topStars)}, ${topStars.f.starsText}.`,
    );
  const topChange = maxBy(parts, (p) => p.f.change);
  out.push(
    topChange
      ? `${T}: largest change against last week's page: ${at(topChange)} (${topChange.source}), ${topChange.f.changeText}.`
      : `${T}: no row has a "vs previous week" figure, so no Radar row grew or fell against last week on this page.`,
  );
  out.push(
    `${T}: tokens, downloads and stars are different units; no Radar row is larger than a row of another source.`,
  );
  return out;
}

function gainFacts(tables: TrendsFactsInput["tables"]): string[] {
  const out: string[] = [];
  const window = "stars gained in the last 7 days";
  const pair = (where: string, rows: (FactsGithubRow & { at: string })[]) => {
    const abs = maxBy(rows, (r) => r.gain);
    const rel = maxBy(rows, (r) => r.relative);
    if (!abs) return;
    const quote = (r: FactsGithubRow & { at: string }) =>
      `${link(r.fullName, r.url)} (${r.at}), ${r.starsCell}`;
    out.push(
      abs === rel
        ? `${where} (${window}): largest absolute and largest relative gain: ${quote(abs)}.`
        : `${where} (${window}): largest absolute gain: ${quote(abs)}; largest relative gain: ${rel ? quote(rel) : "none (no row shows a %)"}.`,
    );
  };
  const located = tables.map((t) => ({
    title: t.title,
    rows: t.rows.map((r, i) => ({ ...r, at: `${t.title}, row ${i + 1}` })),
  }));
  for (const t of located) if (t.rows.length) pair(t.title, t.rows);
  const all = located.flatMap((t) => t.rows);
  if (located.filter((t) => t.rows.length).length > 1) {
    pair(`Across the ${located.length} GitHub category tables (${all.length} rows)`, all);
  }
  return out;
}

function openRouterFacts({ models, date }: TrendsFactsInput["openrouter"]): string[] {
  if (!models.length) return [];
  const T = `OpenRouter usage (one day's snapshot, on ${date})`;
  const out = [`${T}: the table has ${models.length} rows.`];
  const [first, second] = models;
  out.push(
    `${T}: #1 is ${link(first!.slug, `https://openrouter.ai/${first!.slug}`)} with ${formatTokens(first!.tokens)} tokens` +
      (second
        ? `; #2 is ${link(second.slug, `https://openrouter.ai/${second.slug}`)} with ${formatTokens(second.tokens)} (#1 has ${(first!.tokens / second.tokens).toFixed(1)}× #2's tokens).`
        : "."),
  );
  const top = models.slice(0, PROVIDER_TOP_N);
  const counts = new Map<string, number>();
  for (const m of top) {
    const provider = m.slug.split("/")[0]!;
    counts.set(provider, (counts.get(provider) ?? 0) + 1);
  }
  const listed = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  out.push(
    `${T}: models per provider within the top ${top.length} (by the slug's provider prefix): ` +
      `${listed.map(([p, n]) => `${p} ${n}`).join(", ")}. Counts are for the top ${top.length} only, not the whole table.`,
  );
  return out;
}

function hfFacts(hf: TrendsFactsInput["hf"]): string[] {
  if (!hf.length) return [];
  const T = "Hugging Face trending";
  const likes = maxBy(hf, (r) => r.likes)!;
  const downloads = maxBy(hf, (r) => r.downloads)!;
  const pos = (r: (typeof hf)[number]) => `#${hf.indexOf(r) + 1}`;
  return [
    `${T}: rows are in the Hub's order by likes gained in the last 7 days, a figure the page does not show. ` +
      `Likes is each model's total and Downloads its last 30 days: neither is a gain, so no row "gained" likes or downloads.`,
    `${T}: #1 in the Hub's order is ${link(hf[0]!.id, hf[0]!.url)}; most total likes: ${link(likes.id, likes.url)} (${pos(likes)}), ${fmt(likes.likes)}; ` +
      `most downloads in 30 days: ${link(downloads.id, downloads.url)} (${pos(downloads)}), ${fmt(downloads.downloads)}.`,
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
