/**
 * npm packages for coding agents, ranked by download momentum.
 *
 * Nearly every coding CLI ships on npm. The registry search response already
 * carries `downloads.weekly` and `downloads.monthly`, so momentum is computed
 * from that alone. The downloads API is not used: bulk lookups reject scoped
 * packages and its `range` series contains zero-days.
 *
 * Download counts are gameable (CI installs, bots), and these keywords also
 * match plugins and MCP servers — the prompt tells the LLM to filter those.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NpmPackage {
  name: string;
  description: string;
  weekly: number;
  monthly: number;
  url: string;
  lastPublish: string;
  /** Source repository URL as published (often `git+https://…/x.git`); a trending merge key. */
  repository?: string;
  /** Project homepage; a trending merge key. */
  homepage?: string;
}

export interface NpmData {
  /** Weekly downloads well above the monthly run rate — new or surging. */
  rising: NpmPackage[];
  /** Highest weekly downloads, excluding `rising`. */
  top: NpmPackage[];
  fetchSuccess: boolean;
}

export interface NpmSearchObject {
  downloads?: { weekly?: number; monthly?: number };
  package: {
    name: string;
    description?: string;
    date?: string;
    links?: { npm?: string; repository?: string; homepage?: string };
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** `claude-code` is left out: it is dominated by plugins, not agents. */
const KEYWORDS = ["coding-agent", "agentic-coding", "cli-agent"];
/** npm search max page size; results are roughly popularity-ordered, so 250 reaches ~2k weekly. */
const SEARCH_SIZE = 250;

/** weekly × (30/7) ÷ monthly — 1 is a steady package, ~4.3 is one published this week. */
const RISING_MIN_RATIO = 2;
const RISING_MIN_WEEKLY = 10_000;
const LIST_CAP = 15;

// ---------------------------------------------------------------------------
// Ranking
// ---------------------------------------------------------------------------

export function momentumRatio(p: Pick<NpmPackage, "weekly" | "monthly">): number {
  return p.monthly > 0 ? (p.weekly * 30) / 7 / p.monthly : 0;
}

/** Dedupe search hits by name and split them into rising and top lists. */
export function rankNpmPackages(objects: NpmSearchObject[]): Omit<NpmData, "fetchSuccess"> {
  const byName = new Map<string, NpmPackage>();
  for (const o of objects) {
    const name = o.package.name;
    if (byName.has(name)) continue;
    const links = o.package.links;
    byName.set(name, {
      name,
      description: o.package.description ?? "",
      weekly: o.downloads?.weekly ?? 0,
      monthly: o.downloads?.monthly ?? 0,
      url: links?.npm ?? `https://www.npmjs.com/package/${name}`,
      lastPublish: (o.package.date ?? "").slice(0, 10),
      ...(links?.repository ? { repository: links.repository } : {}),
      ...(links?.homepage ? { homepage: links.homepage } : {}),
    });
  }

  const byWeekly = [...byName.values()].sort((a, b) => b.weekly - a.weekly);
  const rising = byWeekly
    .filter((p) => p.weekly >= RISING_MIN_WEEKLY && momentumRatio(p) >= RISING_MIN_RATIO)
    .slice(0, LIST_CAP);
  const risingNames = new Set(rising.map((p) => p.name));
  const top = byWeekly.filter((p) => !risingNames.has(p.name)).slice(0, LIST_CAP);
  return { rising, top };
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

export async function fetchNpmData(): Promise<NpmData> {
  const results = await Promise.all(
    KEYWORDS.map(async (keyword) => {
      try {
        const url = `https://registry.npmjs.org/-/v1/search?text=keywords:${keyword}&size=${SEARCH_SIZE}`;
        const resp = await fetch(url);
        if (!resp.ok) {
          console.error(`  [npm] "${keyword}": HTTP ${resp.status}`);
          return [];
        }
        const { objects } = (await resp.json()) as { objects: NpmSearchObject[] };
        return objects ?? [];
      } catch (err) {
        console.error(`  [npm] "${keyword}": ${err}`);
        return [];
      }
    }),
  );

  const { rising, top } = rankNpmPackages(results.flat());
  console.log(`  [npm] ${rising.length} rising, ${top.length} top packages`);
  return { rising, top, fetchSuccess: rising.length > 0 || top.length > 0 };
}
