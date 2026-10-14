/**
 * The Commission's "Have your say" portal (no key): AI-related initiatives,
 * snapshotted every run. An initiative is a stage item, reported again when
 * its stage changes or a new feedback period opens; an open feedback period's
 * end date is its deadline. `brpapi` is the undocumented backend of the public
 * site, so its shape can change without notice: a failure only costs the source.
 */

import type { PolicyItem } from "./policy.ts";
import type { PolicySourceContext } from "./policy-sources.ts";
import { fetchOk } from "./http.ts";
import { daysBefore } from "./date.ts";

const SEARCH_URL = "https://ec.europa.eu/info/law/better-regulation/brpapi/searchInitiatives";
const PAGE_URL = "https://ec.europa.eu/info/law/better-regulation/have-your-say/initiatives";

/**
 * Two searches: "artificial intelligence" (20 initiatives on 2026-10-14, any
 * status; it finds the Digital Omnibus, whose title names no AI) and the open
 * initiatives matching "AI", which is a fuzzy full-text search (39 open, mostly
 * unrelated) and so is kept to titles naming AI. The first alone missed the
 * open "Articles 75c – 75d AI Act Implementing Act" and "Cloud and AI Development Act".
 */
const SEARCHES = [
  { params: "text=artificial%20intelligence", aiTitleOnly: false },
  { params: "text=AI&feedbackStatus=OPEN", aiTitleOnly: true },
];
const AI_TITLE_RE = /\bAI\b|artificial intelligence/i;

/**
 * An initiative counts only while its feedback is open or its current stage
 * started this recently; otherwise the first run would report every
 * consultation since 2020 (the AI White Paper is still in the search).
 */
const RECENT_DAYS = 30;

/** `frontEndStage` → display text, in procedure order: of two stages starting together the later wins. */
const STAGES: [string, string][] = [
  ["PLANNING_WORKFLOW", "Call for evidence"],
  ["OPC_LAUNCHED", "Public consultation"],
  ["ISC_WORKFLOW", "Draft act"],
  ["ADOPTION_WORKFLOW", "Adopted by the Commission"],
];
const STAGE_ORDER = new Map(STAGES.map(([s], i) => [s, i]));
const STAGE_LABEL = new Map(STAGES);

interface Status {
  frontEndStage?: string;
  receivingFeedbackStatus?: string;
  /** "2026/10/12 11:32:31" (Brussels time); `feedbackEndDate` is null when feedback is disabled. */
  feedbackStartDate?: string | null;
  feedbackEndDate?: string | null;
}

interface Initiative {
  id: number;
  reference?: string;
  shortTitle?: string;
  snippet?: string;
  currentStatuses?: Status[];
}

const isoDay = (d: string) => d.slice(0, 10).replace(/\//g, "-");

/** The current status: the latest start, the later stage on a tie. */
function currentStatus(statuses: Status[]): (Status & { start: string }) | null {
  let best: (Status & { start: string }) | null = null;
  for (const s of statuses) {
    if (!s.feedbackStartDate || !STAGE_ORDER.has(s.frontEndStage ?? "")) continue;
    const start = isoDay(s.feedbackStartDate);
    if (
      !best ||
      start > best.start ||
      (start === best.start && STAGE_ORDER.get(s.frontEndStage!)! > STAGE_ORDER.get(best.frontEndStage!)!)
    ) {
      best = { ...s, start };
    }
  }
  return best;
}

/** The search response's initiatives that are open or recently moved, as stage items. */
export function parseInitiatives(json: unknown, now: Date, aiTitleOnly = false): PolicyItem[] {
  const content = (json as { initiativeResultDtoPage?: { content?: Initiative[] } }).initiativeResultDtoPage
    ?.content;
  if (!Array.isArray(content)) throw new Error("unexpected response shape");
  // From the UTC date: compared with a Brussels date, a day at most apart.
  const recent = daysBefore(now.toISOString().slice(0, 10), RECENT_DAYS);
  const items: PolicyItem[] = [];
  for (const i of content) {
    const title = (i.shortTitle ?? "").trim();
    if (!title || (aiTitleOnly && !AI_TITLE_RE.test(title))) continue;
    const status = currentStatus(i.currentStatuses ?? []);
    if (!status) continue;
    const open = status.receivingFeedbackStatus === "OPEN" && !!status.feedbackEndDate;
    if (!open && status.start < recent) continue;
    const snippet = (i.snippet ?? "")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    items.push({
      id: `hys:${i.id}`,
      title,
      link: `${PAGE_URL}/${i.id}_en`,
      published: status.start,
      description: [`Commission initiative ${i.reference ?? i.id}.`, snippet].filter(Boolean).join(" "),
      source: "Have your say",
      jurisdiction: "eu",
      jevOnly: false,
      // Display text only. A closing feedback period keeps the stage key, so it is not reported again; a new
      // period in the same stage is a new status with a later start, so `published` and the key move.
      stage: STAGE_LABEL.get(status.frontEndStage!)!,
      ...(open ? { deadline: isoDay(status.feedbackEndDate!) } : {}),
    });
  }
  return items;
}

/** Both searches; one failing is logged and skipped, both failing throws. */
export async function fetchHaveYourSay(ctx: PolicySourceContext): Promise<PolicyItem[]> {
  const byId = new Map<string, PolicyItem>();
  let lastError: unknown = null;
  let answered = 0;
  for (const search of SEARCHES) {
    try {
      const res = await fetchOk(`${SEARCH_URL}?language=EN&size=100&${search.params}`);
      for (const item of parseInitiatives(await res.json(), ctx.now, search.aiTitleOnly)) {
        byId.set(item.id, item);
      }
      answered++;
    } catch (err) {
      console.error(`  [policy] Have your say (${search.params}) failed: ${err}`);
      lastError = err;
    }
  }
  if (answered === 0) throw lastError;
  return [...byId.values()];
}
