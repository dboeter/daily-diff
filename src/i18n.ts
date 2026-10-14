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
  trendingFailed: "⚠️ Trending report generation failed.",
} as const;

// ---------------------------------------------------------------------------
// Report headers & labels (used in report-builders.ts, index.ts)
// ---------------------------------------------------------------------------

/**
 * Report names and GitHub issue labels. Each live report has one name: its H1, its GitHub issue title,
 * its sidebar and RSS label and its Telegram label all derive from it. Until
 * October 2026 a report could carry four different ones ("Agent Tooling
 * Weekly" in the H1, "AI Infrastructure Digest" in the sidebar). Names stay
 * cadence-neutral: the archive holds daily and weekly issues of a report.
 */
// In reading order: the report bar and the sidebar list them this way.
export const REPORTS = {
  "ai-agents": { emoji: "🤖", name: "AI Agents", label: "agents" },
  "ai-hn": { emoji: "💬", name: "AI Discussions", label: "hn" },
  "ai-arxiv": { emoji: "📚", name: "AI Research", label: "arxiv" },
  "ai-web": { emoji: "🌐", name: "Lab Announcements", label: "web" },
  "ai-policy": { emoji: "⚖️", name: "Policy Watch", label: "policy" },
  "ai-trending": { emoji: "📈", name: "Agent & AI Coding Trends", label: "trending" },
  "ai-hf": { emoji: "🧠", name: "AI Models", label: "hf" },
} as const satisfies Record<string, { emoji: string; name: string; label: string }>;

export type ReportId = keyof typeof REPORTS;
export const LIVE_REPORT_IDS = Object.keys(REPORTS) as ReportId[];

/**
 * The reports that run weekly (see WEEKLY_REPORT_WEEKDAY in date.ts); the
 * rest are daily. The one list: the issue retention groups (github.ts) and the
 * sidebar's "This week" group (manifest.json `weekly`) derive from it.
 */
export const WEEKLY_REPORT_IDS: ReportId[] = ["ai-trending", "ai-hf"];

/** A report file's H1. */
export const reportHeading = (id: ReportId, dateStr: string) => `# ${REPORTS[id].name} ${dateStr}`;

/** A report's GitHub issue title. */
export const reportIssueTitle = (id: ReportId, dateStr: string) =>
  `${REPORTS[id].emoji} ${REPORTS[id].name} ${dateStr}`;

/**
 * Wording of the agents report's sections (config.yml agents and infra), both
 * daily: infra was a weekly report of its own until October 2026. What a
 * section covers and its LLM subject live in config.yml next to its repos, so
 * re-scoping it is a config edit.
 */
export const PROJECT_SCOPE = { window: "last 24h", period: "today" } as const;

const SOURCES = "Sources:";

/** The meta line under every report's H1 (the web report adds a source list). */
export const REPORT_META = {
  sourcesHeader: SOURCES,
  sources: (list: string) => `${SOURCES} ${list}`,
  generated: (utcStr: string) => `Generated: ${utcStr} UTC`,
  /** After a listing's item count when Jev ordered it (ArXiv, policy). */
  jevRanked: " ranked by [Jev](https://typesafe.ai) relevance",
} as const;

/** The report bar's first link: the day's overview of every report's highlights. */
export const OVERVIEW = { emoji: "📅", name: "Overview" } as const;

export const WEB_REPORT = {
  firstCrawl: "First full crawl",
  todayUpdate: "Today's update",
  newContent: (count: number) => `New content: ${count} articles`,
  anthropicHeading: "Anthropic",
  openaiHeading: "OpenAI",
  // First full crawl only.
  landscapeHeading: "Content Landscape Overview",
  issueTitle: (dateStr: string, isFirstRun: boolean) =>
    `${reportIssueTitle("ai-web", dateStr)}${isFirstRun ? " (First Crawl)" : ""}`,
} as const;

/**
 * Section headings every listing report shares: Highlights → tables → Signals
 * → Worth a Look. Until October 2026 each prompt named its own ("Today's
 * Highlights" in a weekly report, "Research Trend Signal", "Community Pulse",
 * "Worth Deep Reading", "Worth Exploring", …).
 */
export const SECTIONS = {
  highlights: "Highlights",
  signals: "Signals",
  worthALook: "Worth a Look",
} as const;

// Weekly since October 2026.
export const TRENDING_REPORT = {
  sources: "GitHub Trending + GitHub Search API + OpenRouter + npm",
  skillsHeading: "Claude Code Skills",
  skillsSource: (repo: string) => `> Source: [${repo}](https://github.com/${repo})`,
  // Tables rendered in code (renderTrendingTables); the prose headings are handed to the LLM.
  radarHeading: "🚀 Agent & Coding Tool Radar",
  radarHeader: "| Tool | Source | Signal | Summary |\n| :--- | :--- | :--- | :--- |",
  categoriesHeading: "Top Projects by Category",
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

// The discussions report's per-source sections; Dev.to and Lobste.rs on the weekly run only.
export const DISCUSSIONS_REPORT = {
  hnHeading: "Hacker News",
  devtoHeading: "Dev.to",
  lobstersHeading: "Lobste.rs",
} as const;

export const ARXIV_REPORT = {
  source: "[ArXiv](https://arxiv.org/) (cs.AI, cs.CL, cs.LG)",
  papersHeading: "Key Papers",
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
  deadlinesHeading: "Upcoming deadlines (next 30 days)",
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

// Weekly: Hugging Face trending models plus OpenRouter token usage, which
// moved here from the trending report in October 2026.
export const MODELS_REPORT = {
  hfHeading: "Hugging Face Trending",
  openRouterHeading: "OpenRouter Usage",
} as const;

// Rendered daily at the top of the agents report (buildStealthSection).
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
// Footer (used in report.ts)
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
  // Weekly until October 2026, then folded into ai-agents. The older files
  // cover inference engines, hence the label.
  "ai-infra": "AI Infrastructure Digest",
  // Weekly until October 2026, then folded into the discussions report (ai-hn).
  "ai-community": "Tech Community AI Digest",
  // No longer generated (October 2026: ai-cli merged into ai-agents, ai-ph
  // dropped); kept so archived reports keep a title.
  "ai-cli": "AI CLI Tools Digest",
  "ai-ph": "Product Hunt AI Products Digest",
  // Weekly/monthly rollups are no longer generated; kept so archived reports
  // still render a proper title in the sidebar and RSS feed.
  "ai-weekly": "AI Tools Weekly Digest",
  "ai-monthly": "AI Tools Monthly Digest",
};
