/**
 * Open States / Plural API v3 (`PLURAL_API_KEY`): US state AI bills from
 * passing a chamber onward (passed one chamber, passed both, enacted, vetoed);
 * introduced-only and committee-stage bills are dropped before Jev. The state
 * re-reports a bill when its stage moves.
 *
 * One all-states full-text search: `/bills` needs `jurisdiction` or `q`, and
 * `q` (Postgres `websearch_to_tsquery`, so quoted phrases and OR work) spans
 * every jurisdiction, so no per-state loop. At most MAX_PAGES requests a run:
 * the free tier's rate limit is undocumented.
 */

import type { PolicyItem } from "./items.ts";
import type { PolicySourceContext } from "./sources.ts";
import { apiKeyFor, fetchOk } from "../core/http.ts";
import { daysBefore } from "../core/date.ts";

const API_URL = "https://v3.openstates.org/bills";
/**
 * Postgres `websearch_to_tsquery("english", q)` over each bill's full text
 * (openstates/api-v3 `api/bills.py`). It matches lexemes, so the bare `AI`
 * matches the word "AI" (and "AI-generated", whose parts are indexed too) but
 * never the letters inside "said" or "aid". Full text means a bill that names
 * AI in passing matches too; the stage gate and Jev drop those.
 */
const QUERY = '"artificial intelligence" OR "automated decision" OR "algorithmic discrimination" OR AI';
/** The API's maximum (`max_per_page` in api-v3). */
const PER_PAGE = 20;
/** Requests per run, at most: 100 bills by latest action. */
const MAX_PAGES = 5;
/**
 * Bills with an action in this window. Longer than a day because states post
 * actions late and a run can be missed; the policy state drops repeats.
 */
const LOOKBACK_DAYS = 14;

interface OsAction {
  date: string;
  order: number;
  classification: string[];
  organization: { name: string; classification: string };
}

interface OsBill {
  id: string;
  identifier: string;
  title: string;
  session: string;
  openstates_url: string;
  jurisdiction: { name: string; classification: string };
  latest_action_description?: string;
  actions?: OsAction[];
}

const CHAMBERS = new Set(["upper", "lower", "legislature"]);

/**
 * The latest stage from passing a chamber onward; null before that. Action
 * classifications are openstates-core's `BILL_ACTION_CLASSIFICATIONS`.
 */
export function billStage(actions: OsAction[]): { stage: string; date: string } | null {
  const sorted = [...actions].sort((a, b) => a.date.localeCompare(b.date) || a.order - b.order);
  const passed = new Set<string>();
  let latest: { stage: string; date: string } | null = null;
  for (const a of sorted) {
    const date = a.date.slice(0, 10);
    const chamber = a.organization.classification;
    if (a.classification.includes("passage") && CHAMBERS.has(chamber)) {
      passed.add(chamber);
      const both = passed.has("upper") && passed.has("lower");
      latest = { stage: both ? "Passed both chambers" : `Passed the ${a.organization.name}`, date };
    }
    if (a.classification.some((c) => c === "executive-signature" || c === "became-law")) {
      latest = { stage: "Enacted", date };
    }
    if (a.classification.includes("executive-veto")) latest = { stage: "Vetoed", date };
  }
  return latest;
}

function toItem(bill: OsBill, since: string): PolicyItem | null {
  // A `q` search also returns federal and municipal bills.
  if (bill.jurisdiction.classification !== "state") return null;
  const latest = billStage(bill.actions ?? []);
  // An earlier stage is not news: the bill only had a later, lesser action (a referral) in the window.
  if (!latest || latest.date < since) return null;
  const state = bill.jurisdiction.name;
  return {
    id: `openstates:${bill.id}`,
    title: `${state} ${bill.identifier}: ${bill.title}`,
    link: bill.openstates_url,
    published: latest.date,
    description:
      `${state} bill ${bill.identifier} (${bill.session} session). ` +
      `Latest action: ${bill.latest_action_description ?? "none"}.`,
    source: "Open States",
    jurisdiction: "us_states",
    jevOnly: false,
    stage: latest.stage,
  };
}

/** Pages in turn up to MAX_PAGES; a failing first page throws, a later one keeps what arrived. */
export async function fetchOpenStates(ctx: PolicySourceContext): Promise<PolicyItem[]> {
  const key = apiKeyFor("PLURAL_API_KEY", "Open States");
  if (!key) return [];
  const since = daysBefore(ctx.dateStr, LOOKBACK_DAYS);
  const items: PolicyItem[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const params = new URLSearchParams({
      q: QUERY,
      action_since: since,
      include: "actions",
      sort: "latest_action_desc",
      per_page: String(PER_PAGE),
      page: String(page),
    });
    let body: { results: OsBill[]; pagination: { max_page: number } };
    try {
      // The key goes in a header, not `apikey=`, so it never lands in a logged URL.
      const res = await fetchOk(`${API_URL}?${params}`, { headers: { "X-API-Key": key } });
      body = (await res.json()) as typeof body;
    } catch (err) {
      if (page === 1) throw err;
      console.error(`  [policy] Open States page ${page} failed, keeping earlier pages: ${err}`);
      break;
    }
    items.push(...body.results.flatMap((b) => toItem(b, since) ?? []));
    if (page >= body.pagination.max_page) break;
  }
  return items;
}
