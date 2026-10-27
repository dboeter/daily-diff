/**
 * Spotted topic routing: one Jev choice per community story, through
 * `judgeItems`, cached in `digests/spotted-verdicts.json` (hand-editable, like
 * `trending-verdicts.json`). Without a key, or when more than half the
 * new calls fail, `fallbackTopic` decides by keywords.
 */

import path from "node:path";
import {
  droppedFor,
  judgeItems,
  loadItemsFile,
  renderedAt,
  saveItemsFile,
  type AskJev,
  type DroppedReason,
  type SourceCounts,
  type ChoiceAnswer,
  type Judgment,
  type VerdictCache,
} from "../core/jev.ts";
import { DATA_KEYWORD_PATTERNS } from "../sources/hn.ts";
import { siteOf, type SpottedPage, type SpottedRow, type Story } from "./pool.ts";

const TOPIC_QUESTIONS = {
  topic: {
    type: "choice",
    instructions:
      "What is the community story described by `title` (and `description` when present), linked from `site`, about?",
    criteria: {
      agents: {
        what: "AI agents and AI developer tools",
        examples: [
          "a coding agent",
          "an agent framework or SDK",
          "an MCP server or agent tooling",
          "building software with AI agents",
        ],
      },
      models: {
        what: "AI models and the labs and companies that make them",
        examples: [
          "a model release",
          "a benchmark or model comparison",
          "a lab's product, pricing or business news",
          "an open-weight model",
          "inference and serving",
        ],
      },
      research: {
        what: "AI research results",
        examples: [
          "a paper",
          "an interpretability or training finding",
          "a technical explanation of how models work",
        ],
      },
      data: {
        what: "Data engineering and databases, with or without AI",
        examples: [
          "a database or query engine",
          "a warehouse or lakehouse",
          "pipelines and orchestration",
          "a dataframe library",
          "Databricks or Snowflake",
        ],
      },
      policy: {
        what: "AI law, regulation, government action and court cases",
        examples: ["an AI bill or regulation", "a government ban or order", "an AI court case"],
      },
      // The no-match outcome the Jev docs recommend.
      other: {
        what: "None of the above",
        examples: [
          "an opinion essay on AI",
          "AI's effect on jobs or culture",
          "AI-generated content",
          "a story only loosely about AI",
        ],
      },
    },
  },
};

export type Topic = keyof typeof TOPIC_QUESTIONS.topic.criteria;

export interface TopicAnswers {
  topic: ChoiceAnswer;
}

/**
 * The page each topic lands on. Research stays a topic of its own so later
 * work can tell it from model news. Policy and other have no page: AI Policy
 * has its own sources (the HN-to-policy routing was reverted on 2026-10-20), so
 * their best stories go on the Overview's "Also talked about" (`selectTalkedAbout`).
 */
export const PAGE_OF_TOPIC: Record<Topic, SpottedPage | null> = {
  agents: "agents",
  models: "models",
  research: "models",
  data: "data",
  policy: null,
  other: null,
};

/** The topic chosen; throws on a key outside the list, so the call counts as failed. */
export function topicOf(answers: TopicAnswers): Topic {
  const choice = answers?.topic?.choice;
  if (typeof choice !== "string" || !Object.hasOwn(TOPIC_QUESTIONS.topic.criteria, choice)) {
    throw new Error(`Unexpected Jev answers: ${JSON.stringify(answers)}`);
  }
  return choice as Topic;
}

function topicState(story: Story): object {
  return {
    title: story.title,
    ...(story.description ? { description: story.description } : {}),
    site: siteOf(story.url),
  };
}

// ---------------------------------------------------------------------------
// Keyword fallback
// ---------------------------------------------------------------------------

/**
 * Tried in this order. Policy goes first: "DeepSeek banned from U.S. federal
 * civilian agencies" names a model company but is a policy story.
 */
const FALLBACK_KEYWORDS: [Topic, RegExp[]][] = [
  [
    "policy",
    [
      /\bregulat/i,
      /\blaws?\b/i,
      /\blegislat/i,
      /\bbann?(ed|s)?\b/i,
      /\bcourt\b/i,
      /\blawsuit/i,
      /\bsue[sd]?\b/i,
      /\bcongress\b/i,
      /\bsenate\b/i,
      /\bfederal\b/i,
      /\bgovernment\b/i,
      /\bAI Act\b/i,
      /\bFTC\b/,
      /\bEU\b/,
    ],
  ],
  ["data", DATA_KEYWORD_PATTERNS],
  [
    "agents",
    [
      /\bagent(s|ic)?\b/i,
      /\bmcp\b/i,
      /\bclaude code\b/i,
      /\bcodex\b/i,
      /\bcursor\b/i,
      /\bcopilot\b/i,
      /\bvibe[ -]?cod/i,
      /\bcoding (assistant|tool)s?\b/i,
    ],
  ],
  [
    "research",
    [
      /\bpaper\b/i,
      /\barxiv\b/i,
      /\bresearch(ers)?\b/i,
      /\binterpretability\b/i,
      /\btraining\b/i,
      /\bneural\b/i,
      /\btransformers?\b/i,
    ],
  ],
  [
    "models",
    [
      /\bmodels?\b/i,
      /\bllms?\b/i,
      /\bgpt[-\s]?\d/i,
      /\bclaude\b/i,
      /\bgemini\b/i,
      /\bllama\b/i,
      /\bqwen\b/i,
      /\bdeepseek\b/i,
      /\bmistral\b/i,
      /\bopenai\b/i,
      /\banthropic\b/i,
      /\bbenchmark/i,
      /\binference\b/i,
      /\bopen[- ]weights?\b/i,
    ],
  ],
];

/** Keyword lists over the title and description, in FALLBACK_KEYWORDS order, else `other`. */
export function fallbackTopic(story: Pick<Story, "title" | "description">): Topic {
  const text = `${story.title} ${story.description ?? ""}`;
  return FALLBACK_KEYWORDS.find(([, patterns]) => patterns.some((p) => p.test(text)))?.[0] ?? "other";
}

// ---------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------

export type SpottedVerdicts = VerdictCache<TopicAnswers>;

export const SPOTTED_VERDICTS_FILE = path.join("digests", "spotted-verdicts.json");
const TOPICS_UNSEEN_DAYS = 30;

/** Missing file → empty cache. Unreadable or malformed → null: every story is asked and nothing is saved. */
export function loadSpottedVerdicts(file = SPOTTED_VERDICTS_FILE): SpottedVerdicts | null {
  return loadItemsFile(file, "spotted");
}

export function saveSpottedVerdicts(cache: SpottedVerdicts, file = SPOTTED_VERDICTS_FILE): void {
  saveItemsFile(cache, file);
}

export interface Routing {
  /** Each story's topic, by story id: Jev's, else the keyword fallback's. */
  topics: Map<string, Topic>;
  judgment: Judgment<Story, TopicAnswers, { topic: Topic }>;
}

/**
 * One Jev choice per story not in the cache. No fingerprint: a story's topic
 * does not change. A story whose call failed gets the fallback topic.
 */
export async function routeStories(
  stories: Story[],
  opts: { apiKey?: string; cache: SpottedVerdicts | null; dateStr: string; ask?: AskJev },
): Promise<Routing> {
  const judgment = await judgeItems(stories, {
    ...opts,
    tag: "spotted",
    request: (story) => ({ state: topicState(story), questions: TOPIC_QUESTIONS }),
    decide: (a: TopicAnswers) => ({ topic: topicOf(a) }),
    unseenDays: TOPICS_UNSEEN_DAYS,
  });
  const topics = new Map(
    stories.map((s): [string, Topic] => [s.id, judgment.verdicts.get(s.id)?.topic ?? fallbackTopic(s)]),
  );
  console.log(
    `  [spotted] Routed ${stories.length} stories ` +
      (judgment.rankedBy === "jev"
        ? "by Jev"
        : `by keywords (fallback: ${opts.apiKey ? "too many Jev failures" : "no TYPESAFE_API_KEY"})`),
  );
  return { topics, judgment };
}

/**
 * `digests/YYYY-MM-DD/spotted-trace.json`: every routed story with its
 * topic, page, whether a page showed it (`rendered`, `rank`: its row number), why
 * not (`selectSpotted`'s `dropped`, or its page went unpublished), and its answers.
 * A story the Overview's "Also talked about" showed gets `talked_about: true` and no drop reason.
 */
export function spottedTraceFile(
  stories: Story[],
  routing: Routing,
  shownIds: Set<string>,
  selection: {
    rows: Pick<SpottedRow, "id" | "n">[];
    dropped: Map<string, DroppedReason>;
    /** The ids `selectTalkedAbout` took. */
    talkedAbout?: Set<string>;
    sources: SourceCounts;
  },
): string {
  const rowOf = new Map(selection.rows.map((r) => [r.id, r.n]));
  const rows = stories.map((s) => {
    const topic = routing.topics.get(s.id) ?? null;
    const n = rowOf.get(s.id);
    return {
      id: s.id,
      title: s.title,
      source: s.source,
      topic,
      page: topic ? PAGE_OF_TOPIC[topic] : null,
      shown: shownIds.has(s.id),
      ...(n !== undefined && shownIds.has(s.id)
        ? renderedAt(n)
        : selection.talkedAbout?.has(s.id)
          ? { rendered: false, rank: null, talked_about: true }
          : droppedFor(selection.dropped.get(s.id) ?? "unpublished")),
      ...routing.judgment.traceFields(s),
    };
  });
  return routing.judgment.traceFile(rows, { sources: selection.sources });
}
