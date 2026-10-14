/**
 * European Parliament Open Data API v2 (no key): the latest stage of each
 * procedure in the EU watchlist (config.yml `policy.watchlist.eu`, entries
 * like `2025/0359(COD)`). The state reports a procedure again when its stage
 * moves. Watchlist only: `/procedures/feed` answered HTTP 500 on 2026-10-13
 * and 2026-10-14, so there is no discovery of new procedures.
 */

import type { PolicyItem } from "./policy.ts";
import type { PolicySourceContext } from "./policy-sources.ts";
import { fetchOk } from "./http.ts";

const API_URL = "https://data.europarl.europa.eu/api/v2/procedures";

const PROCEDURE_RE = /^(\d{4})\/(\d{4})\([A-Z]+\)$/;

/**
 * The event types (`had_activity_type`) that are a stage, in procedure order:
 * on one day the later one wins. Everything else (amendment and report
 * tablings, votes, committee opinions) is ignored, so it never re-reports a
 * procedure. Renaming a label re-reports every procedure at that stage once.
 */
const STAGES: [string, string][] = [
  ["REFERRAL", "Referred to committee"],
  ["COMMITTEE_ADOPTING_REPORT", "Committee report adopted"],
  ["PLENARY_DEBATE", "Plenary debate"],
  ["PLENARY_AMEND", "Plenary vote on amendments"],
  ["PLENARY_AMEND_PROPOSAL", "Plenary vote on amendments"],
  ["PLENARY_REFER_COMMITTEE_INTERINSTITUTIONAL_NEGOTIATIONS", "Trilogue mandate"],
  ["PLENARY_ENDORSE_COMMITTEE_INTERINSTITUTIONAL_NEGOTIATIONS", "Trilogue mandate"],
  ["INTERINSTITUTIONAL_NEGOTIATION", "Trilogue"],
  ["COMMITTEE_APPROVE_PROVISIONAL_AGREEMENT", "Provisional agreement approved in committee"],
  ["PLENARY_ADOPT_POSITION", "Parliament position adopted"],
  ["SIGNATURE", "Signed"],
  ["PUBLICATION_OFFICIAL_JOURNAL", "Published in the Official Journal"],
];
const STAGE_ORDER = new Map(STAGES.map(([type], i) => [type, i]));
const STAGE_LABEL = new Map(STAGES);

interface EpEvent {
  activity_date?: string;
  had_activity_type?: string;
}

/** The latest stage event; null when the procedure has none yet. */
export function latestStage(events: EpEvent[]): { stage: string; date: string } | null {
  let best: { type: string; date: string } | null = null;
  for (const e of events) {
    const type = e.had_activity_type?.split("/").pop() ?? "";
    if (!STAGE_ORDER.has(type) || !e.activity_date) continue;
    if (
      !best ||
      e.activity_date > best.date ||
      (e.activity_date === best.date && STAGE_ORDER.get(type)! > STAGE_ORDER.get(best.type)!)
    ) {
      best = { type, date: e.activity_date };
    }
  }
  return best && { stage: STAGE_LABEL.get(best.type)!, date: best.date };
}

/** The procedure's stage item; null when it has no stage yet. */
export function parseProcedure(json: unknown): PolicyItem | null {
  const p = (
    json as { data: { label: string; process_title?: Record<string, string>; consists_of?: EpEvent[] }[] }
  ).data[0]!;
  const latest = latestStage(p.consists_of ?? []);
  if (!latest) return null;
  return {
    id: `ep:${p.label}`,
    title: p.process_title?.["en"] ?? p.label,
    // Carries the procedure reference, which is what the watchlist match (policy-jev.ts) reads.
    link: `https://oeil.secure.europarl.europa.eu/oeil/en/procedure-file?reference=${p.label}`,
    published: latest.date,
    description: `European Parliament procedure ${p.label}.`,
    source: "European Parliament",
    jurisdiction: "eu",
    jevOnly: false,
    stage: latest.stage,
  };
}

/** One request per watchlisted procedure, in turn; a failing one is skipped, all failing throws. */
export async function fetchEuroparl(ctx: PolicySourceContext): Promise<PolicyItem[]> {
  const procedures = ctx.config.watchlist.eu.filter((w) => PROCEDURE_RE.test(w));
  const items: PolicyItem[] = [];
  let lastError: unknown = null;
  for (const ref of procedures) {
    const [, year, num] = ref.match(PROCEDURE_RE)!;
    try {
      const res = await fetchOk(`${API_URL}/${year}-${num}?format=application%2Fld%2Bjson`);
      const item = parseProcedure(await res.json());
      if (item) items.push(item);
    } catch (err) {
      console.error(`  [policy] European Parliament ${ref} failed: ${err}`);
      lastError = err;
    }
  }
  if (procedures.length > 0 && items.length === 0 && lastError) throw lastError;
  return items;
}
