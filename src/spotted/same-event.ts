/**
 * Same-event repeats: one Jev choice per story, through `judgeItems`, cached in
 * `digests/same-event-verdicts.json`, in two steps. Before news matching, a fresh story that reports
 * the same event as a story a page showed on an earlier day (within SPOTTED_MAX_AGE_DAYS), with no
 * new development, leaves today's pool (`dropShownRepeats`). After selection, a Spotted or
 * talked-about row that repeats a story shown above it today is removed and its slot refilled
 * (`dropSameDayRepeats`). Comparing only with stories that show means a drop never loses an event.
 * On 2026-11-01 three outlets' stories on Claude blocking game reverse-engineering took three
 * Spotted rows, and a Dev.to follow-up on the Open-VSX incident shown on 10-31 led the agents page
 * again as news. Saved verdicts always apply; a story without one is kept.
 */

import { createHash } from "node:crypto";
import path from "node:path";
import { daysBefore } from "../core/date.ts";
import {
  judgeItems,
  loadItemsFile,
  saveItemsFile,
  type AskJev,
  type ChoiceAnswer,
  type VerdictCache,
} from "../core/jev.ts";
import {
  linkKey,
  siteOf,
  SPOTTED_MAX_AGE_DAYS,
  SPOTTED_PER_SOURCE,
  type SpottedLog,
  type Story,
  type StorySource,
} from "./pool.ts";

const SAME_EVENT_QUESTIONS = {
  same_event: {
    type: "choice",
    instructions:
      "Does the community story described by `title` (and `description` when present), linked from `site`, " +
      "report the same event as one of the stories in `earlier` (each a title and its site)?",
    criteria: {
      new_event: {
        what: "No story in `earlier` reports the same event",
        examples: [
          "a different announcement by the same company",
          "a story on the same topic about another event",
        ],
      },
      same_event_no_development: {
        what: "A story in `earlier` reports the same event, and this one adds no new development",
        examples: [
          "another outlet's article on the same announcement",
          "a how-to, audit checklist or commentary on an incident already reported",
        ],
      },
      same_event_new_development: {
        what:
          "A story in `earlier` reports the same event, and this one reports new facts about the event itself; " +
          "advice, a guide or a checklist prompted by it is no new development",
        examples: [
          "a fix, reversal or official response that followed",
          "new findings on an incident's cause or scale",
        ],
      },
    },
  },
};

type SameEvent = keyof typeof SAME_EVENT_QUESTIONS.same_event.criteria;

export interface SameEventAnswers {
  same_event: ChoiceAnswer;
}

/** Whether the story is a repeat; throws on a key outside the list, so the call counts as failed. */
export function isRepeatEvent(answers: SameEventAnswers): boolean {
  const choice = answers?.same_event?.choice;
  if (typeof choice !== "string" || !Object.hasOwn(SAME_EVENT_QUESTIONS.same_event.criteria, choice)) {
    throw new Error(`Unexpected Jev answers: ${JSON.stringify(answers)}`);
  }
  return (choice as SameEvent) === "same_event_no_development";
}

/**
 * Today's ranking for "higher-ranked": sources in SPOTTED_PER_SOURCE order, then points, then id.
 * Points are not comparable across sources, so an HN story outranks every Lobste.rs and Dev.to one.
 */
export function rankFresh(stories: Story[]): Story[] {
  const order = Object.keys(SPOTTED_PER_SOURCE) as StorySource[];
  return [...stories].sort(
    (a, b) =>
      order.indexOf(a.source) - order.indexOf(b.source) || b.points - a.points || a.id.localeCompare(b.id),
  );
}

type Earlier = { title: string; site: string };

const earlierOf = (stories: Pick<Story, "title" | "url">[], own: Pick<Story, "url">): Earlier[] =>
  stories
    .filter((e) => linkKey(e.url) !== linkKey(own.url))
    .map((e) => ({ title: e.title, site: siteOf(e.url) }));

/**
 * The run's date plus a hash of the `earlier` list: a same-day re-run whose ranking or shown
 * stories changed asks again instead of reusing a verdict made against another list.
 */
export function sameEventFingerprint(dateStr: string, earlier: Earlier[]): string {
  const hash = createHash("sha1").update(JSON.stringify(earlier)).digest("hex").slice(0, 8);
  return `${dateStr}:${hash}`;
}

export type SameEventVerdicts = VerdictCache<SameEventAnswers>;

export const SAME_EVENT_VERDICTS_FILE = path.join("digests", "same-event-verdicts.json");
const SAME_EVENT_UNSEEN_DAYS = 30;
/**
 * The same-day step's verdicts are saved under `<id>#same-day`: a story is judged in both steps against
 * different lists, and one key would make each step overwrite the other's verdict and a re-run ask twice.
 */
const SAME_DAY_KEY = "#same-day";

/** Missing file → empty cache. Unreadable or malformed → null: every story is asked and nothing is saved. */
export function loadSameEventVerdicts(file = SAME_EVENT_VERDICTS_FILE): SameEventVerdicts | null {
  return loadItemsFile(file, "same-event");
}

export function saveSameEventVerdicts(cache: SameEventVerdicts, file = SAME_EVENT_VERDICTS_FILE): void {
  saveItemsFile(cache, file);
}

interface JudgeOpts {
  apiKey?: string;
  cache: SameEventVerdicts | null;
  dateStr: string;
  ask?: AskJev;
}

/**
 * Judge each story against its `earlier` list. Saved verdicts apply whatever the key or Jev's health
 * (`judgeItems` keeps them in `verdicts`); a story without a verdict is no repeat.
 */
async function judgeAgainst(stories: Story[], earlier: Map<string, Earlier[]>, opts: JudgeOpts, key = "") {
  const keyed = stories.map((s) => ({ ...s, id: `${s.id}${key}` }));
  const listOf = (k: { id: string }) => earlier.get(k.id.slice(0, k.id.length - key.length))!;
  const judgment = await judgeItems(keyed, {
    ...opts,
    tag: "same-event",
    request: (story) => ({
      state: {
        title: story.title,
        ...(story.description ? { description: story.description } : {}),
        site: siteOf(story.url),
        earlier: listOf(story),
      },
      questions: SAME_EVENT_QUESTIONS,
    }),
    decide: (a: SameEventAnswers) => ({ repeat: isRepeatEvent(a) }),
    fingerprint: (story) => sameEventFingerprint(opts.dateStr, listOf(story)),
    unseenDays: SAME_EVENT_UNSEEN_DAYS,
  });
  if (judgment.rankedBy !== "jev") {
    console.log(
      `  [same-event] Saved verdicts only (fallback: ${opts.apiKey ? "too many Jev failures" : "no TYPESAFE_API_KEY"})`,
    );
  }
  return {
    isRepeat: (s: Story) => judgment.verdicts.get(`${s.id}${key}`)?.repeat === true,
    traceFields: (s: Story) => judgment.traceFields({ ...s, id: `${s.id}${key}` }),
    nextCache: judgment.nextCache,
  };
}

export interface SameEventCheck {
  repeats: Story[];
  /** A judged story's `same_event` answers and `decided`, for the Spotted trace. */
  traceFields(story: Story): Record<string, unknown>;
  /** The cache to save, null when the file was malformed. */
  nextCache: SameEventVerdicts | null;
}

/**
 * Before news matching: each fresh story against the stories a page showed on an earlier day within
 * SPOTTED_MAX_AGE_DAYS (a follow-up is still returned days later), a copy of its own link left out.
 * Not today's: a same-day re-run shows them again. A story with nothing to compare is not asked.
 */
export async function dropShownRepeats(
  fresh: Story[],
  opts: JudgeOpts & { log: SpottedLog },
): Promise<SameEventCheck & { kept: Story[] }> {
  const from = daysBefore(opts.dateStr, SPOTTED_MAX_AGE_DAYS);
  const shown = Object.values(opts.log.items)
    .filter((e) => e.shown && e.shown !== opts.dateStr && e.shown >= from)
    .sort((a, b) => b.shown!.localeCompare(a.shown!) || a.title.localeCompare(b.title));
  const earlier = new Map(fresh.map((s) => [s.id, earlierOf(shown, s)]));
  const asked = fresh.filter((s) => earlier.get(s.id)!.length > 0);
  const judged = await judgeAgainst(asked, earlier, opts);
  const repeats = asked.filter(judged.isRepeat);
  const ids = new Set(repeats.map((s) => s.id));
  console.log(
    `  [same-event] Dropped ${repeats.length} of ${fresh.length} fresh stories as repeats of earlier days`,
  );
  return {
    kept: fresh.filter((s) => !ids.has(s.id)),
    repeats,
    traceFields: judged.traceFields,
    nextCache: judged.nextCache,
  };
}

/**
 * After selection: what shows today ranked as project news first (`news`, context only, never
 * removed), then the Spotted and talked-about rows by `rankFresh`. Each row with a story above it
 * (a copy of its own link left out) is asked once per run; a repeat is removed and `select` runs
 * again without it, so its slot goes to the next candidate, which is checked the same way. A row
 * judged no repeat stays one when a story above it is later removed: its list only shrank.
 */
export async function dropSameDayRepeats<T>(
  news: Story[],
  select: (removed: ReadonlySet<string>) => { selection: T; shown: Story[] },
  opts: JudgeOpts,
): Promise<SameEventCheck & { selection: T }> {
  const removed = new Map<string, Story>();
  const decided = new Set<string>();
  const traces = new Map<string, Record<string, unknown>>();
  let cache = opts.cache;
  for (;;) {
    const { selection, shown } = select(new Set(removed.keys()));
    const order = [...rankFresh(news), ...rankFresh(shown)];
    const earlier = new Map(order.map((s, i) => [s.id, earlierOf(order.slice(0, i), s)]));
    const toAsk = shown.filter((s) => !decided.has(s.id) && earlier.get(s.id)!.length > 0);
    const judged = await judgeAgainst(toAsk, earlier, { ...opts, cache }, SAME_DAY_KEY);
    if (cache) cache = judged.nextCache;
    const repeats = toAsk.filter(judged.isRepeat);
    for (const s of toAsk) {
      decided.add(s.id);
      traces.set(s.id, judged.traceFields(s));
    }
    for (const s of repeats) removed.set(s.id, s);
    if (repeats.length === 0) {
      console.log(`  [same-event] Removed ${removed.size} of today's rows as repeats of a higher one`);
      return {
        selection,
        repeats: [...removed.values()],
        traceFields: (s) => traces.get(s.id) ?? {},
        nextCache: cache,
      };
    }
  }
}
