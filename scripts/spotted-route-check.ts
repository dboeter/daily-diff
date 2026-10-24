/**
 * Spotted routing check: route the HN table rows of the archived discussions
 * reports (2026-10-13 … 2026-10-22) with the production topic question, and
 * print the share per topic and 30 random routings. The cache goes under
 * `.scratch/digest-structure/`, nothing under `digests/`.
 *
 *   node --env-file=.env --import tsx scripts/spotted-route-check.ts
 *
 * Without TYPESAFE_API_KEY the keyword fallback routes every story.
 */

import fs from "node:fs";
import path from "node:path";
import { daysBefore } from "../src/core/date.ts";
import {
  loadSpottedVerdicts,
  routeStories,
  saveSpottedVerdicts,
  PAGE_OF_TOPIC,
  type Topic,
} from "../src/spotted/jev.ts";
import type { Story } from "../src/spotted/spotted.ts";

const FIRST = "2026-10-13";
const LAST = "2026-10-22";
const CACHE = path.join(".scratch", "digest-structure", "spotted-topics.json");
const SAMPLE = 30;

/** `| [Title](url) · [HN](https://news.ycombinator.com/item?id=N) | points | comments | summary |` */
const ROW =
  /^\|\s*\[(.+?)\]\((\S+?)\)\s*·\s*\[HN\]\((https:\/\/news\.ycombinator\.com\/item\?id=(\d+))\)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|/;

function archivedStories(): { stories: Story[]; rows: number; days: number } {
  const byId = new Map<string, Story>();
  let rows = 0;
  let days = 0;
  for (let d = LAST; d >= FIRST; d = daysBefore(d, 1)) {
    const file = path.join("digests", d, "ai-hn.md");
    if (!fs.existsSync(file)) continue;
    days++;
    for (const line of fs.readFileSync(file, "utf-8").split("\n")) {
      const m = line.match(ROW);
      if (!m) continue;
      rows++;
      const [, title, url, discussionUrl, id, points, comments] = m;
      // The newest day first: its counts are the latest.
      if (byId.has(`hn:${id}`)) continue;
      byId.set(`hn:${id}`, {
        id: `hn:${id}`,
        source: "hn",
        title: title!,
        url: url!,
        discussionUrl: discussionUrl!,
        points: Number(points),
        comments: Number(comments),
        published: `${d}T00:00:00Z`,
      });
    }
  }
  return { stories: [...byId.values()], rows, days };
}

async function main(): Promise<void> {
  const { stories, rows, days } = archivedStories();
  console.log(`${rows} HN rows in ${days} reports (${FIRST} … ${LAST}), ${stories.length} unique stories`);
  console.log(
    "Note: the archive has no page descriptions, so this routes on title and site only, less than production sees.",
  );
  const cache = loadSpottedVerdicts(CACHE);
  const routing = await routeStories(stories, {
    apiKey: process.env["TYPESAFE_API_KEY"],
    cache,
    dateStr: LAST,
  });
  if (routing.judgment.nextCache) saveSpottedVerdicts(routing.judgment.nextCache, CACHE);
  console.log(`Routed by: ${routing.judgment.rankedBy === "jev" ? "Jev" : "keyword fallback (no Jev)"}\n`);

  const counts = new Map<Topic, number>();
  for (const t of routing.topics.values()) counts.set(t, (counts.get(t) ?? 0) + 1);
  console.log("Share per topic:");
  for (const [topic, n] of [...counts].sort((a, b) => b[1] - a[1])) {
    const page = PAGE_OF_TOPIC[topic] ?? "dropped";
    console.log(
      `  ${topic.padEnd(9)} ${String(n).padStart(4)}  ${((100 * n) / stories.length).toFixed(1).padStart(5)}%  → ${page}`,
    );
  }

  const sample = [...stories].sort(() => Math.random() - 0.5).slice(0, SAMPLE);
  console.log(`\n${sample.length} random routings:`);
  for (const s of sample) console.log(`  ${routing.topics.get(s.id)!.padEnd(9)} ${s.title}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
