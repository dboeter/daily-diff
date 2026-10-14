/**
 * Congress.gov API v3 (`USA_GOV_API_KEY`, api.data.gov): federal bills from
 * passing a chamber onward (passed one chamber, passed both, enacted, vetoed).
 *
 * The list has no keyword search and filters on `updateDate`, which also moves
 * on cosponsor, text and metadata changes. So: list the bills updated in the
 * window, keep the AI-titled or watchlisted ones whose `latestAction` is dated
 * in the window (a real new action), and only for those fetch `/actions` to
 * find the stage. The latest action alone can't tell: on passage day it is
 * often a procedural one ("Motion to reconsider laid on the table"). The policy
 * state's stage key then reports a bill again only when its stage moves.
 *
 * Requests per run: at most MAX_PAGES list pages plus MAX_ACTION_REQUESTS.
 */

import type { PolicyItem } from "./policy.ts";
import type { PolicySourceContext } from "./policy-sources.ts";
import { keywordHit, watchlisted } from "./policy-jev.ts";

const API_URL = "https://api.congress.gov/v3/bill";
const FETCH_TIMEOUT_MS = 30_000;
/** The API's maximum page size. */
const LIMIT = 250;
/** ~1,200 bills are updated a week (spike, 2026-10-13): 5 pages; 8 leaves room. */
const MAX_PAGES = 8;
/** One `/actions` request per candidate bill; ~2 AI bills a week had a new action (spike). */
const MAX_ACTION_REQUESTS = 10;
/** Bills updated and stages reached in this window; the policy state drops repeats. */
const LOOKBACK_DAYS = 7;

/** Bill types that can become law; resolutions (HRES, SRES, concurrent) never do. */
const BILL_TYPES: Record<string, { label: string; slug: string }> = {
  HR: { label: "H.R.", slug: "house-bill" },
  S: { label: "S.", slug: "senate-bill" },
  HJRES: { label: "H.J.Res.", slug: "house-joint-resolution" },
  SJRES: { label: "S.J.Res.", slug: "senate-joint-resolution" },
};

interface CgAction {
  actionDate: string;
  text: string;
  type?: string;
  actionCode?: string;
}

interface CgBill {
  congress: number;
  type: string;
  number: string;
  title: string;
  latestAction?: { actionDate: string; text: string };
}

/**
 * The latest stage from passing a chamber onward; null before that. Uses the
 * Library of Congress action codes (8000 passed House, 17000 passed Senate,
 * 36000 became law), with the action text and type as fallback.
 */
export function congressStage(actions: CgAction[]): { stage: string; date: string } | null {
  const sorted = [...actions].sort((a, b) => a.actionDate.localeCompare(b.actionDate));
  const passed = new Set<string>();
  let latest: { stage: string; date: string } | null = null;
  for (const a of sorted) {
    const date = a.actionDate;
    const chamber =
      a.actionCode === "8000" || a.text.startsWith("Passed/agreed to in House")
        ? "House"
        : a.actionCode === "17000" || a.text.startsWith("Passed/agreed to in Senate")
          ? "Senate"
          : null;
    if (chamber) {
      passed.add(chamber);
      latest = { stage: passed.size === 2 ? "Passed both chambers" : `Passed the ${chamber}`, date };
    }
    if (a.actionCode === "36000" || a.type === "BecameLaw" || a.text.startsWith("Became Public Law")) {
      latest = { stage: "Enacted", date };
    }
    if (a.type === "Veto" || /^(Pocket )?vetoed by President/i.test(a.text))
      latest = { stage: "Vetoed", date };
  }
  return latest;
}

async function getJson<T>(url: string, key: string): Promise<T> {
  // The key goes in a header, not `api_key=`, so it never lands in a logged URL.
  const res = await fetch(url, {
    headers: { "User-Agent": "daily-diff/1.0", "X-Api-Key": key },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

/** The watchlist id of a bill, e.g. `hr10768-119`. */
const billId = (b: CgBill) => `${b.type.toLowerCase()}${b.number}-${b.congress}`;

/** 119 → "119th", 121 → "121st" (congress.gov URLs). */
const ordinal = (n: number) =>
  `${n}${n % 100 >= 11 && n % 100 <= 13 ? "th" : (["th", "st", "nd", "rd"][n % 10] ?? "th")}`;

export async function fetchCongress(ctx: PolicySourceContext): Promise<PolicyItem[]> {
  const key = process.env["USA_GOV_API_KEY"];
  if (!key) {
    console.log("  [policy] Congress.gov skipped: USA_GOV_API_KEY is not set");
    return [];
  }
  const since = new Date(Date.parse(ctx.dateStr) - LOOKBACK_DAYS * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const bills: CgBill[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const params = new URLSearchParams({
      format: "json",
      fromDateTime: `${since}T00:00:00Z`,
      toDateTime: ctx.now.toISOString().replace(/\.\d+Z$/, "Z"),
      sort: "updateDate desc",
      limit: String(LIMIT),
      offset: String(page * LIMIT),
    });
    let body: { bills: CgBill[] };
    try {
      body = await getJson(`${API_URL}?${params}`, key);
    } catch (err) {
      if (page === 0) throw err;
      console.error(`  [policy] Congress.gov page ${page + 1} failed, keeping earlier pages: ${err}`);
      break;
    }
    bills.push(...body.bills);
    if (body.bills.length < LIMIT) break;
    if (page === MAX_PAGES - 1)
      console.log(`  [policy] Congress.gov: page cap reached, older updates skipped`);
  }

  const watchlist = ctx.config.watchlist.usFederal;
  const candidates = bills.filter(
    (b) =>
      b.type in BILL_TYPES &&
      (b.latestAction?.actionDate ?? "") >= since &&
      (keywordHit({ title: b.title, description: "" }) ||
        watchlisted({ title: billId(b), description: "", link: "" }, watchlist)),
  );
  if (candidates.length > MAX_ACTION_REQUESTS) {
    console.log(
      `  [policy] Congress.gov: ${candidates.length} candidate bills, checking the first ${MAX_ACTION_REQUESTS}`,
    );
  }
  const items: PolicyItem[] = [];
  for (const b of candidates.slice(0, MAX_ACTION_REQUESTS)) {
    let actions: CgAction[];
    try {
      const url = `${API_URL}/${b.congress}/${b.type.toLowerCase()}/${b.number}/actions?format=json&limit=250`;
      actions = (await getJson<{ actions: CgAction[] }>(url, key)).actions;
    } catch (err) {
      console.error(`  [policy] Congress.gov actions of ${billId(b)} failed: ${err}`);
      continue;
    }
    const stage = congressStage(actions);
    // An older stage is not news: the bill only had a lesser action (a referral) in the window.
    if (!stage || stage.date < since) continue;
    const { label, slug } = BILL_TYPES[b.type]!;
    items.push({
      id: `congress:${billId(b)}`,
      title: `${label} ${b.number}: ${b.title}`,
      link: `https://www.congress.gov/bill/${ordinal(b.congress)}-congress/${slug}/${b.number}`,
      published: stage.date,
      // Carries the bill id, which is what the watchlist match (policy-jev.ts) reads.
      description:
        `US federal bill ${billId(b)} (${ordinal(b.congress)} Congress). ` +
        `Latest action: ${b.latestAction?.text ?? "none"}`,
      source: "Congress.gov",
      jurisdiction: "us_federal",
      jevOnly: false,
      stage: stage.stage,
    });
  }
  return items;
}
