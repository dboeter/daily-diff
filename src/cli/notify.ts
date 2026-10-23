/**
 * Notifications — reads manifest.json and sends a Telegram message with links
 * to the latest reports, and a Teams card with the data report's highlights.
 * Each channel skips silently if its secrets are not set.
 *
 * Env vars:
 *   TELEGRAM_BOT_TOKEN  — bot token from @BotFather
 *   TELEGRAM_CHAT_ID    — channel/group/user chat ID
 *   TEAMS_WEBHOOK_URL   — Teams Workflows "When a Teams webhook request is received" URL
 *   PAGES_URL           — GitHub Pages base URL (defaults to the public deployment)
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { COMING_UP, GOING_AWAY, isReportId, REPORT_LABELS, REPORTS, WORDMARK } from "../core/strings.ts";
import type { ComingUpEntry } from "../reports/coming-up.ts";
import type { ReportHighlights } from "../reports/prompts-data.ts";

const PAGES_URL_DEFAULT = "https://dboeter.github.io/daily-diff";

export function resolvePagesUrl(override?: string): string {
  if (override) return override.replace(/\/$/, "");
  const envUrl = process.env["PAGES_URL"];
  if (envUrl) return envUrl.replace(/\/$/, "");
  const ghaRepo = process.env["GITHUB_REPOSITORY"];
  if (ghaRepo) {
    const [owner, repo] = ghaRepo.split("/");
    if (owner && repo) return `https://${owner}.github.io/${repo}`;
  }
  return PAGES_URL_DEFAULT;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** A highlight behind its gutter sign. An unsigned one is an addition: the model signs only what goes away. */
function gutterLine(h: string, format: (s: string) => string = (s) => s): string {
  const gone = h.startsWith(`${GOING_AWAY} `);
  return `${gone ? GOING_AWAY : "+"} ${format(gone ? h.slice(GOING_AWAY.length + 1) : h)}`;
}

const COMING_UP_MAX = 5;

async function sendTelegram(text: string): Promise<void> {
  const BOT_TOKEN = process.env["TELEGRAM_BOT_TOKEN"] ?? "";
  const CHAT_ID = process.env["TELEGRAM_CHAT_ID"] ?? "";
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram API ${res.status}: ${body}`);
  }
}

export function buildMessage(
  date: string,
  reports: string[],
  pagesUrl?: string,
  highlights?: ReportHighlights | null,
  comingUp?: ComingUpEntry[] | null,
): string {
  const PAGES_URL = resolvePagesUrl(pagesUrl);
  const lines: string[] = [`<b>${WORDMARK}</b> · ${date}`];

  for (const r of reports) {
    const label = REPORT_LABELS[r] ?? r;
    const mark = isReportId(r) ? REPORTS[r].emoji : "•";
    lines.push(""); // blank line before each report section
    lines.push(`${mark} <a href="${PAGES_URL}/#${date}/${r}">${escapeHtml(label)}</a>`);

    // Add highlights as indented sub-items.
    const items = highlights?.[r];
    if (items?.length) {
      for (const h of items) {
        lines.push(`  ${gutterLine(h, escapeHtml)}`);
      }
    }
  }

  if (comingUp?.length) {
    lines.push("", `<b>${COMING_UP.heading}</b>`);
    for (const c of comingUp.slice(0, COMING_UP_MAX)) {
      const page = REPORT_LABELS[c.page] ?? c.page;
      lines.push(
        `• ${c.date} · <a href="${escapeHtml(c.link)}">${escapeHtml(c.title)}</a> (${escapeHtml(page)})`,
      );
    }
  }

  lines.push(`\n<a href="${PAGES_URL}">Web UI</a>  ·  <a href="${PAGES_URL}/feed.xml">RSS</a>`);
  return lines.join("\n");
}

const TEAMS_REPORT_ID = "ai-data";

/**
 * The webhook body for a Teams Workflows trigger: a `message` envelope around
 * one Adaptive Card (connectors/teams, "Microsoft Teams - Webhook": contentUrl
 * must be null). Version 1.2 matches Microsoft's webhook samples and is the
 * first with RichTextBlock.
 */
export function buildTeamsCard(date: string, highlights: string[], pagesUrl?: string) {
  const PAGES_URL = resolvePagesUrl(pagesUrl);
  const { emoji, name } = REPORTS[TEAMS_REPORT_ID];
  return {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        contentUrl: null,
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.2",
          body: [
            { type: "TextBlock", text: WORDMARK, isSubtle: true, size: "Small", wrap: true },
            {
              type: "TextBlock",
              text: `${emoji} ${name}`,
              weight: "Bolder",
              size: "Medium",
              spacing: "Small",
              wrap: true,
            },
            { type: "TextBlock", text: date, isSubtle: true, spacing: "None", wrap: true },
            // A TextBlock parses Markdown (`*`, `_`, `[x](y)`, a leading `- `), which
            // LLM-written highlights can contain by accident; a TextRun is plain
            // text, so the highlight needs no escaping.
            ...highlights.map((h) => ({
              type: "RichTextBlock",
              inlines: [{ type: "TextRun", text: gutterLine(h) }],
            })),
          ],
          actions: [
            { type: "Action.OpenUrl", title: "Open report", url: `${PAGES_URL}/#${date}/${TEAMS_REPORT_ID}` },
          ],
        },
      },
    ],
  };
}

/**
 * Posts the data report's card. Never throws: the report is already published,
 * so a Teams failure is logged and noted in the step summary, not a failed run.
 */
export async function sendTeams(date: string, highlights: ReportHighlights | null): Promise<void> {
  const webhookUrl = process.env["TEAMS_WEBHOOK_URL"] ?? "";
  if (!webhookUrl) return;
  const items = highlights?.[TEAMS_REPORT_ID];
  if (!items?.length) {
    console.log(`[notify] No ${TEAMS_REPORT_ID} highlights for ${date} — skipping Teams.`);
    return;
  }
  let error: string | null = null;
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildTeamsCard(date, items)),
    });
    // Microsoft documents no success status for the Workflows trigger, so any 2xx
    // counts. The body is cut: an error page can be kilobytes of HTML.
    if (!res.ok) error = `HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`;
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }
  if (!error) {
    console.log(`[notify] Teams card sent for ${date}.`);
    return;
  }
  console.error(`[notify] Teams webhook failed — ${error}`);
  const summaryPath = process.env["GITHUB_STEP_SUMMARY"];
  if (summaryPath) {
    fs.appendFileSync(summaryPath, `⚠️ **Teams notification failed** — ${error}\n`, "utf-8");
  }
}

async function main(): Promise<void> {
  if (!fs.existsSync("manifest.json")) {
    console.log("[notify] manifest.json not found — skipping.");
    return;
  }

  const { dates } = JSON.parse(fs.readFileSync("manifest.json", "utf-8")) as {
    dates: { date: string; reports: string[] }[];
  };

  const latest = dates?.[0];
  if (!latest) {
    console.log("[notify] manifest is empty — skipping.");
    return;
  }
  const { date, reports } = latest;

  // Load highlights if available
  let highlights: ReportHighlights | null = null;
  const highlightsPath = path.join("digests", date, "highlights.json");
  if (fs.existsSync(highlightsPath)) {
    try {
      highlights = JSON.parse(fs.readFileSync(highlightsPath, "utf-8")) as ReportHighlights;
    } catch {
      console.log("[notify] Failed to parse highlights.json — sending without highlights.");
    }
  }

  let comingUp: ComingUpEntry[] | null = null;
  const comingUpPath = path.join("digests", date, "coming-up.json");
  if (fs.existsSync(comingUpPath)) {
    try {
      comingUp = JSON.parse(fs.readFileSync(comingUpPath, "utf-8")) as ComingUpEntry[];
    } catch {
      console.log("[notify] Failed to parse coming-up.json — sending without Coming up.");
    }
  }

  // Teams first: it never throws, so a Telegram failure cannot skip it.
  await sendTeams(date, highlights);

  if (!process.env["TELEGRAM_BOT_TOKEN"]) {
    console.log("[notify] TELEGRAM_BOT_TOKEN not set — skipping.");
    return;
  }
  if (!process.env["TELEGRAM_CHAT_ID"]) {
    console.log("[notify] TELEGRAM_CHAT_ID not set — skipping.");
    return;
  }

  const text = buildMessage(date, reports, undefined, highlights, comingUp);

  console.log(`[notify] Sending Telegram message for ${date} (${reports.length} reports)…`);
  await sendTelegram(text);
  console.log("[notify] Done!");
}

// Only auto-send when run directly (`tsx src/cli/notify.ts`). Guard prevents an
// accidental send when another module imports `buildMessage` from here.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e: unknown) => {
    console.error("[notify]", e instanceof Error ? e.message : e);
    process.exit(1);
  });
}
