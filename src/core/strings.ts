/**
 * Centralized report strings: report names, labels, footers and status messages.
 */

import type { Jurisdiction } from "./config.ts";

// ---------------------------------------------------------------------------
// Status & error messages (used in index.ts)
// ---------------------------------------------------------------------------

export const MSG = {
  projectsNoActivity: "No stable releases, hot issues or news items today.",
  summaryFailed: "⚠️ Summary generation failed.",
  skillsFailed: "⚠️ Skills summary generation failed.",
} as const;

// ---------------------------------------------------------------------------
// Report headers & labels (used in markdown.ts, index.ts)
// ---------------------------------------------------------------------------

/**
 * Report names and GitHub issue labels. Each live report has one name: its H1, its GitHub issue title,
 * its sidebar and RSS label and its Telegram label all derive from it. Until
 * October 2026 a report could carry four different ones ("Agent Tooling
 * Weekly" in the H1, "AI Infrastructure Digest" in the sidebar). Names stay
 * cadence-neutral: the archive holds daily and weekly issues of a report.
 */
// In reading order: the report bar and the sidebar list them this way. A report's mark is a
// square: `emoji` where only text goes (issue titles, the report bar, Telegram, Teams), `color` in
// the web UI (manifest.json `colors`), so every channel shows the same one. Green and red squares
// are left out: those colors mean added and going away (the diff gutter).
export const REPORTS = {
  "ai-agents": { emoji: "🟪", color: "#9D7BDB", name: "AI Agents", label: "agents" },
  "ai-models": { emoji: "🟦", color: "#55ACEE", name: "AI Models & Labs", label: "models" },
  "ai-policy": { emoji: "🟧", color: "#F4900C", name: "AI Policy", label: "policy" },
  "ai-data": { emoji: "🟨", color: "#FDCB58", name: "Data Engineering", label: "data" },
  "ai-trends": { emoji: "🟫", color: "#C1694F", name: "Trends", label: "trends" },
} as const satisfies Record<string, { emoji: string; color: string; name: string; label: string }>;

export const isReportId = (id: string): id is ReportId => Object.hasOwn(REPORTS, id);

export type ReportId = keyof typeof REPORTS;
export const LIVE_REPORT_IDS = Object.keys(REPORTS) as ReportId[];

/**
 * The reports that run weekly (see WEEKLY_REPORT_WEEKDAY in date.ts); the
 * rest are daily. The one list: the issue retention groups (github.ts) and the
 * sidebar's "This week" group (manifest.json `weekly`) derive from it.
 */
export const WEEKLY_REPORT_IDS: ReportId[] = ["ai-trends"];

/** A report file's H1. */
export const reportHeading = (id: ReportId, dateStr: string) => `# ${REPORTS[id].name} ${dateStr}`;

/** A report's GitHub issue title. */
export const reportIssueTitle = (id: ReportId, dateStr: string) =>
  `${REPORTS[id].emoji} ${REPORTS[id].name} ${dateStr}`;

/**
 * Wording of the repo sections (config.yml agents and infra in the agents
 * report, the data sections in the data report), all daily: infra was a
 * weekly report of its own until October 2026. What a
 * section covers and its LLM subject live in config.yml next to its repos, so
 * re-scoping it is a config edit.
 */
export const PROJECT_SCOPE = { window: "last 24h", period: "today" } as const;

const SOURCES = "Sources:";

/** The meta line under every report's H1. */
export const REPORT_META = {
  sources: (list: string) => `${SOURCES} ${list}`,
  generated: (utcStr: string) => `Generated: ${utcStr} UTC`,
  /** After a listing's item count when Jev ordered it (policy). */
  jevRanked: " ranked by [Jev](https://typesafe.ai) relevance",
} as const;

/** The report bar's first link: the day's overview of every report's highlights. */
export const OVERVIEW = { emoji: "⬛", name: "Overview" } as const;

/** The digest's name as its wordmark writes it, lowercase, where plain text opens a message (Telegram, Teams). */
export const WORDMARK = "daily diff";

/**
 * The diff gutter's sign on a highlight about something going away (deprecation, retirement,
 * removal, end of support, shutdown), the minus sign U+2212; an unsigned highlight reads as +.
 * Only the model writing Highlights knows which is which, so it writes the sign.
 */
export const GOING_AWAY = "−";

/**
 * The table columns of prose (a row's summary, an action's what to do), by header. On a phone the
 * web UI puts such a cell under the row's other cells at full width; a table without one wraps as
 * one line. A header renamed in a table below must be renamed here too.
 */
export const PROSE_COLUMNS = ["Summary", "What to do"];

/** The dated items of the next 30 days from every page (coming-up.json), on the Overview and in Telegram. */
export const COMING_UP = {
  heading: "Coming up",
  stealthTitle: (name: string) => `${name} (stealth model) expires`,
  stealthSource: "OpenRouter",
} as const;

/**
 * Section headings of the LLM-written reports: every page opens with
 * Highlights; the weekly Trends page ends in Signals, the one place for trend
 * claims. Until October 2026 each prompt named its own ("Today's Highlights"
 * in a weekly report, "Research Trend Signal", "Community Pulse", …).
 */
export const SECTIONS = {
  highlights: "Highlights",
  signals: "Signals",
} as const;

// Weekly: what is moving. The prose call writes Highlights and Signals around the rest.
export const TRENDS_REPORT = {
  sources:
    "GitHub Trending + GitHub Search API + OpenRouter + npm + Hugging Face + arXiv + Hacker News + Lobste.rs + Dev.to",
  agentsHeading: "Agents & coding tools",
  skillsHeading: "Claude Code Skills",
  skillsSource: (repo: string) => `> Source: [${repo}](https://github.com/${repo})`,
  /** Code only: 🔥 GitHub repos in no config.yml section, with the lines to add. */
  candidatesHeading: "Candidates to track",
  candidatesIntro:
    "These repos trended two weeks in a row (🔥) and are not tracked. To track one, add its lines to `config.yml`.",
  candidatesSection: (key: string) => `\`${key}.repos\`:`,
  modelsHeading: "Models",
  openRouterHeading: "OpenRouter usage",
  hfHeading: "Hugging Face trending",
  researchHeading: "Research",
  researchTableHeader: "| Paper | Summary |\n| :--- | :--- |",
  mostDiscussedHeading: "Most discussed",
  // Tables rendered in code (renderTrendingTables), one `##` per table, nested under agentsHeading.
  radarHeading: "🚀 Agent & Coding Tool Radar",
  radarHeader: "| Tool | Source | Signal | Summary |\n| :--- | :--- | :--- | :--- |",
  categoryHeader:
    "| Project | Lang | Stars (total / this week, %) | Summary |\n| :--- | :--- | ---: | :--- |",
  categoryTitles: {
    coding_agent: "🧑‍💻 Coding Agents",
    harness_framework: "🧰 Agent Harnesses & Frameworks",
    multi_agent: "🕸️ Multi-Agent & Orchestration",
    agent_tooling: "🔌 Agent Tooling",
    other_agent: "🤖 Other Agents",
  },
} as const;

// Community stories routed by topic (src/spotted/), rendered in code on their topic's page.
export const SPOTTED = {
  heading: "Spotted",
  tableHeader: "| Story | Source | Discussion | Summary |\n| :--- | :--- | :--- | :--- |",
  /** The Source column, and the source of a story matched as project news. */
  sources: { hn: "Hacker News", lobsters: "Lobste.rs", devto: "Dev.to" },
  /** The Discussion cell, e.g. "312 points, 95 comments"; a Dev.to story's points are reactions. */
  counts: (source: "hn" | "lobsters" | "devto", points: number, comments: number) =>
    `${points} ${source === "devto" ? "reactions" : "points"}, ${comments} comments`,
} as const;

// Daily: AI legislation, regulation and official guidance. The table is rendered in code.
export const POLICY_REPORT = {
  /** One section per jurisdiction, in the report's order (config.ts JURISDICTIONS). */
  headings: {
    eu: "EU",
    nl: "Netherlands",
    us_federal: "US federal",
    us_states: "US states",
    other: "Elsewhere",
  } satisfies Record<Jurisdiction, string>,
  // Stage is empty for items from the regular news feeds.
  tableHeader: "| Date | Source | Title | Stage | Summary |\n| :--- | :--- | :--- | :--- | :--- |",
  /** The last section: open deadlines and calendar dates of the next 30 days (src/policy/deadlines.ts). */
  deadlinesHeading: "Coming up",
  deadlinesWindow: "Deadlines and dates in the next 30 days.",
  deadlinesHeader: "| Date | Source | Item |\n| :--- | :--- | :--- |",
  /** The source column of a config.yml `policy.calendar` date. */
  calendarSource: "Calendar",
  /** After the jurisdiction sections: items from `kind: news` feeds (news and commentary outlets). */
  newsHeading: "News & commentary",
  newsTableHeader: "| Date | Source | Title | Summary |\n| :--- | :--- | :--- | :--- |",
  /** The meta line's count, and the log's. */
  newItems: (n: number) => `${n} new items`,
  noNewItems: "No new items, skipping report.",
  noData: "No data available, skipping report.",
} as const;

// Daily: the data platforms and open-source data stack of Digital Power's data engineers.
// Fixed section headings, in report order; config.yml's section titles are README's.
export const DATA_REPORT = {
  headings: {
    databricks: "Databricks",
    snowflake: "Snowflake",
    cloud: "Azure / Fabric & GCP",
    data_stack: "Open-source stack",
  },
  vendorCount: (count: number) => `Vendor items: ${count}`,
  vendorTableHeader: "| Date | Source | Item | Summary |\n| :--- | :--- | :--- | :--- |",
  /** Leads the line of links under a vendor table: today's kept items over the cap. */
  alsoNew: "Also new:",
  /** Marks a deprecation, retirement, breaking or behavior change in the Item cell. */
  deprecationMarker: "⚠️",
  /** Written by the prose call after the tables: one capability compared across vendors. */
  acrossPlatforms: "Across platforms",
  /** Code-rendered after Open-source stack: the data repos' stable releases no earlier report showed. */
  releasesHeading: "Releases this week",
  releasesTableHeader: "| Project | Version | Date | Summary |\n| :--- | :--- | :--- | :--- |",
  /** Code-rendered after Highlights: the open end dates of reported deprecations. */
  actionHeading: "Action required",
  actionTableHeader: "| Date | Platform | Item | What to do |\n| :--- | :--- | :--- | :--- |",
  /** Marks an AI feature in a data platform (`aiInData`) in the Item cell. */
  aiMarker: "🤖",
  /** The last section, code only: links to today's AI Policy items that are EU data law. */
  dataLawHeading: "EU data law",
  noNewItems: "No vendor items, releases, hot issues or news in the tracked data projects, skipping report.",
} as const;

// Daily: Anthropic and OpenAI posts, models newly listed on OpenRouter, stealth models, Spotted.
export const MODELS_PAGE = {
  labHeading: "Lab announcements",
  labTableHeader: "| Date | Lab | Post | Summary |\n| :--- | :--- | :--- | :--- |",
  /** The Lab column. */
  labs: { anthropic: "Anthropic", openai: "OpenAI" },
  /** Below the table when more new posts came in than it shows. */
  morePosts: (n: number) => `${n} more posts not shown.`,
  /** A lab's line on its first crawl, when every URL in its sitemaps is new. */
  firstCrawl: (lab: string, n: number) =>
    `First crawl of ${lab}: ${n} posts recorded; new posts are listed from the next run.`,
  noPosts: "No new posts today.",
  siteFailed: (lab: string) => `⚠️ ${lab}: sitemap fetch failed.`,
  modelsHeading: "New on OpenRouter",
  modelsTableHeader: "| Model | Listed | Context | Summary |\n| :--- | :--- | :--- | :--- |",
  noModels: "No new models listed today.",
  catalogUnavailable: "⚠️ OpenRouter model catalog unavailable.",
  counts: (posts: number, models: number, spotted: number) =>
    `Lab posts: ${posts} | New models: ${models} | Spotted: ${spotted}`,
  noContent: "No lab posts, new models, new stealth models or Spotted stories, skipping report.",
} as const;

// Rendered daily on the models page (buildStealthSection).
export const STEALTH_SECTION = {
  title: "🕵️ Stealth Models on OpenRouter",
  none: "No stealth models listed on OpenRouter today.",
  unavailable: "⚠️ OpenRouter model catalog unavailable — stealth model status unknown.",
  header: "| Model | Listed | Expires | Status |\n| :--- | :--- | :--- | :--- |",
  isNew: "🆕 new",
  expiring: (days: number) => (days <= 0 ? "⏳ expires today" : `⏳ expires in ${days}d`),
  live: "live",
} as const;

// ---------------------------------------------------------------------------
// Footer (used in llm.ts)
// ---------------------------------------------------------------------------

export const FOOTER = {
  autoGen: "This digest is auto-generated by",
} as const;

// ---------------------------------------------------------------------------
// Report labels: RSS item titles, the Telegram message, and published in
// manifest.json (`labels`) for the sidebar (index.html) and the MCP server
// (mcp/src/index.ts). The live reports' names plus the retired ones.
// ---------------------------------------------------------------------------

export const REPORT_LABELS: Record<string, string> = {
  ...Object.fromEntries(LIVE_REPORT_IDS.map((id) => [id, REPORTS[id].name])),
  // No longer generated: listed so archived reports stay reachable from the
  // sidebar and RSS feed (REPORT_FILES) with a title. October 2026: ai-hn
  // (the daily Hacker News, Dev.to and Lobste.rs stories) moved to each page's
  // Spotted section and ai-web to ai-models; ai-trending, ai-hf and ai-arxiv
  // became sections of the weekly Trends page; ai-infra (weekly, its older
  // files cover inference engines, hence the label) and ai-cli were folded into
  // ai-agents, ai-community into ai-hn, and ai-ph dropped. The weekly and
  // monthly rollups were removed earlier.
  "ai-hn": "AI Discussions",
  "ai-web": "Lab Announcements",
  "ai-trending": "Agent & AI Coding Trends",
  "ai-hf": "AI Models",
  "ai-arxiv": "AI Research",
  "ai-infra": "AI Infrastructure Digest",
  "ai-community": "Tech Community AI Digest",
  "ai-cli": "AI CLI Tools Digest",
  "ai-ph": "Product Hunt AI Products Digest",
  "ai-weekly": "AI Tools Weekly Digest",
  "ai-monthly": "AI Tools Monthly Digest",
};
