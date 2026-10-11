/**
 * Centralized report strings: titles, labels, footers and status messages.
 * The agents and infra report titles are the exception: config.yml.
 */

import type { SectionKey } from "./config.ts";

// ---------------------------------------------------------------------------
// Status & error messages (used in index.ts)
// ---------------------------------------------------------------------------

export const MSG = {
  agentsNoActivity: "No stable releases, hot issues or news mentions today.",
  infraNoActivity: "No stable releases or hot issues this week.",
  summaryFailed: "⚠️ Summary generation failed.",
  skillsFailed: "⚠️ Skills summary generation failed.",
  trendingFailed: "⚠️ Trending report generation failed.",
} as const;

// ---------------------------------------------------------------------------
// Report headers & labels (used in report-builders.ts, index.ts)
// ---------------------------------------------------------------------------

/**
 * The config.yml report sections (agents, infra). What a section covers, its
 * title and LLM subject, lives in config.yml next to its repos, so re-scoping
 * it is a config edit. These strings follow from its cadence and stay here;
 * so do the REPORT_LABELS archive labels below.
 */
export const PROJECT_REPORTS = {
  // Replaced the separate CLI and OpenClaw-ecosystem reports in October 2026.
  agents: { emoji: "🤖", window: "last 24h", period: "today" },
  // Weekly since October 2026 (see WEEKLY_REPORT_WEEKDAY in date.ts). Covers
  // agent tooling since 2026-10-10; the "AI Infrastructure" archive labels in
  // REPORT_LABELS stay because older ai-infra files cover inference engines.
  infra: { emoji: "⚙️", window: "last 7 days", period: "this week" },
} as const satisfies Record<SectionKey, { emoji: string; window: string; period: string }>;

/** GitHub issue title of a section report; `title` is the section's `title` in config.yml. */
export const projectIssueTitle = (key: SectionKey, title: string, dateStr: string) =>
  `${PROJECT_REPORTS[key].emoji} ${title} ${dateStr}`;

export const WEB_REPORT = {
  title: "Official AI Content Report",
  firstCrawl: "First full crawl",
  todayUpdate: "Today's update",
  newContent: (count: number) => `New content: ${count} articles`,
  generated: (utcStr: string) => `Generated: ${utcStr} UTC`,
  sourcesHeader: "Sources:",
  issueTitle: (dateStr: string, isFirstRun: boolean) =>
    `🌐 Official AI Content Report ${dateStr}${isFirstRun ? " (First Crawl)" : ""}`,
} as const;

// Weekly since October 2026. The sidebar/RSS labels in REPORT_LABELS stay
// cadence-neutral because the archive holds daily editions too.
export const TRENDING_REPORT = {
  title: "Agent & AI Coding Trends Weekly",
  sources: "Sources: GitHub Trending + GitHub Search API + OpenRouter + npm",
  skillsHeading: "Claude Code Skills Highlights",
  skillsSource: (repo: string) => `> Source: [${repo}](https://github.com/${repo})`,
  issueTitle: (dateStr: string) => `📈 Agent & AI Coding Trends Weekly ${dateStr}`,
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
  highlightsHeading: "This Week's Highlights",
  trendsHeading: "Trend Signal Analysis",
  hotSpotsHeading: "Community Hot Spots",
  modelUsageHeading: "Model Usage on OpenRouter",
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

export const HN_REPORT = {
  title: "Hacker News AI Community Digest",
  issueTitle: (dateStr: string) => `📰 Hacker News AI Digest ${dateStr}`,
} as const;

export const ARXIV_REPORT = {
  title: "ArXiv AI Research Digest",
  issueTitle: (dateStr: string) => `📚 ArXiv AI Research Digest ${dateStr}`,
} as const;

// The HF report runs weekly (see WEEKLY_REPORT_WEEKDAY in date.ts) — the Hub's
// download-ranked list barely moves day to day, so the titles say "weekly".
export const HF_REPORT = {
  title: "Hugging Face Trending Models Weekly",
  issueTitle: (dateStr: string) => `🤗 Hugging Face Trending Models Weekly ${dateStr}`,
} as const;

// Weekly since October 2026.
export const COMMUNITY_REPORT = {
  title: "Tech Community AI Weekly",
  issueTitle: (dateStr: string) => `💬 Tech Community AI Weekly ${dateStr}`,
} as const;

export const ISSUE_LABELS = {
  agents: "agents",
  infra: "infra",
  web: "web",
  trending: "trending",
  hn: "hn",
  arxiv: "arxiv",
  hf: "hf",
  community: "community",
} as const;

// ---------------------------------------------------------------------------
// Footer (used in report.ts)
// ---------------------------------------------------------------------------

export const FOOTER = {
  autoGen: "This digest is auto-generated by",
} as const;

// ---------------------------------------------------------------------------
// Report labels: RSS item titles, and published in manifest.json (`labels`) for
// the sidebar (index.html) and the MCP server (mcp/src/index.ts). The only copy.
// ---------------------------------------------------------------------------

export const REPORT_LABELS: Record<string, string> = {
  "ai-agents": "AI Agents Digest",
  "ai-infra": "AI Infrastructure Digest",
  "ai-web": "Official AI Content Report",
  "ai-trending": "Agent & AI Coding Trends",
  "ai-hn": "Hacker News AI Community Digest",
  "ai-arxiv": "ArXiv AI Research Digest",
  "ai-hf": "Hugging Face Trending Models",
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

// ---------------------------------------------------------------------------
// Telegram notification labels (used in notify.ts)
// ---------------------------------------------------------------------------

export const NOTIFY_LABELS: Record<string, string> = {
  "ai-agents": "AI Agents",
  "ai-infra": "AI Infrastructure",
  "ai-web": "Official Updates",
  "ai-trending": "GitHub Trends",
  "ai-hn": "HN Community",
  "ai-arxiv": "ArXiv Research",
  "ai-hf": "HF Models",
  "ai-community": "Tech Community",
};
