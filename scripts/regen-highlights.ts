/**
 * Rebuild a day's highlights.json from its saved reports' Highlights (no LLM call)
 * and optionally resend the Telegram notification.
 *
 * Usage:
 *   npx tsx scripts/regen-highlights.ts [YYYY-MM-DD] [--notify]
 *
 * Env vars:
 *   TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID (only if --notify)
 */

import fs from "node:fs";
import path from "node:path";
import { pageHighlights } from "../src/reports/prompts-pages.ts";
import { buildMessage } from "../src/cli/notify.ts";
import { REPORT_LABELS } from "../src/core/strings.ts";

const DATE = process.argv[2] && !process.argv[2].startsWith("-") ? process.argv[2] : null;
const NOTIFY = process.argv.includes("--notify");

async function main() {
  // Find latest date
  const digestsDir = "digests";
  const dateStr =
    DATE ??
    fs
      .readdirSync(digestsDir)
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
      .sort()
      .reverse()[0];

  if (!dateStr) {
    console.error("No digest date found");
    process.exit(1);
  }

  console.log(`Regenerating highlights for ${dateStr}...`);

  // Every known report the date has: live ones first in main()'s order, then retired ones
  // (ai-hn, ai-web…). highlights.json is overwritten whole; a report without a Highlights section
  // (the archive before October 2026) gets no entry.
  const reportIds = Object.keys(REPORT_LABELS);

  // Read reports
  const reports: Record<string, string> = {};
  for (const id of reportIds) {
    const reportPath = path.join(digestsDir, dateStr, `${id}.md`);
    if (fs.existsSync(reportPath)) reports[id] = fs.readFileSync(reportPath, "utf-8");
  }

  console.log(`  Reports: ${Object.keys(reports).length}`);

  const highlights = pageHighlights(reports);

  const outPath = path.join(digestsDir, dateStr, "highlights.json");
  fs.writeFileSync(outPath, JSON.stringify(highlights, null, 2) + "\n");
  console.log(`  Saved ${outPath}`);
  console.log(`  Keys: ${Object.keys(highlights).join(", ")}`);

  if (NOTIFY) {
    const BOT_TOKEN = process.env["TELEGRAM_BOT_TOKEN"] ?? "";
    const CHAT_ID = process.env["TELEGRAM_CHAT_ID"] ?? "";

    if (!BOT_TOKEN) {
      console.error("  TELEGRAM_BOT_TOKEN not set, cannot send notification.");
      process.exit(1);
    }

    const text = buildMessage(dateStr, Object.keys(reports), undefined, highlights);

    console.log(`  Sending Telegram notification...`);
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
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
      console.error(`  Telegram API ${res.status}: ${body}`);
      process.exit(1);
    }
    console.log("  Telegram notification sent!");
  }

  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
