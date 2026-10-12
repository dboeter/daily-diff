/**
 * Centralized report strings: report names, labels, footers and status messages.
 */

import type { SectionKey } from "./config.ts";

// ---------------------------------------------------------------------------
// Status & error messages (used in index.ts)
// ---------------------------------------------------------------------------

export const MSG = {
  projectsNoActivity: "No stable releases, hot issues or news mentions today.",
  summaryFailed: "⚠️ Summary generation failed.",
  skillsFailed: "⚠️ Skills summary generation failed.",
  trendingFailed: "⚠️ Trending report generation failed.",
} as const;

// ---------------------------------------------------------------------------
// Report headers & labels (used in report-builders.ts, index.ts)
// ---------------------------------------------------------------------------

/**
 * Report names. Each live report has one name: its H1, its GitHub issue title,
 * its sidebar and RSS label and its Telegram label all derive from it. Until
 * October 2026 a report could carry four different ones ("Agent Tooling
 * Weekly" in the H1, "AI Infrastructure Digest" in the sidebar). Names stay
 * cadence-neutral: the archive holds daily and weekly editions of a report.
 */
// In reading order: the report bar and the sidebar list them this way.
export const REPORTS = {
  "ai-agents": { emoji: "🤖", name: "AI Agents" },
  "ai-hn": { emoji: "💬", name: "AI Discussions" },
  "ai-arxiv": { emoji: "📚", name: "AI Research" },
  "ai-web": { emoji: "🌐", name: "Lab Announcements" },
  "ai-trending": { emoji: "📈", name: "Agent & AI Coding Trends" },
  "ai-hf": { emoji: "🧠", name: "AI Models" },
} as const satisfies Record<string, { emoji: string; name: string }>;

export type ReportId = keyof typeof REPORTS;
export const LIVE_REPORT_IDS = Object.keys(REPORTS) as ReportId[];

/** A report file's H1. */
export const reportHeading = (id: ReportId, dateStr: string) => `# ${REPORTS[id].name} ${dateStr}`;

/** A report's GitHub issue title. */
export const reportIssueTitle = (id: ReportId, dateStr: string) =>
  `${REPORTS[id].emoji} ${REPORTS[id].name} ${dateStr}`;

/**
 * The config.yml report sections (agents, infra). What a section covers and
 * its LLM subject live in config.yml next to its repos, so re-scoping it is a
 * config edit. These strings follow from its cadence and stay here.
 */
export const PROJECT_REPORTS = {
  // Replaced the separate CLI and OpenClaw-ecosystem reports in October 2026.
  agents: { window: "last 24h", period: "today" },
  // A group in the agents report since October 2026; a weekly report of its
  // own before that, which mostly listed quiet projects.
  infra: { window: "last 24h", period: "today" },
} as const satisfies Record<SectionKey, { window: string; period: string }>;

export const WEB_REPORT = {
  firstCrawl: "First full crawl",
  todayUpdate: "Today's update",
  newContent: (count: number) => `New content: ${count} articles`,
  generated: (utcStr: string) => `Generated: ${utcStr} UTC`,
  sourcesHeader: "Sources:",
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
  sources: "Sources: GitHub Trending + GitHub Search API + OpenRouter + npm",
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

export const ISSUE_LABELS = {
  agents: "agents",
  web: "web",
  trending: "trending",
  hn: "hn",
  arxiv: "arxiv",
  hf: "hf",
} as const;

// ---------------------------------------------------------------------------
// Footer (used in report.ts)
// ---------------------------------------------------------------------------

export const OVERVIEW = { emoji: "📅", name: "Overview" } as const;

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
