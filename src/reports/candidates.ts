/**
 * `candidates.json`: every item the pipeline fetched that day, shown or not, for the nightly
 * black-box review. It holds what a reader of the source would see, never a score, verdict or
 * drop reason; whether an item was shown is read from the published reports' links.
 */

import type { ProjectActivity } from "./prompts.ts";
import type { PolicyItem } from "../policy/items.ts";
import type { VendorItem } from "../data/vendors.ts";
import type { CommunityPost } from "../data/community.ts";
import type { LabsFetchResult } from "../sources/labs.ts";
import type { ModelCatalog } from "../sources/openrouter.ts";
import type { TrendingRepo } from "../trending/compose.ts";
import type { Story } from "../spotted/pool.ts";
import { SPOTTED } from "../core/strings.ts";

export interface Candidate {
  page: "ai-agents" | "ai-models" | "ai-data" | "ai-policy" | "spotted";
  kind:
    | "release"
    | "hot-issue"
    | "story"
    | "lab-post"
    | "model"
    | "policy-item"
    | "vendor-note"
    | "community-post"
    | "trending-repo";
  /** Human source name: a repo's full name, "Hacker News", a feed's name, "OpenRouter", a lab's site. */
  source: string;
  title: string;
  url: string;
  /** A story's discussion page: project News links it instead of `url`. */
  discussion?: string;
  /** As the item has it: an ISO date or time. */
  published: string;
  /** The item's own text, whitespace-collapsed and cut to `MAX_TEXT_CHARS`; "" when it has none. */
  text: string;
}

export type ProjectItems = Pick<
  ProjectActivity,
  "config" | "releases" | "previews" | "hotIssues" | "weekReleases"
>;

export interface CandidateSources {
  /** The agents and infra projects: page ai-agents. */
  agents: ProjectItems[];
  /** Every data project of every section: page ai-data. */
  data: ProjectItems[];
  stories: Story[];
  labs: LabsFetchResult[];
  catalog: ModelCatalog | null;
  trending: TrendingRepo[];
  posts: CommunityPost[];
  /** Every new policy item before selection (`NewItems.candidates`). */
  policy: PolicyItem[];
  /** Every new vendor note before selection (`NewItems.candidates`). */
  vendor: VendorItem[];
  /** The run's CST date: a trending repo has no date of its own. */
  dateStr: string;
}

/** Plain cut, no ellipsis: the reviewer reads at most this many characters of an item. */
const MAX_TEXT_CHARS = 1500;

const textOf = (text: string | null | undefined): string =>
  (text ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_TEXT_CHARS);

const modelCandidate = (m: { id: string; name: string; created: string }, text: string): Candidate => ({
  page: "ai-models",
  kind: "model",
  source: "OpenRouter",
  title: m.name,
  url: `https://openrouter.ai/${m.id}`,
  published: m.created,
  text,
});

function projectCandidates(
  page: "ai-agents" | "ai-data",
  { config, releases, previews, hotIssues, weekReleases = [] }: ProjectItems,
): Candidate[] {
  return [
    // A data project's page also lists the week's releases; the day's are among them.
    ...[...new Map([...releases, ...previews, ...weekReleases].map((r) => [r.tag_name, r])).values()].map(
      (r): Candidate => ({
        page,
        kind: "release",
        source: config.repo,
        title: `${config.name} ${r.name || r.tag_name}`,
        url: `https://github.com/${config.repo}/releases/tag/${r.tag_name}`,
        published: r.published_at,
        text: textOf(r.body),
      }),
    ),
    ...hotIssues.map((i): Candidate => ({
      page,
      kind: "hot-issue",
      source: config.repo,
      title: i.title,
      url: i.html_url,
      published: i.created_at,
      text: textOf(i.body),
    })),
  ];
}

/** One candidate per fetched item, in source order; the policy and vendor items are those before selection. */
export function buildCandidates(s: CandidateSources): Candidate[] {
  return [
    ...s.agents.flatMap((p) => projectCandidates("ai-agents", p)),
    ...s.data.flatMap((p) => projectCandidates("ai-data", p)),
    ...s.stories.map((story): Candidate => ({
      page: "spotted",
      kind: "story",
      source: SPOTTED.sources[story.source],
      title: story.title,
      url: story.url,
      discussion: story.discussionUrl,
      published: story.published,
      text: textOf(story.description),
    })),
    ...s.labs.flatMap((r) =>
      r.newItems.map((post): Candidate => ({
        page: "ai-models",
        kind: "lab-post",
        source: post.site,
        title: post.title,
        url: post.url,
        published: post.lastmod,
        text: textOf(post.content),
      })),
    ),
    ...(s.catalog?.newModels ?? []).map((m) => modelCandidate(m, textOf(m.description))),
    ...(s.catalog?.stealth ?? []).map((m) => modelCandidate(m, "")),
    ...s.trending.map((r): Candidate => ({
      page: "ai-agents",
      kind: "trending-repo",
      source: "GitHub Trending",
      title: r.fullName,
      url: r.url,
      published: s.dateStr,
      text: textOf(r.description),
    })),
    ...s.posts.map((p): Candidate => ({
      page: "ai-data",
      kind: "community-post",
      source: p.source,
      title: p.title,
      url: p.url,
      published: p.published,
      text: textOf(p.description),
    })),
    ...s.policy.map((i): Candidate => ({
      page: "ai-policy",
      kind: "policy-item",
      source: i.source,
      title: i.title,
      url: i.link,
      published: i.published,
      text: textOf(i.description),
    })),
    ...s.vendor.map((i): Candidate => ({
      page: "ai-data",
      kind: "vendor-note",
      source: i.source,
      title: i.title,
      url: i.link,
      published: i.date,
      text: textOf(i.description),
    })),
  ];
}

/** One candidate per line in a top-level array, like the other per-day files. */
export function candidatesFile(candidates: Candidate[]): string {
  return candidates.length > 0 ? `[\n${candidates.map((c) => JSON.stringify(c)).join(",\n")}\n]\n` : "[]\n";
}
