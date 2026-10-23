import fs from "fs";
import path from "path";
import { marked } from "marked";
import {
  COMING_UP,
  LIVE_REPORT_IDS,
  OVERVIEW,
  PROSE_COLUMNS,
  REPORT_LABELS,
  REPORTS,
  SECTIONS,
  WEEKLY_REPORT_IDS,
} from "../core/i18n.ts";

const DIGESTS_DIR = "digests";
const MANIFEST_PATH = "manifest.json";
const FEED_PATH = "feed.xml";
// One feed per live report next to feed.xml, so a reader can follow one page.
const FEEDS_DIR = "feeds";
const SITE_URL = "https://dboeter.github.io/daily-diff";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// Live reports in REPORTS (reading) order, then the archive: the sidebar lists them this way.
const REPORT_FILES = Object.keys(REPORT_LABELS);
const MAX_FEED_ITEMS = 30;

interface DateEntry {
  date: string;
  reports: string[];
}

interface Manifest {
  generated: string;
  /** Report id → label, so the sidebar and the MCP server need no copy of REPORT_LABELS. */
  labels: Record<string, string>;
  /** The weekly report ids, for the sidebar's "This week" group. */
  weekly: string[];
  /** Report id → its own feed's path, for the web UI's per-page feed link. */
  feeds: Record<string, string>;
  /** Live report id → its square's color in the web UI; a retired report has none. */
  colors: Record<string, string>;
  /** The sidebar label of a day's overview (the report bar's first link). */
  overview: string;
  /** The heading of the overview's Coming up list (coming-up.json). */
  comingUp: string;
  /** The Highlights heading (SECTIONS), whose list the web UI renders as a diff hunk. */
  highlights: string;
  /** The table headers of prose columns (PROSE_COLUMNS), stacked full width on a phone. */
  proseColumns: string[];
  dates: DateEntry[];
}

interface ReportContent {
  summary: string;
  fullHtml: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function toRfc822(date: Date): string {
  return (
    `${DAYS[date.getUTCDay()]}, ${String(date.getUTCDate()).padStart(2, "0")} ` +
    `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()} ` +
    `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}:${String(date.getUTCSeconds()).padStart(2, "0")} +0000`
  );
}

export function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function getReportContent(date: string, report: string): Promise<ReportContent> {
  const filePath = path.join(DIGESTS_DIR, date, `${report}.md`);

  try {
    const markdown = fs.readFileSync(filePath, "utf-8");
    const html = await marked.parse(markdown, { async: false });

    // Extract summary text from original HTML (before CDATA escape)
    const textOnly = html
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const summary = textOnly.length > 500 ? textOnly.slice(0, 500) + "..." : textOnly;

    // Escape CDATA end marker to prevent injection
    const safeHtml = html.replace(/]]>/g, "]]]]><![CDATA[");

    return {
      summary: escapeXml(summary), // Plain text, XML-escaped, no CDATA
      fullHtml: `<![CDATA[${safeHtml}]]>`, // HTML in CDATA, no escaping needed
    };
  } catch {
    // Fallback to title-only content on any error
    const label = REPORT_LABELS[report] ?? report;
    const title = `${label} ${date}`;
    return {
      summary: escapeXml(title),
      fullHtml: `<![CDATA[${escapeXml(title)}]]>`,
    };
  }
}

/** The newest MAX_FEED_ITEMS reports of the entries (newest first), of one report or, without one, of all. */
export function selectFeedItems(
  entries: DateEntry[],
  report?: string,
): Array<{ date: string; report: string }> {
  const items: Array<{ date: string; report: string }> = [];
  for (const entry of entries) {
    for (const r of entry.reports) {
      if (report && r !== report) continue;
      items.push({ date: entry.date, report: r });
      if (items.length >= MAX_FEED_ITEMS) return items;
    }
  }
  return items;
}

async function buildFeedXml(
  items: Array<{ date: string; report: string }>,
  title: string,
  feedPath: string,
): Promise<string> {
  const buildDate = toRfc822(new Date());

  const itemXmlChunks: string[] = [];
  for (const { date, report } of items) {
    const label = REPORT_LABELS[report] ?? report;
    const itemTitle = `${label} ${date}`;
    const link = `${SITE_URL}/#${date}/${report}`;
    const parts = date.split("-").map(Number);
    const pubDate = toRfc822(new Date(Date.UTC(parts[0]!, parts[1]! - 1, parts[2]!)));
    const content = await getReportContent(date, report);
    itemXmlChunks.push(
      [
        "    <item>",
        `      <title>${escapeXml(itemTitle)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
        `      <description>${content.summary}</description>`,
        `      <content:encoded>${content.fullHtml}</content:encoded>`,
        "    </item>",
      ].join("\n"),
    );
  }
  const itemsXml = itemXmlChunks.join("\n");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">\n` +
    `  <channel>\n` +
    `    <title>${escapeXml(title)}</title>\n` +
    `    <link>${SITE_URL}</link>\n` +
    `    <description>Daily AI ecosystem digest</description>\n` +
    `    <language>en</language>\n` +
    // RSS 2.0 caps a channel image at 144 px wide and takes no SVG: feed-icon.png is favicon.svg rendered at 144.
    `    <image>\n` +
    `      <url>${SITE_URL}/feed-icon.png</url>\n` +
    `      <title>${escapeXml(title)}</title>\n` +
    `      <link>${SITE_URL}</link>\n` +
    `      <width>144</width>\n` +
    `      <height>144</height>\n` +
    `    </image>\n` +
    `    <atom:link href="${SITE_URL}/${feedPath}" rel="self" type="application/rss+xml"/>\n` +
    `    <lastBuildDate>${buildDate}</lastBuildDate>\n` +
    itemsXml +
    `\n  </channel>\n` +
    `</rss>\n`
  );
}

async function main(): Promise<void> {
  const entries = fs
    .readdirSync(DIGESTS_DIR)
    .filter((name) => DATE_RE.test(name) && fs.statSync(path.join(DIGESTS_DIR, name)).isDirectory())
    .sort()
    .reverse()
    .map((date) => {
      const reports = REPORT_FILES.filter((r) => fs.existsSync(path.join(DIGESTS_DIR, date, `${r}.md`)));
      return { date, reports };
    })
    .filter((e) => e.reports.length > 0);

  const manifest: Manifest = {
    generated: new Date().toISOString(),
    labels: REPORT_LABELS,
    weekly: WEEKLY_REPORT_IDS,
    feeds: Object.fromEntries(LIVE_REPORT_IDS.map((id) => [id, `${FEEDS_DIR}/${id}.xml`])),
    colors: Object.fromEntries(LIVE_REPORT_IDS.map((id) => [id, REPORTS[id].color])),
    overview: OVERVIEW.name,
    comingUp: COMING_UP.heading,
    highlights: SECTIONS.highlights,
    proseColumns: PROSE_COLUMNS,
    dates: entries,
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`manifest.json updated: ${entries.length} dates`);

  // ── RSS Feed ──────────────────────────────────────────────────────────────────

  const feedItems = selectFeedItems(entries);
  fs.writeFileSync(FEED_PATH, await buildFeedXml(feedItems, "Daily Diff", FEED_PATH));
  console.log(`feed.xml updated: ${feedItems.length} items`);

  fs.mkdirSync(FEEDS_DIR, { recursive: true });
  for (const id of LIVE_REPORT_IDS) {
    const feedPath = `${FEEDS_DIR}/${id}.xml`;
    const items = selectFeedItems(entries, id);
    fs.writeFileSync(feedPath, await buildFeedXml(items, `Daily Diff: ${REPORT_LABELS[id]}`, feedPath));
    console.log(`${feedPath} updated: ${items.length} items`);
  }
}

// Run only when executed directly (not imported for testing)
const isDirectRun =
  process.argv[1] &&
  (process.argv[1].endsWith("generate-manifest.ts") || process.argv[1].endsWith("generate-manifest.js"));
if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
