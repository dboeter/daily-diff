/**
 * Same-event repeats: one Jev choice per fresh story, through `judgeItems`, cached in
 * `digests/same-event-verdicts.json`. A story that reports the same event as a higher-ranked
 * fresh story or a story a page showed in the last SAME_EVENT_SHOWN_DAYS days, with no new
 * development, leaves today's pool before news matching, so it is neither project news nor
 * Spotted. On 2026-11-01 three outlets' stories on Claude blocking game reverse-engineering took
 * three Spotted rows, and a Dev.to follow-up on the Open-VSX incident shown on 10-31 led the agents
 * page again as news. Without a verdict (no key, or Jev failing too often) no story is dropped.
 */

import path from "node:path";
import { daysBefore } from "../core/date.ts";
import {
  judgeItems,
  loadItemsFile,
  saveItemsFile,
  type AskJev,
  type ChoiceAnswer,
  type Judgment,
  type VerdictCache,
} from "../core/jev.ts";
import {
  linkKey,
  siteOf,
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
          "a how-to or commentary on an incident already reported",
        ],
      },
      same_event_new_development: {
        what: "A story in `earlier` reports the same event, and this one reports a new development of it",
        examples: [
          "a fix, reversal or response that followed",
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

/** A story shown this many days before the run, or fewer, is an earlier story. */
export const SAME_EVENT_SHOWN_DAYS = 2;

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

/**
 * Each story's `earlier` list: the stories a page showed in the last SAME_EVENT_SHOWN_DAYS days
 * (not today: a same-day re-run shows today's again), then the fresh stories ranked above it.
 * A copy of its own link is left out: `freshStories` keeps every copy so one that lands nowhere
 * leaves the link to another.
 */
function earlierLists(ranked: Story[], log: SpottedLog, dateStr: string): Map<string, Earlier[]> {
  const from = daysBefore(dateStr, SAME_EVENT_SHOWN_DAYS);
  const shown = Object.values(log.items).filter((e) => e.shown && e.shown !== dateStr && e.shown >= from);
  return new Map(
    ranked.map((s, i) => {
      const key = linkKey(s.url);
      const list = [...shown, ...ranked.slice(0, i)]
        .filter((e) => linkKey(e.url) !== key)
        .map((e) => ({ title: e.title, site: siteOf(e.url) }));
      return [s.id, list];
    }),
  );
}

export type SameEventVerdicts = VerdictCache<SameEventAnswers>;

export const SAME_EVENT_VERDICTS_FILE = path.join("digests", "same-event-verdicts.json");
const SAME_EVENT_UNSEEN_DAYS = 30;

/** Missing file → empty cache. Unreadable or malformed → null: every story is asked and nothing is saved. */
export function loadSameEventVerdicts(file = SAME_EVENT_VERDICTS_FILE): SameEventVerdicts | null {
  return loadItemsFile(file, "same-event");
}

export function saveSameEventVerdicts(cache: SameEventVerdicts, file = SAME_EVENT_VERDICTS_FILE): void {
  saveItemsFile(cache, file);
}

export interface SameEventCheck {
  /** The fresh stories, repeats removed, in their input order. */
  kept: Story[];
  repeats: Story[];
  judgment: Judgment<Story, SameEventAnswers, { repeat: boolean }>;
}

/**
 * One Jev choice per fresh story with a non-empty `earlier` list. The fingerprint is the run's date:
 * the list changes from day to day, and a same-day re-run reuses the day's verdicts, so it drops the
 * same stories even when points reorder them.
 */
export async function dropSameEventRepeats(
  fresh: Story[],
  opts: { log: SpottedLog; apiKey?: string; cache: SameEventVerdicts | null; dateStr: string; ask?: AskJev },
): Promise<SameEventCheck> {
  const ranked = rankFresh(fresh);
  const earlier = earlierLists(ranked, opts.log, opts.dateStr);
  const judgment = await judgeItems(
    ranked.filter((s) => earlier.get(s.id)!.length > 0),
    {
      ...opts,
      tag: "same-event",
      request: (story) => ({
        state: {
          title: story.title,
          ...(story.description ? { description: story.description } : {}),
          site: siteOf(story.url),
          earlier: earlier.get(story.id),
        },
        questions: SAME_EVENT_QUESTIONS,
      }),
      decide: (a: SameEventAnswers) => ({ repeat: isRepeatEvent(a) }),
      fingerprint: () => opts.dateStr,
      unseenDays: SAME_EVENT_UNSEEN_DAYS,
    },
  );
  if (judgment.rankedBy !== "jev") {
    console.log(
      `  [same-event] No story dropped (fallback: ${opts.apiKey ? "too many Jev failures" : "no TYPESAFE_API_KEY"})`,
    );
    return { kept: fresh, repeats: [], judgment };
  }
  const isRepeat = (s: Story) => judgment.verdicts.get(s.id)?.repeat === true;
  const repeats = fresh.filter(isRepeat);
  console.log(`  [same-event] Dropped ${repeats.length} of ${fresh.length} fresh stories as repeats`);
  return { kept: fresh.filter((s) => !isRepeat(s)), repeats, judgment };
}
